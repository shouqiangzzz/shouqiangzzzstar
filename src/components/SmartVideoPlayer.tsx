import React, { useState, useEffect, useRef, forwardRef, useImperativeHandle } from 'react';
import { Play, Pause, Volume2, VolumeX, Maximize2, AlertCircle, RefreshCw, ExternalLink, Sparkles, CheckCircle2 } from 'lucide-react';
import { resolvePlayableVideoUrl } from '../services/videoStorage';

export interface SmartVideoPlayerHandle {
  play: () => Promise<void>;
  pause: () => void;
  togglePlay: () => void;
  videoElement: HTMLVideoElement | null;
}

interface SmartVideoPlayerProps {
  src: string;
  poster?: string;
  title?: string;
  duration?: string;
  autoPlay?: boolean;
  className?: string;
}

export const SmartVideoPlayer = forwardRef<SmartVideoPlayerHandle, SmartVideoPlayerProps>(({
  src,
  poster,
  title,
  duration,
  autoPlay = false,
  className = ''
}, ref) => {
  const [resolvedSrc, setResolvedSrc] = useState<string>('');
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [videoDuration, setVideoDuration] = useState<number>(0);
  const [hasError, setHasError] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [embedType, setEmbedType] = useState<'bilibili' | 'youtube' | 'direct'>('direct');
  const [embedUrl, setEmbedUrl] = useState<string>('');
  const [autoMutedNotice, setAutoMutedNotice] = useState<boolean>(false);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const userManuallyPaused = useRef<boolean>(false);

  // Check if URL is an embeddable external platform
  useEffect(() => {
    if (!src) {
      setHasError(true);
      setErrorMessage('未提供有效的视频播放链接');
      setIsLoading(false);
      return;
    }

    setHasError(false);
    setErrorMessage('');
    setIsLoading(true);
    userManuallyPaused.current = false;

    // 1. Check Bilibili: e.g. https://www.bilibili.com/video/BV1xx411c7mD
    const bvidMatch = src.match(/(BV[a-zA-Z0-9]+)/i);
    if (src.includes('bilibili.com') && bvidMatch) {
      setEmbedType('bilibili');
      setEmbedUrl(`//player.bilibili.com/player.html?bvid=${bvidMatch[1]}&page=1&high_quality=1&danmaku=0&autoplay=0`);
      setIsLoading(false);
      return;
    }

    // 2. Check YouTube: e.g. https://www.youtube.com/watch?v=xxx or https://youtu.be/xxx
    const ytMatch = src.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/);
    if (ytMatch) {
      setEmbedType('youtube');
      setEmbedUrl(`https://www.youtube-nocookie.com/embed/${ytMatch[1]}?rel=0&modestbranding=1`);
      setIsLoading(false);
      return;
    }

    // 3. Direct video (MP4, WebM, MOV, Blob, or IndexedDB storage key)
    setEmbedType('direct');
    let isCancelled = false;

    resolvePlayableVideoUrl(src).then((playable) => {
      if (isCancelled) return;
      if (!playable) {
        setHasError(true);
        setErrorMessage('视频资源未能找到或本地数据已失效');
        setIsLoading(false);
      } else {
        setResolvedSrc(playable);
        // Note: setIsLoading will be finalized in onLoadedMetadata / onCanPlay
      }
    }).catch(() => {
      if (isCancelled) return;
      setHasError(true);
      setErrorMessage('解析视频播放流出现异常');
      setIsLoading(false);
    });

    return () => {
      isCancelled = true;
    };
  }, [src]);

  // ==========================================
  // HTML5 原生 Video API: 手动控制播放/暂停
  // ==========================================

  /**
   * 手动调用 HTML5 原生 video.play() 方法启动播放
   * 采用异步 Promise 防御，如遇浏览器限制声音自动播，自动降级为静音恢复播放，杜绝卡在封面帧
   */
  const handleManualPlay = async () => {
    const video = videoRef.current;
    if (!video) return;

    userManuallyPaused.current = false;
    setIsLoading(false);

    try {
      const playPromise = video.play();
      if (playPromise !== undefined) {
        await playPromise;
        setIsPlaying(true);
      }
    } catch (err: any) {
      console.warn("HTML5 video.play() 需要安全策略兼容:", err);
      // 现代浏览器（Chrome/Safari）对于非直接用户交互的带声播放会限制，降级为静音播放
      if (err.name === 'NotAllowedError' || err.name === 'AbortError') {
        video.muted = true;
        setIsMuted(true);
        setAutoMutedNotice(true);
        try {
          await video.play();
          setIsPlaying(true);
        } catch (retryErr) {
          console.error("静音回退播放失败:", retryErr);
        }
      }
    }
  };

  /**
   * 手动调用 HTML5 原生 video.pause() 方法暂停播放
   */
  const handleManualPause = () => {
    const video = videoRef.current;
    if (!video) return;

    userManuallyPaused.current = true;
    video.pause();
    setIsPlaying(false);
  };

  /**
   * 切换播放 / 暂停
   */
  const togglePlay = () => {
    if (isPlaying) {
      handleManualPause();
    } else {
      handleManualPlay();
    }
  };

  // 暴露 HTML5 原生 Video 控制句柄供父级组件按需调用
  useImperativeHandle(ref, () => ({
    play: handleManualPlay,
    pause: handleManualPause,
    togglePlay,
    videoElement: videoRef.current
  }));

  // ==========================================
  // HTML5 原生 Video 事件监听器
  // ==========================================

  /**
   * onLoadedMetadata 事件监听：
   * 在视频元数据加载完成后触发，获取真实视频时长，
   * 并主动触发 HTML5 原生 play() 自动恢复动态播放，解决卡在封面的虚假播放问题。
   */
  const handleLoadedMetadata = () => {
    const video = videoRef.current;
    if (!video) return;

    setVideoDuration(video.duration);
    setIsLoading(false);

    // 只要用户此前未明确点击过手动“暂停”，立即通过原生 Video API 恢复播放
    if (!userManuallyPaused.current) {
      const playPromise = video.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            setIsPlaying(true);
          })
          .catch((err) => {
            console.info("onLoadedMetadata 触发自动播放策略防护，转为静音恢复画面:", err);
            video.muted = true;
            setIsMuted(true);
            setAutoMutedNotice(true);
            video.play()
              .then(() => setIsPlaying(true))
              .catch((e) => console.warn("元数据恢复播放状态追踪:", e));
          });
      }
    }
  };

  /**
   * onCanPlay 事件监听：确保首帧及缓冲区数据可读后迅速启动
   */
  const handleCanPlay = () => {
    setIsLoading(false);
    const video = videoRef.current;
    if (video && video.paused && !userManuallyPaused.current) {
      video.play().then(() => setIsPlaying(true)).catch(() => {});
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
    }
  };

  const handlePlay = () => {
    setIsPlaying(true);
    setIsLoading(false);
  };

  const handlePause = () => {
    setIsPlaying(false);
  };

  const handleWaiting = () => {
    setIsLoading(true);
  };

  const handlePlaying = () => {
    setIsLoading(false);
    setIsPlaying(true);
  };

  const toggleMute = () => {
    if (!videoRef.current) return;
    const nextMuted = !videoRef.current.muted;
    videoRef.current.muted = nextMuted;
    setIsMuted(nextMuted);
    if (!nextMuted) {
      setAutoMutedNotice(false);
    }
  };

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (document.fullscreenElement) {
      document.exitFullscreen();
    } else {
      containerRef.current.requestFullscreen().catch(() => {});
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value);
    setCurrentTime(time);
    if (videoRef.current) {
      videoRef.current.currentTime = time;
    }
  };

  const handleVideoError = () => {
    const mediaError = videoRef.current?.error;
    console.warn("Video element error:", mediaError?.code, mediaError?.message);
    // 仅在出现不可恢复的媒体源或网络错误时才展示错误看板
    if (mediaError && (mediaError.code === 4 || mediaError.code === 2)) {
      setHasError(true);
      setIsLoading(false);
      setErrorMessage('视频解码失败或资源受防盗链保护，您可尝试直接在浏览器新标签页中打开。');
    }
  };

  const handleReload = () => {
    setHasError(false);
    setIsLoading(true);
    userManuallyPaused.current = false;
    if (videoRef.current) {
      videoRef.current.load();
    }
  };

  const formatTime = (secs: number) => {
    if (isNaN(secs) || secs < 0) return '0:00';
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div 
      ref={containerRef}
      className={`relative group rounded-2xl overflow-hidden bg-black aspect-video flex items-center justify-center shadow-lg border border-stone-800 ${className}`}
    >
      {/* 1. EMBEDDED PLATFORM: Bilibili / YouTube */}
      {embedType !== 'direct' && embedUrl && (
        <iframe
          src={embedUrl}
          title={title || '视频播放器'}
          className="w-full h-full border-0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
        />
      )}

      {/* 2. DIRECT HTML5 VIDEO PLAYER */}
      {embedType === 'direct' && resolvedSrc && !hasError && (
        <>
          <video
            ref={videoRef}
            key={resolvedSrc}
            src={resolvedSrc}
            poster={poster}
            playsInline
            preload="auto"
            autoPlay={autoPlay}
            onTimeUpdate={handleTimeUpdate}
            onLoadedMetadata={handleLoadedMetadata}
            onCanPlay={handleCanPlay}
            onWaiting={handleWaiting}
            onPlaying={handlePlaying}
            onPlay={handlePlay}
            onPause={handlePause}
            onError={handleVideoError}
            onClick={togglePlay}
            className="w-full h-full object-contain cursor-pointer select-none"
          />

          {/* 静音恢复播放提示横条（自动播放受限时优雅提示用户解开声音） */}
          {autoMutedNotice && isPlaying && isMuted && (
            <div 
              onClick={toggleMute}
              className="absolute top-3 left-3 bg-black/70 hover:bg-black/90 backdrop-blur-md px-3 py-1 rounded-full text-amber-300 text-xs flex items-center gap-1.5 cursor-pointer border border-amber-500/30 transition-all z-20 animate-fade-in shadow-md"
            >
              <VolumeX className="w-3.5 h-3.5" />
              <span>已自动恢复静音播放，点击开启原声</span>
            </div>
          )}

          {/* Central Large Play Button overlay when paused */}
          {!isPlaying && !isLoading && (
            <div 
              onClick={handleManualPlay}
              className="absolute inset-0 flex items-center justify-center bg-black/35 backdrop-blur-[2px] transition-all cursor-pointer z-10"
            >
              <div className="flex flex-col items-center gap-2 group-hover:scale-105 transition-transform">
                <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-amber-500 hover:bg-amber-600 text-white flex items-center justify-center shadow-xl">
                  <Play className="w-7 h-7 fill-white translate-x-0.5" />
                </div>
                <span className="text-xs text-white/90 font-medium px-2.5 py-0.5 rounded-full bg-black/50 backdrop-blur-sm">
                  点击播放（HTML5 原生解码）
                </span>
              </div>
            </div>
          )}

          {/* Bottom Custom Control Bar */}
          <div className="absolute inset-x-0 bottom-0 p-3 bg-gradient-to-t from-black/95 via-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col gap-2 z-20">
            {/* Scrubber Range */}
            <input
              type="range"
              min={0}
              max={videoDuration || 100}
              step={0.1}
              value={currentTime}
              onChange={handleSeek}
              className="w-full h-1 bg-stone-600 rounded-lg appearance-none cursor-pointer accent-amber-500"
            />

            <div className="flex items-center justify-between text-white text-xs">
              <div className="flex items-center gap-2.5">
                {/* 手动播放与暂停专用按钮 */}
                {isPlaying ? (
                  <button 
                    onClick={handleManualPause} 
                    className="hover:text-amber-400 transition-colors p-1 flex items-center gap-1 text-xs"
                    title="手动暂停 (pause())"
                  >
                    <Pause className="w-4 h-4 fill-white" />
                    <span className="hidden sm:inline text-[11px]">暂停</span>
                  </button>
                ) : (
                  <button 
                    onClick={handleManualPlay} 
                    className="hover:text-amber-400 transition-colors p-1 flex items-center gap-1 text-xs text-amber-400"
                    title="手动播放 (play())"
                  >
                    <Play className="w-4 h-4 fill-amber-400" />
                    <span className="hidden sm:inline text-[11px]">播放</span>
                  </button>
                )}

                <button 
                  onClick={toggleMute} 
                  className="hover:text-amber-400 transition-colors p-1"
                  title={isMuted ? '取消静音' : '静音'}
                >
                  {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4" />}
                </button>

                <span className="text-[11px] text-stone-300 font-mono">
                  {formatTime(currentTime)} / {formatTime(videoDuration || (duration ? 15 : 0))}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-semibold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  原生 Video 就绪
                </span>
                <button 
                  onClick={toggleFullscreen} 
                  className="hover:text-amber-400 transition-colors p-1"
                  title="全屏播放"
                >
                  <Maximize2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* 3. LOADING STATE */}
      {isLoading && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-stone-900/80 text-white gap-2 z-10">
          <RefreshCw className="w-8 h-8 text-amber-500 animate-spin" />
          <span className="text-xs text-stone-300 font-medium">短视频加载解析中...</span>
        </div>
      )}

      {/* 4. ERROR & FALLBACK STATE (Never broken black screen) */}
      {hasError && (
        <div className="absolute inset-0 p-6 flex flex-col items-center justify-center bg-stone-950/95 text-center text-white space-y-3 z-30">
          <div className="w-12 h-12 rounded-full bg-rose-500/20 border border-rose-500/40 flex items-center justify-center text-rose-400">
            <AlertCircle className="w-6 h-6" />
          </div>
          <div>
            <h4 className="font-bold text-sm text-stone-100">视频播放提示</h4>
            <p className="text-xs text-stone-400 max-w-sm mt-1 leading-relaxed">
              {errorMessage || '当前视频流由于跨域或格式限制未能直接在播放器中渲染'}
            </p>
          </div>
          <div className="flex items-center gap-2 pt-1">
            <button
              onClick={handleReload}
              className="px-3 py-1.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-xs text-stone-200 flex items-center gap-1.5 transition-all"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>重新加载</span>
            </button>
            {src && (
              <a
                href={resolvedSrc || src}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-xs text-white font-medium flex items-center gap-1.5 shadow-sm transition-all"
              >
                <span>在新标签页打开</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            )}
          </div>
        </div>
      )}
    </div>
  );
});

SmartVideoPlayer.displayName = 'SmartVideoPlayer';
