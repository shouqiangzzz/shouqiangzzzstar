import React, { useState } from 'react';
import { 
  X, 
  Heart, 
  Send, 
  Share2, 
  CheckCircle,
  Calendar,
  Sparkles
} from 'lucide-react';
import { StoryItem, Comment } from '../types';
import { VideoPlayer } from './VideoPlayer';
import { LegacyVideoRecovery } from './LegacyVideoRecovery';
import type { RecoverVideoHandler } from './LegacyVideoRecovery';
import { getLegacyVideoId } from '../utils/video';

interface StoryDetailModalProps {
  story: StoryItem | null;
  onClose: () => void;
  onLike: (id: string) => void;
  onAddComment: (storyId: string, comment: Comment) => void;
  onRecoverVideo?: RecoverVideoHandler;
  onRequestLogin?: () => void;
}

export const StoryDetailModal: React.FC<StoryDetailModalProps> = ({
  story,
  onClose,
  onLike,
  onAddComment,
  onRecoverVideo,
  onRequestLogin,
}) => {
  const [commentText, setCommentText] = useState('');
  const [authorName, setAuthorName] = useState('');
  const [copied, setCopied] = useState(false);

  if (!story) return null;

  const handleCommentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    const newComment: Comment = {
      id: `sc-${Date.now()}`,
      author: authorName.trim() || '温暖读者',
      avatar: `https://images.unsplash.com/photo-${1535713875002 + Math.floor(Math.random() * 100)}?auto=format&fit=crop&w=120&q=80`,
      content: commentText.trim(),
      date: new Date().toISOString().split('T')[0],
      likes: 1
    };

    onAddComment(story.id, newComment);
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
        className="relative w-full max-w-3xl bg-white rounded-2xl shadow-2xl overflow-hidden my-auto flex flex-col max-h-[92vh] animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Bar */}
        <div className="flex items-center justify-between px-6 py-3.5 border-b border-stone-200 bg-stone-50/80 sticky top-0 z-20">
          <div className="flex items-center gap-2 text-xs">
            <span className="font-semibold text-rose-800 bg-rose-100 px-2 py-0.5 rounded-full">
              {story.category}
            </span>
            <span className="text-stone-400">·</span>
            <span className="text-stone-500">故事故事会</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleShare}
              className="p-2 text-stone-500 hover:text-stone-800 hover:bg-stone-200/60 rounded-full transition-colors"
              title="分享故事"
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
          {/* Author Block */}
          <div className="flex items-center gap-3 p-3 rounded-xl bg-stone-50 border border-stone-100">
            <img
              src={story.authorAvatar}
              alt={story.author}
              className="w-11 h-11 rounded-full object-cover border-2 border-white shadow-xs"
            />
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm text-stone-900">{story.author}</span>
                {story.roleBadge && (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 font-medium border border-rose-150">
                    {story.roleBadge}
                  </span>
                )}
              </div>
              <div className="text-xs text-stone-400 flex items-center gap-1.5 mt-0.5">
                <Calendar className="w-3 h-3" />
                <span>发布于 {story.date}</span>
              </div>
            </div>
          </div>

          {/* Title */}
          <h1 className="text-xl sm:text-2xl font-bold font-serif text-stone-900 leading-snug">
            {story.title}
          </h1>

          {/* Cover image */}
          {story.coverImage && (
            <div className="rounded-xl overflow-hidden aspect-16/9 bg-stone-100 border border-stone-200">
              <img
                src={story.coverImage}
                alt={story.title}
                className="w-full h-full object-cover"
              />
            </div>
          )}

          {/* Video if any */}
          {story.videoUrl && (
            getLegacyVideoId(story.videoUrl) && onRecoverVideo ? (
              <LegacyVideoRecovery key={`${story.id}:${story.videoUrl}`} authorId={story.authorId} onRecover={onRecoverVideo} onRequestLogin={onRequestLogin} />
            ) : <VideoPlayer src={story.videoUrl} title="故事原视频" />
          )}

          {/* Content */}
          <div className="prose prose-stone max-w-none text-stone-700 text-sm sm:text-base leading-relaxed space-y-4">
            {story.content.split('\n\n').map((paragraph, index) => {
              if (paragraph.startsWith('### ')) {
                return (
                  <h3 key={index} className="text-lg sm:text-xl font-bold font-serif text-stone-900 mt-6 mb-2">
                    {paragraph.replace('### ', '')}
                  </h3>
                );
              }
              if (paragraph.startsWith('#### ')) {
                return (
                  <h4 key={index} className="text-base font-semibold text-stone-800 mt-4 mb-2">
                    {paragraph.replace('#### ', '')}
                  </h4>
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
          <div className="flex flex-wrap gap-1.5 pt-4 border-t border-stone-100">
            {story.tags.map((tag) => (
              <span key={tag} className="text-xs px-2.5 py-1 rounded-full bg-stone-100 text-stone-700 font-medium">
                #{tag}
              </span>
            ))}
          </div>

          {/* Like */}
          <div className="flex items-center justify-between p-4 rounded-xl bg-rose-50/50 border border-rose-100">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-rose-500" />
              <span className="text-xs text-stone-600">觉得这个故事触动了你？给作者送上一朵小红花吧～</span>
            </div>

            <button
              onClick={() => onLike(story.id)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-rose-500 hover:bg-rose-600 text-white text-xs font-semibold shadow-xs transition-colors"
            >
              <Heart className="w-4 h-4 fill-white" />
              <span>给TA点赞 ({story.likesCount})</span>
            </button>
          </div>

          {/* Comments */}
          <div className="space-y-4 pt-2">
            <h3 className="font-bold text-base text-stone-900">
              读者互动留言 ({story.comments.length})
            </h3>

            {/* Form */}
            <form onSubmit={handleCommentSubmit} className="space-y-2 bg-stone-50 p-4 rounded-xl border border-stone-200">
              <input
                type="text"
                placeholder="你的昵称（选填）"
                value={authorName}
                onChange={(e) => setAuthorName(e.target.value)}
                className="w-full px-3 py-1.5 text-xs bg-white border border-stone-200 rounded-lg outline-hidden focus:border-rose-500"
              />
              <div className="flex gap-2">
                <textarea
                  rows={2}
                  placeholder="写下你对这个故事的感触或共鸣..."
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  className="flex-1 px-3 py-2 text-xs sm:text-sm bg-white border border-stone-200 rounded-lg outline-hidden focus:border-rose-500 resize-none"
                />
                <button
                  type="submit"
                  disabled={!commentText.trim()}
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white text-xs font-semibold rounded-lg flex items-center gap-1 self-end transition-colors"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>留言</span>
                </button>
              </div>
            </form>

            <div className="space-y-2.5">
              {story.comments.length === 0 ? (
                <p className="text-xs text-stone-400 py-2 text-center">暂无讨论，来做第一个留言交流的朋友吧～</p>
              ) : (
                story.comments.map((comment) => (
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
