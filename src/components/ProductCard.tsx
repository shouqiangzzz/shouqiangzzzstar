import React from 'react';
import { Heart, ShoppingCart, Star, CheckCircle, Sparkles } from 'lucide-react';
import { ProductItem } from '../types';

interface ProductCardProps {
  product: ProductItem;
  isPlanted: boolean;
  onTogglePlant: (id: string) => void;
  onAddToCart: (product: ProductItem) => void;
  onOpenDetail: (product: ProductItem) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  isPlanted,
  onTogglePlant,
  onAddToCart,
  onOpenDetail
}) => {
  const getCategoryBadge = (cat: string) => {
    switch (cat) {
      case 'electronics':
        return { label: '电子数码', color: 'bg-indigo-50 text-indigo-700 border-indigo-200' };
      case 'books':
        return { label: '精选书籍', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' };
      case 'snacks':
        return { label: '严选零食', color: 'bg-amber-50 text-amber-700 border-amber-200' };
      case 'travel':
        return { label: '旅游攻略', color: 'bg-rose-50 text-rose-700 border-rose-200' };
      default:
        return { label: '好物推荐', color: 'bg-stone-50 text-stone-700 border-stone-200' };
    }
  };

  const badgeInfo = getCategoryBadge(product.category);

  return (
    <div className="group bg-white rounded-2xl overflow-hidden border border-stone-200/80 hover:border-amber-300 shadow-xs hover:shadow-lg transition-all duration-300 flex flex-col justify-between">
      <div>
        {/* Product Image Cover */}
        <div 
          onClick={() => onOpenDetail(product)}
          className="relative aspect-4/3 overflow-hidden cursor-pointer bg-stone-100"
        >
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
            onError={(e) => {
              e.currentTarget.src = 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=800&q=80';
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

          {/* Category & Badge */}
          <div className="absolute top-2.5 left-2.5 flex flex-col gap-1 items-start">
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border backdrop-blur-xs ${badgeInfo.color}`}>
              {badgeInfo.label}
            </span>
            {product.badge && (
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-amber-500 text-white shadow-xs">
                ★ {product.badge}
              </span>
            )}
          </div>

          {/* Plant Grass (种草) quick button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onTogglePlant(product.id);
            }}
            className={`absolute top-2.5 right-2.5 p-2 rounded-full backdrop-blur-md shadow-xs transition-all ${
              isPlanted 
                ? 'bg-rose-500 text-white scale-110' 
                : 'bg-white/80 text-stone-600 hover:text-rose-500 hover:bg-white'
            }`}
            title={isPlanted ? '已种草，点击取消' : '种草该好物'}
          >
            <Heart className={`w-4 h-4 ${isPlanted ? 'fill-current' : ''}`} />
          </button>

          {/* Rating */}
          <div className="absolute bottom-2 left-2.5 flex items-center gap-1 px-2 py-0.5 rounded-full bg-black/60 backdrop-blur-xs text-white text-[11px]">
            <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
            <span className="font-semibold">{product.rating}</span>
            <span className="text-stone-300 text-[10px]">({product.reviewsCount}+人评价)</span>
          </div>
        </div>

        {/* Content Details */}
        <div className="p-4">
          <h3 
            onClick={() => onOpenDetail(product)}
            className="font-bold text-sm sm:text-base text-stone-900 group-hover:text-amber-700 cursor-pointer line-clamp-2 leading-snug mb-2"
          >
            {product.name}
          </h3>

          {product.usageDuration && (
            <div className="text-[10px] text-amber-900 font-medium bg-amber-100/60 px-2 py-0.5 rounded-md border border-amber-200/80 mb-2 w-fit">
              ⏱️ {product.usageDuration.split('·')[0]}
            </div>
          )}

          {/* Reason for recommendation */}
          <div className="p-2.5 rounded-xl bg-amber-50/70 border border-amber-100/80 mb-3 text-xs text-amber-900 leading-relaxed">
            <div className="flex items-center gap-1 font-semibold text-[11px] text-amber-800 mb-0.5">
              <Sparkles className="w-3 h-3 text-amber-600" />
              <span>为什么我推荐：</span>
            </div>
            <p className="line-clamp-2 text-stone-700 text-xs">
              {product.highlightReason}
            </p>
          </div>
        </div>
      </div>

      {/* Footer Price & Buttons */}
      <div className="px-4 pb-4 pt-1 flex items-center justify-between border-t border-stone-100">
        <div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-xs font-bold text-rose-600">¥</span>
            <span className="text-xl font-black text-rose-600 tracking-tight">{product.price}</span>
            {product.originalPrice && (
              <span className="text-xs text-stone-400 line-through">
                ¥{product.originalPrice}
              </span>
            )}
          </div>
          <div className="text-[10px] text-stone-400">
            {product.plantedCount} 人已种草
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={() => onAddToCart(product)}
            className="p-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 transition-colors"
            title="加入购物车"
          >
            <ShoppingCart className="w-4 h-4" />
          </button>
          
          <button
            onClick={() => onOpenDetail(product)}
            className="px-3 py-1.5 rounded-xl bg-stone-900 hover:bg-amber-600 text-white text-xs font-semibold transition-colors"
          >
            查看详情
          </button>
        </div>
      </div>
    </div>
  );
};
