import React, { useState } from 'react';
import { X, TrendingUp, AlertTriangle, HelpCircle, DollarSign, Tag, Send, CheckCircle2, BookOpen, Palette, Check } from 'lucide-react';
import { InvestmentStory, InvestmentCategory, ChartThemeConfig } from '../types';
import { ImageUploadField } from './ImageUploadField';
import { InvestmentYieldChart } from './InvestmentYieldChart';
import { BG_PRESETS, COLOR_PALETTE } from './ChartThemeCustomizer';

interface ShareInvestmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (investment: InvestmentStory) => void;
  currentUserName?: string;
  currentUserAvatar?: string;
}

const PRESET_COVERS = [
  'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&w=1200&q=80', // K-line / Stock
  'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1200&q=80', // Charts & Analysis
  'https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?auto=format&fit=crop&w=1200&q=80', // Deep focus / Reflection
  'https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?auto=format&fit=crop&w=1200&q=80', // Savings & Coins
  'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1200&q=80', // Crypto / Tech
  'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?auto=format&fit=crop&w=1200&q=80'  // Coffee / Long term
];

export const ShareInvestmentModal: React.FC<ShareInvestmentModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  currentUserName,
  currentUserAvatar
}) => {
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState(currentUserName || '');
  const [authorRole, setAuthorRole] = useState('');
  const [category, setCategory] = useState<InvestmentCategory>('stock_etf');
  const [targetAsset, setTargetAsset] = useState('');
  const [experienceYears, setExperienceYears] = useState('实战 2 年');
  const [returnRate, setReturnRate] = useState('');
  const [returnType, setReturnType] = useState<'profit' | 'loss' | 'neutral' | 'question'>('profit');
  const [summary, setSummary] = useState('');
  const [content, setContent] = useState('');
  const [keyLesson1, setKeyLesson1] = useState('');
  const [keyLesson2, setKeyLesson2] = useState('');
  const [coverImage, setCoverImage] = useState(PRESET_COVERS[0]);
  const [tagsStr, setTagsStr] = useState('');

  // DIY Chart Theme customization state
  const [chartLineColor, setChartLineColor] = useState('#10b981');
  const [chartBgType, setChartBgType] = useState<'grid' | 'image' | 'gradient' | 'solid'>('grid');
  const [chartBgImage, setChartBgImage] = useState('https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?auto=format&fit=crop&w=800&q=80');

  if (!isOpen) return null;

  const getCategoryLabel = (cat: InvestmentCategory) => {
    switch (cat) {
      case 'stock_etf': return '指数定投';
      case 'value_investing': return '价值投资';
      case 'crypto': return '加密与Web3';
      case 'pitfall_reflection': return '避坑反思';
      case 'qa_help': return '提问求助';
      case 'macro_asset': return '宏观大类配置';
      default: return '实战心得';
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;

    const tags = tagsStr
      .split(/[,，、 ]+/)
      .map(t => t.trim())
      .filter(Boolean);

    const keyLessons: string[] = [];
    if (keyLesson1.trim()) keyLessons.push(keyLesson1.trim());
    if (keyLesson2.trim()) keyLessons.push(keyLesson2.trim());

    const newInvestment: InvestmentStory = {
      id: `inv-${Date.now()}`,
      title: title.trim(),
      category,
      categoryLabel: getCategoryLabel(category),
      author: author.trim() || currentUserName || '理智投资者',
      authorRole: authorRole.trim() || (category === 'qa_help' ? '提问交流者' : '独立投资者'),
      authorAvatar: currentUserAvatar || `https://images.unsplash.com/photo-${1535713875002 + Math.floor(Math.random() * 50)}?auto=format&fit=crop&w=120&q=80`,
      date: new Date().toISOString().split('T')[0],
      experienceYears: experienceYears.trim() || '实战探索中',
      targetAsset: targetAsset.trim() || (category === 'crypto' ? 'BTC / ETH' : '宽基指数ETF / 优质股权'),
      returnRate: returnRate.trim() || (category === 'qa_help' ? '探讨求助' : '长期复利中'),
      returnType,
      summary: summary.trim() || content.slice(0, 100) + '...',
      content: content.trim(),
      keyLessons: keyLessons.length > 0 ? keyLessons : undefined,
      coverImage: coverImage.trim() || PRESET_COVERS[0],
      tags: tags.length > 0 ? tags : [getCategoryLabel(category), '实战复盘', '长期主义'],
      likesCount: 1,
      bookmarksCount: 0,
      comments: [],
      chartTheme: {
        lineColor: chartLineColor,
        bgType: chartBgType,
        bgImage: chartBgType === 'image' ? chartBgImage : undefined
      }
    };

    onSubmit(newInvestment);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/80 backdrop-blur-md animate-fade-in overflow-y-auto">
      <div className="bg-stone-900 border border-stone-800 rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl my-8">
        {/* Header */}
        <div className="px-6 py-5 border-b border-stone-800 flex items-center justify-between bg-stone-900/60 sticky top-0 z-10 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-lg text-stone-100 flex items-center gap-2">
                <span>分享投资故事 / 提问交流</span>
                <span className="text-xs font-normal px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  理性交流 · 沉淀智慧
                </span>
              </h3>
              <p className="text-xs text-stone-400">分享穿越周期的实战经验、避坑教训，或提出你的投资困惑</p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="p-2 text-stone-400 hover:text-white rounded-xl hover:bg-stone-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 text-stone-200 text-sm max-h-[75vh] overflow-y-auto custom-scrollbar">
          {/* 1. Category and Type Selection */}
          <div className="space-y-2">
            <label className="block text-xs font-semibold text-stone-300">
              内容类型与板块 <span className="text-rose-400">*</span>
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {[
                { key: 'stock_etf', label: '📈 指数定投', desc: '标普500/纳指/宽基' },
                { key: 'value_investing', label: '💎 价值投资', desc: '商业护城河/深度财报' },
                { key: 'crypto', label: '🪙 加密与Web3', desc: '周期存币/减半实录' },
                { key: 'pitfall_reflection', label: '⚠️ 避坑反思', desc: '爆仓踩坑/教训警示' },
                { key: 'qa_help', label: '❓ 提问求助', desc: '新手答疑/资产配置探讨' },
                { key: 'macro_asset', label: '🌐 宏观大类', desc: '全天候/股债现金平衡' },
              ].map(item => (
                <button
                  type="button"
                  key={item.key}
                  onClick={() => {
                    setCategory(item.key as InvestmentCategory);
                    if (item.key === 'qa_help') {
                      setReturnType('question');
                      setReturnRate('求探讨 / 解答');
                    } else if (item.key === 'pitfall_reflection') {
                      setReturnType('loss');
                    } else {
                      setReturnType('profit');
                    }
                  }}
                  className={`p-3 rounded-2xl border text-left transition-all ${
                    category === item.key 
                      ? 'bg-amber-500/20 border-amber-500/60 text-amber-200 ring-2 ring-amber-500/20' 
                      : 'bg-stone-800/60 border-stone-700/60 text-stone-400 hover:bg-stone-800 hover:text-stone-200'
                  }`}
                >
                  <div className="font-semibold text-xs text-stone-100">{item.label}</div>
                  <div className="text-[10px] text-stone-400 mt-0.5">{item.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* 2. Title */}
          <div>
            <label className="block text-xs font-semibold text-stone-300 mb-1.5">
              文章标题 / 核心提问 <span className="text-rose-400">*</span>
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="例如：从月薪3000到定投标普500：我的5年心得 / 【求助】手头存下5万元该如何配置？"
              className="w-full bg-stone-800 border border-stone-700 rounded-xl px-4 py-2.5 text-stone-100 placeholder-stone-500 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 text-sm"
            />
          </div>

          {/* 3. Target Asset & Return / Outcome */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-stone-300 mb-1.5">
                投资标的 / 涉及品种
              </label>
              <input
                type="text"
                value={targetAsset}
                onChange={e => setTargetAsset(e.target.value)}
                placeholder="例如：标普500 (VOO)、沪深300、BTC现货、腾讯控股"
                className="w-full bg-stone-800 border border-stone-700 rounded-xl px-4 py-2.5 text-stone-100 placeholder-stone-500 focus:outline-none focus:border-amber-500 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-stone-300 mb-1.5">
                实战时长 / 经历周期
              </label>
              <input
                type="text"
                value={experienceYears}
                onChange={e => setExperienceYears(e.target.value)}
                placeholder="例如：实战 3 年、穿越一轮牛熊、新手第 1 个月"
                className="w-full bg-stone-800 border border-stone-700 rounded-xl px-4 py-2.5 text-stone-100 placeholder-stone-500 focus:outline-none focus:border-amber-500 text-sm"
              />
            </div>
          </div>

          {/* 4. Return Rate / Result tag */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-stone-300 mb-1.5">
                收益状态 / 结果标识
              </label>
              <div className="flex gap-2">
                {[
                  { key: 'profit', label: '🟢 稳健/盈利' },
                  { key: 'loss', label: '🔴 亏损/反思' },
                  { key: 'question', label: '❓ 交流/提问' },
                  { key: 'neutral', label: '⚪ 中性/纪律' }
                ].map(r => (
                  <button
                    type="button"
                    key={r.key}
                    onClick={() => setReturnType(r.key as any)}
                    className={`px-2.5 py-1.5 rounded-xl text-xs font-medium border transition-all ${
                      returnType === r.key
                        ? 'bg-amber-500/20 border-amber-500 text-amber-300'
                        : 'bg-stone-800 border-stone-700 text-stone-400 hover:text-stone-200'
                    }`}
                  >
                    {r.label}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-stone-300 mb-1.5">
                收益率或核心标签
              </label>
              <input
                type="text"
                value={returnRate}
                onChange={e => setReturnRate(e.target.value)}
                placeholder="例如：+42% (年化)、-25% (止损反思)、求建议探讨"
                className="w-full bg-stone-800 border border-stone-700 rounded-xl px-4 py-2.5 text-stone-100 placeholder-stone-500 focus:outline-none focus:border-amber-500 text-sm"
              />
            </div>
          </div>

          {/* 5. Summary */}
          <div>
            <label className="block text-xs font-semibold text-stone-300 mb-1.5">
              一句话摘要 / 核心要旨
            </label>
            <input
              type="text"
              value={summary}
              onChange={e => setSummary(e.target.value)}
              placeholder="概括你的核心心路历程或本次求助的核心困惑（不超过 80 字）"
              className="w-full bg-stone-800 border border-stone-700 rounded-xl px-4 py-2.5 text-stone-100 placeholder-stone-500 focus:outline-none focus:border-amber-500 text-sm"
            />
          </div>

          {/* 6. Detailed Story / Question Content */}
          <div>
            <label className="block text-xs font-semibold text-stone-300 mb-1.5">
              详细经历故事 / 提问详情 <span className="text-rose-400">*</span>
            </label>
            <textarea
              required
              rows={6}
              value={content}
              onChange={e => setContent(e.target.value)}
              placeholder="讲述真实的投资故事：最初是怎么开始的？经历了怎样的市场波动与心理变化？做对了什么、踩了什么坑？或者详细写出你的资产现状与面临的困惑..."
              className="w-full bg-stone-800 border border-stone-700 rounded-xl p-4 text-stone-100 placeholder-stone-500 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 text-sm leading-relaxed"
            />
          </div>

          {/* 7. Key Lessons / Takeaways */}
          <div className="space-y-2 p-3.5 bg-stone-800/40 rounded-2xl border border-stone-800">
            <label className="block text-xs font-semibold text-stone-300 flex items-center gap-1.5">
              <BookOpen className="w-3.5 h-3.5 text-amber-400" />
              <span>投资心得 / 避坑箴言（选填，提炼 1~2 条精髓）</span>
            </label>
            <input
              type="text"
              value={keyLesson1}
              onChange={e => setKeyLesson1(e.target.value)}
              placeholder="箴言 1：例如：不择时就是最好的择时，场外稳定现金流是最大底气"
              className="w-full bg-stone-800 border border-stone-700 rounded-xl px-3 py-2 text-stone-100 placeholder-stone-500 text-xs focus:outline-none focus:border-amber-500"
            />
            <input
              type="text"
              value={keyLesson2}
              onChange={e => setKeyLesson2(e.target.value)}
              placeholder="箴言 2：例如：只要带上爆仓杠杆，长期数学期望值就是零"
              className="w-full bg-stone-800 border border-stone-700 rounded-xl px-3 py-2 text-stone-100 placeholder-stone-500 text-xs focus:outline-none focus:border-amber-500"
            />
          </div>

          {/* 8. Cover Image Preset Selection */}
          <div>
            <label className="block text-xs font-semibold text-stone-300 mb-2">
              精选封面图选择
            </label>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
              {PRESET_COVERS.map((imgUrl, idx) => (
                <div
                  key={idx}
                  onClick={() => setCoverImage(imgUrl)}
                  className={`aspect-video rounded-xl overflow-hidden cursor-pointer border-2 transition-all relative ${
                    coverImage === imgUrl ? 'border-amber-500 ring-2 ring-amber-500/30' : 'border-stone-700 hover:border-stone-500 opacity-60 hover:opacity-100'
                  }`}
                >
                  <img src={imgUrl} alt={`Cover option ${idx}`} className="w-full h-full object-cover" />
                  {coverImage === imgUrl && (
                    <div className="absolute inset-0 bg-amber-500/20 flex items-center justify-center">
                      <CheckCircle2 className="w-4 h-4 text-amber-400 drop-shadow" />
                    </div>
                  )}
                </div>
              ))}
            </div>
            <div className="mt-2">
              <input
                type="text"
                value={coverImage}
                onChange={e => setCoverImage(e.target.value)}
                placeholder="或输入自定义图片 URL"
                className="w-full bg-stone-800 border border-stone-700 rounded-xl px-3 py-1.5 text-stone-300 placeholder-stone-500 text-xs focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          {/* 9. DIY Chart Styling & Background Customization */}
          <div className="space-y-3.5 p-4 rounded-2xl bg-stone-800/40 border border-stone-800">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-stone-200 flex items-center gap-1.5">
                <Palette className="w-3.5 h-3.5 text-amber-400" />
                <span>收益率走势图 DIY 配色与背景定制</span>
              </label>
              <div className="flex items-center gap-2">
                <span className="text-[11px] text-stone-400">曲线拾色:</span>
                <input
                  type="color"
                  value={chartLineColor}
                  onChange={(e) => setChartLineColor(e.target.value)}
                  className="w-6 h-6 rounded cursor-pointer bg-transparent border-0 p-0"
                />
              </div>
            </div>

            {/* Quick Curve Color Swatches */}
            <div className="space-y-1.5">
              <div className="text-[11px] text-stone-400">选择折线与发光渐变主色：</div>
              <div className="flex flex-wrap gap-2">
                {COLOR_PALETTE.map((c) => (
                  <button
                    type="button"
                    key={c.hex}
                    onClick={() => setChartLineColor(c.hex)}
                    className={`px-2.5 py-1 rounded-lg border text-xs flex items-center gap-1.5 transition-all ${
                      chartLineColor.toLowerCase() === c.hex.toLowerCase()
                        ? 'border-amber-400 ring-2 ring-amber-400/20 bg-stone-800'
                        : 'border-stone-700 hover:border-stone-500 bg-stone-800/60 text-stone-300'
                    }`}
                  >
                    <span 
                      className="w-3 h-3 rounded-full border border-white/20" 
                      style={{ backgroundColor: c.hex }} 
                    />
                    <span>{c.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Background Skin Selection */}
            <div className="space-y-1.5 pt-1">
              <div className="text-[11px] text-stone-400">选择走势图背景底纹 / 风格：</div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {BG_PRESETS.map((bg) => {
                  const isSelected = 
                    chartBgType === bg.type && 
                    (bg.type !== 'image' || chartBgImage === bg.url);

                  return (
                    <button
                      type="button"
                      key={bg.id}
                      onClick={() => {
                        setChartBgType(bg.type);
                        if (bg.type === 'image' && bg.url) {
                          setChartBgImage(bg.url);
                        }
                      }}
                      className={`p-2 rounded-xl border text-left text-xs transition-all flex items-center justify-between ${
                        isSelected
                          ? 'border-amber-500 bg-amber-500/15 text-amber-200 ring-1 ring-amber-500/30'
                          : 'border-stone-700/80 bg-stone-800/50 text-stone-300 hover:bg-stone-800'
                      }`}
                    >
                      <span>{bg.name}</span>
                      {isSelected && <Check className="w-3.5 h-3.5 text-amber-400" />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Embedded Live Preview of the custom chart */}
            <div className="pt-2">
              <div className="text-[11px] text-stone-400 mb-1 flex items-center justify-between">
                <span>图表生成效果实时预览：</span>
                <span className="font-mono text-[10px] text-amber-400">
                  {chartLineColor} · {chartBgType}
                </span>
              </div>
              <InvestmentYieldChart
                story={{
                  id: 'preview-new',
                  title: title || '收益率走势',
                  category,
                  categoryLabel: getCategoryLabel(category),
                  author: author || '作者',
                  date: '2026-10-02',
                  returnRate: returnRate || '+42.5%',
                  returnType,
                  summary: '',
                  content: '',
                  tags: [],
                  likesCount: 0,
                  comments: []
                }}
                customTheme={{
                  lineColor: chartLineColor,
                  bgType: chartBgType,
                  bgImage: chartBgType === 'image' ? chartBgImage : undefined
                }}
                height={85}
              />
            </div>
          </div>

          {/* 10. Author Info & Tags */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-stone-300 mb-1.5">
                作者昵称 / 身份标签
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={author}
                  onChange={e => setAuthor(e.target.value)}
                  placeholder="作者昵称"
                  className="w-1/2 bg-stone-800 border border-stone-700 rounded-xl px-3 py-2 text-stone-100 placeholder-stone-500 text-xs focus:outline-none focus:border-amber-500"
                />
                <input
                  type="text"
                  value={authorRole}
                  onChange={e => setAuthorRole(e.target.value)}
                  placeholder="角色（如定投爱好者）"
                  className="w-1/2 bg-stone-800 border border-stone-700 rounded-xl px-3 py-2 text-stone-100 placeholder-stone-500 text-xs focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-stone-300 mb-1.5">
                标签（逗号或空格隔开）
              </label>
              <input
                type="text"
                value={tagsStr}
                onChange={e => setTagsStr(e.target.value)}
                placeholder="例如：标普500, 复利效应, 资产配置"
                className="w-full bg-stone-800 border border-stone-700 rounded-xl px-3 py-2 text-stone-100 placeholder-stone-500 text-xs focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          {/* Submit Button */}
          <div className="pt-4 border-t border-stone-800 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-stone-400 hover:text-white hover:bg-stone-800 transition-colors text-xs font-medium"
            >
              取消
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-medium flex items-center gap-2 shadow-lg shadow-amber-500/20 transition-all text-xs"
            >
              <Send className="w-4 h-4" />
              <span>立即公开发布</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
