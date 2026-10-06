import React from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ReferenceLine
} from 'recharts';
import { InvestmentStory, TrendPoint, ChartThemeConfig } from '../types';
import { TrendingUp, AlertTriangle, HelpCircle, Palette } from 'lucide-react';

interface InvestmentYieldChartProps {
  story: InvestmentStory;
  height?: number;
  showDetails?: boolean;
  customTheme?: ChartThemeConfig;
  onOpenDIYModal?: () => void;
}

export function resolveTrendData(story: InvestmentStory): TrendPoint[] {
  if (story.trendData && story.trendData.length >= 2) {
    return story.trendData;
  }

  // Extract explicit return number if available
  const numMatch = story.returnRate?.match(/([+-]?\d+(?:\.\d+)?)/);
  const explicitNum = numMatch ? parseFloat(numMatch[1]) : null;

  if (story.returnType === 'loss') {
    const finalVal = explicitNum !== null ? (explicitNum > 0 ? -explicitNum : explicitNum) : -65;
    return [
      { period: '建仓', yield: 0, benchmark: 0 },
      { period: '盈利期', yield: Math.round(Math.abs(finalVal) * 0.45), benchmark: 4 },
      { period: '顶峰', yield: Math.round(Math.abs(finalVal) * 0.9), benchmark: 8 },
      { period: '急跌', yield: Math.round(finalVal * 0.4), benchmark: 12 },
      { period: '爆仓反思', yield: finalVal, benchmark: 16 }
    ];
  }

  if (story.returnType === 'question') {
    return [
      { period: '第1月', yield: 0.2, benchmark: 1.5 },
      { period: '第3月', yield: 0.6, benchmark: 4.2 },
      { period: '第6月', yield: 1.1, benchmark: 7.8 },
      { period: '第9月', yield: 1.5, benchmark: 11.2 },
      { period: '当前', yield: 1.8, benchmark: 15.0 }
    ];
  }

  // Profit / Compounding
  const finalVal = explicitNum !== null ? Math.abs(explicitNum) : 48.6;
  return [
    { period: '初期', yield: 0, benchmark: 0 },
    { period: '回调', yield: Math.round(-finalVal * 0.25), benchmark: 3 },
    { period: '筑底', yield: Math.round(finalVal * 0.28), benchmark: 10 },
    { period: '加速', yield: Math.round(finalVal * 0.68), benchmark: 18 },
    { period: '当前', yield: finalVal, benchmark: 26 }
  ];
}

