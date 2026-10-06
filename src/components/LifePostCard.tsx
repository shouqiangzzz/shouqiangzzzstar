import React from 'react';
import { 
  Heart, 
  Bookmark, 
  MessageCircle, 
  MapPin, 
  Calendar, 
  Clock,
  Play, 
  Images, 
  FileText 
} from 'lucide-react';
import { LifePost } from '../types';
import { calculateReadingTime } from '../utils/readingTime';

interface LifePostCardProps {
  post: LifePost;
  isBookmarked: boolean;
  onToggleBookmark: (id: string) => void;
  onLike: (id: string) => void;
  onOpenDetail: (post: LifePost) => void;
}

export const LifePostCard: React.FC<LifePostCardProps> = ({
  post,
  isBookmarked,
  onToggleBookmark,
  onLike,
  onOpenDetail
}) => {
  const readingTime = calculateReadingTime(post.content);

  const getCategoryLabel = (cat: string) => {
    switch (cat) {
      case 'life': return { label: '生活日常', color: 'bg-emerald-100 text-emerald-800' };
      case 'study': return { label: '深度学习', color: 'bg-indigo-100 text-indigo-800' };
      case 'tech': return { label: '数码探索', color: 'bg-blue-100 text-blue-800' };
      case 'milestone': return { label: '人生里程碑', color: 'bg-amber-100 text-amber-800' };
      default: return { label: '探索经历', color: 'bg-stone-100 text-stone-800' };
    }
  };

  const catInfo = getCategoryLabel(post.category);

  return (
    <article className="group bg-white rounded-2xl overflow-hidden border border-stone-200/80 hover:border-stone-300 shadow-xs hover:shadow-lg transition-all duration-300 flex flex-col">
      {/* Media Cover */}
      <div 
        onClick={() => onOpenDetail(post)} 
        className="relative aspect-16/10 overflow-hidden cursor-pointer bg-stone-900"
      >
        <img
          src={post.coverImage}
          alt={post.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-stone-950/60 via-transparent to-black/10" />

        {/* Media Type Badge */}
        <div className="absolute top-3 left-3 flex items-center gap-1.5">
          <span className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full ${catInfo.color} shadow-xs`}>
            {catInfo.label}
          </span>
          {post.mediaType === 'video' && (
            <span className="flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full bg-black/60 backdrop-blur-xs text-white">
              <Play className="w-3 h-3 fill-white" />
              <span>视频 {post.videoDuration || ''}</span>
            </span>
          )}
          {post.mediaType === 'mixed' && (
            <span className="flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full bg-black/60 backdrop-blur-xs text-white">
              <Images className="w-3 h-3" />
              <span>视频+图集</span>
            </span>
          )}
          {post.mediaType === 'image' && post.images.length > 1 && (
            <span className="flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full bg-black/60 backdrop-blur-xs text-white">
              <Images className="w-3 h-3" />
              <span>{post.images.length}张图</span>
            </span>
          )}
        </div>

        {/* Video Play Overlay */}
        {(post.mediaType === 'video' || post.videoUrl) && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-12 h-12 rounded-full bg-white/90 backdrop-blur-xs flex items-center justify-center text-stone-900 shadow-md group-hover:scale-110 group-hover:bg-amber-400 group-hover:text-black transition-all">
              <Play className="w-5 h-5 ml-0.5 fill-current" />
            </div>
          </div>
        )}

        {/* Location if any */}
        {post.location && (
          <div className="absolute bottom-2.5 left-3 flex items-center gap-1 text-[11px] text-white/90 drop-shadow-xs">
            <MapPin className="w-3 h-3 text-amber-300" />
            <span className="truncate max-w-[200px]">{post.location}</span>
          </div>
        )}
      </div>

      {/* Post Content Body */}
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          {/* Date & Read indicator */}
          <div className="flex items-center gap-2.5 text-xs text-stone-400 mb-2">
            <div className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" />
              <span>{post.date}</span>
            </div>
            <span>·</span>
            <div className="flex items-center gap-1 text-amber-700 font-medium bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200/60 text-[11px]">
              <Clock className="w-3 h-3 text-amber-600" />
              <span>{readingTime.label}</span>
            </div>
          </div>

          {/* Title */}
          <h3 
            onClick={() => onOpenDetail(post)}
            className="font-bold text-base sm:text-lg text-stone-900 group-hover:text-amber-700 cursor-pointer transition-colors leading-snug line-clamp-2 mb-2"
          >
            {post.title}
          </h3>

          {/* Summary */}
          <p className="text-stone-600 text-xs sm:text-sm line-clamp-2 leading-relaxed mb-3">
            {post.summary}
          </p>

          {/* Tags */}
          <div className="flex flex-wrap gap-1.5 mb-4">
            {(post.tags || []).map((tag, idx) => (
              <span 
                key={`${tag}-${idx}`} 
                className="text-[11px] px-2 py-0.5 rounded-md bg-stone-100 text-stone-600 font-medium"
              >
                #{tag}
              </span>
            ))}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="pt-3 border-t border-stone-100 flex items-center justify-between text-xs text-stone-500">
          <div className="flex items-center gap-3">
            {/* Like */}
            <button
              onClick={() => onLike(post.id)}
              className="flex items-center gap-1 hover:text-rose-600 transition-colors"
            >
              <Heart className="w-4 h-4 text-rose-500" />
              <span>{post.likesCount || 0}</span>
            </button>

            {/* Comments count */}
            <button
              onClick={() => onOpenDetail(post)}
              className="flex items-center gap-1 hover:text-stone-900 transition-colors"
            >
              <MessageCircle className="w-4 h-4" />
              <span>{post.comments?.length || 0}</span>
            </button>
          </div>

          {/* Bookmark & Read Full */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => onToggleBookmark(post.id)}
              className={`p-1.5 rounded-md transition-colors ${
                isBookmarked 
                  ? 'text-amber-600 bg-amber-50' 
                  : 'text-stone-400 hover:text-stone-700 hover:bg-stone-100'
              }`}
              title="收藏本篇"
            >
              <Bookmark className={`w-4 h-4 ${isBookmarked ? 'fill-current' : ''}`} />
            </button>

            <button
              onClick={() => onOpenDetail(post)}
              className="text-xs font-semibold text-amber-700 hover:text-amber-900"
            >
              阅读全文 →
            </button>
          </div>
        </div>
      </div>
    </article>
  );
};
