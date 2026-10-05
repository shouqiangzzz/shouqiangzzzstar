import test from 'node:test';
import assert from 'node:assert/strict';
import { mergePublishedRows, normalizeLifePost, normalizeStory, normalizeStudyInsight, publishContent, publishedDate, stripUndefined } from '../src/lib/publishContent.ts';

test('optional fields in nested comments and arrays are removed without changing media URL', () => {
  const input = {
    id: 'story-original',
    videoUrl: 'https://cdn.example.test/original.mp4',
    coverImage: undefined,
    comments: [{ id: 'comment-1', optional: undefined, nested: { reply: undefined, text: 'hello' } }],
    images: [undefined, 'image.jpg'],
    count: 0,
    featured: false,
    empty: '',
    missing: null
  };
  assert.deepEqual(stripUndefined(input), {
    id: 'story-original',
    videoUrl: 'https://cdn.example.test/original.mp4',
    comments: [{ id: 'comment-1', nested: { text: 'hello' } }],
    images: ['image.jpg'],
    count: 0,
    featured: false,
    empty: '',
    missing: null
  });
  assert.ok('coverImage' in input, 'sanitizing must not mutate the draft');
});

test('sanitization preserves non-plain Firestore values', () => {
  class TimestampValue { seconds = 123; }
  const timestamp = new TimestampValue();
  const date = new Date('2026-10-05T00:00:00Z');
  const clean = stripUndefined({ timestamp, date, empty: undefined });
  assert.equal(clean.timestamp, timestamp);
  assert.equal(clean.date, date);
  assert.ok(!('empty' in clean));
});

test('guest publication requires login and never invokes cloud persistence', async () => {
  let writes = 0;
  await assert.rejects(
    publishContent({ id: 'story-guest' }, undefined, async () => { writes++; }),
    /请先登录/
  );
  assert.equal(writes, 0);
});

test('publication resolves only after persistence acknowledges and sends original content', async () => {
  let acknowledge;
  let submitted;
  let published = false;
  const writeAcknowledged = new Promise((resolve) => { acknowledge = resolve; });
  const pending = publishContent({ id: 'video-1', videoUrl: 'https://cdn.example.test/real.webm', coverImage: undefined }, 'user-ordinary', async (data) => {
    submitted = data;
    await writeAcknowledged;
  }).then((value) => { published = true; return value; });
  await Promise.resolve();
  assert.equal(published, false);
  assert.equal(submitted.authorId, 'user-ordinary');
  assert.equal(submitted.videoUrl, 'https://cdn.example.test/real.webm');
  assert.ok(!('coverImage' in submitted));
  assert.ok(!Number.isNaN(Date.parse(submitted.createdAt)));
  acknowledge();
  assert.deepEqual(await pending, submitted);
  assert.equal(published, true);
});

test('failed write rejects publication with a recoverable error', async () => {
  await assert.rejects(
    publishContent({ id: 'video-1' }, 'user-ordinary', async () => { throw new Error('offline'); }),
    /未同步成功.*检查网络/
  );
});

test('permission failures explain that login must be renewed', async () => {
  await assert.rejects(
    publishContent({ id: 'video-1' }, 'user-ordinary', async () => { throw { code: 'permission-denied' }; }),
    /重新登录/
  );
});

test('canonical public media replaces stale cached media and keeps examples once', () => {
  const current = [
    { id: 'video-1', videoUrl: 'https://cdn.example.test/wrong.mp4' },
    { id: 'example-1', videoUrl: 'https://cdn.example.test/example.mp4' }
  ];
  const remote = [
    { id: 'video-2', videoUrl: 'https://cdn.example.test/new.mp4' },
    { id: 'video-1', videoUrl: 'https://cdn.example.test/original.mp4' }
  ];
  assert.deepEqual(mergePublishedRows(current, remote), [...remote, current[1]]);
  assert.deepEqual(mergePublishedRows(mergePublishedRows(current, remote), remote), [...remote, current[1]]);
});

