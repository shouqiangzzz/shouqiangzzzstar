import { safeVideoFileName, validateVideoFile } from '../utils/videoFile.ts';

export interface UploadedOriginalVideo {
  url: string;
  storagePath: string;
  fileName: string;
  size: number;
  contentType: string;
}

interface UploadSnapshot {
  bytesTransferred: number;
  totalBytes: number;
}

interface OriginalUploadTask {
  on(
    event: 'state_changed',
    next: (snapshot: UploadSnapshot) => void,
    error: (error: unknown) => void,
    complete: () => void,
  ): () => void;
  cancel(): boolean;
}

export interface OriginalVideoUploadTransport {
  getCurrentUser(): { uid: string } | null;
  createUniqueId(): string;
  startUpload(path: string, file: File, metadata: {
    contentType: string;
    customMetadata: { originalFileName: string; originalSize: string };
  }): OriginalUploadTask;
  getDownloadUrl(path: string): Promise<string>;
  removeUpload(path: string): Promise<void>;
}

export function getVideoUploadError(error: unknown): string {
  const code = typeof error === 'object' && error !== null && 'code' in error ? String(error.code) : '';
  const name = error instanceof Error ? error.name : '';
  if (code === 'storage/canceled' || name === 'AbortError') return '已取消视频上传。';
  if (code === 'storage/unauthenticated') return '登录已失效，请重新登录后上传原视频。';
  if (code === 'storage/unauthorized') return '视频上传权限未开通，请检查云存储规则或重新登录。';
  if (code === 'storage/quota-exceeded') return '云存储空间或配额不足，请联系管理员后重试。';
  if (code === 'storage/bucket-not-found' || code === 'storage/no-default-bucket') return '视频云存储尚未配置，请联系管理员。';
  if (code === 'storage/retry-limit-exceeded') return '视频上传超时，请检查网络后重试。';
  if (code === 'storage/invalid-checksum') return '视频上传校验未通过，请重新上传原文件。';
  return error instanceof Error && !code ? error.message : '视频上传失败，请检查网络后重试。';
}

function abortError(): Error {
  const error = new Error('已取消视频上传。');
  error.name = 'AbortError';
  return error;
}

function isDurableDownloadUrl(url: string): boolean {
  try { return /^https:\/\//i.test(url) && new URL(url).protocol === 'https:'; } catch { return false; }
}

function ensureOwnPath(path: string, uid: string): void {
  if (!path.startsWith(`videos/${uid}/`) || path.split('/').length !== 4) {
    throw new Error('不能删除其他用户的视频。');
  }
}

/** Injectable transport exercises the same original-file transfer used in production. */
export async function uploadOriginalVideoWithTransport(
  file: File,
  onProgress: (percent: number) => void,
  signal: AbortSignal | undefined,
  transport: OriginalVideoUploadTransport,
): Promise<UploadedOriginalVideo> {
  const user = transport.getCurrentUser();
  if (!user) throw new Error('请先登录，再上传原创视频。');
  const metadata = validateVideoFile(file);
  if (signal?.aborted) throw abortError();
  const uniqueId = transport.createUniqueId();
  if (!user.uid || /[\\/]/.test(user.uid) || !uniqueId || /[\\/]/.test(uniqueId)) {
    throw new Error('无法生成视频上传路径，请重新登录后重试。');
  }
  const storagePath = `videos/${user.uid}/${uniqueId}/${safeVideoFileName(file.name)}`;
  const reportProgress = (percent: number) => {
    try { onProgress(percent); } catch { /* A UI callback cannot alter the original transfer. */ }
  };
  // The original File is passed unchanged: no canvas, captureStream, compression, or re-encoding.
  let task: OriginalUploadTask;
  try {
    task = transport.startUpload(storagePath, file, {
      contentType: metadata.contentType,
      customMetadata: { originalFileName: file.name, originalSize: String(file.size) },
    });
  } catch (error) {
    throw new Error(getVideoUploadError(error));
  }

  return new Promise<UploadedOriginalVideo>((resolve, reject) => {
    let settled = false;
    let unsubscribe: (() => void) | undefined;
    const cleanupListener = () => {
      signal?.removeEventListener('abort', onAbort);
      unsubscribe?.();
    };
    const fail = (error: unknown) => {
      if (settled) return;
      settled = true;
      cleanupListener();
      const code = typeof error === 'object' && error !== null && 'code' in error ? error.code : '';
      reject(code === 'storage/canceled' ? abortError()
        : error instanceof Error && error.name === 'AbortError' ? error : new Error(getVideoUploadError(error)));
    };
    const onAbort = () => {
      task.cancel();
      fail(abortError());
    };
    signal?.addEventListener('abort', onAbort, { once: true });
    // A cancellation can arrive between task creation and listener registration.
    if (signal?.aborted) { onAbort(); return; }
    reportProgress(0);
    unsubscribe = task.on('state_changed', (snapshot) => {
      if (settled || signal?.aborted) return;
      const total = snapshot.totalBytes || file.size;
      // 100% means a durable playback URL has been obtained, not merely that bytes were sent.
      reportProgress(Math.max(0, Math.min(99, Math.floor(snapshot.bytesTransferred / total * 100))));
    }, fail, () => {
      void (async () => {
        try {
          const url = await transport.getDownloadUrl(storagePath);
          if (signal?.aborted || settled) {
            await transport.removeUpload(storagePath);
            fail(abortError());
            return;
          }
          if (!isDurableDownloadUrl(url)) throw new Error('未取得可分享的视频地址，请重新上传。');
          settled = true;
          cleanupListener();
          reportProgress(100);
          resolve({ url, storagePath, ...metadata });
        } catch (error) {
          // Completed bytes without a usable URL must not leave a successful-looking publication.
          try { await transport.removeUpload(storagePath); } catch { /* Retry may still recover the file. */ }
          fail(error);
        }
      })();
    });
    if (settled) unsubscribe();
  });
}

async function firebaseTransport(): Promise<OriginalVideoUploadTransport> {
  const [{ auth, storage }, { ref, uploadBytesResumable, getDownloadURL, deleteObject }] = await Promise.all([
    import('./firebase.ts'),
    import('firebase/storage'),
  ]);
  return {
    getCurrentUser: () => auth.currentUser,
    createUniqueId: () => crypto.randomUUID(),
    startUpload: (path, file, metadata) => uploadBytesResumable(ref(storage, path), file, metadata),
    getDownloadUrl: (path) => getDownloadURL(ref(storage, path)),
    removeUpload: (path) => deleteObject(ref(storage, path)),
  };
}

export async function uploadOriginalVideo(
  file: File,
  onProgress: (percent: number) => void,
  signal?: AbortSignal,
): Promise<UploadedOriginalVideo> {
  return uploadOriginalVideoWithTransport(file, onProgress, signal, await firebaseTransport());
}

export async function deleteUploadedVideo(storagePath: string): Promise<void> {
  const transport = await firebaseTransport();
  const user = transport.getCurrentUser();
  if (!user) throw new Error('请先登录后重试。');
  ensureOwnPath(storagePath, user.uid);
  try {
    await transport.removeUpload(storagePath);
  } catch (error) {
    const code = typeof error === 'object' && error !== null && 'code' in error ? error.code : '';
    if (code !== 'storage/object-not-found') throw new Error(getVideoUploadError(error));
  }
}
