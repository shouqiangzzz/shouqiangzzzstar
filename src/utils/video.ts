export interface VideoInfo {
  url: string;
  duration: string;
  durationSeconds: number;
}

export const normalizeVideoUrl = (value: string): string => value.trim();

/** Check durability and syntax here; the browser must also decode a video frame. */
export const getVideoUrlError = (value: string): string | null => {
  const url = normalizeVideoUrl(value);
  if (!url) return null;
  if (!/^https?:\/\//i.test(url) || /[\s\\]/.test(url)) {
    return '请输入完整的 HTTP 或 HTTPS 视频直链，不要使用临时或本地地址。';
  }
  try {
    const parsed = new URL(url);
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
      return '请使用可公开访问的 HTTP 或 HTTPS 视频直链；临时 blob、data 和本地地址无法分享给其他用户。';
    }
    if (!parsed.hostname) return '请输入完整的视频直链。';
    return null;
  } catch {
    return '请输入完整的 HTTP 或 HTTPS 视频直链。';
  }
};

export const isValidVideoDuration = (seconds: number): boolean =>
  Number.isFinite(seconds) && seconds > 0;

export const formatVideoDuration = (seconds: number): string => {
  if (!isValidVideoDuration(seconds)) return '';
  const total = Math.floor(seconds);
  const hours = Math.floor(total / 3600);
  const minutes = Math.floor((total % 3600) / 60);
  const remaining = String(total % 60).padStart(2, '0');
  return hours > 0
    ? `${hours}:${String(minutes).padStart(2, '0')}:${remaining}`
    : `${minutes}:${remaining}`;
};

export const getMediaErrorMessage = (code?: number): string => {
  switch (code) {
    case 1:
      return '视频加载已中断，请重新加载。';
    case 2:
      return '无法读取视频。请确认直链可公开访问、未过期，且服务器允许外部播放。';
    case 3:
      return '浏览器无法解码此视频。请使用兼容的 MP4（H.264 视频、AAC 音频）或 WebM。';
    default:
      return '此链接无法播放视频。请填写原视频文件的公开直链，而不是网页或分享页面链接。';
  }
};