export const InvestmentYieldChart: React.FC<InvestmentYieldChartProps> = ({
  story,
  height = 110,
  showDetails = false,
  customTheme,
  onOpenDIYModal
}) => {
  const data = resolveTrendData(story);
  const isLoss = story.returnType === 'loss';
  const isQuestion = story.returnType === 'question';

  // Determine active DIY theme
  const defaultLineColor = isLoss ? '#f43f5e' : isQuestion ? '#6366f1' : '#10b981';
  const theme: ChartThemeConfig = customTheme || story.chartTheme || {
    lineColor: defaultLineColor,
    bgType: 'grid'
  };

  const primaryColor = theme.lineColor || defaultLineColor;
  const gradientId = `gradient-${story.id || 'chart'}-${primaryColor.replace('#', '')}`;

  // Find min and max for auto domain padding
  const yields = data.map(d => d.yield);
  const minYield = Math.min(...yields, 0);
  const maxYield = Math.max(...yields, 0);
  const padding = Math.max((maxYield - minYield) * 0.15, 5);

  const startVal = data[0]?.yield ?? 0;
  const latestVal = data[data.length - 1]?.yield ?? 0;

  // Background styling computation
  const getContainerStyle = (): React.CSSProperties => {
    if (theme.bgType === 'image' && theme.bgImage) {
      return {
        backgroundImage: `url(${theme.bgImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center'
      };
    }
    if (theme.bgType === 'gradient') {
      return {
        background: `linear-gradient(135deg, ${theme.gradientFrom || '#0f172a'}, ${theme.gradientTo || '#1e1b4b'})`
      };
    }
    if (theme.bgType === 'solid') {
      return {
        backgroundColor: theme.bgColor || '#09090b'
      };
    }
    return {};
  };

  return (
    <div 
      style={getContainerStyle()}
      className={`relative w-full rounded-2xl p-3 border border-stone-800/80 flex flex-col justify-between overflow-hidden transition-all ${
        theme.bgType === 'grid' 
          ? 'bg-stone-950/80 bg-[radial-gradient(#334155_1px,transparent_1px)] [background-size:12px_12px]' 
          : theme.bgType === 'image'
          ? 'bg-stone-950 bg-cover bg-center'
          : 'bg-stone-950/90'
      }`}
    >
      {/* Backdrop overlay for image backgrounds */}
      {theme.bgType === 'image' && (
        <div className="absolute inset-0 bg-stone-950/55 backdrop-blur-[0.5px] pointer-events-none" />
      )}

      {/* Chart Header */}
      <div className="relative z-10 flex items-center justify-between text-[11px] mb-1.5 px-0.5">
        <div className="flex items-center gap-1.5 font-medium text-stone-300">
          {isLoss ? (
            <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
          ) : isQuestion ? (
            <HelpCircle className="w-3.5 h-3.5 text-indigo-400" />
          ) : (
            <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
          )}
          <span>{isQuestion ? '收益对比基准' : '复利/净值走势'}</span>

          {/* Quick DIY trigger icon button if callback provided */}
          {onOpenDIYModal && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onOpenDIYModal();
              }}
              className="ml-1 px-1.5 py-0.5 rounded-md bg-stone-800/80 hover:bg-stone-700 text-stone-400 hover:text-amber-300 border border-stone-700/60 flex items-center gap-1 text-[10px] transition-colors"
              title="自定义图表配色与背景"
            >
              <Palette className="w-2.5 h-2.5 text-amber-400" />
              <span>DIY</span>
            </button>
          )}
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[10px] text-stone-400 font-mono">起点: {startVal}%</span>
          <span 
            className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded shadow-sm border border-white/10"
            style={{ 
              backgroundColor: `${primaryColor}22`,
              color: primaryColor,
              borderColor: `${primaryColor}44`
            }}
          >
            现值: {latestVal > 0 ? `+${latestVal}%` : `${latestVal}%`}
          </span>
        </div>
      </div>

      {/* SVG Recharts Line / Area Sparkline */}
      <div style={{ width: '100%', height }} className="relative z-10 select-none">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 8, right: 8, left: 8, bottom: 4 }}>
            <defs>
              <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={primaryColor} stopOpacity={0.45} />
                <stop offset="95%" stopColor={primaryColor} stopOpacity={0.0} />
              </linearGradient>
            </defs>

            <XAxis
              dataKey="period"
              stroke="#a8a29e"
              fontSize={10}
              tickLine={false}
              axisLine={false}
              dy={4}
            />

            <YAxis
              domain={[Math.floor(minYield - padding), Math.ceil(maxYield + padding)]}
              hide
            />

            <ReferenceLine y={0} stroke="#57534e" strokeDasharray="3 3" opacity={0.6} />

            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const pt = payload[0].payload as TrendPoint;
                  return (
                    <div className="bg-stone-900/95 border border-stone-700/80 rounded-xl px-2.5 py-1.5 text-[11px] shadow-xl backdrop-blur-md">
                      <div className="text-stone-400 font-medium mb-0.5">{pt.period}</div>
                      <div className="flex items-center gap-2">
                        <span className="text-stone-300">收益回报:</span>
                        <span 
                          className="font-bold font-mono" 
                          style={{ color: primaryColor }}
                        >
                          {pt.yield > 0 ? `+${pt.yield}%` : `${pt.yield}%`}
                        </span>
                      </div>
                      {pt.benchmark !== undefined && (
                        <div className="text-[10px] text-stone-500 font-mono mt-0.5">
                          基准参考: +{pt.benchmark}%
                        </div>
                      )}
                    </div>
                  );
                }
                return null;
              }}
            />

            <Area
              type="monotone"
              dataKey="yield"
              stroke={primaryColor}
              strokeWidth={2.4}
              fillOpacity={1}
              fill={`url(#${gradientId})`}
              dot={{ r: 2.5, fill: primaryColor, strokeWidth: 0 }}
              activeDot={{ r: 5, stroke: '#09090b', strokeWidth: 2, fill: primaryColor }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {showDetails && (
        <div className="relative z-10 flex items-center justify-between text-[10px] text-stone-400 pt-2 border-t border-stone-800/60 mt-1 px-1">
          <span>横轴：经历周期阶段</span>
          <span>纵轴：累计综合回报率（%）</span>
        </div>
      )}
    </div>
  );
};
