import assert from 'node:assert/strict';
import test from 'node:test';
import { recoveredVideoPatch, getLegacyVideoRecoveryError } from '../src/lib/recoverLegacyVideo.ts';

const legacySource = 'sq_video://vid_1790934730487_82owq';
const uploaded = {
  url: 'https://firebasestorage.googleapis.com/v0/b/test/o/videos%2Fauthor%2Fupload-1%2F大浪.mp4?alt=media&token=original',
  duration: '0:28', durationSeconds: 28.8,
  storagePath: 'videos/author/upload-1/大浪.mp4', fileName: '大浪.mp4',
  size: 1024, contentType: 'video/mp4',
};

test('recovering an original video produces only video metadata and preserves current content and interactions', () => {
  const content = {
    authorId: 'author', videoUrl: legacySource,
    title: '大浪', content: 'Original content', authorName: '杜兰宁',
    likesCount: 10, comments: [{ id: 'new-comment', content: 'New concurrent comment' }],
    status: 'published', createdAt: '2026-10-02T09:52:26.686Z',
  };
  const before = structuredClone(content);
  const patch = recoveredVideoPatch(content, 'author', legacySource, uploaded);
  assert.deepEqual(patch, {
    videoUrl: uploaded.url, videoDuration: '0:28', videoDurationSeconds: 28.8,
    videoStoragePath: uploaded.storagePath, videoFileName: '大浪.mp4',
    videoSize: 1024, videoContentType: 'video/mp4',
  });
  assert.deepEqual(content, before, 'validation must not mutate the current document');
  assert.deepEqual({ ...content, ...patch }, { ...before, ...patch });
});

test('guest and other authors cannot replace the uploaded video', () => {
  const content = { authorId: 'author', videoUrl: legacySource };
  assert.throws(() => recoveredVideoPatch(content, undefined, legacySource, uploaded), /请先登录原上传账号/);
  assert.throws(() => recoveredVideoPatch(content, 'other-author', legacySource, uploaded), /只有.*原作者/);
});

test('missing documents and already changed sources reject recovery rather than recreating or overwriting content', () => {
  assert.throws(() => recoveredVideoPatch(null, 'author', legacySource, uploaded), /已不存在/);
  for (const changedSource of ['https://example.test/replacement.mp4', 'sq_video://another-video', undefined]) {
    assert.throws(() => recoveredVideoPatch({ authorId: 'author', videoUrl: changedSource }, 'author', legacySource, uploaded), /视频已更新/);
  }
});

test('recovery requires a complete legacy reference and never accepts an arbitrary public or local source', () => {
  for (const source of ['https://example.test/video.mp4', 'blob:https://example.test/local', 'sq_video://', 'sq_video://nested/video', 'sq_video://id?token=1', `sq_video://${'a'.repeat(129)}`]) {
    assert.throws(() => recoveredVideoPatch({ authorId: 'author', videoUrl: source }, 'author', source, uploaded), /不是可恢复的旧视频/);
  }
});

test('recovery cannot save unfinished, malformed, mismatched, or another author\'s upload', () => {
  for (const patch of [
    { url: 'blob:https://example.test/local' },
    { url: 'sq_video://another-local-video' },
    { url: 'https:example.test/video.mp4' },
    { url: 'http://example.test/video.mp4' },
    { url: `${uploaded.url} ` },
    { durationSeconds: 0 }, { durationSeconds: Infinity }, { duration: '0:30' },
    { storagePath: '' }, { storagePath: 'videos/other-author/upload-1/大浪.mp4' },
    { storagePath: 'videos/author/../大浪.mp4' }, { storagePath: 'videos/author/upload-1/nested/file.mp4' },
    { fileName: '' }, { size: 0 }, { size: 0.5 }, { size: 100 * 1024 * 1024 + 1 },
    { fileName: '大浪.txt' }, { contentType: 'text/plain' }, { contentType: '' },
  ]) {
    assert.throws(() => recoveredVideoPatch({ authorId: 'author', videoUrl: legacySource }, 'author', legacySource, { ...uploaded, ...patch }), /上传信息不完整/);
  }
});

test('permission and network failures preserve uploaded video and offer a save retry', () => {
  for (const code of ['permission-denied', 'unauthenticated']) {
    assert.match(getLegacyVideoRecoveryError({ code }), /重新登录.*重试.*已上传视频会保留/);
  }
  assert.match(getLegacyVideoRecoveryError({ code: 'unavailable' }), /检查网络后重试.*已上传视频会保留/);
  assert.match(getLegacyVideoRecoveryError(new Error('offline')), /检查网络后重试.*已上传视频会保留/);
  try {
    recoveredVideoPatch(null, 'author', legacySource, uploaded);
  } catch (error) {
    assert.match(getLegacyVideoRecoveryError(error), /已不存在/);
  }
});
