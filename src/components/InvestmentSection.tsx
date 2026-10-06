import React, { useState, useMemo } from 'react';
import { TrendingUp, Plus, Search, HelpCircle, AlertTriangle, ShieldCheck, BookOpen, MessageSquare, ArrowUpRight, Target, Clock, Filter, Sparkles, Heart, Palette } from 'lucide-react';
import { InvestmentStory, InvestmentCategory, ChartThemeConfig } from '../types';
import { InvestmentYieldChart } from './InvestmentYieldChart';
import { ChartThemeCustomizer } from './ChartThemeCustomizer';

interface InvestmentSectionProps {
  investments: InvestmentStory[];
  onSelectInvestment: (investment: InvestmentStory) => void;
  onOpenShareModal: () => void;
  onLikeInvestment: (id: string) => void;
  globalChartTheme?: ChartThemeConfig;
  onUpdateGlobalChartTheme?: (theme: ChartThemeConfig) => void;
}

export const InvestmentSection: React.FC<InvestmentSectionProps> = ({
  investments,
  onSelectInvestment,
  onOpenShareModal,
  onLikeInvestment,
  globalChartTheme,
  onUpdateGlobalChartTheme
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedSort, setSelectedSort] = useState<'latest' | 'popular'>('latest');

  // DIY Chart Theme state persisted in localStorage
  const [chartTheme, setChartTheme] = useState<ChartThemeConfig>(() => {
    const saved = localStorage.getItem('sq_diy_chart_theme');
    return saved ? JSON.parse(saved) : {
      lineColor: '#10b981',
      bgType: 'grid'
    };
  });
  const [isDIYModalOpen, setIsDIYModalOpen] = useState(false);

  const effectiveTheme = globalChartTheme || chartTheme;

  const handleSaveTheme = (newTheme: ChartThemeConfig) => {
    setChartTheme(newTheme);
    localStorage.setItem('sq_diy_chart_theme', JSON.stringify(newTheme));
    if (onUpdateGlobalChartTheme) {
      onUpdateGlobalChartTheme(newTheme);
    }
  };

  const categories = [
    { key: 'all', label: '全部交流', icon: Sparkles },
    { key: 'stock_etf', label: '📈 指数定投', icon: TrendingUp },
    { key: 'value_investing', label: '💎 价值投资', icon: ShieldCheck },
    { key: 'crypto', label: '🪙 加密与Web3', icon: Target },
    { key: 'pitfall_reflection', label: '⚠️ 避坑反思', icon: AlertTriangle },
    { key: 'qa_help', label: '❓ 提问求助', icon: HelpCircle },
  ];

  const filteredInvestments = useMemo(() => {
    return investments
      .filter(item => {
        // Status filter: ignore non-published if specified
        if (item.status && item.status !== 'published') return false;

        const matchCat = selectedCategory === 'all' || item.category === selectedCategory;
        const q = searchQuery.toLowerCase().trim();
        const matchSearch = !q || (
          item.title.toLowerCase().includes(q) ||
          item.summary.toLowerCase().includes(q) ||
          item.author.toLowerCase().includes(q) ||
          (item.targetAsset && item.targetAsset.toLowerCase().includes(q)) ||
          item.tags.some(t => t.toLowerCase().includes(q))
        );
        return matchCat && matchSearch;
      })
      .sort((a, b) => {
        if (selectedSort === 'popular') {
          return (b.likesCount + b.comments.length) - (a.likesCount + a.comments.length);
        }
        return new Date(b.date).getTime() - new Date(a.date).getTime();
      });
  }, [investments, selectedCategory, searchQuery, selectedSort]);

  const getReturnBadge = (item: InvestmentStory) => {
    switch (item.returnType) {
      case 'loss':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-rose-500/15 text-rose-400 border border-rose-500/30 flex items-center gap-1">
            <AlertTriangle className="w-3 h-3" />
            <span>{item.returnRate || '亏损反思'}</span>
          </span>
        );
      case 'question':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-indigo-500/15 text-indigo-400 border border-indigo-500/30 flex items-center gap-1">
            <HelpCircle className="w-3 h-3" />
            <span>{item.returnRate || '探讨求助'}</span>
          </span>
        );
      case 'profit':
      default:
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
            <TrendingUp className="w-3 h-3" />
            <span>{item.returnRate || '长期复利'}</span>
          </span>
        );
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* 1. Hero Header Banner */}
      <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-stone-900 via-stone-900 to-amber-950/30 border border-stone-800 p-6 sm:p-8 shadow-xl">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/15 text-amber-400 border border-amber-500/30 text-xs font-semibold">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>投资实战圈 · 故事沉淀与经验答疑</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-stone-100 tracking-tight leading-snug">
              聊聊你的投资故事、实战心得与困惑提问
            </h1>
            <p className="text-stone-400 text-xs sm:text-sm leading-relaxed">
              在波动的市场中，散户最大的护城河是“时间与复利的心态”。欢迎分享你穿越牛熊的实操复盘、借杠杆踩坑的血泪教训，或抛出资产配置面临的真实难题。
            </p>

            {/* Quick Stats Highlights */}
            <div className="flex flex-wrap items-center gap-4 pt-2 text-xs">
              <div className="flex items-center gap-1.5 text-stone-300">
                <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                <span>累计沉淀实战复盘: <strong>{investments.length} 篇</strong></span>
              </div>
              <div className="flex items-center gap-1.5 text-stone-300">
                <span className="w-2 h-2 rounded-full bg-amber-400"></span>
                <span>跨越周期品类: <strong>指数/美股/加密/价值</strong></span>
              </div>
              <div className="flex items-center gap-1.5 text-stone-300">
                <span className="w-2 h-2 rounded-full bg-indigo-400"></span>
                <span>社群互助答疑: <strong>开放式探讨</strong></span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="shrink-0 flex flex-col sm:flex-row gap-3">
            <button
              onClick={() => setIsDIYModalOpen(true)}
              className="px-4 py-3 rounded-2xl bg-stone-800/90 hover:bg-stone-700 text-stone-200 border border-stone-700/80 font-semibold text-xs sm:text-sm shadow-md flex items-center justify-center gap-2 transition-all hover:border-amber-500/50"
              title="自定义走势图的曲线颜色与背景"
            >
              <Palette className="w-4 h-4 text-amber-400" />
              <span>DIY 图表配色与背景</span>
            </button>

            <button
              onClick={onOpenShareModal}
              className="px-5 py-3 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-stone-950 font-bold text-xs sm:text-sm shadow-xl shadow-amber-500/25 flex items-center justify-center gap-2 transition-all transform hover:-translate-y-0.5"
            >
              <Plus className="w-4 h-4" />
              <span>分享我的投资故事 / 提问</span>
            </button>
          </div>
        </div>

        {/* Decorative background glow */}
        <div className="absolute -right-20 -bottom-20 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* 2. Filter & Search Controls */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-stone-900/40 p-2 sm:p-3 rounded-2xl border border-stone-800/80 backdrop-blur-sm">
        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 custom-scrollbar">
          {categories.map(cat => (
            <button
              key={cat.key}
              onClick={() => setSelectedCategory(cat.key)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                selectedCategory === cat.key
                  ? 'bg-amber-500 text-stone-950 shadow-md shadow-amber-500/20'
                  : 'bg-stone-800/60 text-stone-400 hover:bg-stone-800 hover:text-stone-200'
              }`}
            >
              <span>{cat.label}</span>
            </button>
          ))}
        </div>

        {/* Search & Sort */}
        <div className="flex items-center gap-2">
          <div className="relative flex-1 sm:w-56">
            <Search className="w-3.5 h-3.5 text-stone-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="搜索标的、经验、提问..."
              className="w-full bg-stone-800/90 border border-stone-700/80 rounded-xl pl-8 pr-3 py-1.5 text-stone-200 placeholder-stone-500 text-xs focus:outline-none focus:border-amber-500"
            />
          </div>

          <div className="flex rounded-xl bg-stone-800 p-0.5 border border-stone-700/70 text-xs">
            <button
              onClick={() => setSelectedSort('latest')}
              className={`px-2.5 py-1 rounded-lg transition-colors ${selectedSort === 'latest' ? 'bg-stone-700 text-white font-medium' : 'text-stone-400 hover:text-stone-200'}`}
            >
              最新
            </button>
            <button
              onClick={() => setSelectedSort('popular')}
              className={`px-2.5 py-1 rounded-lg transition-colors ${selectedSort === 'popular' ? 'bg-stone-700 text-white font-medium' : 'text-stone-400 hover:text-stone-200'}`}
            >
              高赞
            </button>
          </div>
        </div>
      </div>

      {/* 3. Investment Cards Grid */}
      {filteredInvestments.length === 0 ? (
        <div className="text-center py-16 bg-stone-900/30 rounded-3xl border border-stone-800/60 space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center justify-center mx-auto">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-bold text-base text-stone-200">没有找到匹配的投资内容</h3>
            <p className="text-stone-400 text-xs mt-1">换个搜索词，或者成为第一个发起该话题交流的创作者吧！</p>
          </div>
          <button
            onClick={onOpenShareModal}
            className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-stone-950 text-xs font-bold transition-all"
          >
            立即发表投资故事
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredInvestments.map(item => (
            <div
              key={item.id}
              onClick={() => onSelectInvestment(item)}
              className="group bg-stone-900/80 hover:bg-stone-900 border border-stone-800 hover:border-amber-500/40 rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl hover:shadow-amber-500/10 transition-all duration-300 flex flex-col cursor-pointer"
            >
              {/* Card Cover */}
              <div className="relative aspect-[16/9] overflow-hidden bg-stone-950">
                <img
                  src={item.coverImage || 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&w=1200&q=80'}
                  alt={item.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-90 group-hover:opacity-100"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-stone-950/30 to-transparent" />
                
                {/* Badges on Cover */}
                <div className="absolute top-3 inset-x-3 flex items-center justify-between gap-2">
                  <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-stone-900/85 backdrop-blur-md text-amber-300 border border-amber-500/30 shadow-md">
                    {item.categoryLabel}
                  </span>
                  {getReturnBadge(item)}
                </div>

                {/* Target Asset indicator at bottom of image */}
                {item.targetAsset && (
                  <div className="absolute bottom-2.5 left-3 right-3 flex items-center gap-1.5 text-[11px] text-stone-300 font-mono bg-stone-900/70 backdrop-blur-sm px-2.5 py-1 rounded-lg border border-stone-700/60 truncate">
                    <Target className="w-3 h-3 text-amber-400 shrink-0" />
                    <span className="truncate">标的: {item.targetAsset}</span>
                  </div>
                )}
              </div>

              {/* Card Content */}
              <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                <div className="space-y-2.5">
                  {item.isCuratorPick && (
                    <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[10px] font-bold">
                      <Sparkles className="w-3 h-3 text-amber-400" />
                      <span>主理人精选置顶</span>
                    </div>
                  )}

                  <h3 className="font-extrabold text-base text-stone-100 group-hover:text-amber-400 transition-colors line-clamp-2 leading-snug">
                    {item.title}
                  </h3>

                  <p className="text-stone-400 text-xs line-clamp-2 leading-relaxed">
                    {item.summary}
                  </p>

                  {/* Highlight Lesson preview if available */}
                  {item.keyLessons && item.keyLessons.length > 0 && (
                    <div className="p-2.5 rounded-xl bg-stone-800/40 border border-stone-800 text-[11px] text-stone-300 flex items-start gap-1.5 line-clamp-1">
                      <BookOpen className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                      <span className="truncate">法则: {item.keyLessons[0]}</span>
                    </div>
                  )}

                  {/* Mini Yield Trend Sparkline Chart with DIY Theme */}
                  <div className="pt-1">
                    <InvestmentYieldChart 
                      story={item} 
                      customTheme={item.chartTheme || effectiveTheme}
                      onOpenDIYModal={() => setIsDIYModalOpen(true)}
                      height={92} 
                    />
                  </div>
                </div>

                {/* Card Footer: Author + Metrics */}
                <div className="pt-3 border-t border-stone-800/80 flex items-center justify-between text-xs text-stone-400">
                  <div className="flex items-center gap-2">
                    <img
                      src={item.authorAvatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&q=80'}
                      alt={item.author}
                      className="w-6 h-6 rounded-full object-cover border border-stone-700"
                    />
                    <div className="flex flex-col">
                      <span className="font-medium text-stone-300 text-[11px]">{item.author}</span>
                      {item.experienceYears && (
                        <span className="text-[10px] text-stone-500">{item.experienceYears}</span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onLikeInvestment(item.id);
                      }}
                      className="flex items-center gap-1 hover:text-rose-400 transition-colors"
                      title="点赞"
                    >
                      <Heart className="w-3.5 h-3.5 text-rose-500/80" />
                      <span>{item.likesCount}</span>
                    </button>
                    <span className="flex items-center gap-1">
                      <MessageSquare className="w-3.5 h-3.5 text-stone-500" />
                      <span>{item.comments.length}</span>
                    </span>
                    <span className="flex items-center gap-0.5 text-amber-400 group-hover:translate-x-0.5 transition-transform font-medium text-[11px]">
                      <span>详情</span>
                      <ArrowUpRight className="w-3 h-3" />
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Chart DIY Customizer Modal */}
      <ChartThemeCustomizer
        isOpen={isDIYModalOpen}
        onClose={() => setIsDIYModalOpen(false)}
        currentTheme={effectiveTheme}
        onSaveTheme={handleSaveTheme}
        sampleStory={filteredInvestments[0] || investments[0]}
      />
    </div>
  );
};
