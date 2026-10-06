import React, { useState } from 'react';
import { X, Palette, Check, Sparkles, Sliders, Image as ImageIcon, RotateCcw, Eye } from 'lucide-react';
import { ChartThemeConfig, InvestmentStory } from '../types';
import { InvestmentYieldChart } from './InvestmentYieldChart';

export const BG_PRESETS = [
  {
    id: 'grid',
    name: '技术网格 (Grid)',
    type: 'grid' as const,
    desc: '经典金融分析坐标网格'
  },
  {
    id: 'starry',
    name: '浩瀚星空 (Cosmos)',
    type: 'image' as const,
    url: 'https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?auto=format&fit=crop&w=800&q=80',
    desc: '深邃宇宙与时间复利'
  },
  {
    id: 'matrix',
    name: '赛博脉络 (Matrix)',
    type: 'image' as const,
    url: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=800&q=80',
    desc: '极客数字代码底纹'
  },
  {
    id: 'candlestick',
    name: 'K线微光 (Candles)',
    type: 'image' as const,
    url: 'https://images.unsplash.com/photo-1642543492481-44e81e3914a7?auto=format&fit=crop&w=800&q=80',
    desc: '多空博弈行情光影'
  },
  {
    id: 'gradient',
    name: '午夜渐变 (Gradient)',
    type: 'gradient' as const,
    from: '#0f172a',
    to: '#1e1b4b',
    desc: '从深石板到深靛紫'
  },
  {
    id: 'solid',
    name: '极简黑曜 (Obsidian)',
    type: 'solid' as const,
    color: '#0c0a09',
    desc: '沉浸纯黑极简磨砂'
  }
];

export const COLOR_PALETTE = [
  { name: '翡翠绿', hex: '#10b981' },
  { name: '琥珀金', hex: '#f59e0b' },
  { name: '霓虹青', hex: '#06b6d4' },
  { name: '赛博紫', hex: '#a855f7' },
  { name: '珊瑚红', hex: '#f43f5e' },
  { name: '极光碧', hex: '#14b8a6' },
  { name: '火橙色', hex: '#fb923c' },
  { name: '皓月白', hex: '#ffffff' }
];

export const THEME_PRESETS: { name: string; icon: string; theme: ChartThemeConfig }[] = [
  {
    name: '👑 黑金至尊',
    icon: '🏆',
    theme: {
      lineColor: '#f59e0b',
      bgType: 'image',
      bgImage: 'https://images.unsplash.com/photo-1642543492481-44e81e3914a7?auto=format&fit=crop&w=800&q=80'
    }
  },
  {
    name: '⚡ 赛博霓虹',
    icon: '👾',
    theme: {
      lineColor: '#06b6d4',
      bgType: 'image',
      bgImage: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=800&q=80'
    }
  },
  {
    name: '💎 价值翡翠',
    icon: '📈',
    theme: {
      lineColor: '#10b981',
      bgType: 'grid'
    }
  },
  {
    name: '🌌 宇宙星空',
    icon: '🪐',
    theme: {
      lineColor: '#14b8a6',
      bgType: 'image',
      bgImage: 'https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?auto=format&fit=crop&w=800&q=80'
    }
  },
  {
    name: '🔥 烈焰警示',
    icon: '⚠️',
    theme: {
      lineColor: '#f43f5e',
      bgType: 'solid',
      bgColor: '#0c0a09'
    }
  },
  {
    name: '🟣 暗夜紫芒',
    icon: '🔮',
    theme: {
      lineColor: '#a855f7',
      bgType: 'gradient',
      gradientFrom: '#0f172a',
      gradientTo: '#1e1b4b'
    }
  }
];

interface ChartThemeCustomizerProps {
  isOpen: boolean;
  onClose: () => void;
  currentTheme: ChartThemeConfig;
  onSaveTheme: (theme: ChartThemeConfig) => void;
  sampleStory?: InvestmentStory;
}

