import React from 'react';
import { Heart, MessageSquare, Tag, User, Video, Calendar } from 'lucide-react';
import { StoryItem } from '../types';

interface StoryCardProps {
  story: StoryItem;
  onLike: (id: string) => void;
  onOpenDetail: (story: StoryItem) => void;
}

export const StoryCard: React.FC<StoryCardProps> = ({
  story,
  onLike,
  onOpenDetail
}) => {
  return (
    <article className="group bg-white rounded-2xl overflow-hidden border border-stone-200/80 hover:border-rose-300 shadow-xs hover:shadow-lg transition-all duration-300 flex flex-col justify-between">
      <div>
        {/* Cover image if available */}
        {story.coverImage && (
          <div 
            onClick={() => onOpenDetail(story)}
            className="relative aspect-16/9 overflow-hidden cursor-pointer bg-stone-100"
          >
            <img
              src={story.coverImage}
              alt={story.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
            <div className="absolute top-2.5 left-2.5">
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-rose-500 text-white shadow-xs">
                {story.category}
              </span>
            </div>
          </div>
        )}

        <div className="p-5">
          {/* Author bar */}
          <div className="flex items-center gap-2.5 mb-3">
            <img
              src={story.authorAvatar}
              alt={story.author}
              className="w-8 h-8 rounded-full object-cover border border-stone-200"
            />
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-semibold text-xs text-stone-900">{story.author}</span>
                {story.roleBadge && (
                  <span className="text-[10px] px-1.5 py-0.2 rounded-sm bg-stone-100 text-stone-600">
                    {story.roleBadge}
                  </span>
                )}
              </div>
              <div className="text-[10px] text-stone-400 flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                <span>{story.date}</span>
              </div>
            </div>
          </div>

          {/* Title */}
          <h3
            onClick={() => onOpenDetail(story)}
            className="font-bold text-base text-stone-900 group-hover:text-rose-700 cursor-pointer line-clamp-2 leading-snug mb-2"
          >
            {story.title}
          </h3>

          {/* Summary */}
          <p className="text-xs sm:text-sm text-stone-600 line-clamp-3 leading-relaxed mb-3">
            {story.summary}
          </p>

          {/* Tags */}
          <div className="flex flex-wrap gap-1 mb-2">
            {story.tags.map((tag) => (
              <span key={tag} className="text-[10px] px-2 py-0.5 rounded-md bg-stone-50 border border-stone-100 text-stone-600">
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
            onClick={() => onLike(story.id)}
            className="flex items-center gap-1 hover:text-rose-600 transition-colors"
          >
            <Heart className="w-3.5 h-3.5 text-rose-500" />
            <span>{story.likesCount}</span>
          </button>

          <button
            onClick={() => onOpenDetail(story)}
            className="flex items-center gap-1 hover:text-stone-900 transition-colors"
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>{story.comments.length}</span>
          </button>
        </div>

        <button
          onClick={() => onOpenDetail(story)}
          className="text-xs font-semibold text-rose-600 hover:text-rose-800"
        >
          查看故事全文 →
        </button>
      </div>
    </article>
  );
};
