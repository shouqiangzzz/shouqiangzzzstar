import React, { useState } from 'react';
import { 
  X, 
  Heart, 
  Bookmark, 
  MapPin, 
  Calendar, 
  Clock,
  Send, 
  Share2,
  CheckCircle
} from 'lucide-react';
import { LifePost, Comment } from '../types';
import { calculateReadingTime } from '../utils/readingTime';
import { VideoPlayer } from './VideoPlayer';

interface LifePostDetailModalProps {
  post: LifePost | null;
  onClose: () => void;
  isBookmarked: boolean;
  onToggleBookmark: (id: string) => void;
  onLike: (id: string) => void;
  onAddComment: (postId: string, comment: Comment) => void;
}

export const LifePostDetailModal: React.FC<LifePostDetailModalProps> = ({
  post,
  onClose,
  isBookmarked,
  onToggleBookmark,
  onLike,
  onAddComment
}) => {
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [commentText, setCommentText] = useState('');
  const [authorName, setAuthorName] = useState('');
  const [copied, setCopied] = useState(false);

  if (!post) return null;

  const readingTime = calculateReadingTime(post.content);

  const handleCommentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    const newComment: Comment = {
      id: `c-${Date.now()}`,
      author: authorName.trim() || '热心读者',
      avatar: `https://images.unsplash.com/photo-${1535713875002 + Math.floor(Math.random() * 100)}?auto=format&fit=crop&w=120&q=80`,
      content: commentText.trim(),
      date: new Date().toISOString().split('T')[0],
      likes: 1
    };

    onAddComment(post.id, newComment);
    setCommentText('');
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/70 backdrop-blur-xs overflow-y-auto">
      <div 
        className="relative w-full max-w-4xl bg-white rounded-2xl shadow-2xl overflow-hidden my-auto flex flex-col max-h-[92vh] animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-stone-200 bg-stone-50/80 sticky top-0 z-20">
          <div className="flex items-center gap-2 text-xs text-stone-500 flex-wrap">
            <span className="font-semibold text-amber-800 bg-amber-100 px-2 py-0.5 rounded-full">
              {post.category === 'life' ? '生活日常' : post.category === 'study' ? '深度学习' : post.category === 'tech' ? '数码探索' : '人生里程碑'}
            </span>
            <span className="hidden sm:inline">·</span>
            <span className="hidden sm:inline">{post.date}</span>
            <span className="hidden sm:inline">·</span>
            <span className="flex items-center gap-1 text-amber-800 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200/60 font-medium">
              <Clock className="w-3 h-3 text-amber-600" />
              <span>预计阅读 {readingTime.minutes} 分钟</span>
            </span>
            {post.location && (
              <>
                <span>·</span>
                <span className="flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-rose-500" />
                  {post.location}
                </span>
              </>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleShare}
              className="p-2 text-stone-500 hover:text-stone-800 hover:bg-stone-200/60 rounded-full transition-colors relative"
              title="复制链接"
            >
              {copied ? <CheckCircle className="w-4 h-4 text-emerald-600" /> : <Share2 className="w-4 h-4" />}
            </button>
            <button
              onClick={onClose}
              className="p-2 text-stone-400 hover:text-stone-700 hover:bg-stone-200/60 rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="overflow-y-auto px-6 py-6 space-y-6">
          {/* Post Title & Meta */}
          <div className="space-y-3">
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold font-serif text-stone-900 leading-snug">
              {post.title}
            </h1>
            <div className="flex flex-wrap items-center gap-3 text-xs text-stone-500 py-2 px-3 rounded-xl bg-stone-50 border border-stone-100">
              <div className="flex items-center gap-1.5 font-medium text-amber-800">
                <Clock className="w-3.5 h-3.5 text-amber-600" />
                <span>预计阅读时长：约 {readingTime.minutes} 分钟</span>
              </div>
              <span>·</span>
              <span>正文共 {readingTime.wordCount} 字</span>
              <span>·</span>
              <div className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-stone-400" />
                <span>发布于 {post.date}</span>
              </div>
            </div>
          </div>

          {/* Media Player Section */}
          {post.videoUrl && (
            <VideoPlayer src={post.videoUrl} title="现场视频记录" />
          )}

          {/* Image Gallery */}
          {post.images && post.images.length > 0 && !post.videoUrl && (
            <div className="space-y-3">
              <div className="aspect-16/9 rounded-xl overflow-hidden bg-stone-100 border border-stone-200">
                <img
                  src={post.images[activeImageIndex] || post.coverImage}
                  alt={post.title}
                  className="w-full h-full object-cover"
                />
              </div>

              {post.images.length > 1 && (
                <div className="flex gap-2 overflow-x-auto pb-1">
                  {post.images.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setActiveImageIndex(idx)}
                      className={`relative w-20 h-14 rounded-lg overflow-hidden shrink-0 border-2 transition-all ${
                        activeImageIndex === idx ? 'border-amber-500 scale-95' : 'border-transparent opacity-70 hover:opacity-100'
                      }`}
                    >
                      <img src={img} alt="" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Post Body (Formatted Text) */}
          <div className="prose prose-stone max-w-none text-stone-700 text-sm sm:text-base leading-relaxed space-y-4 font-normal">
            {post.content.split('\n\n').map((paragraph, index) => {
              if (paragraph.startsWith('### ')) {
                return (
                  <h3 key={index} className="text-lg sm:text-xl font-bold font-serif text-stone-900 mt-6 mb-2">
                    {paragraph.replace('### ', '')}
                  </h3>
                );
              }
              if (paragraph.startsWith('#### ')) {
                return (
                  <h4 key={index} className="text-base sm:text-lg font-semibold text-stone-800 mt-4 mb-2">
                    {paragraph.replace('#### ', '')}
                  </h4>
                );
              }
              if (paragraph.startsWith('- ')) {
                const items = paragraph.split('\n- ');
                return (
                  <ul key={index} className="list-disc pl-5 space-y-1.5 my-3">
                    {items.map((item, i) => (
                      <li key={i} className="text-stone-700">
                        {item.replace('- ', '')}
                      </li>
                    ))}
                  </ul>
                );
              }
              return (
                <p key={index} className="text-stone-700 leading-relaxed whitespace-pre-line">
                  {paragraph}
                </p>
              );
            })}
          </div>

          {/* Tags */}
          <div className="flex flex-wrap gap-2 pt-4 border-t border-stone-100">
            {post.tags.map((tag) => (
              <span key={tag} className="text-xs px-2.5 py-1 rounded-full bg-stone-100 text-stone-700 font-medium">
                #{tag}
              </span>
            ))}
          </div>

          {/* Interaction Bar */}
          <div className="flex items-center justify-between py-4 px-5 rounded-xl bg-stone-50 border border-stone-200">
            <div className="flex items-center gap-4">
              <button
                onClick={() => onLike(post.id)}
                className="flex items-center gap-2 text-sm font-medium px-4 py-2 rounded-lg bg-white border border-stone-200 shadow-xs hover:border-rose-300 text-stone-700 hover:text-rose-600 transition-colors"
              >
                <Heart className="w-4 h-4 text-rose-500 fill-rose-500" />
                <span>点赞 ({post.likesCount})</span>
              </button>

              <button
                onClick={() => onToggleBookmark(post.id)}
                className={`flex items-center gap-2 text-sm font-medium px-4 py-2 rounded-lg border shadow-xs transition-colors ${
                  isBookmarked
                    ? 'bg-amber-500 text-white border-amber-600'
                    : 'bg-white text-stone-700 border-stone-200 hover:border-amber-300'
                }`}
              >
                <Bookmark className={`w-4 h-4 ${isBookmarked ? 'fill-current' : ''}`} />
                <span>{isBookmarked ? '已收藏' : '收藏'}</span>
              </button>
            </div>

            <span className="text-xs text-stone-500">
              {post.comments.length} 条读者讨论
            </span>
          </div>

          {/* Comments Section */}
          <div className="space-y-4 pt-2">
            <h3 className="font-bold text-base text-stone-900 flex items-center gap-2">
              <span>读者留言 & 交流</span>
              <span className="text-xs font-normal text-stone-500">（支持任意读者发言交流）</span>
            </h3>

            {/* Comment Form */}
            <form onSubmit={handleCommentSubmit} className="space-y-2 bg-stone-50/70 p-4 rounded-xl border border-stone-200">
              <input
                type="text"
                placeholder="你的昵称（选填，默认：热心读者）"
                value={authorName}
                onChange={(e) => setAuthorName(e.target.value)}
                className="w-full px-3 py-1.5 text-xs bg-white border border-stone-200 rounded-lg outline-hidden focus:border-amber-500"
              />
              <div className="flex gap-2">
                <textarea
                  rows={2}
                  placeholder="写下你的想法、提问或共鸣..."
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  className="flex-1 px-3 py-2 text-xs sm:text-sm bg-white border border-stone-200 rounded-lg outline-hidden focus:border-amber-500 resize-none"
                />
                <button
                  type="submit"
                  disabled={!commentText.trim()}
                  className="px-4 py-2 bg-amber-600 hover:bg-amber-700 disabled:opacity-50 text-white text-xs font-semibold rounded-lg flex items-center gap-1 self-end transition-colors"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>发送</span>
                </button>
              </div>
            </form>

            {/* Comment List */}
            <div className="space-y-3">
              {post.comments.length === 0 ? (
                <p className="text-xs text-stone-400 py-3 text-center">暂无留言，来做第一个留言的人吧～</p>
              ) : (
                post.comments.map((comment) => (
                  <div key={comment.id} className="flex gap-3 p-3 rounded-xl bg-stone-50 border border-stone-100">
                    <img
                      src={comment.avatar}
                      alt={comment.author}
                      className="w-8 h-8 rounded-full object-cover shrink-0 mt-0.5"
                    />
                    <div className="flex-1 text-xs">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-semibold text-stone-900">{comment.author}</span>
                        <span className="text-[10px] text-stone-400">{comment.date}</span>
                      </div>
                      <p className="text-stone-700 leading-relaxed text-xs sm:text-sm">{comment.content}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