test('legacy posts default absent arrays and counters and use the canonical document ID', () => {
  const row = normalizeLifePost({ id: 'wrong-stored-id', title: 'Original', category: 'life', summary: 'Summary', content: 'Content' }, 'post-1');
  assert.equal(row.id, 'post-1');
  assert.deepEqual(row.tags, []);
  assert.deepEqual(row.comments, []);
  assert.deepEqual(row.images, []);
  assert.equal(row.likesCount, 0);
  assert.equal(row.bookmarksCount, 0);
  assert.equal(row.date, '');
  assert.equal(row.coverImage, '');
  assert.equal(row.videoUrl, undefined);
});

test('legacy stories retain exact video URL and richer cloud fields', () => {
  const url = 'https://cdn.example.test/Original%20Video.webm?token=abc%2B123#clip';
  const row = normalizeStory({
    title: 'Original', category: '生活', summary: 'Summary', content: 'Content',
    videoUrl: url, createdAt: '2026-10-05T02:03:04.000Z',
    durationSeconds: 18.4, videoMetadata: { codec: 'vp9' }
  }, 'story-1');
  assert.equal(row.videoUrl, url);
  assert.equal(row.date, '2026-10-05');
  assert.equal(row.author, '社区用户');
  assert.equal(row.durationSeconds, 18.4);
  assert.deepEqual(row.videoMetadata, { codec: 'vp9' });
  assert.deepEqual(row.tags, []);
  assert.deepEqual(row.comments, []);
});

test('legacy insights infer media type while preserving actual video URL', () => {
  const url = 'https://cdn.example.test/original.mp4';
  const row = normalizeStudyInsight({ title: 'Insight', subject: '工程实践', takeaway: 'Takeaway', content: 'Content', videoUrl: url }, 'insight-1');
  assert.equal(row.mediaType, 'video');
  assert.equal(row.videoUrl, url);
  assert.deepEqual(row.images, []);
  assert.deepEqual(row.tags, []);
  assert.deepEqual(row.comments, []);
});

test('structurally invalid cloud documents are skipped safely in every collection', () => {
  const story = { title: 'Title', category: 'life', summary: 'Summary', content: 'Content' };
  const insight = { title: 'Title', subject: 'Subject', takeaway: 'Takeaway', content: 'Content' };
  for (const normalize of [normalizeLifePost, normalizeStory]) {
    assert.equal(normalize({ title: 'Title only' }, 'doc-1'), null);
    assert.equal(normalize({ ...story, content: {} }, 'doc-1'), null);
    assert.equal(normalize({ ...story, summary: '   ' }, 'doc-1'), null);
    assert.equal(normalize(story, ''), null);
    assert.equal(normalize(null, 'doc-1'), null);
  }
  assert.equal(normalizeStudyInsight({ title: 'Title only' }, 'doc-1'), null);
  assert.equal(normalizeStudyInsight({ ...insight, subject: [] }, 'doc-1'), null);
  assert.equal(normalizeStudyInsight({ ...insight, takeaway: '   ' }, 'doc-1'), null);
});

test('bad optional arrays and comments cannot crash public rendering', () => {
  const row = normalizeLifePost({
    title: 'Title', category: 'life', summary: 'Summary', content: 'Content',
    tags: ['valid', {}, null], images: false, likesCount: NaN, bookmarksCount: -3,
    location: {}, coverImage: {}, videoUrl: {},
    comments: [null, {}, { id: 'comment-1', content: 'Valid', author: {}, likes: -1 }]
  }, 'post-1');
  assert.deepEqual(row.tags, ['valid']);
  assert.deepEqual(row.images, []);
  assert.equal(row.likesCount, 0);
  assert.equal(row.bookmarksCount, 0);
  assert.equal(row.location, undefined);
  assert.equal(row.coverImage, '');
  assert.equal(row.videoUrl, undefined);
  assert.deepEqual(row.comments, [{ id: 'comment-1', content: 'Valid', author: '社区用户', avatar: '', date: '', likes: 0 }]);
});

test('sorting uses authored ISO timestamps and safely falls back for legacy timestamp types', () => {
  assert.equal(publishedDate({ createdAt: '2026-10-05T02:03:04Z', date: '2025-01-01' }), '2026-10-05T02:03:04Z');
  assert.equal(publishedDate({ createdAt: { seconds: 123 }, date: '2026-10-04' }), '2026-10-04');
  assert.equal(publishedDate({}), '');
});
