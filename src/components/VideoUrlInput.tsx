import React, { useId } from 'react';
import { VideoPlayer } from './VideoPlayer';
import { getVideoUrlError, normalizeVideoUrl } from '../utils/video';
import type { VideoInfo } from '../utils/video';

export interface VideoUrlInputProps {
  url: string;
  onChange: (url: string) => void;
  onReady: (info: VideoInfo) => void;
  onInvalid: (url: string, message: string) => void;
  onChecking?: (url: string) => void;
}

export const VideoUrlInput: React.FC<VideoUrlInputProps> = ({ url, onChange, onReady, onInvalid, onChecking }) => {
  const id = useId();
  const normalizedUrl = normalizeVideoUrl(url);
  const error = getVideoUrlError(normalizedUrl);

  return (
    <div className="space-y-2">
      <label htmlFor={id} className="block text-xs font-semibold text-stone-700">视频直链（选填）</label>
      <input
        id={id}
        type="url"
        value={url}
        onChange={(event) => onChange(event.target.value)}
        placeholder="https://… 原视频文件地址"
        aria-invalid={Boolean(error)}
        aria-describedby={`${id}-help`}
        className="w-full px-3 py-2 text-sm border border-stone-200 rounded-lg outline-hidden focus:border-amber-500 bg-white"
      />
      <p id={`${id}-help`} className="text-xs text-stone-500 leading-relaxed">
        填写可公开播放的视频文件直链。发布前会验证画面和真实时长；请用预览确认这是你的视频。
      </p>
      {error && <p className="text-xs text-rose-600 leading-relaxed" role="alert">{error}</p>}
      {normalizedUrl && !error && (
        <VideoPlayer
          src={normalizedUrl}
          title="原视频预览"
          verify
          onReady={onReady}
          onInvalid={onInvalid}
          onChecking={onChecking}
        />
      )}
    </div>
  );
};
