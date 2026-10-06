import React, { useRef, useState } from 'react';
import { X, Download, Copy, Check, Sparkles, TrendingUp, ShoppingBag, ShieldCheck, Share2, QrCode } from 'lucide-react';
import { InvestmentStory, ProductItem, ChartThemeConfig } from '../types';
import { InvestmentYieldChart } from './InvestmentYieldChart';

interface SharePosterModalProps {
  isOpen: boolean;
  onClose: () => void;
  story?: InvestmentStory | null;
  product?: ProductItem | null;
  customTheme?: ChartThemeConfig;
}

export const SharePosterModal: React.FC<SharePosterModalProps> = ({
  isOpen,
  onClose,
  story,
  product,
  customTheme
}) => {
  const [copied, setCopied] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const posterRef = useRef<HTMLDivElement>(null);

  if (!isOpen || (!story && !product)) return null;

  const isInvestment = !!story;

  const handleCopyText = () => {
    let text = '';
    if (story) {
      text = `【星芒生活志 · 投资复盘】\n` +
        `标的/主题：${story.title}\n` +
        `收益情况：${story.returnRate}\n` +
        `核心心得：\n${story.keyLessons ? story.keyLessons.map((l, i) => `${i + 1}. ${l}`).join('\n') : story.summary}\n\n` +
        `来自「ShouqiangStar 星芒生活志」独立站\n探寻属于工程师的长线复利与现实工程学。`;
    } else if (product) {
      text = `【星芒生活志 · 自用好物实测】\n` +
        `装备：${product.name}\n` +
        `实测使用：${product.usageDuration || '长期主力自用'}\n` +
        `主理人实测点评：${product.highlightReason}\n` +
        (product.honestDisadvantages ? `谁慎买（缺点坦白）：${product.honestDisadvantages}\n\n` : '\n') +
        `来自「ShouqiangStar 星芒生活志」独立站。`;
    }

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadPoster = async () => {
    setDownloading(true);
    try {
      // Create a canvas dynamically to draw the poster high-res
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const width = 800;
      const height = isInvestment ? 1100 : 1050;
      canvas.width = width;
      canvas.height = height;

      // Draw background dark slate gradient
      const bgGrad = ctx.createLinearGradient(0, 0, width, height);
      bgGrad.addColorStop(0, '#0c0a09');
      bgGrad.addColorStop(0.5, '#1c1917');
      bgGrad.addColorStop(1, '#09090b');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, width, height);

      // Draw elegant decorative borders
      ctx.strokeStyle = '#292524';
      ctx.lineWidth = 2;
      ctx.strokeRect(24, 24, width - 48, height - 48);

      // Inner header
      ctx.fillStyle = '#f59e0b';
      ctx.font = 'bold 24px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto';
      ctx.fillText('SHOUQIANG STAR · 星芒生活志', 48, 80);

      ctx.fillStyle = '#a8a29e';
      ctx.font = '16px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto';
      ctx.fillText(isInvestment ? '投资实战复盘 · 穿越牛熊与长线复利' : '自用好物实测 · 真实使用与缺点坦白', 48, 110);

      // Horizontal separator
      ctx.strokeStyle = '#44403c';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(48, 130);
      ctx.lineTo(width - 48, 130);
      ctx.stroke();

      if (isInvestment && story) {
        // Category & Return badge
        ctx.fillStyle = '#292524';
        ctx.fillRect(48, 160, 140, 36);
        ctx.fillStyle = '#f59e0b';
        ctx.font = 'bold 16px sans-serif';
        ctx.fillText(story.categoryLabel || '投资交流', 60, 184);

        ctx.fillStyle = story.returnType === 'loss' ? '#f43f5e' : '#10b981';
        ctx.font = 'bold 22px monospace';
        ctx.fillText(story.returnRate || '+48.6%', 210, 186);

        // Title
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 26px sans-serif';
        const titleWords = story.title;
        if (titleWords.length > 25) {
          ctx.fillText(titleWords.slice(0, 25), 48, 240);
          ctx.fillText(titleWords.slice(25, 50) + (titleWords.length > 50 ? '...' : ''), 48, 275);
        } else {
          ctx.fillText(titleWords, 48, 240);
        }

        // Summary box
        ctx.fillStyle = '#1c1917';
        ctx.fillRect(48, 310, width - 96, 120);
        ctx.strokeStyle = '#292524';
        ctx.strokeRect(48, 310, width - 96, 120);

        ctx.fillStyle = '#d6d3d1';
        ctx.font = '16px sans-serif';
        const summaryText = story.summary.slice(0, 120) + (story.summary.length > 120 ? '...' : '');
        ctx.fillText(summaryText.slice(0, 38), 68, 345);
        ctx.fillText(summaryText.slice(38, 76), 68, 375);
        if (summaryText.length > 76) {
          ctx.fillText(summaryText.slice(76, 114), 68, 405);
        }

        // Key lessons section
        ctx.fillStyle = '#fbbf24';
        ctx.font = 'bold 18px sans-serif';
        ctx.fillText('💡 实战法则与避坑箴言：', 48, 470);

        const lessons = story.keyLessons && story.keyLessons.length > 0 
          ? story.keyLessons 
          : ['耐得住寂寞的枯燥感，场外稳定现金流是底气', '只要带上爆仓杠杆，长期数学期望值就是零'];

        lessons.slice(0, 3).forEach((lesson, idx) => {
          ctx.fillStyle = '#292524';
          ctx.beginPath();
          ctx.arc(62, 510 + idx * 45, 12, 0, Math.PI * 2);
          ctx.fill();

          ctx.fillStyle = '#fbbf24';
          ctx.font = 'bold 14px sans-serif';
          ctx.fillText(String(idx + 1), 58, 515 + idx * 45);

          ctx.fillStyle = '#e7e5e4';
          ctx.font = '15px sans-serif';
          ctx.fillText(lesson.slice(0, 40), 85, 515 + idx * 45);
        });

        // Mock Curve visual representation on canvas
        ctx.fillStyle = '#141210';
        ctx.fillRect(48, 660, width - 96, 200);
        ctx.strokeStyle = '#292524';
        ctx.strokeRect(48, 660, width - 96, 200);

        // Draw sparkline curve
        const curveColor = customTheme?.lineColor || (story.returnType === 'loss' ? '#f43f5e' : '#10b981');
        ctx.strokeStyle = curveColor;
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.moveTo(80, 800);
        ctx.bezierCurveTo(240, 810, 380, 770, 500, 720);
        ctx.bezierCurveTo(580, 690, 660, 705, 720, 680);
        ctx.stroke();

        ctx.fillStyle = curveColor;
        [80, 240, 420, 580, 720].forEach((x, i) => {
          ctx.beginPath();
          const y = [800, 805, 750, 700, 680][i];
          ctx.arc(x, y, 6, 0, Math.PI * 2);
          ctx.fill();
        });

        ctx.fillStyle = '#a8a29e';
        ctx.font = '14px monospace';
        ctx.fillText('建仓初期', 80, 840);
        ctx.fillText('震荡筑底', 360, 840);
        ctx.fillText('当前走势', 680, 840);

      } else if (product) {
        // Product Poster Mode
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 28px sans-serif';
        ctx.fillText(product.name.slice(0, 32), 48, 220);

        ctx.fillStyle = '#f59e0b';
        ctx.font = 'bold 24px sans-serif';
        ctx.fillText(`¥${product.price}`, 48, 265);

        ctx.fillStyle = '#a8a29e';
        ctx.font = '16px sans-serif';
        ctx.fillText(`实测使用：${product.usageDuration || '主力自用 2 年'}`, 180, 265);

        // Highlight
        ctx.fillStyle = '#1c1917';
        ctx.fillRect(48, 300, width - 96, 110);
        ctx.strokeStyle = '#292524';
        ctx.strokeRect(48, 300, width - 96, 110);

        ctx.fillStyle = '#fef3c7';
        ctx.font = 'bold 16px sans-serif';
        ctx.fillText('🌟 为什么主力推荐：', 68, 335);

        ctx.fillStyle = '#d6d3d1';
        ctx.font = '15px sans-serif';
        ctx.fillText(product.highlightReason.slice(0, 42), 68, 365);
        ctx.fillText(product.highlightReason.slice(42, 84), 68, 390);

        // Honest Disadvantage
        ctx.fillStyle = '#291415';
        ctx.fillRect(48, 435, width - 96, 110);
        ctx.strokeStyle = '#4c1d24';
        ctx.strokeRect(48, 435, width - 96, 110);

        ctx.fillStyle = '#fda4af';
        ctx.font = 'bold 16px sans-serif';
        ctx.fillText('⚠️ 主理人缺点坦白 / 谁慎买：', 68, 470);

        ctx.fillStyle = '#fecdd3';
        ctx.font = '15px sans-serif';
        const disText = product.honestDisadvantages || '不建议盲目跟风，适合看重耐用度而非追逐快消潮流的人群。';
        ctx.fillText(disText.slice(0, 42), 68, 500);
        ctx.fillText(disText.slice(42, 84), 68, 525);

        // Specs preview
        ctx.fillStyle = '#e7e5e4';
        ctx.font = '15px sans-serif';
        ctx.fillText(`产品标签：#${product.tag}  |  评分：${product.rating} 分 (${product.reviewsCount}人探讨)`, 48, 580);
      }

      // Poster Footer with QR code mockup & branding
      const footerY = height - 170;
      ctx.fillStyle = '#141210';
      ctx.fillRect(48, footerY, width - 96, 110);
      ctx.strokeStyle = '#292524';
      ctx.strokeRect(48, footerY, width - 96, 110);

      // QR Code Box
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(68, footerY + 15, 80, 80);
      ctx.fillStyle = '#000000';
      ctx.fillRect(76, footerY + 23, 24, 24);
      ctx.fillRect(116, footerY + 23, 24, 24);
      ctx.fillRect(76, footerY + 63, 24, 24);
      ctx.fillRect(116, footerY + 63, 14, 14);

      // Footer texts
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 16px sans-serif';
      ctx.fillText('ShouqiangStar · 星芒生活志', 170, footerY + 45);

      ctx.fillStyle = '#a8a29e';
      ctx.font = '13px sans-serif';
      ctx.fillText('扫码或搜索访问独立站 · 探索真实生活与长线复利', 170, footerY + 75);

      // Convert to image download
      const dataUrl = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.download = `shouqiangstar-share-${Date.now()}.png`;
      link.href = dataUrl;
      link.click();
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/85 backdrop-blur-md animate-fade-in overflow-y-auto">
      <div className="bg-stone-900 border border-stone-800 rounded-3xl w-full max-w-xl overflow-hidden shadow-2xl my-6 flex flex-col">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-stone-800 flex items-center justify-between bg-stone-900/80">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center">
              <Share2 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-stone-100 text-sm">生成社交分享卡片海报</h3>
              <p className="text-[11px] text-stone-400">适合发小红书、朋友圈、即刻与 Twitter</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-stone-800 text-stone-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Live Poster Card Visual Preview */}
        <div className="p-6 overflow-y-auto max-h-[70vh] flex flex-col items-center">
          <div 
            ref={posterRef}
            className="w-full max-w-md rounded-2xl p-6 bg-gradient-to-b from-stone-950 via-stone-900 to-stone-950 border-2 border-stone-800 shadow-2xl space-y-5 text-stone-100 relative overflow-hidden"
          >
            {/* Header branding */}
            <div className="flex items-center justify-between border-b border-stone-800 pb-3">
              <div className="space-y-0.5">
                <span className="font-bold font-serif text-amber-400 tracking-wider text-xs">
                  SHOUQIANG STAR · 星芒生活志
                </span>
                <p className="text-[10px] text-stone-400">
                  {isInvestment ? '投资实战复盘 · 穿越牛熊与长线复利' : '自用好物实测 · 真实使用与缺点坦白'}
                </p>
              </div>
              <Sparkles className="w-4 h-4 text-amber-400" />
            </div>

            {/* Poster Main Body for Investment */}
            {isInvestment && story && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-0.5 rounded-md text-[11px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                    {story.categoryLabel}
                  </span>
                  <span className={`text-xs font-mono font-bold px-2 py-0.5 rounded ${
                    story.returnType === 'loss' ? 'bg-rose-500/20 text-rose-300' : 'bg-emerald-500/20 text-emerald-300'
                  }`}>
                    {story.returnRate}
                  </span>
                </div>

                <h4 className="text-base font-bold text-white leading-snug">
                  {story.title}
                </h4>

                <div className="p-3 rounded-xl bg-stone-900/90 border border-stone-800 text-xs text-stone-300 leading-relaxed">
                  {story.summary}
                </div>

                {/* Embedded DIY Chart */}
                <div className="rounded-xl overflow-hidden border border-stone-800">
                  <InvestmentYieldChart 
                    story={story} 
                    customTheme={customTheme || story.chartTheme} 
                    height={115} 
                  />
                </div>

                {/* Key Lessons */}
                {story.keyLessons && story.keyLessons.length > 0 && (
                  <div className="space-y-2 p-3 rounded-xl bg-amber-500/5 border border-amber-500/20">
                    <div className="text-[11px] font-bold text-amber-400">💡 实战复盘法则：</div>
                    {story.keyLessons.slice(0, 2).map((l, i) => (
                      <div key={i} className="text-[11px] text-stone-300 flex items-start gap-1.5">
                        <span className="text-amber-400 font-bold shrink-0">{i + 1}.</span>
                        <span className="leading-relaxed">{l}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Poster Main Body for Product */}
            {!isInvestment && product && (
              <div className="space-y-4">
                <div className="aspect-video w-full rounded-xl overflow-hidden border border-stone-800 relative">
                  <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                  <div className="absolute bottom-2 left-2 px-2 py-0.5 rounded-md bg-stone-950/80 backdrop-blur-md text-[10px] text-amber-300 border border-amber-500/30">
                    实测自用：{product.usageDuration || '主力使用 2 年'}
                  </div>
                </div>

                <div>
                  <h4 className="text-base font-bold text-white leading-snug">{product.name}</h4>
                  <div className="text-amber-400 font-bold text-sm mt-1">¥{product.price}</div>
                </div>

                <div className="p-3 rounded-xl bg-stone-900/90 border border-stone-800 text-xs space-y-1">
                  <div className="font-bold text-stone-200">为什么主力推荐：</div>
                  <p className="text-stone-400 leading-relaxed">{product.highlightReason}</p>
                </div>

                {product.honestDisadvantages && (
                  <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-xs space-y-1">
                    <div className="font-bold text-rose-300">⚠️ 缺点坦白 / 谁慎买：</div>
                    <p className="text-rose-200/80 leading-relaxed">{product.honestDisadvantages}</p>
                  </div>
                )}
              </div>
            )}

            {/* Poster Bottom Card Footer */}
            <div className="pt-3 border-t border-stone-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-stone-800 border border-stone-700 flex items-center justify-center text-stone-300">
                  <QrCode className="w-5 h-5 text-amber-400" />
                </div>
                <div>
                  <div className="text-[11px] font-bold text-stone-200">星芒生活志 · 独立站</div>
                  <div className="text-[10px] text-stone-500">扫码或搜索直达独立站阅读完整故事</div>
                </div>
              </div>
              <span className="text-[10px] text-stone-500 font-mono">MIT · 2026</span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="p-5 border-t border-stone-800 bg-stone-900/60 flex flex-col sm:flex-row items-center gap-3">
          <button
            onClick={handleCopyText}
            className="w-full sm:flex-1 py-2.5 px-4 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors border border-stone-700"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 text-emerald-400" />
                <span>已复制社交文案</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                <span>复制社交发帖文案</span>
              </>
            )}
          </button>

          <button
            onClick={handleDownloadPoster}
            disabled={downloading}
            className="w-full sm:flex-1 py-2.5 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-stone-950 font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-md shadow-amber-500/20 disabled:opacity-50"
          >
            <Download className="w-4 h-4" />
            <span>{downloading ? '正在导出高清海报...' : '下载高清分享海报 (PNG)'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
