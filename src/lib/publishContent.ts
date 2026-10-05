import type { Comment, LifePost, MediaType, StoryItem, StudyInsight } from '../types';

/** Firestore rejects undefined, including inside optional nested comment fields. */
export function stripUndefined<T>(value: T): T {
  if (Array.isArray(value)) {
    return value.filter((item) => item !== undefined).map(stripUndefined) as T;
  }

  if (value !== null && typeof value === 'object') {
    const prototype = Object.getPrototypeOf(value);
    if (prototype === Object.prototype || prototype === null) {
      return Object.fromEntries(
        Object.entries(value)
          .filter(([, item]) => item !== undefined)
          .map(([key, item]) => [key, stripUndefined(item)])
      ) as T;
    }
  }

  // Preserve Firestore-specific values and other class instances.
  return value;
}

export async function publishContent<T extends { id: string }>(
  content: T,
  authorId: string | undefined,
  persist: (data: T & { authorId: string; createdAt: string }) => Promise<void>
): Promise<T & { authorId: string; createdAt: string }> {
  if (!authorId) {
    throw new Error('请先登录后再发布，登录后其他用户才能看到并播放你的视频。');
  }

  const published = stripUndefined({
    ...content,
    authorId,
    createdAt: new Date().toISOString()
  });

  try {
    await persist(published);
  } catch (error) {
    const code = (error as { code?: string } | null)?.code;
    if (code === 'permission-denied' || code === 'unauthenticated') {
      throw new Error('发布失败：登录状态或发布权限已失效，请重新登录后重试。');
    }
    throw new Error('发布失败：内容未同步成功，请检查网络后重试。已填写的内容会保留。');
  }

  return published;
}

/** Cloud documents replace matching cached rows; examples and local rows stay available. */
export function mergePublishedRows<T extends { id: string }>(current: T[], published: T[]): T[] {
  const rows = new Map<string, T>();
  for (const row of published) rows.set(row.id, row);
  for (const row of current) {
    if (!rows.has(row.id)) rows.set(row.id, row);
  }
  return [...rows.values()];
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function hasCoreFields(data: unknown, id: string, fields: string[]): data is Record<string, unknown> {
  return typeof id === 'string' && id.trim().length > 0 && isRecord(data) && fields.every((field) =>
    typeof data[field] === 'string' && (data[field] as string).trim().length > 0
  );
}

function optionalString(value: unknown): string | undefined {
  return typeof value === 'string' ? value : undefined;
}

function stringList(value: unknown): string[] {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === 'string') : [];
}

function count(value: unknown): number {
  return typeof value === 'number' && Number.isFinite(value) && value >= 0 ? value : 0;
}

function commentList(value: unknown): Comment[] {
  if (!Array.isArray(value)) return [];
  return value.filter((item) => isRecord(item) && typeof item.id === 'string' && item.id.trim()
    && typeof item.content === 'string').map((item) => ({
      ...item,
      author: optionalString(item.author) || '社区用户',
      avatar: optionalString(item.avatar) || '',
      date: optionalString(item.date) || '',
      likes: count(item.likes)
    } as Comment));
}

function mediaType(value: unknown, videoUrl: string | undefined, images: string[]): MediaType {
  if (value === 'image' || value === 'video' || value === 'mixed' || value === 'text') return value;
  return videoUrl ? 'video' : images.length > 0 ? 'image' : 'text';
}

function commonFields(data: Record<string, unknown>, id: string) {
  return {
    ...data,
    id,
    date: optionalString(data.date) || optionalString(data.createdAt)?.split('T')[0] || '',
    tags: stringList(data.tags),
    comments: commentList(data.comments),
    likesCount: count(data.likesCount),
    coverImage: optionalString(data.coverImage),
    // A cloud media URL must stay byte-for-byte equal to the author's value.
    videoUrl: optionalString(data.videoUrl),
    videoDuration: optionalString(data.videoDuration)
  };
}

/** Reject incomplete legacy documents before they reach filters and detail components. */
export function normalizeLifePost(data: unknown, id: string): LifePost | null {
  if (!hasCoreFields(data, id, ['title', 'category', 'summary', 'content'])) return null;
  const common = commonFields(data, id);
  const images = stringList(data.images);
  return {
    ...common,
    location: optionalString(data.location),
    coverImage: common.coverImage || '',
    images,
    mediaType: mediaType(data.mediaType, common.videoUrl, images),
    bookmarksCount: count(data.bookmarksCount),
    isFeatured: typeof data.isFeatured === 'boolean' ? data.isFeatured : undefined
  } as LifePost;
}

export function normalizeStory(data: unknown, id: string): StoryItem | null {
  if (!hasCoreFields(data, id, ['title', 'category', 'summary', 'content'])) return null;
  return {
    ...commonFields(data, id),
    author: optionalString(data.author) || '社区用户',
    authorAvatar: optionalString(data.authorAvatar) || '',
    roleBadge: optionalString(data.roleBadge)
  } as StoryItem;
}

export function normalizeStudyInsight(data: unknown, id: string): StudyInsight | null {
  if (!hasCoreFields(data, id, ['title', 'subject', 'takeaway', 'content'])) return null;
  const common = commonFields(data, id);
  const images = stringList(data.images);
  return {
    ...common,
    author: optionalString(data.author),
    authorAvatar: optionalString(data.authorAvatar),
    difficulty: optionalString(data.difficulty),
    images,
    mediaType: mediaType(data.mediaType, common.videoUrl, images)
  } as StudyInsight;
}

/** All authored timestamps are ISO strings; fall back to the displayed date for legacy rows. */
export function publishedDate(row: { date?: string; createdAt?: unknown }): string {
  return optionalString(row.createdAt) || row.date || '';
}
