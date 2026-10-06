import type { VideoMetadata } from '../types';

interface UploadedVideo {
  url: string;
  duration: string;
  durationSeconds: number;
  storagePath: string;
  fileName: string;
  size: number;
  contentType: string;
}

/** Only the completed cloud upload is saved; the local preview URL stays in memory. */
export function videoMetadata(video: UploadedVideo | undefined): VideoMetadata {
  if (!video) return {};
  if (!/^https?:\/\//i.test(video.url) || !video.storagePath) {
    throw new Error('视频尚未上传完成，请重试。');
  }
  return {
    videoUrl: video.url,
    videoDuration: video.duration,
    videoDurationSeconds: video.durationSeconds,
    videoStoragePath: video.storagePath,
    videoFileName: video.fileName,
    videoSize: video.size,
    videoContentType: video.contentType,
  };
}
