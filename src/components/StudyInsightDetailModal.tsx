import React, { useState } from 'react';
import { 
  X, 
  Heart, 
  Send, 
  Share2, 
  CheckCircle,
  Calendar,
  Clock,
  Sparkles,
  Lightbulb
} from 'lucide-react';
import { StudyInsight, Comment } from '../types';
import { calculateReadingTime } from '../utils/readingTime';
import { VideoPlayer } from './VideoPlayer';
import { LegacyVideoRecovery } from './LegacyVideoRecovery';
import type { RecoverVideoHandler } from './LegacyVideoRecovery';
import { getLegacyVideoId } from '../utils/video';

interface StudyInsightDetailModalProps {
  insight: StudyInsight | null;
  onClose: () => void;
  onLike: (id: string) => void;
  onAddComment: (insightId: string, comment: Comment) => void;
  onRecoverVideo?: RecoverVideoHandler;
  onRequestLogin?: () => void;
}

export const StudyInsightDetailModal: React.FC<StudyInsightDetailModalProps> = ({
  insight,
  onClose,
  onLike,
  onAddComment,
  onRecoverVideo,
  onRequestLogin,
}) => {
  const [commentText, setCommentText] = useState('');
  const [authorName, setAuthorName] = useState('');
  const [copied, setCopied] = useState(false);
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  if (!insight) return null;

  const readingTime = calculateReadingTime(insight.content);
  const images = insight.images && insight.images.length > 0 ? insight.images : (insight.coverImage ? [insight.coverImage] : []);

  const handleCommentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    const newComment: Comment = {
      id: `ic-${Date.now()}`,
      author: authorName.trim() || '求知同行者',
      avatar: `https://images.unsplash.com/photo-${1535713875002 + Math.floor(Math.random() * 100)}?auto=format&fit=crop&w=120&q=80`,
      content: commentText.trim(),
      date: new Date().toISOString().split('T')[0],
      likes: 1
    };

    onAddComment(insight.id, newComment);
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
            <span className="font-semibold text-indigo-800 bg-indigo-100 px-2 py-0.5 rounded-full">
              {insight.subject}
            </span>
            {insight.difficulty && (
              <span className="text-purple-700 bg-purple-100 px-2 py-0.5 rounded-full font-medium">
                {insight.difficulty}
              </span>
            )}
            <span className="hidden sm:inline">·</span>
            <span className="hidden sm:inline">{insight.date}</span>
            <span className="hidden sm:inline">·</span>
            <span className="flex items-center gap-1 text-indigo-800 bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-200/60 font-medium">
              <Clock className="w-3 h-3 text-indigo-600" />
              <span>预计阅读 {readingTime.minutes} 分钟</span>
            </span>
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
          {/* Title & Metadata Card */}
          <div className="space-y-3">
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold font-serif text-stone-900 leading-snug">
              {insight.title}
            </h1>

            <div className="flex flex-wrap items-center gap-3 text-xs text-stone-500 py-2 px-3 rounded-xl bg-stone-50 border border-stone-100">
              <div className="flex items-center gap-1.5 font-medium text-indigo-800">
                <Clock className="w-3.5 h-3.5 text-indigo-600" />
                <span>预计阅读时长：约 {readingTime.minutes} 分钟</span>
              </div>
              <span>·</span>
              <span>正文共 {readingTime.wordCount} 字</span>
              <span>·</span>
              <div className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-stone-400" />
                <span>发布于 {insight.date}</span>
              </div>
              {insight.author && (
                <>
                  <span>·</span>
                  <span className="font-medium text-stone-700">作者：{insight.author}</span>
                </>
              )}
            </div>
          </div>

          {/* Core Takeaway Callout Box */}
          <div className="p-4 rounded-xl bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-200/80 shadow-xs">
            <div className="flex items-center gap-2 font-bold text-sm text-indigo-900 mb-1.5">
              <Lightbulb className="w-4 h-4 text-amber-500 fill-amber-400" />
              <span>核心心得感悟与底层提炼：</span>
            </div>
            <p className="text-xs sm:text-sm text-indigo-950 leading-relaxed font-medium">
              {insight.takeaway}
            </p>
          </div>

          {/* Video Player Section */}
          {insight.videoUrl && (
            getLegacyVideoId(insight.videoUrl) && onRecoverVideo ? (
              <LegacyVideoRecovery key={`${insight.id}:${insight.videoUrl}`} authorId={insight.authorId} onRecover={onRecoverVideo} onRequestLogin={onRequestLogin} />
            ) : <VideoPlayer src={insight.videoUrl} title="配套视频演示与讲解" />
          )}

          {/* Image Gallery */}
          {images.length > 0 && !insight.videoUrl && (
            <div className="space-y-3">
              <div className="aspect-16/9 rounded-xl overflow-hidden bg-stone-100 border border-stone-200">
                <img
                  src={images[activeImageIndex]}
                  alt={insight.title}
                  className="w-full h-full object-cover"
                />
              </div>

              {images.length > 1 && (
                <div className="flex gap-2 overflow-x-auto pb-1">
                  {images.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setActiveImageIndex(idx)}
                      className={`relative w-20 h-14 rounded-lg overflow-hidden shrink-0 border-2 transition-all ${
                        activeImageIndex === idx ? 'border-indigo-500 scale-95' : 'border-transparent opacity-70 hover:opacity-100'
                      }`}
                    >
                      <img src={img} alt="" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Formatted Text Content */}
          <div className="prose prose-stone max-w-none text-stone-700 text-sm sm:text-base leading-relaxed space-y-4">
            {insight.content.split('\n\n').map((paragraph, index) => {
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
          <div className="flex flex-wrap gap-1.5 pt-4 border-t border-stone-100">
            {insight.tags.map((tag) => (
              <span key={tag} className="text-xs px-2.5 py-1 rounded-full bg-stone-100 text-stone-700 font-medium">
                #{tag}
              </span>
            ))}
          </div>

          {/* Like Interaction */}
          <div className="flex items-center justify-between p-4 rounded-xl bg-indigo-50/50 border border-indigo-100">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-indigo-600" />
              <span className="text-xs text-stone-600">觉得这篇心得对你有启发？给作者点赞支持吧～</span>
            </div>

            <button
              onClick={() => onLike(insight.id)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-xs transition-colors"
            >
              <Heart className="w-4 h-4 fill-white" />
              <span>获得启发 ({insight.likesCount})</span>
            </button>
          </div>

          {/* Comments / Discussions */}
          <div className="space-y-4 pt-2">
            <h3 className="font-bold text-base text-stone-900">
              探讨与思想碰撞 ({insight.comments.length})
            </h3>

            {/* Form */}
            <form onSubmit={handleCommentSubmit} className="space-y-2 bg-stone-50 p-4 rounded-xl border border-stone-200">
              <input
                type="text"
                placeholder="你的昵称（选填，默认：求知同行者）"
                value={authorName}
                onChange={(e) => setAuthorName(e.target.value)}
                className="w-full px-3 py-1.5 text-xs bg-white border border-stone-200 rounded-lg outline-hidden focus:border-indigo-500"
              />
              <div className="flex gap-2">
                <textarea
                  rows={2}
                  placeholder="写下你的理解、质疑、补充或学习感受..."
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  className="flex-1 px-3 py-2 text-xs sm:text-sm bg-white border border-stone-200 rounded-lg outline-hidden focus:border-indigo-500 resize-none"
                />
                <button
                  type="submit"
                  disabled={!commentText.trim()}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-xs font-semibold rounded-lg flex items-center gap-1 self-end transition-colors"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>交流</span>
                </button>
              </div>
            </form>

            <div className="space-y-2.5">
              {insight.comments.length === 0 ? (
                <p className="text-xs text-stone-400 py-2 text-center">暂无讨论，欢迎分享你的独到见解～</p>
              ) : (
                insight.comments.map((comment) => (
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
