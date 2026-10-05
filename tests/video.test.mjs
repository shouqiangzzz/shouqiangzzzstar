import assert from 'node:assert/strict';
import test from 'node:test';
import {
  formatVideoDuration,
  getVideoUrlError,
  isValidVideoDuration,
  normalizeVideoUrl,
} from '../src/utils/video.ts';

test('only durable absolute HTTP(S) sources can be shared', () => {
  for (const url of [
    'blob:https://example.com/temporary-id',
    'data:video/mp4;base64,AAAA',
    'file:///C:/video.mp4',
    'javascript:alert(1)',
    'ftp://example.com/video.mp4',
    '/video.mp4',
    'not a url',
    'https:example.com/video.mp4',
    'https://example.com/vi\ndeo.mp4',
    'https://example.com\\video.mp4',
  ]) {
    assert.ok(getVideoUrlError(url), `must reject ${url}`);
  }
  assert.equal(getVideoUrlError(''), null);
  assert.equal(getVideoUrlError('https://example.com/video.mp4'), null);
  assert.equal(getVideoUrlError('http://example.com/media'), null);
});

test('signed video URLs retain their exact path and query after trimming', () => {
  const signed = 'https://cdn.example.com/a%2Fb?token=AbC%2F123&expires=123456';
  assert.equal(normalizeVideoUrl(`  ${signed}\n`), signed);
  assert.equal(getVideoUrlError(signed), null);
});

test('only real finite durations are accepted; unknown duration is never invented', () => {
  for (const seconds of [NaN, Infinity, -Infinity, -1, 0]) {
    assert.equal(isValidVideoDuration(seconds), false);
    assert.equal(formatVideoDuration(seconds), '');
  }
  assert.equal(isValidVideoDuration(0.25), true);
  assert.equal(formatVideoDuration(0.25), '0:00');
  assert.equal(formatVideoDuration(75.9), '1:15');
  assert.equal(formatVideoDuration(3602), '1:00:02');
  assert.equal(formatVideoDuration(3661), '1:01:01');
});
