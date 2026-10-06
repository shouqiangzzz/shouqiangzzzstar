import assert from 'node:assert/strict';
import test from 'node:test';
import { MAX_VIDEO_SIZE, getVideoFileError, safeVideoFileName, validateVideoFile } from '../src/utils/videoFile.ts';

test('recognizes original MP4, WebM and MOV files and keeps exact original metadata', () => {
  for (const [name, type] of [['原创.MP4', 'video/mp4'], ['原视频.webm', 'video/webm'], ['手机拍摄.mov', 'video/quicktime']]) {
    const file = new File(['original bytes'], name, { type });
    assert.equal(getVideoFileError(file), null);
    assert.deepEqual(validateVideoFile(file), { fileName: name, size: 14, contentType: type });
  }
});

test('missing generic file MIME is inferred from supported filename extension', () => {
  assert.equal(validateVideoFile(new File(['original'], '视频.MP4')).contentType, 'video/mp4');
  assert.equal(validateVideoFile(new File(['original'], '视频.mov', { type: 'application/octet-stream' })).contentType, 'video/quicktime');
});

test('rejects empty files, oversize files, nonvideo formats and conflicting MIME types', () => {
  assert.match(getVideoFileError(new File([], 'empty.mp4', { type: 'video/mp4' })), /为空/);
  assert.match(getVideoFileError({ name: 'huge.mp4', type: 'video/mp4', size: MAX_VIDEO_SIZE + 1 }), /100 MB/);
  assert.equal(getVideoFileError({ name: 'limit.mp4', type: 'video/mp4', size: MAX_VIDEO_SIZE }), null);
  for (const file of [
    new File(['text'], 'text.txt', { type: 'text/plain' }),
    new File(['not a video'], 'fake.mp4', { type: 'text/plain' }),
    new File(['unknown'], 'clip.avi', { type: 'video/x-msvideo' }),
    new File(['bad'], 'malware.exe', { type: 'video/mp4' }),
  ]) {
    assert.match(getVideoFileError(file), /本地视频文件/);
    assert.throws(() => validateVideoFile(file), /本地视频文件/);
  }
});

test('size validation rejects invalid metadata and storage filename stays a single safe path segment', () => {
  for (const size of [NaN, Infinity, -1, 0]) assert.ok(getVideoFileError({ name: 'clip.mp4', type: 'video/mp4', size }));
  const name = safeVideoFileName('../../原创视频\\take?2#1.mp4');
  assert.equal(/[\\/\u0000-\u001f?#]/.test(name), false);
  assert.ok(name.endsWith('.mp4'));
  assert.equal(safeVideoFileName('...'), 'original-video');
});
