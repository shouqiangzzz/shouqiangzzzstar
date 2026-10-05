import { useCallback, useRef, useState } from 'react';
import { getVideoUrlError, normalizeVideoUrl } from '../utils/video';
import type { VideoInfo } from '../utils/video';
import type { VideoUrlInputProps } from '../components/VideoUrlInput';

export const useVideoAttachment = () => {
  const [videoUrl, setUrl] = useState('');
  const [videoInfo, setVideoInfo] = useState<VideoInfo | null>(null);
  const currentUrl = useRef('');
  const validatedVideo = useRef<VideoInfo | null>(null);
  const validationError = useRef<string | null>(null);

  const setVideoUrl = useCallback((url: string) => {
    const normalized = normalizeVideoUrl(url);
    if (normalized !== currentUrl.current) {
      currentUrl.current = normalized;
      validatedVideo.current = null;
      validationError.current = getVideoUrlError(normalized);
      setVideoInfo(null);
    }
    setUrl(url);
  }, []);

  const onReady = useCallback((info: VideoInfo) => {
    if (info.url !== currentUrl.current) return;
    validatedVideo.current = info;
    validationError.current = null;
    setVideoInfo(info);
  }, []);

  const onInvalid = useCallback((url: string, message: string) => {
    if (url !== currentUrl.current) return;
    validatedVideo.current = null;
    validationError.current = message;
    setVideoInfo(null);
  }, []);

  const onChecking = useCallback((url: string) => {
    if (url !== currentUrl.current) return;
    validatedVideo.current = null;
    validationError.current = null;
    setVideoInfo(null);
  }, []);

  const requireVideo = useCallback((): VideoInfo | undefined => {
    const url = currentUrl.current;
    if (!url) return undefined;
    const error = getVideoUrlError(url) || validationError.current;
    if (error) throw new Error(error);
    const video = validatedVideo.current;
    if (!video || video.url !== url) {
      throw new Error('视频尚未验证成功，请等待预览加载并确认内容，或删除视频链接后发布。');
    }
    return video;
  }, []);

  const inputProps: VideoUrlInputProps = { url: videoUrl, onChange: setVideoUrl, onReady, onInvalid, onChecking };
  return { videoUrl, setVideoUrl, videoInfo, inputProps, requireVideo };
};
