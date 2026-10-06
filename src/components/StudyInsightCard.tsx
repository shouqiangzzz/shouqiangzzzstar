import React from 'react';
import { 
  Heart, 
  MessageSquare, 
  Play, 
  Images, 
  Clock, 
  Sparkles, 
  BookOpenCheck,
  Calendar,
  Layers
} from 'lucide-react';
import { StudyInsight } from '../types';
import { calculateReadingTime } from '../utils/readingTime';

interface StudyInsightCardProps {
  insight: StudyInsight;
  onLike: (id: string) => void;
  onOpenDetail: (insight: StudyInsight) => void;
}

export const StudyInsightCard: React.FC<StudyInsightCardProps> = ({
  insight,
  onLike,
  onOpenDetail
}) => {
  const readingTime = calculateReadingTime(insight.content || '');

  const getSubjectBadge = (subj: string) => {
    switch (subj) {
      case '计算机底层':
        return { color: 'bg-indigo-100 text-indigo-800 border-indigo-200' };
      case '前端与架构':
        return { color: 'bg-cyan-100 text-cyan-800 border-cyan-200' };
      case '算法思想':
        return { color: 'bg-violet-100 text-violet-800 border-violet-200' };
      case '学习方法论':
        return { color: 'bg-amber-100 text-amber-800 border-amber-200' };
      default:
        return { color: 'bg-emerald-100 text-emerald-800 border-emerald-200' };
    }
  };

  const getDifficultyBadge = (diff?: string) => {
    switch (diff) {
      case '底层硬核':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      case '进阶实战':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      default:
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    }
  };

  const subjInfo = getSubjectBadge(insight.subject || '其他');

  return (
    <article className="group bg-white rounded-2xl overflow-hidden border border-stone-200/80 hover:border-indigo-300 shadow-xs hover:shadow-lg transition-all duration-300 flex flex-col justify-between">
      <div>
        {/* Cover / Media preview if available */}
        {insight.coverImage && (
          <div 
            onClick={() => onOpenDetail(insight)}
            className="relative aspect-16/9 overflow-hidden cursor-pointer bg-stone-900"
          >
            <img
              src={insight.coverImage}
              alt={insight.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-stone-950/70 via-transparent to-black/20" />

            {/* Media badge */}
            <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5">
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border backdrop-blur-xs ${subjInfo.color}`}>
                {insight.subject}
              </span>
              {insight.difficulty && (
                <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-md border backdrop-blur-xs ${getDifficultyBadge(insight.difficulty)}`}>
                  {insight.difficulty}
                </span>
              )}
            </div>

            {/* Video preview icon */}
            {(insight.mediaType === 'video' || insight.videoUrl) && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-11 h-11 rounded-full bg-white/90 backdrop-blur-xs flex items-center justify-center text-stone-900 shadow-md group-hover:scale-110 group-hover:bg-indigo-600 group-hover:text-white transition-all">
                  <Play className="w-4 h-4 ml-0.5 fill-current" />
                </div>
              </div>
            )}

            {/* Image indicator */}
            {insight.images && insight.images.length > 1 && (
              <div className="absolute bottom-2 right-2.5 flex items-center gap-1 px-2 py-0.5 rounded-full bg-black/60 backdrop-blur-xs text-white text-[10px]">
                <Images className="w-3 h-3" />
                <span>{insight.images.length} 图解</span>
              </div>
            )}
          </div>
        )}

        <div className="p-5">
          {/* Metadata bar if no cover or secondary info */}
          {!insight.coverImage && (
            <div className="flex items-center gap-2 mb-2.5">
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${subjInfo.color}`}>
                {insight.subject}
              </span>
              {insight.difficulty && (
                <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-md border ${getDifficultyBadge(insight.difficulty)}`}>
                  {insight.difficulty}
                </span>
              )}
            </div>
          )}

          {/* Date & Reading time */}
          <div className="flex items-center gap-2.5 text-xs text-stone-400 mb-2">
            <div className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" />
              <span>{insight.date}</span>
            </div>
            <span>·</span>
            <div className="flex items-center gap-1 text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-200/60 text-[11px] font-medium">
              <Clock className="w-3 h-3 text-indigo-600" />
              <span>{readingTime.label}</span>
            </div>
          </div>

          {/* Title */}
          <h3
            onClick={() => onOpenDetail(insight)}
            className="font-bold text-base text-stone-900 group-hover:text-indigo-700 cursor-pointer line-clamp-2 leading-snug mb-3"
          >
            {insight.title}
          </h3>

          {/* Core Takeaway Box (核心顿悟) */}
          <div className="p-3 rounded-xl bg-indigo-50/70 border border-indigo-100/80 mb-3 text-xs text-indigo-950 leading-relaxed">
            <div className="flex items-center gap-1.5 font-bold text-[11px] text-indigo-800 mb-1">
              <Sparkles className="w-3 h-3 text-indigo-600" />
              <span>核心心得感悟：</span>
            </div>
            <p className="line-clamp-2 text-stone-700 text-xs">
              {insight.takeaway || ''}
            </p>
          </div>

          {/* Tags */}
          <div className="flex flex-wrap gap-1">
            {(insight.tags || []).map((tag, idx) => (
              <span key={`${tag}-${idx}`} className="text-[10px] px-2 py-0.5 rounded-md bg-stone-100 text-stone-600 font-medium">
                #{tag}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="px-5 py-3 border-t border-stone-100 flex items-center justify-between text-xs text-stone-500 bg-stone-50/50">
        <div className="flex items-center gap-3">
          <button
            onClick={() => onLike(insight.id)}
            className="flex items-center gap-1 hover:text-rose-600 transition-colors"
          >
            <Heart className="w-3.5 h-3.5 text-rose-500" />
            <span>{insight.likesCount || 0}</span>
          </button>

          <button
            onClick={() => onOpenDetail(insight)}
            className="flex items-center gap-1 hover:text-stone-900 transition-colors"
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>{insight.comments?.length || 0}</span>
          </button>
        </div>

        <button
          onClick={() => onOpenDetail(insight)}
          className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
        >
          <span>研读完整心得</span>
          <span>→</span>
        </button>
      </div>
    </article>
  );
};
