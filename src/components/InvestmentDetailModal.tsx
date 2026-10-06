import React, { useState } from 'react';
import { X, Heart, Bookmark, Share2, MessageSquare, Send, TrendingUp, AlertTriangle, HelpCircle, CheckCircle2, BookOpen, Clock, Target, Calendar, User, Palette, Sparkles } from 'lucide-react';
import { InvestmentStory, Comment, ChartThemeConfig } from '../types';
import { InvestmentYieldChart } from './InvestmentYieldChart';
import { ChartThemeCustomizer } from './ChartThemeCustomizer';

interface InvestmentDetailModalProps {
  investment: InvestmentStory | null;
  isOpen: boolean;
  onClose: () => void;
  onLike: (id: string) => void;
  onAddComment: (id: string, comment: Comment) => void;
  currentUserName?: string;
  currentUserAvatar?: string;
  globalChartTheme?: ChartThemeConfig;
  onUpdateStoryTheme?: (theme: ChartThemeConfig) => void;
  onOpenSharePoster?: (story: InvestmentStory) => void;
}

export const InvestmentDetailModal: React.FC<InvestmentDetailModalProps> = ({
  investment,
  isOpen,
  onClose,
  onLike,
  onAddComment,
  currentUserName,
  currentUserAvatar,
  globalChartTheme,
  onUpdateStoryTheme,
  onOpenSharePoster
}) => {
  const [newComment, setNewComment] = useState('');
  const [isCopied, setIsCopied] = useState(false);
  const [isDIYOpen, setIsDIYOpen] = useState(false);
  const [modalTheme, setModalTheme] = useState<ChartThemeConfig | undefined>(undefined);

  if (!isOpen || !investment) return null;

  const activeTheme = modalTheme || investment.chartTheme || globalChartTheme;

  const handleCommentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    const commentObj: Comment = {
      id: `ic-${Date.now()}`,
      author: currentUserName || '理智同行者',
      avatar: currentUserAvatar || `https://images.unsplash.com/photo-${1535713875002 + Math.floor(Math.random() * 30)}?auto=format&fit=crop&w=120&q=80`,
      content: newComment.trim(),
      date: new Date().toISOString().split('T')[0],
      likes: 0
    };

    onAddComment(investment.id, commentObj);
    setNewComment('');
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const getReturnBadge = () => {
    switch (investment.returnType) {
      case 'loss':
        return (
          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-rose-500/15 text-rose-400 border border-rose-500/30 flex items-center gap-1.5">
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>{investment.returnRate || '亏损反思'}</span>
          </span>
        );
      case 'question':
        return (
          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-indigo-500/15 text-indigo-400 border border-indigo-500/30 flex items-center gap-1.5">
            <HelpCircle className="w-3.5 h-3.5" />
            <span>{investment.returnRate || '探讨求助'}</span>
          </span>
        );
      case 'profit':
      default:
        return (
          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 flex items-center gap-1.5">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>{investment.returnRate || '长期复利'}</span>
          </span>
        );
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/80 backdrop-blur-md animate-fade-in overflow-y-auto">
      <div className="bg-stone-900 border border-stone-800 rounded-3xl w-full max-w-3xl overflow-hidden shadow-2xl my-8 flex flex-col max-h-[90vh]">
        {/* Header Bar */}
        <div className="px-6 py-4 border-b border-stone-800 flex items-center justify-between bg-stone-900/90 backdrop-blur-md sticky top-0 z-20">
          <div className="flex items-center gap-3">
            <img 
              src={investment.authorAvatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&q=80'} 
              alt={investment.author}
              className="w-10 h-10 rounded-full object-cover border border-amber-500/40"
            />
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm text-stone-100">{investment.author}</span>
                {investment.authorRole && (
                  <span className="text-[11px] px-2 py-0.5 rounded-full bg-stone-800 text-amber-400 border border-amber-500/20 font-medium">
                    {investment.authorRole}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-3 text-[11px] text-stone-400 mt-0.5">
                <span className="flex items-center gap-1">
                  <Calendar className="w-3 h-3 text-stone-500" />
                  {investment.date}
                </span>
                {investment.experienceYears && (
                  <span className="flex items-center gap-1 text-stone-400">
                    <Clock className="w-3 h-3 text-stone-500" />
                    {investment.experienceYears}
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {onOpenSharePoster && (
              <button
                onClick={() => onOpenSharePoster(investment)}
                className="px-3 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                title="生成精美社交分享海报"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>生成海报</span>
              </button>
            )}
            <button
              onClick={handleShare}
              className="px-3 py-1.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 text-xs flex items-center gap-1.5 transition-colors"
              title="分享链接"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>{isCopied ? '已复制' : '分享'}</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 text-stone-400 hover:text-white rounded-xl hover:bg-stone-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Modal Content */}
        <div className="overflow-y-auto p-6 space-y-6 flex-1 custom-scrollbar text-stone-200">
          {/* Cover & Key Indicators */}
          <div className="relative rounded-2xl overflow-hidden aspect-[21/9] max-h-64 border border-stone-800 shadow-md">
            <img 
              src={investment.coverImage || 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&w=1200&q=80'} 
              alt={investment.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent flex flex-col justify-end p-5">
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <span className="px-2.5 py-0.5 rounded-md text-xs font-medium bg-amber-500 text-stone-950 shadow-sm">
                  {investment.categoryLabel}
                </span>
                {getReturnBadge()}
                {investment.targetAsset && (
                  <span className="px-2.5 py-0.5 rounded-md text-xs font-mono bg-stone-900/80 text-stone-300 border border-stone-700 flex items-center gap-1">
                    <Target className="w-3 h-3 text-amber-400" />
                    <span>标的: {investment.targetAsset}</span>
                  </span>
                )}
              </div>
              <h2 className="text-xl sm:text-2xl font-extrabold text-white leading-tight drop-shadow-md">
                {investment.title}
              </h2>
            </div>
          </div>

          {/* Core Summary Callout */}
          {investment.summary && (
            <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/25 text-amber-200/90 text-sm leading-relaxed">
              <span className="font-semibold text-amber-300 mr-2">核心要旨：</span>
              {investment.summary}
            </div>
          )}

          {/* Curator Pick Highlight if available */}
          {investment.isCuratorPick && investment.curatorNote && (
            <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-start gap-3">
              <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center shrink-0 mt-0.5">
                <Sparkles className="w-4 h-4" />
              </div>
              <div className="text-xs space-y-1">
                <div className="font-bold text-amber-300">⭐ 星芒主理人精选置顶认证</div>
                <p className="text-stone-300 leading-relaxed">{investment.curatorNote}</p>
              </div>
            </div>
          )}

          {/* Key Lessons Highlight Box */}
          {investment.keyLessons && investment.keyLessons.length > 0 && (
            <div className="p-4 rounded-2xl bg-stone-800/60 border border-stone-700/60 space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold text-amber-400 tracking-wide uppercase">
                <BookOpen className="w-4 h-4 text-amber-400" />
                <span>实战沉淀 · 核心法则与避坑箴言</span>
              </div>
              <div className="grid gap-2 pt-1">
                {investment.keyLessons.map((lesson, idx) => (
                  <div key={idx} className="flex items-start gap-2.5 text-xs text-stone-200">
                    <span className="w-4 h-4 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/40 flex items-center justify-center shrink-0 text-[10px] font-bold mt-0.5">
                      {idx + 1}
                    </span>
                    <span className="leading-relaxed">{lesson}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Return & Yield Trend Detailed Interactive Sparkline */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-stone-200 flex items-center gap-1.5">
                <TrendingUp className="w-4 h-4 text-amber-400" />
                <span>收益率演进走势（实战周期复盘）</span>
              </h4>
              <button
                type="button"
                onClick={() => setIsDIYOpen(true)}
                className="px-2.5 py-1 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-300 hover:text-amber-300 border border-stone-700 flex items-center gap-1.5 text-xs transition-colors"
                title="DIY自定义曲线颜色与背景"
              >
                <Palette className="w-3.5 h-3.5 text-amber-400" />
                <span>DIY 图表配色与背景</span>
              </button>
            </div>
            <InvestmentYieldChart 
              story={investment} 
              customTheme={activeTheme}
              height={145} 
              showDetails={true} 
            />
          </div>

          {/* Main Story Body */}
          <div className="prose prose-invert max-w-none text-stone-300 text-sm leading-relaxed space-y-3 whitespace-pre-line border-b border-stone-800 pb-6">
            {investment.content}
          </div>

          {/* Tags & Action Bar */}
          <div className="flex flex-wrap items-center justify-between gap-4 py-2">
            <div className="flex flex-wrap gap-1.5">
              {investment.tags.map((tag, idx) => (
                <span 
                  key={idx}
                  className="px-2.5 py-1 rounded-lg bg-stone-800 text-stone-400 text-xs font-medium border border-stone-700/50"
                >
                  #{tag}
                </span>
              ))}
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => onLike(investment.id)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-rose-400 hover:text-rose-300 transition-colors text-xs font-semibold shadow-sm"
              >
                <Heart className="w-4 h-4 fill-rose-500/20 text-rose-400" />
                <span>{investment.likesCount} 点赞</span>
              </button>
            </div>
          </div>

          {/* Community Discussion & Q&A Area */}
          <div className="space-y-4 pt-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-stone-100 flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-amber-400" />
                <span>投资者问答与交流探讨</span>
                <span className="text-xs font-normal text-stone-500">({investment.comments.length} 条观点)</span>
              </h3>
              <span className="text-[11px] text-stone-400">提倡理性思考 · 拒绝恶意推票</span>
            </div>

            {/* Comment Input */}
            <form onSubmit={handleCommentSubmit} className="flex gap-2">
              <input
                type="text"
                value={newComment}
                onChange={e => setNewComment(e.target.value)}
                placeholder="分享你的经验、观点，或者解答题主提问..."
                className="flex-1 bg-stone-800 border border-stone-700 rounded-xl px-4 py-2 text-stone-100 placeholder-stone-500 text-xs focus:outline-none focus:border-amber-500"
              />
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-stone-950 font-semibold text-xs flex items-center gap-1.5 transition-colors shadow-sm"
              >
                <Send className="w-3.5 h-3.5" />
                <span>发送</span>
              </button>
            </form>

            {/* Comments List */}
            <div className="space-y-3 pt-2">
              {investment.comments.length === 0 ? (
                <div className="text-center py-8 text-stone-500 text-xs bg-stone-800/30 rounded-2xl border border-stone-800/50">
                  暂无评论，成为第一个参与讨论交流的投资者吧！
                </div>
              ) : (
                investment.comments.map(c => (
                  <div key={c.id} className="p-3.5 rounded-2xl bg-stone-800/40 border border-stone-800 space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <img 
                          src={c.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&q=80'} 
                          alt={c.author} 
                          className="w-5 h-5 rounded-full object-cover"
                        />
                        <span className="font-semibold text-stone-200">{c.author}</span>
                      </div>
                      <span className="text-[11px] text-stone-500 font-mono">{c.date}</span>
                    </div>
                    <p className="text-xs text-stone-300 pl-7 leading-relaxed whitespace-pre-line">
                      {c.content}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* DIY Customizer Modal inside detail */}
      <ChartThemeCustomizer
        isOpen={isDIYOpen}
        onClose={() => setIsDIYOpen(false)}
        currentTheme={activeTheme || { lineColor: '#10b981', bgType: 'grid' }}
        onSaveTheme={(newTheme) => {
          setModalTheme(newTheme);
          if (onUpdateStoryTheme) {
            onUpdateStoryTheme(newTheme);
          }
        }}
        sampleStory={investment}
      />
    </div>
  );
};
