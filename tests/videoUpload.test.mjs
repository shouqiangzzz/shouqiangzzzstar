import assert from 'node:assert/strict';
import test from 'node:test';
import { getVideoUploadError, uploadOriginalVideoWithTransport } from '../src/lib/videoUpload.ts';

function createTransport(options = {}) {
  const state = { uploads: [], removed: [], progress: [], cancelled: 0, unsubscribed: 0 };
  let observer;
  let id = 0;
  const transport = {
    getCurrentUser: () => options.user === undefined ? { uid: 'ordinary-user' } : options.user,
    createUniqueId: () => `unique-${++id}`,
    startUpload(path, file, metadata) {
      state.uploads.push({ path, file, metadata });
      if (options.startError) throw options.startError;
      return {
        on(event, next, error, complete) {
          assert.equal(event, 'state_changed');
          observer = { next, error, complete };
          return () => { state.unsubscribed++; };
        },
        cancel() {
          state.cancelled++;
          observer?.error({ code: 'storage/canceled' });
          return true;
        },
      };
    },
    getDownloadUrl: options.getDownloadUrl ?? (async () => 'https://firebasestorage.googleapis.com/v0/b/bucket/o/original.mp4?alt=media&token=token'),
    async removeUpload(path) { state.removed.push(path); },
  };
  return {
    transport, state,
    progress: (value) => state.progress.push(value),
    next: (bytesTransferred, totalBytes) => observer.next({ bytesTransferred, totalBytes }),
    fail: (error) => observer.error(error),
    complete: () => observer.complete(),
  };
}

const original = () => new File([new Uint8Array([0, 1, 254, 255, 12, 40])], '我拍摄的 原视频.mp4', { type: 'video/mp4' });

test('ordinary authenticated users upload identical original File bytes and get a durable URL after completion', async () => {
  const upload = createTransport();
  const file = original();
  const pending = uploadOriginalVideoWithTransport(file, upload.progress, undefined, upload.transport);
  let resolved = false;
  pending.then(() => { resolved = true; });
  const sent = upload.state.uploads[0];
  assert.equal(sent.file, file, 'transport must receive the same original File object');
  assert.deepEqual(new Uint8Array(await sent.file.arrayBuffer()), new Uint8Array([0, 1, 254, 255, 12, 40]));
  assert.match(sent.path, /^videos\/ordinary-user\/unique-1\/我拍摄的 原视频\.mp4$/);
  assert.deepEqual(sent.metadata, { contentType: 'video/mp4', customMetadata: { originalFileName: file.name, originalSize: '6' } });
  upload.next(3, 6);
  upload.next(6, 6);
  await Promise.resolve();
  assert.equal(resolved, false, 'complete bytes alone are not a usable publication');
  assert.deepEqual(upload.state.progress, [0, 50, 99]);
  upload.complete();
  const result = await pending;
  assert.deepEqual(result, {
    url: 'https://firebasestorage.googleapis.com/v0/b/bucket/o/original.mp4?alt=media&token=token',
    storagePath: sent.path, fileName: file.name, size: 6, contentType: 'video/mp4',
  });
  assert.equal(upload.state.progress.at(-1), 100);
  assert.equal(upload.state.unsubscribed, 1);
  assert.deepEqual(upload.state.removed, []);
});

test('every upload uses an independent path so concurrent originals cannot overwrite', async () => {
  const upload = createTransport();
  const first = uploadOriginalVideoWithTransport(original(), upload.progress, undefined, upload.transport);
  upload.complete();
  await first;
  const second = uploadOriginalVideoWithTransport(original(), upload.progress, undefined, upload.transport);
  upload.complete();
  await second;
  assert.notEqual(upload.state.uploads[0].path, upload.state.uploads[1].path);
});

test('guests and invalid files cannot start any cloud upload', async () => {
  const guest = createTransport({ user: null });
  await assert.rejects(uploadOriginalVideoWithTransport(original(), guest.progress, undefined, guest.transport), /请先登录/);
  assert.equal(guest.state.uploads.length, 0);
  const invalid = createTransport();
  await assert.rejects(uploadOriginalVideoWithTransport(new File(['text'], 'not-video.txt'), invalid.progress, undefined, invalid.transport), /本地视频文件/);
  assert.equal(invalid.state.uploads.length, 0);
});

