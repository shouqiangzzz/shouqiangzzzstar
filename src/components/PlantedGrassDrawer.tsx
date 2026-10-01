import React from 'react';
import { X, Heart, ShoppingCart, Trash2, ArrowRight } from 'lucide-react';
import { ProductItem } from '../types';

interface PlantedGrassDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  plantedProducts: ProductItem[];
  onTogglePlant: (id: string) => void;
  onAddToCart: (product: ProductItem) => void;
  onOpenDetail: (product: ProductItem) => void;
}

export const PlantedGrassDrawer: React.FC<PlantedGrassDrawerProps> = ({
  isOpen,
  onClose,
  plantedProducts,
  onTogglePlant,
  onAddToCart,
  onOpenDetail
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/60 backdrop-blur-xs flex justify-end">
      <div 
        className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col justify-between animate-in slide-in-from-right duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-stone-200 flex items-center justify-between bg-stone-50">
          <div className="flex items-center gap-2">
            <Heart className="w-5 h-5 text-rose-500 fill-rose-500" />
            <h2 className="font-bold text-stone-900 text-base">
              我的种草清单 ({plantedProducts.length})
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-stone-400 hover:text-stone-700 hover:bg-stone-200/60 rounded-full"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-3">
          {plantedProducts.length === 0 ? (
            <div className="py-16 text-center space-y-3">
              <div className="w-16 h-16 rounded-full bg-rose-50 text-rose-400 mx-auto flex items-center justify-center">
                <Heart className="w-8 h-8" />
              </div>
              <p className="text-stone-700 text-sm font-medium">你还没有种草任何好物</p>
              <p className="text-xs text-stone-400 leading-relaxed max-w-xs mx-auto">
                在好物集市看到心仪的电子产品、书籍、零食或旅游攻略时，点击红心图标即可种草到这里，方便随时复看和选购。
              </p>
              <button
                onClick={onClose}
                className="px-4 py-2 bg-rose-500 hover:bg-rose-600 text-white text-xs font-semibold rounded-lg mt-2"
              >
                前往集市发现心动好物
              </button>
            </div>
          ) : (
            plantedProducts.map((product) => (
              <div 
                key={product.id}
                className="flex gap-3 p-3 rounded-xl bg-stone-50 border border-stone-200 hover:border-amber-300 transition-colors"
              >
                <img
                  src={product.image}
                  alt={product.name}
                  onClick={() => {
                    onOpenDetail(product);
                    onClose();
                  }}
                  className="w-18 h-18 rounded-lg object-cover cursor-pointer shrink-0 border border-stone-200"
                />

                <div className="flex-1 min-w-0 flex flex-col justify-between">
                  <div>
                    <h4 
                      onClick={() => {
                        onOpenDetail(product);
                        onClose();
                      }}
                      className="text-xs font-bold text-stone-900 truncate hover:text-amber-700 cursor-pointer"
                    >
                      {product.name}
                    </h4>
                    <p className="text-[10px] text-amber-700 line-clamp-1 mt-0.5">
                      ★ {product.highlightReason}
                    </p>
                  </div>

                  <div className="flex items-center justify-between mt-2 pt-1 border-t border-stone-100">
                    <span className="text-xs font-extrabold text-rose-600">
                      ¥{product.price}
                    </span>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => onAddToCart(product)}
                        className="px-2.5 py-1 rounded-md bg-stone-900 hover:bg-amber-600 text-white text-[11px] font-medium flex items-center gap-1 transition-colors"
                      >
                        <ShoppingCart className="w-3 h-3" />
                        <span>加购</span>
                      </button>

                      <button
                        onClick={() => onTogglePlant(product.id)}
                        className="p-1 text-stone-400 hover:text-rose-500"
                        title="移出种草"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {plantedProducts.length > 0 && (
          <div className="p-4 border-t border-stone-200 bg-stone-50 text-center">
            <p className="text-xs text-stone-500">
              提示：种草清单保存在你的浏览器中，随时回访查看更新
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
