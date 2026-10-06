export const MAX_VIDEO_SIZE = 100 * 1024 * 1024;
export const VIDEO_FILE_ACCEPT = '.mp4,.webm,.mov,video/mp4,video/webm,video/quicktime';

const extensionTypes: Record<string, string> = {
  mp4: 'video/mp4',
  webm: 'video/webm',
  mov: 'video/quicktime',
};

type VideoFileDescription = Pick<File, 'name' | 'size' | 'type'>;

export interface ValidatedVideoFile {
  fileName: string;
  size: number;
  contentType: string;
}

export function getVideoFileContentType(file: VideoFileDescription): string | null {
  const extension = file.name.trim().split('.').pop()?.toLowerCase() ?? '';
  const expected = extensionTypes[extension];
  if (!expected) return null;
  const declared = file.type.split(';')[0].trim().toLowerCase();
  if (!declared || declared === 'application/octet-stream') return expected;
  return declared === expected ? declared : null;
}

export function getVideoFileError(file: VideoFileDescription): string | null {
  if (!Number.isFinite(file.size) || file.size <= 0) return '视频文件为空，请重新选择原视频。';
  if (file.size > MAX_VIDEO_SIZE) return '视频不能超过 100 MB，请选择较小的原视频。';
  if (!getVideoFileContentType(file)) return '请选择 MP4、WebM 或 MOV 格式的本地视频文件。';
  return null;
}

export function validateVideoFile(file: VideoFileDescription): ValidatedVideoFile {
  const error = getVideoFileError(file);
  if (error) throw new Error(error);
  return { fileName: file.name, size: file.size, contentType: getVideoFileContentType(file)! };
}

/** A filename is a single object-path segment; the original name remains in metadata. */
export function safeVideoFileName(fileName: string): string {
  return fileName.replace(/[\\/\u0000-\u001f\u007f?#\[\]]/g, '_')
    .replace(/^\.+/, '').trim().slice(-160) || 'original-video';
}
