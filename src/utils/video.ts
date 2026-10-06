export interface VideoInfo {
  url: string;
  duration: string;
  durationSeconds: number;
}

export const normalizeVideoUrl = (value: string): string => value.trim();

/** Published videos must point to the uploaded file, never a local preview URL. */
export const getVideoUrlError = (value: string): string | null => {
  const url = normalizeVideoUrl(value);
  if (!url) return null;
  if (!/^https?:\/\//i.test(url) || /[\s\\]/.test(url)) {
    return '上传的视频地址无效，请作者重新上传原视频。';
  }
  try {
    const parsed = new URL(url);
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
      return '上传的视频地址无效，请作者重新上传原视频。';
    }
    if (!parsed.hostname) return '上传的视频地址无效，请作者重新上传原视频。';
    return null;
  } catch {
    return '上传的视频地址无效，请作者重新上传原视频。';
  }
};

/** Only the file picker can opt in to a temporary local preview. */
export const getVideoSourceError = (value: string, localPreview = false): string | null => {
  const source = normalizeVideoUrl(value);
  if (localPreview && /^blob:/i.test(source) && !/[\s\\]/.test(source)) {
    try {
      if (new URL(source).protocol === 'blob:') return null;
    } catch {
      return '无法读取这个本地视频，请重新选择文件。';
    }
  }
  return getVideoUrlError(source);
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

export const getMediaErrorMessage = (code?: number, localPreview = false): string => {
  switch (code) {
    case 1:
      return '视频加载已中断，请重新加载。';
    case 2:
      return localPreview
        ? '无法读取这个本地视频，请重新选择文件。'
        : '无法读取上传的视频，请重新加载；若仍失败，请作者重新上传原视频。';
    case 3:
      return '浏览器无法解码此视频。请使用兼容的 MP4（H.264 视频、AAC 音频）或 WebM。';
    default:
      return localPreview
        ? '这个文件无法播放，请选择兼容的 MP4（H.264 视频、AAC 音频）或 WebM 视频。'
        : '上传的视频暂时无法播放，请重新加载或请作者重新上传原视频。';
  }
};