test('already canceled selection does not start a transfer', async () => {
  const upload = createTransport();
  const controller = new AbortController();
  controller.abort();
  await assert.rejects(uploadOriginalVideoWithTransport(original(), upload.progress, controller.signal, upload.transport), { name: 'AbortError' });
  assert.equal(upload.state.uploads.length, 0);
});

test('cancellation cancels the resumable task and rejects without a successful progress state', async () => {
  const upload = createTransport();
  const controller = new AbortController();
  const pending = uploadOriginalVideoWithTransport(original(), upload.progress, controller.signal, upload.transport);
  controller.abort();
  await assert.rejects(pending, { name: 'AbortError' });
  assert.equal(upload.state.cancelled, 1);
  assert.equal(upload.state.unsubscribed, 1);
  assert.equal(upload.state.progress.includes(100), false);
});

test('cancellation while download URL is pending removes the completed object', async () => {
  let downloadReady;
  const download = new Promise((resolve) => { downloadReady = resolve; });
  const upload = createTransport({ getDownloadUrl: () => download });
  const controller = new AbortController();
  const pending = uploadOriginalVideoWithTransport(original(), upload.progress, controller.signal, upload.transport);
  upload.complete();
  controller.abort();
  await assert.rejects(pending, { name: 'AbortError' });
  downloadReady('https://firebasestorage.googleapis.com/original.mp4');
  await new Promise((resolve) => setImmediate(resolve));
  assert.deepEqual(upload.state.removed, [upload.state.uploads[0].path]);
  assert.equal(upload.state.progress.includes(100), false);
});

test('cloud errors explain a recoverable problem and never claim success', async () => {
  const upload = createTransport();
  const pending = uploadOriginalVideoWithTransport(original(), upload.progress, undefined, upload.transport);
  upload.fail({ code: 'storage/unauthorized' });
  await assert.rejects(pending, /权限.*云存储规则/);
  assert.equal(upload.state.progress.includes(100), false);
  const beforeStart = createTransport({ startError: { code: 'storage/quota-exceeded' } });
  await assert.rejects(uploadOriginalVideoWithTransport(original(), beforeStart.progress, undefined, beforeStart.transport), /配额不足/);
});

test('download URL failures and temporary playback URLs roll back uploaded object', async () => {
  for (const getDownloadUrl of [async () => { throw { code: 'storage/retry-limit-exceeded' }; }, async () => 'blob:temporary-local-preview', async () => 'https://']) {
    const upload = createTransport({ getDownloadUrl });
    const pending = uploadOriginalVideoWithTransport(original(), upload.progress, undefined, upload.transport);
    upload.complete();
    await assert.rejects(pending, /超时|可分享的视频地址/);
    assert.deepEqual(upload.state.removed, [upload.state.uploads[0].path]);
    assert.equal(upload.state.progress.includes(100), false);
  }
});

test('a failing progress UI callback cannot invalidate the uploaded original or hang completion', async () => {
  const upload = createTransport();
  const pending = uploadOriginalVideoWithTransport(original(), () => { throw new Error('UI unavailable'); }, undefined, upload.transport);
  upload.next(3, 6);
  upload.complete();
  assert.match((await pending).url, /^https:\/\//);
  assert.deepEqual(upload.state.removed, []);
});

test('storage errors distinguish expired login, missing storage, quota and original byte checksum', () => {
  assert.match(getVideoUploadError({ code: 'storage/unauthenticated' }), /重新登录/);
  assert.match(getVideoUploadError({ code: 'storage/bucket-not-found' }), /尚未配置/);
  assert.match(getVideoUploadError({ code: 'storage/quota-exceeded' }), /配额不足/);
  assert.match(getVideoUploadError({ code: 'storage/invalid-checksum' }), /校验未通过.*原文件/);
});
