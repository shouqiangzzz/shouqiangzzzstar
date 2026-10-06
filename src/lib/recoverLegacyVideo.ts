import type { VideoMetadata } from '../types';
import type { VideoInfo } from '../utils/video.ts';
import type { UploadedOriginalVideo } from './videoUpload.ts';
import { formatVideoDuration, getLegacyVideoId, getVideoUrlError, isValidVideoDuration } from '../utils/video.ts';
import { validateVideoFile } from '../utils/videoFile.ts';
import { videoMetadata } from '../utils/videoMetadata.ts';

export type RecoverableCollection = 'posts' | 'stories' | 'insights';
export type RecoveredVideo = UploadedOriginalVideo & VideoInfo;

type RecoveryFailure = 'login-required' | 'not-found' | 'not-author' | 'invalid-source' | 'source-changed' | 'invalid-upload';

class LegacyVideoRecoveryError extends Error {
  readonly code: RecoveryFailure;

  constructor(code: RecoveryFailure, message: string) {
    super(message);
    this.name = 'LegacyVideoRecoveryError';
    this.code = code;
  }
}

function fail(code: RecoveryFailure, message: string): never {
  throw new LegacyVideoRecoveryError(code, message);
}

/** Recovery only replaces an original author's unchanged legacy video reference. */
export function recoveredVideoPatch(
  data: unknown,
  userId: string | undefined,
  expectedLegacySource: string,
  uploadedVideo: RecoveredVideo,
): VideoMetadata {
  if (!userId) fail('login-required', '请先登录原上传账号，再恢复这条视频。');
  if (data === null || typeof data !== 'object' || Array.isArray(data)) {
    fail('not-found', '这条内容已不存在，无法恢复视频。');
  }
  const row = data as Record<string, unknown>;
  if (row.authorId !== userId) {
    fail('not-author', '只有这条内容的原作者才能恢复视频，请登录原上传账号。');
  }
  if (!getLegacyVideoId(expectedLegacySource)) {
    fail('invalid-source', '当前视频不是可恢复的旧视频引用。');
  }
  if (row.videoUrl !== expectedLegacySource) {
    fail('source-changed', '这条内容的视频已更新，请刷新后重试。');
  }

  const invalidUpload = () => fail('invalid-upload', '原视频上传信息不完整，请重新选择并上传原视频。');
  if (!uploadedVideo || typeof uploadedVideo !== 'object') invalidUpload();
  const { url, duration, durationSeconds, storagePath, fileName, size, contentType } = uploadedVideo;
  if (typeof url !== 'string' || url !== url.trim() || !/^https:\/\//i.test(url) || getVideoUrlError(url)
    || typeof duration !== 'string' || !isValidVideoDuration(durationSeconds)
    || duration !== formatVideoDuration(durationSeconds)
    || typeof storagePath !== 'string' || typeof fileName !== 'string' || !fileName.trim()
    || typeof contentType !== 'string' || !Number.isSafeInteger(size)) invalidUpload();
  const segments = storagePath.split('/');
  if (segments.length !== 4 || segments[0] !== 'videos' || segments[1] !== userId
    || segments.some((segment) => !segment || segment === '.' || segment === '..' || /[\\\u0000-\u001f]/.test(segment))) {
    invalidUpload();
  }
  try {
    const validated = validateVideoFile({ name: fileName, size, type: contentType });
    if (contentType !== validated.contentType) invalidUpload();
  } catch {
    invalidUpload();
  }
  // This whitelist contains no title, author, moderation, timestamps, or interaction fields.
  return videoMetadata(uploadedVideo);
}

export function getLegacyVideoRecoveryError(error: unknown): string {
  if (error instanceof LegacyVideoRecoveryError) return error.message;
  const code = typeof error === 'object' && error !== null && 'code' in error ? String(error.code) : '';
  if (code === 'permission-denied' || code === 'unauthenticated') {
    return '视频已上传，但恢复信息尚未保存：登录状态或内容修改权限已失效，请重新登录后重试。已上传视频会保留。';
  }
  return '视频已上传，但恢复信息尚未保存，请检查网络后重试。已上传视频会保留。';
}

/** A transaction preserves concurrent comments, likes, and every other content field. */
export async function saveRecoveredVideo(
  collectionName: RecoverableCollection,
  documentId: string,
  expectedLegacySource: string,
  uploadedVideo: RecoveredVideo,
): Promise<VideoMetadata> {
  if (!['posts', 'stories', 'insights'].includes(collectionName)
    || !/^[a-zA-Z0-9_-]{1,128}$/.test(documentId)) {
    throw new Error('内容位置无效，请刷新后重试。');
  }
  const [{ auth, db }, { doc, runTransaction }] = await Promise.all([
    import('./firebase.ts'),
    import('firebase/firestore'),
  ]);
  const userId = auth.currentUser?.uid;
  if (!userId) fail('login-required', '请先登录原上传账号，再恢复这条视频。');
  try {
    return await runTransaction(db, async (transaction) => {
      const reference = doc(db, collectionName, documentId);
      const snapshot = await transaction.get(reference);
      if (auth.currentUser?.uid !== userId) {
        fail('login-required', '登录账号已变更，请重新登录原上传账号后重试。');
      }
      const patch = recoveredVideoPatch(snapshot.exists() ? snapshot.data() : null, userId, expectedLegacySource, uploadedVideo);
      transaction.update(reference, { ...patch });
      return patch;
    });
  } catch (error) {
    if (error instanceof LegacyVideoRecoveryError) throw error;
    throw new Error(getLegacyVideoRecoveryError(error));
  }
}
