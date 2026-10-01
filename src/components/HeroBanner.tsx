import React from 'react';
import { 
  Sparkles, 
  Video, 
  Image as ImageIcon, 
  FileText, 
  MapPin, 
  ShoppingBag, 
  Heart,
  TrendingUp,
  Compass
} from 'lucide-react';

interface HeroBannerProps {
  onSelectTab: (tab: string) => void;
  onSelectProductCategory?: (category: string) => void;
}

export const HeroBanner: React.FC<HeroBannerProps> = ({ 
  onSelectTab,
  onSelectProductCategory 
}) => {
  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-stone-900 via-stone-800 to-amber-950 text-white p-6 sm:p-8 lg:p-10 mb-8 shadow-xl">
      {/* Decorative background glow & mesh */}
      <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 rounded-full bg-amber-500/20 blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-1/3 -mb-20 w-80 h-80 rounded-full bg-rose-500/20 blur-3xl pointer-events-none" />

      <div className="relative z-10 max-w-4xl">
        {/* Creator Identity & Status */}
        <div className="flex flex-wrap items-center gap-3 mb-4">
          <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-xs border border-white/15 text-xs text-amber-200">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span className="font-medium">持续探索 · 创作中</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-stone-300">
            <MapPin className="w-3.5 h-3.5 text-rose-400" />
            <span>杭州 / 大理 / 旅居与数字创造</span>
          </div>
          <div className="flex items-center gap-1 text-xs text-amber-300 font-mono">
            <span>github.com/shouqiangzzz</span>
          </div>
        </div>

        {/* Main Title & Vision */}
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight font-serif mb-3 leading-snug">
          记录生活与学习跃迁，<br className="hidden sm:inline" />
          <span className="bg-gradient-to-r from-amber-300 via-rose-300 to-amber-100 bg-clip-text text-transparent">
            分享自用严选好物，倾听每个动人故事。
          </span>
        </h1>

        <p className="text-stone-300 text-sm sm:text-base leading-relaxed mb-6 max-w-2xl font-normal">
          这里是 Shouqiang 的多模态生活实验室。不仅有视频、高清图集与深度随笔记录的求索足迹；更有亲测好用的
          <span className="text-amber-300 font-medium"> 电子数码、高分书籍、工位零食与自驾路书</span>
          。欢迎随时留言交流、一键种草，或在故事墙留下你的高光瞬间。
        </p>

        {/* Multi-format support indicators */}
        <div className="flex flex-wrap items-center gap-2 mb-6">
          <span className="text-xs text-stone-400 mr-1">支持格式:</span>
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-stone-800/80 border border-stone-700/60 text-[11px] text-amber-200">
            <Video className="w-3 h-3 text-amber-400" /> 4K超清视频
          </span>
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-stone-800/80 border border-stone-700/60 text-[11px] text-emerald-200">
            <ImageIcon className="w-3 h-3 text-emerald-400" /> 高清摄影图集
          </span>
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-stone-800/80 border border-stone-700/60 text-[11px] text-sky-200">
            <FileText className="w-3 h-3 text-sky-400" /> 深度长文手札
          </span>
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-stone-800/80 border border-stone-700/60 text-[11px] text-rose-200">
            <Heart className="w-3 h-3 text-rose-400" /> 好物互动种草
          </span>
        </div>

        {/* Category Jump Buttons */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3 pt-2">
          <button
            onClick={() => {
              onSelectTab('products');
              if (onSelectProductCategory) onSelectProductCategory('electronics');
            }}
            className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition-all text-left group"
          >
            <div className="w-8 h-8 rounded-lg bg-indigo-500/20 text-indigo-300 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
              💻
            </div>
            <div>
              <div className="text-xs font-semibold text-white">电子产品</div>
              <div className="text-[10px] text-stone-400">便携屏 / 键盘 / 降噪</div>
            </div>
          </button>

          <button
            onClick={() => {
              onSelectTab('products');
              if (onSelectProductCategory) onSelectProductCategory('books');
            }}
            className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition-all text-left group"
          >
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-300 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
              📚
            </div>
            <div>
              <div className="text-xs font-semibold text-white">精选书籍</div>
              <div className="text-[10px] text-stone-400">CSAPP / 深度工作</div>
            </div>
          </button>

          <button
            onClick={() => {
              onSelectTab('products');
              if (onSelectProductCategory) onSelectProductCategory('snacks');
            }}
            className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition-all text-left group"
          >
            <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-300 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
              ☕
            </div>
            <div>
              <div className="text-xs font-semibold text-white">严选零食</div>
              <div className="text-[10px] text-stone-400">冻干黑咖 / 风干牛肉</div>
            </div>
          </button>

          <button
            onClick={() => {
              onSelectTab('products');
              if (onSelectProductCategory) onSelectProductCategory('travel');
            }}
            className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition-all text-left group"
          >
            <div className="w-8 h-8 rounded-lg bg-rose-500/20 text-rose-300 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
              🧭
            </div>
            <div>
              <div className="text-xs font-semibold text-white">旅游攻略</div>
              <div className="text-[10px] text-stone-400">川西318 / 云南旅居</div>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};