export const ChartThemeCustomizer: React.FC<ChartThemeCustomizerProps> = ({
  isOpen,
  onClose,
  currentTheme,
  onSaveTheme,
  sampleStory
}) => {
  const [theme, setTheme] = useState<ChartThemeConfig>(currentTheme);
  const [customImageUrl, setCustomImageUrl] = useState('');

  if (!isOpen) return null;

  const mockStory: InvestmentStory = sampleStory || {
    id: 'preview-diy',
    title: 'DIY 走势图效果实时预览',
    category: 'stock_etf',
    categoryLabel: '实时预览',
    author: 'DIY 体验官',
    date: '2026-10-02',
    experienceYears: '实战复盘',
    returnRate: '+48.6%',
    returnType: 'profit',
    summary: '调节下方曲线色彩与背景图，实时观察走势折线图与渐变面积的折射效果。',
    content: '',
    tags: ['DIY体验', '个性化图表'],
    likesCount: 99,
    comments: [],
    trendData: [
      { period: '建仓', yield: 0, benchmark: 0 },
      { period: '回调', yield: -12, benchmark: 4 },
      { period: '筑底', yield: 15, benchmark: 9 },
      { period: '拉升', yield: 32, benchmark: 17 },
      { period: '当前', yield: 48.6, benchmark: 26 }
    ]
  };

  const handleApplyPreset = (presetTheme: ChartThemeConfig) => {
    setTheme(presetTheme);
  };

  const handleSave = () => {
    onSaveTheme(theme);
    onClose();
  };

  const handleReset = () => {
    const defaultTheme: ChartThemeConfig = {
      lineColor: '#10b981',
      bgType: 'grid'
    };
    setTheme(defaultTheme);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/85 backdrop-blur-md animate-fade-in overflow-y-auto">
      <div className="bg-stone-900 border border-stone-800 rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl my-8 flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-stone-800 flex items-center justify-between bg-stone-900/90 backdrop-blur-md sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center">
              <Palette className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-stone-100 flex items-center gap-2">
                <span>投资图表 DIY 风格定制</span>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  实时预览 · 全局生效
                </span>
              </h3>
              <p className="text-xs text-stone-400">个性化设定收益折线颜色、渐变填充与专属背景图</p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="p-2 text-stone-400 hover:text-white rounded-xl hover:bg-stone-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto custom-scrollbar text-stone-200 text-sm">
          {/* 1. Real-time Live Preview Box */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-stone-300 flex items-center gap-1.5">
                <Eye className="w-3.5 h-3.5 text-amber-400" />
                <span>实时效果预览</span>
              </span>
              <span className="text-[11px] text-stone-400 font-mono">
                当前曲线色: <strong style={{ color: theme.lineColor }}>{theme.lineColor}</strong>
              </span>
            </div>
            <div className="p-2 rounded-2xl border border-stone-700/60 bg-stone-950/80 shadow-inner">
              <InvestmentYieldChart
                story={mockStory}
                customTheme={theme}
                height={125}
                showDetails={true}
              />
            </div>
          </div>

          {/* 2. Quick 1-Click Aesthetic Presets */}
          <div className="space-y-2.5">
            <label className="block text-xs font-semibold text-stone-300 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>大师配色方案（一键套用）</span>
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              {THEME_PRESETS.map((p, idx) => (
                <button
                  type="button"
                  key={idx}
                  onClick={() => handleApplyPreset(p.theme)}
                  className={`p-2.5 rounded-xl border text-left transition-all flex items-center gap-2.5 ${
                    theme.lineColor.toLowerCase() === p.theme.lineColor.toLowerCase() &&
                    theme.bgType === p.theme.bgType
                      ? 'bg-amber-500/20 border-amber-500/80 text-amber-200 ring-2 ring-amber-500/20'
                      : 'bg-stone-800/60 border-stone-700 hover:bg-stone-800 text-stone-300'
                  }`}
                >
                  <span className="text-lg">{p.icon}</span>
                  <div>
                    <div className="font-semibold text-xs text-stone-100">{p.name}</div>
                    <div className="text-[10px] text-stone-400 flex items-center gap-1.5 mt-0.5">
                      <span
                        className="w-2.5 h-2.5 rounded-full inline-block border border-white/20"
                        style={{ backgroundColor: p.theme.lineColor }}
                      />
                      <span>{p.theme.lineColor}</span>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* 3. DIY Curve Line Color Selection */}
          <div className="space-y-2.5 p-4 rounded-2xl bg-stone-800/40 border border-stone-800">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-stone-200 flex items-center gap-1.5">
                <Sliders className="w-3.5 h-3.5 text-amber-400" />
                <span>自定义曲线主色调（及发光渐变）</span>
              </label>
              <div className="flex items-center gap-2">
                <span className="text-[11px] text-stone-400">调色盘取色:</span>
                <input
                  type="color"
                  value={theme.lineColor}
                  onChange={(e) => setTheme(prev => ({ ...prev, lineColor: e.target.value }))}
                  className="w-7 h-7 rounded-lg cursor-pointer bg-transparent border-0 p-0"
                  title="点击自由拾色"
                />
              </div>
            </div>

            {/* Quick Palette Swatches */}
            <div className="grid grid-cols-4 sm:grid-cols-8 gap-2 pt-1">
              {COLOR_PALETTE.map((c) => (
                <button
                  type="button"
                  key={c.hex}
                  onClick={() => setTheme(prev => ({ ...prev, lineColor: c.hex }))}
                  className={`p-2 rounded-xl border flex flex-col items-center gap-1 transition-all ${
                    theme.lineColor.toLowerCase() === c.hex.toLowerCase()
                      ? 'border-amber-400 ring-2 ring-amber-400/30 scale-105'
                      : 'border-stone-700 hover:border-stone-500'
                  }`}
                >
                  <span
                    className="w-6 h-6 rounded-full shadow-md flex items-center justify-center border border-white/20"
                    style={{ backgroundColor: c.hex }}
                  >
                    {theme.lineColor.toLowerCase() === c.hex.toLowerCase() && (
                      <Check className="w-3.5 h-3.5 text-stone-950 font-bold drop-shadow" />
                    )}
                  </span>
                  <span className="text-[10px] text-stone-400">{c.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* 4. DIY Background Skin / Wallpaper */}
          <div className="space-y-2.5 p-4 rounded-2xl bg-stone-800/40 border border-stone-800">
            <label className="block text-xs font-semibold text-stone-200 flex items-center gap-1.5">
              <ImageIcon className="w-3.5 h-3.5 text-amber-400" />
              <span>选择图表背景图或底纹样式</span>
            </label>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 pt-1">
              {BG_PRESETS.map((bg) => {
                const isSelected = 
                  theme.bgType === bg.type && 
                  (bg.type !== 'image' || theme.bgImage === bg.url);

                return (
                  <button
                    type="button"
                    key={bg.id}
                    onClick={() => {
                      if (bg.type === 'image') {
                        setTheme(prev => ({ ...prev, bgType: 'image', bgImage: bg.url }));
                      } else if (bg.type === 'gradient') {
                        setTheme(prev => ({ 
                          ...prev, 
                          bgType: 'gradient', 
                          gradientFrom: bg.from, 
                          gradientTo: bg.to 
                        }));
                      } else if (bg.type === 'solid') {
                        setTheme(prev => ({ ...prev, bgType: 'solid', bgColor: bg.color }));
                      } else {
                        setTheme(prev => ({ ...prev, bgType: 'grid' }));
                      }
                    }}
                    className={`relative p-3 rounded-xl border text-left overflow-hidden transition-all group ${
                      isSelected
                        ? 'border-amber-500 ring-2 ring-amber-500/25'
                        : 'border-stone-700/80 hover:border-stone-500'
                    }`}
                  >
                    {/* Background visual snippet */}
                    {bg.url && (
                      <div 
                        className="absolute inset-0 bg-cover bg-center opacity-40 group-hover:opacity-50 transition-opacity"
                        style={{ backgroundImage: `url(${bg.url})` }}
                      />
                    )}
                    {bg.type === 'gradient' && (
                      <div 
                        className="absolute inset-0 opacity-40 group-hover:opacity-60 transition-opacity"
                        style={{ background: `linear-gradient(135deg, ${bg.from}, ${bg.to})` }}
                      />
                    )}
                    {bg.type === 'grid' && (
                      <div className="absolute inset-0 bg-[radial-gradient(#334155_1px,transparent_1px)] [background-size:12px_12px] opacity-40" />
                    )}

                    <div className="relative z-10 flex items-center justify-between">
                      <span className="font-semibold text-xs text-stone-100">{bg.name}</span>
                      {isSelected && (
                        <Check className="w-3.5 h-3.5 text-amber-400" />
                      )}
                    </div>
                    <div className="relative z-10 text-[10px] text-stone-400 mt-1">{bg.desc}</div>
                  </button>
                );
              })}
            </div>

            {/* Custom Background Image URL input */}
            <div className="pt-2">
              <div className="text-[11px] text-stone-400 mb-1">或输入自定义背景图 URL：</div>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={customImageUrl}
                  onChange={(e) => setCustomImageUrl(e.target.value)}
                  placeholder="https://images.unsplash.com/..."
                  className="flex-1 bg-stone-800 border border-stone-700 rounded-xl px-3 py-1.5 text-xs text-stone-200 placeholder-stone-500 focus:outline-none focus:border-amber-500"
                />
                <button
                  type="button"
                  onClick={() => {
                    if (customImageUrl.trim()) {
                      setTheme(prev => ({ ...prev, bgType: 'image', bgImage: customImageUrl.trim() }));
                    }
                  }}
                  className="px-3 py-1.5 rounded-xl bg-stone-700 hover:bg-stone-600 text-stone-200 text-xs font-medium"
                >
                  应用背景
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-stone-800 flex items-center justify-between bg-stone-900/90">
          <button
            type="button"
            onClick={handleReset}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-stone-400 hover:text-stone-200 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>重置为默认</span>
          </button>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-stone-400 hover:text-white hover:bg-stone-800 transition-colors text-xs font-medium"
            >
              取消
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-stone-950 font-bold text-xs shadow-lg shadow-amber-500/20 transition-all flex items-center gap-1.5"
            >
              <Check className="w-3.5 h-3.5" />
              <span>保存并应用定制风格</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
