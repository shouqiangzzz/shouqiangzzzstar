import React, { useState } from 'react';
import { 
  X, 
  Heart, 
  ShoppingCart, 
  Star, 
  Check, 
  Truck, 
  ShieldCheck, 
  Send, 
  Sparkles,
  Share2,
  CheckCircle
} from 'lucide-react';
import { ProductItem, Comment } from '../types';

interface ProductDetailModalProps {
  product: ProductItem | null;
  onClose: () => void;
  isPlanted: boolean;
  onTogglePlant: (id: string) => void;
  onAddToCart: (product: ProductItem, quantity: number) => void;
  onDirectBuy: (product: ProductItem, quantity: number) => void;
  onAddComment: (productId: string, comment: Comment) => void;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  product,
  onClose,
  isPlanted,
  onTogglePlant,
  onAddToCart,
  onDirectBuy,
  onAddComment
}) => {
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [commentText, setCommentText] = useState('');
  const [authorName, setAuthorName] = useState('');
  const [copied, setCopied] = useState(false);
  const [addedToast, setAddedToast] = useState(false);

  if (!product) return null;

  const images = product.gallery && product.gallery.length > 0 ? product.gallery : [product.image];

  const handleAddToCartClick = () => {
    onAddToCart(product, quantity);
    setAddedToast(true);
    setTimeout(() => setAddedToast(false), 2000);
  };

  const handleCommentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    const newComment: Comment = {
      id: `pc-${Date.now()}`,
      author: authorName.trim() || '好物鉴赏家',
      avatar: `https://images.unsplash.com/photo-${1535713875002 + Math.floor(Math.random() * 100)}?auto=format&fit=crop&w=120&q=80`,
      content: commentText.trim(),
      date: new Date().toISOString().split('T')[0],
      likes: 1
    };

    onAddComment(product.id, newComment);
    setCommentText('');
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/70 backdrop-blur-xs overflow-y-auto">
      <div 
        className="relative w-full max-w-4xl bg-white rounded-2xl shadow-2xl overflow-hidden my-auto flex flex-col max-h-[92vh] animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Bar */}
        <div className="flex items-center justify-between px-6 py-3.5 border-b border-stone-200 bg-stone-50/80 sticky top-0 z-20">
          <div className="flex items-center gap-2 text-xs">
            <span className="font-semibold text-stone-900">好物详情</span>
            <span className="text-stone-400">·</span>
            <span className="text-amber-800 bg-amber-100 px-2 py-0.5 rounded-full font-medium">
              {product.tag}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleShare}
              className="p-2 text-stone-500 hover:text-stone-800 hover:bg-stone-200/60 rounded-full transition-colors"
              title="分享好物"
            >
              {copied ? <CheckCircle className="w-4 h-4 text-emerald-600" /> : <Share2 className="w-4 h-4" />}
            </button>
            <button
              onClick={onClose}
              className="p-2 text-stone-400 hover:text-stone-700 hover:bg-stone-200/60 rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="overflow-y-auto px-6 py-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Gallery Column */}
            <div className="space-y-3">
              <div className="aspect-4/3 rounded-xl overflow-hidden bg-stone-100 border border-stone-200 shadow-xs">
                <img
                  src={images[activeImageIndex] || product.image}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              </div>

              {images.length > 1 && (
                <div className="flex gap-2 overflow-x-auto pb-1">
                  {images.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setActiveImageIndex(idx)}
                      className={`relative w-16 h-16 rounded-lg overflow-hidden shrink-0 border-2 transition-all ${
                        activeImageIndex === idx ? 'border-amber-500 scale-95' : 'border-transparent opacity-70 hover:opacity-100'
                      }`}
                    >
                      <img src={img} alt="" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}

              {/* Service guarantee pills */}
              <div className="grid grid-cols-2 gap-2 pt-2">
                <div className="flex items-center gap-1.5 p-2 rounded-lg bg-stone-50 border border-stone-100 text-xs text-stone-600">
                  <Truck className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                  <span>顺丰速运 / 电子攻略秒送</span>
                </div>
                <div className="flex items-center gap-1.5 p-2 rounded-lg bg-stone-50 border border-stone-100 text-xs text-stone-600">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>博主亲测正品保证</span>
                </div>
              </div>
            </div>

            {/* Info Column */}
            <div className="flex flex-col justify-between space-y-4">
              <div>
                {product.badge && (
                  <div className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-md bg-amber-500 text-white mb-2 shadow-xs">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>{product.badge}</span>
                  </div>
                )}

                <h1 className="text-xl sm:text-2xl font-bold font-serif text-stone-900 leading-snug mb-3">
                  {product.name}
                </h1>

                {/* Rating & reviews */}
                <div className="flex items-center gap-2 text-xs text-stone-500 mb-4">
                  <div className="flex items-center gap-0.5 text-amber-500">
                    <Star className="w-4 h-4 fill-amber-400" />
                    <span className="font-bold text-stone-900">{product.rating}</span>
                  </div>
                  <span>·</span>
                  <span>{product.reviewsCount}+ 条真实好评</span>
                  <span>·</span>
                  <span className="text-rose-600 font-medium">{product.plantedCount} 人已种草</span>
                </div>

                {/* Price block */}
                <div className="p-4 rounded-xl bg-rose-50/60 border border-rose-100 mb-4">
                  <div className="flex items-baseline gap-2">
                    <span className="text-sm font-bold text-rose-600">特惠价:</span>
                    <span className="text-3xl font-extrabold text-rose-600">¥{product.price}</span>
                    {product.originalPrice && (
                      <span className="text-sm text-stone-400 line-through">
                        原价 ¥{product.originalPrice}
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-stone-500 mt-1">
                    支持即时选购发货；电子类/旅游路书可即刻在线阅览并支持下载
                  </p>
                </div>

                {/* Why I recommend */}
                <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200/80 mb-4">
                  <div className="flex items-center gap-1.5 font-bold text-xs text-amber-900 mb-1">
                    <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                    <span>博主自用体验推荐理由：</span>
                  </div>
                  <p className="text-xs sm:text-sm text-stone-700 leading-relaxed">
                    {product.highlightReason}
                  </p>
                </div>
              </div>

              {/* Purchase Controls */}
              <div className="pt-4 border-t border-stone-200 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-stone-600 font-medium">数量:</span>
                    <div className="flex items-center border border-stone-300 rounded-lg overflow-hidden">
                      <button
                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                        className="px-2.5 py-1 text-xs hover:bg-stone-100 text-stone-600"
                      >
                        -
                      </button>
                      <span className="px-3 py-1 text-xs font-semibold bg-white text-stone-800">
                        {quantity}
                      </span>
                      <button
                        onClick={() => setQuantity(quantity + 1)}
                        className="px-2.5 py-1 text-xs hover:bg-stone-100 text-stone-600"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  {/* Plant Button */}
                  <button
                    onClick={() => onTogglePlant(product.id)}
                    className={`flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg border transition-all ${
                      isPlanted
                        ? 'bg-rose-50 text-rose-600 border-rose-300'
                        : 'bg-white text-stone-600 border-stone-300 hover:border-rose-400'
                    }`}
                  >
                    <Heart className={`w-3.5 h-3.5 ${isPlanted ? 'fill-rose-500 text-rose-500' : ''}`} />
                    <span>{isPlanted ? '已种草' : '种草收藏'}</span>
                  </button>
                </div>

                <div className="flex gap-2 pt-1">
                  <button
                    onClick={handleAddToCartClick}
                    className="flex-1 py-2.5 px-4 rounded-xl border border-stone-900 text-stone-900 hover:bg-stone-100 text-xs sm:text-sm font-semibold flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <ShoppingCart className="w-4 h-4" />
                    <span>加入购物车</span>
                  </button>

                  <button
                    onClick={() => {
                      onDirectBuy(product, quantity);
                      onClose();
                    }}
                    className="flex-1 py-2.5 px-4 rounded-xl bg-gradient-to-r from-amber-600 to-rose-600 hover:from-amber-700 hover:to-rose-700 text-white text-xs sm:text-sm font-semibold flex items-center justify-center gap-1.5 shadow-xs transition-all"
                  >
                    <span>立即购买 / 获取</span>
                  </button>
                </div>

                {addedToast && (
                  <p className="text-xs text-emerald-600 font-medium text-center flex items-center justify-center gap-1">
                    <Check className="w-3.5 h-3.5" />
                    <span>已成功加入购物车！</span>
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Full Description & Specs */}
          <div className="pt-6 border-t border-stone-200 space-y-4">
            <h3 className="font-bold text-base text-stone-900">详细介绍与实测说明</h3>
            <p className="text-sm text-stone-700 leading-relaxed whitespace-pre-line bg-stone-50 p-4 rounded-xl border border-stone-200">
              {product.description}
            </p>

            {product.specs && (
              <div className="space-y-2">
                <h4 className="font-semibold text-xs text-stone-500 uppercase tracking-wider">规格参数</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {Object.entries(product.specs).map(([key, value]) => (
                    <div key={key} className="flex justify-between p-2.5 rounded-lg bg-stone-50 border border-stone-100 text-xs">
                      <span className="text-stone-500">{key}</span>
                      <span className="font-medium text-stone-800 text-right">{value}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* User Reviews & Comments */}
          <div className="pt-6 border-t border-stone-200 space-y-4">
            <h3 className="font-bold text-base text-stone-900">
              读者反馈与种草讨论 ({product.comments.length})
            </h3>

            {/* Form */}
            <form onSubmit={handleCommentSubmit} className="space-y-2 bg-stone-50 p-4 rounded-xl border border-stone-200">
              <input
                type="text"
                placeholder="你的昵称（选填）"
                value={authorName}
                onChange={(e) => setAuthorName(e.target.value)}
                className="w-full px-3 py-1.5 text-xs bg-white border border-stone-200 rounded-lg outline-hidden focus:border-amber-500"
              />
              <div className="flex gap-2">
                <textarea
                  rows={2}
                  placeholder="写下你对这件好物的提问、使用体验或种草心声..."
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  className="flex-1 px-3 py-2 text-xs sm:text-sm bg-white border border-stone-200 rounded-lg outline-hidden focus:border-amber-500 resize-none"
                />
                <button
                  type="submit"
                  disabled={!commentText.trim()}
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white text-xs font-semibold rounded-lg flex items-center gap-1 self-end transition-colors"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>留言</span>
                </button>
              </div>
            </form>

            <div className="space-y-2.5">
              {product.comments.length === 0 ? (
                <p className="text-xs text-stone-400 py-2 text-center">暂无评论，欢迎分享你的看法～</p>
              ) : (
                product.comments.map((comment) => (
                  <div key={comment.id} className="flex gap-3 p-3 rounded-xl bg-stone-50 border border-stone-100">
                    <img
                      src={comment.avatar}
                      alt={comment.author}
                      className="w-8 h-8 rounded-full object-cover shrink-0 mt-0.5"
                    />
                    <div className="flex-1 text-xs">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-semibold text-stone-900">{comment.author}</span>
                        <span className="text-[10px] text-stone-400">{comment.date}</span>
                      </div>
                      <p className="text-stone-700 leading-relaxed text-xs sm:text-sm">{comment.content}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
