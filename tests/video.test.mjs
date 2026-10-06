import assert from 'node:assert/strict';
import test from 'node:test';
import {
  formatVideoDuration,
  getLegacyVideoId,
  getMediaErrorMessage,
  getVideoSourceError,
  getVideoUrlError,
  isValidVideoDuration,
  normalizeVideoUrl,
} from '../src/utils/video.ts';

test('published video sources reject local preview URLs and malformed locations', () => {
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

test('temporary file previews are enabled explicitly and never become published sources', () => {
  for (const source of ['blob:https://example.com/temporary-id', 'blob:null/temporary-id']) {
    assert.equal(getVideoSourceError(source, true), null);
    assert.ok(getVideoSourceError(source));
    assert.ok(getVideoUrlError(source));
  }
  for (const source of ['data:video/mp4;base64,AAAA', 'file:///C:/video.mp4', 'javascript:alert(1)', 'blob:https://example.com/has spaces']) {
    assert.ok(getVideoSourceError(source, true));
  }
  assert.equal(getVideoSourceError('https://example.com/uploaded-original.mp4'), null);
});

test('legacy video IDs explain the missing reader without becoming playable or publishable URLs', () => {
  const source = 'sq_video://vid_1790934730487_82owq';
  assert.equal(getLegacyVideoId(source), 'vid_1790934730487_82owq');
  assert.equal(getLegacyVideoId(`  ${source}\n`), 'vid_1790934730487_82owq');
  for (const localPreview of [false, true]) {
    assert.equal(getVideoSourceError(source, localPreview),
      '使用旧版视频接口，当前站点缺少对应读取接口，不能从视频 ID 还原原文件，需要从原上传站点导出并重新上传。');
  }
  assert.ok(getVideoUrlError(source));
});

test('legacy references reject paths, encoded IDs, parameters and unsafe or missing IDs', () => {
  for (const source of [
    'sq_video://',
    'sq_video://../video',
    'sq_video://vid_1790934730487_82owq/extra',
    'sq_video://vid_1790934730487_82owq?token=abc',
    'sq_video://vid_1790934730487_82owq#fragment',
    'sq_video://vid%2F1790934730487',
    'sq_video://vid_1790934730487_82owq\\extra',
    'sq_video://vid_1790934730487_82 owq',
    'sq_video://vid_1790934730487_82\nowq',
    `sq_video://${'a'.repeat(129)}`,
    'https://example.com/sq_video://vid_1790934730487_82owq',
  ]) {
    assert.equal(getLegacyVideoId(source), null, `must not recognize ${source}`);
    if (source.startsWith('sq_video://')) {
      assert.match(getVideoSourceError(source), /地址无效/);
    }
  }
  for (const source of ['https://example.com/video.mp4', 'http://example.com/video.mp4']) {
    assert.equal(getLegacyVideoId(source), null);
    assert.equal(getVideoSourceError(source), null);
    assert.equal(getVideoSourceError(source, true), null);
  }
});

test('playback errors guide users to local original files without pasted-link instructions', () => {
  for (const code of [1, 2, 3, 4, undefined]) {
    assert.doesNotMatch(getMediaErrorMessage(code), /直链|粘贴|填写.*链接/);
    assert.doesNotMatch(getMediaErrorMessage(code, true), /直链|粘贴|填写.*链接/);
  }
  assert.match(getMediaErrorMessage(2, true), /本地视频/);
  assert.match(getMediaErrorMessage(3, true), /解码/);
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
