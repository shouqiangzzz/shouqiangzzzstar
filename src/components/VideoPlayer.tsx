import React, { useLayoutEffect, useRef, useState } from 'react';
import { Play, RotateCcw } from 'lucide-react';
import {
  formatVideoDuration,
  getMediaErrorMessage,
  getVideoUrlError,
  isValidVideoDuration,
  normalizeVideoUrl,
} from '../utils/video';
import type { VideoInfo } from '../utils/video';

export interface VideoPlayerProps {
  src: string;
  title?: string;
  poster?: string;
  className?: string;
  verify?: boolean;
  onReady?: (info: VideoInfo) => void;
  onInvalid?: (url: string, message: string) => void;
  onChecking?: (url: string) => void;
}

/** A source change mounts a fresh player so no previous source can keep playing. */
export const VideoPlayer: React.FC<VideoPlayerProps> = (props) => {
  const src = normalizeVideoUrl(props.src);
  return <SourceVideoPlayer key={src} {...props} src={src} />;
};

const SourceVideoPlayer: React.FC<VideoPlayerProps> = ({
  src,
  title = '视频播放',
  poster,
  className = '',
  verify = false,
  onReady,
  onInvalid,
  onChecking,
}) => {
  const [attempt, setAttempt] = useState(0);
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading');
  const [error, setError] = useState('');
  const [duration, setDuration] = useState('');
  const videoRef = useRef<HTMLVideoElement>(null);
  const active = useRef(true);
  const failed = useRef(false);
  const reportedReady = useRef(false);
  const callbacks = useRef({ onReady, onInvalid, onChecking });
  callbacks.current = { onReady, onInvalid, onChecking };
  const timerRef = useRef<ReturnType<typeof setTimeout>>();

  const clearTimer = () => {
    if (timerRef.current !== undefined) {
      clearTimeout(timerRef.current);
      timerRef.current = undefined;
    }
  };

  const fail = (message: string) => {
    if (!active.current) return;
    clearTimer();
    failed.current = true;
    reportedReady.current = false;
    setStatus('error');
    setError(message);
    callbacks.current.onInvalid?.(src, message);
  };

  useLayoutEffect(() => {
    active.current = true;
    failed.current = false;
    reportedReady.current = false;
    setStatus('loading');
    setError('');
    setDuration('');
    callbacks.current.onChecking?.(src);
    const invalidUrl = getVideoUrlError(src);
    if (!src || invalidUrl) {
      fail(invalidUrl || '未提供视频地址。');
    } else {
      timerRef.current = setTimeout(() => {
        fail(verify
          ? '视频验证超时。请确认直链可访问，然后点击重新加载；验证成功前无法发布此视频。'
          : '视频加载超时。请确认直链可访问，然后点击重新加载。');
      }, 15000);
    }
    const video = videoRef.current;
    // React StrictMode replays effects; its cleanup has released this same element.
    if (video && src && !invalidUrl && video.getAttribute('src') !== src) {
      video.setAttribute('src', src);
      video.load();
    }
    return () => {
      active.current = false;
      clearTimer();
      // A hidden or closed preview must be decoded again before it can be submitted.
      callbacks.current.onChecking?.(src);
      // Release an old request and stop sound when switching sources or closing a modal.
      if (video) {
        video.pause();
        video.removeAttribute('src');
        video.load();
      }
    };
  }, [src, attempt, verify]);

  const readMetadata = (video: HTMLVideoElement) => {
    if (!active.current || failed.current || video !== videoRef.current) return;
    if (isValidVideoDuration(video.duration)) {
      setDuration(formatVideoDuration(video.duration));
    }
  };

  const handleLoadedData = (video: HTMLVideoElement) => {
    if (!active.current || failed.current || video !== videoRef.current || video.readyState < 2) return;
    if (!isValidVideoDuration(video.duration) || video.videoWidth === 0 || video.videoHeight === 0) {
      fail('未能读取完整的视频画面和时长。请使用有效的视频文件直链。');
      return;
    }
    clearTimer();
    readMetadata(video);
    setStatus('ready');
    setError('');
    if (!reportedReady.current) {
      reportedReady.current = true;
      callbacks.current.onReady?.({
        url: src,
        duration: formatVideoDuration(video.duration),
        durationSeconds: video.duration,
      });
    }
  };

  const invalidUrl = getVideoUrlError(src);

  return (
    <div className={`rounded-xl overflow-hidden bg-black shadow-inner ${className}`}>
      <div className="p-2 bg-stone-900 text-stone-300 text-xs flex items-center justify-between gap-3">
        <span className="flex items-center gap-1.5 font-medium">
          <Play className="w-3.5 h-3.5 text-amber-400" />
          {title}
        </span>
        <span className="text-[11px] text-stone-400">{duration || '读取时长中'}</span>
      </div>
      {!invalidUrl && src && (
        <video
          key={attempt}
          ref={videoRef}
          controls
          playsInline
          autoPlay={false}
          loop={false}
          muted={false}
          preload={verify ? 'auto' : 'metadata'}
          poster={poster}
          src={src}
          aria-label={title}
          className="w-full max-h-[460px] aspect-video object-contain bg-black"
          onLoadedMetadata={(event) => {
            const video = event.currentTarget;
            video.defaultPlaybackRate = 1;
            video.playbackRate = 1;
            readMetadata(video);
            if (!verify && active.current && !failed.current) {
              clearTimer();
              setStatus('ready');
            }
          }}
          onDurationChange={(event) => readMetadata(event.currentTarget)}
          onLoadedData={(event) => handleLoadedData(event.currentTarget)}
          onCanPlay={(event) => handleLoadedData(event.currentTarget)}
          onError={(event) => {
            if (event.currentTarget === videoRef.current) {
              fail(getMediaErrorMessage(event.currentTarget.error?.code));
            }
          }}
        >
          您的浏览器不支持视频播放。
        </video>
      )}
      {status === 'loading' && (
        <p className="px-3 py-2 text-xs text-stone-300" role="status">
          {verify ? '正在读取原视频并验证画面，请稍候…' : '正在加载原视频…'}
        </p>
      )}
      {status === 'ready' && verify && (
        <p className="px-3 py-2 text-xs text-emerald-300" role="status">视频验证成功，请播放预览确认内容和节奏。</p>
      )}
      {status === 'error' && (
        <div className="px-3 py-3 space-y-2 bg-rose-950/60">
          <p className="text-xs leading-relaxed text-rose-200" role="alert">{error}</p>
          {!invalidUrl && src && (
            <button
              type="button"
              className="flex items-center gap-1.5 text-xs text-white border border-stone-500 rounded-md px-3 py-1.5 hover:bg-stone-800"
              onClick={() => setAttempt((value) => value + 1)}
            >
              <RotateCcw className="w-3 h-3" />重新加载
            </button>
          )}
        </div>
      )}
    </div>
  );
};
