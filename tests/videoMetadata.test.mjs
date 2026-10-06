import assert from 'node:assert/strict';
import test from 'node:test';
import { videoMetadata } from '../src/utils/videoMetadata.ts';

test('a completed original-file upload keeps its exact URL, size, name, and timing', () => {
  const video = {
    url: 'https://firebasestorage.googleapis.com/v0/b/test/o/videos%2Fuser%2Fclip?alt=media&token=original',
    duration: '1:15', durationSeconds: 75.25,
    storagePath: 'videos/user/unique-id/原创视频.mp4',
    fileName: '原创视频.mp4', size: 1024, contentType: 'video/mp4',
  };
  assert.deepEqual(videoMetadata(video), {
    videoUrl: video.url, videoDuration: '1:15', videoDurationSeconds: 75.25,
    videoStoragePath: video.storagePath, videoFileName: '原创视频.mp4',
    videoSize: 1024, videoContentType: 'video/mp4',
  });
});

test('posts without video do not receive fabricated video fields', () => {
  assert.deepEqual(videoMetadata(undefined), {});
});

test('a local preview or an incomplete upload cannot become published media', () => {
  const base = { url: 'https://example.test/file', storagePath: 'videos/user/file', duration: '0:03', durationSeconds: 3, fileName: '原片.webm', size: 100, contentType: 'video/webm' };
  assert.throws(() => videoMetadata({ ...base, url: 'blob:https://example.test/local-preview' }), /上传/);
  assert.throws(() => videoMetadata({ ...base, url: 'data:video/mp4;base64,AAAA' }), /上传/);
  assert.throws(() => videoMetadata({ ...base, storagePath: '' }), /上传/);
});
