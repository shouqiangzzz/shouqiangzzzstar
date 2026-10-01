import React from 'react';
import { 
  Sparkles, 
  BookOpen, 
  ShoppingBag, 
  MessageSquare, 
  Heart, 
  PlusCircle, 
  Search,
  ShoppingCart,
  GraduationCap,
  User,
  LogIn
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  plantedCount: number;
  cartCount: number;
  onOpenPublish: () => void;
  onOpenShareStory: () => void;
  onOpenShareInsight: () => void;
  onOpenCart: () => void;
  onOpenPlanted: () => void;
  onOpenAuth: (mode?: 'login' | 'register') => void;
  onOpenProfile: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  searchQuery,
  setSearchQuery,
  plantedCount,
  cartCount,
  onOpenPublish,
  onOpenShareStory,
  onOpenShareInsight,
  onOpenCart,
  onOpenPlanted,
  onOpenAuth,
  onOpenProfile
}) => {
  const { currentUser, userProfile } = useAuth();

  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-stone-200/80 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-3">
          {/* Logo & Brand */}
          <div 
            onClick={() => setActiveTab('all')}
            className="flex items-center gap-2.5 cursor-pointer select-none group shrink-0"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-rose-500 flex items-center justify-center text-white shadow-sm shadow-amber-500/20 group-hover:scale-105 transition-transform duration-200">
              <Sparkles className="w-5 h-5 text-white animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-lg text-stone-900 tracking-tight font-serif">ShouqiangStar</span>
                <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-800">星芒志</span>
              </div>
              <p className="text-[11px] text-stone-500 hidden sm:block">生活 · 经历 · 学习心得 · 好物社区</p>
            </div>
          </div>

          {/* Navigation Links (Desktop) */}
          <nav className="hidden lg:flex items-center gap-1 text-sm font-medium">
            <button
              onClick={() => setActiveTab('all')}
              className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 ${
                activeTab === 'all'
                  ? 'bg-stone-900 text-white shadow-xs'
                  : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
              }`}
            >
              <Sparkles className="w-4 h-4" />
              全部发现
            </button>

            <button
              onClick={() => setActiveTab('life')}
              className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 ${
                activeTab === 'life'
                  ? 'bg-stone-900 text-white shadow-xs'
                  : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
              }`}
            >
              <BookOpen className="w-4 h-4 text-emerald-500" />
              生活与经历
            </button>

            <button
              onClick={() => setActiveTab('insights')}
              className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 ${
                activeTab === 'insights'
                  ? 'bg-stone-900 text-white shadow-xs'
                  : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
              }`}
            >
              <GraduationCap className="w-4 h-4 text-indigo-500" />
              学习心得
            </button>

            <button
              onClick={() => setActiveTab('products')}
              className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 ${
                activeTab === 'products'
                  ? 'bg-stone-900 text-white shadow-xs'
                  : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
              }`}
            >
              <ShoppingBag className="w-4 h-4 text-amber-500" />
              好物集市
            </button>

            <button
              onClick={() => setActiveTab('stories')}
              className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 ${
                activeTab === 'stories'
                  ? 'bg-stone-900 text-white shadow-xs'
                  : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
              }`}
            >
              <MessageSquare className="w-4 h-4 text-rose-500" />
              故事分享墙
            </button>
          </nav>

          {/* Search Bar & Actions */}
          <div className="flex items-center gap-2 sm:gap-2.5">
            {/* Search Input */}
            <div className="relative w-32 sm:w-48 md:w-56">
              <Search className="w-4 h-4 absolute left-2.5 top-1/2 -translate-y-1/2 text-stone-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="搜索心得、经历、好物..."
                className="w-full pl-8 pr-3 py-1.5 bg-stone-100/80 hover:bg-stone-100 focus:bg-white text-xs sm:text-sm rounded-lg border border-transparent focus:border-amber-400 focus:ring-2 focus:ring-amber-100 outline-hidden transition-all text-stone-800 placeholder-stone-400"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-stone-400 hover:text-stone-600"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Planted Grass / Wishlist Button */}
            <button
              onClick={onOpenPlanted}
              title="我的种草清单"
              className="relative p-2 rounded-lg text-stone-700 hover:bg-rose-50 hover:text-rose-600 transition-colors"
            >
              <Heart className={`w-5 h-5 ${plantedCount > 0 ? 'fill-rose-500 text-rose-500' : ''}`} />
              {plantedCount > 0 && (
                <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 bg-rose-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                  {plantedCount}
                </span>
              )}
            </button>

            {/* Shopping Cart Button */}
            <button
              onClick={onOpenCart}
              title="购物车与订单"
              className="relative p-2 rounded-lg text-stone-700 hover:bg-amber-50 hover:text-amber-600 transition-colors"
            >
              <ShoppingCart className="w-5 h-5" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 bg-amber-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </button>

            {/* User Auth or Profile Button */}
            {currentUser && userProfile ? (
              <button
                onClick={onOpenProfile}
                className="flex items-center gap-1.5 p-1 sm:px-2.5 sm:py-1 rounded-xl bg-stone-100 hover:bg-amber-50 border border-stone-200 transition-colors"
                title="打开用户中心"
              >
                <img
                  src={userProfile.photoURL}
                  alt={userProfile.displayName}
                  className="w-6 h-6 rounded-full object-cover border border-amber-300"
                />
                <span className="text-xs font-semibold text-stone-800 hidden sm:inline max-w-[80px] truncate">
                  {userProfile.displayName}
                </span>
              </button>
            ) : (
              <button
                onClick={() => onOpenAuth('register')}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-amber-300 bg-amber-50 hover:bg-amber-100 text-amber-900 text-xs font-semibold transition-colors"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>注册 / 登录</span>
              </button>
            )}

            {/* Action Publish Button */}
            <button
              onClick={onOpenPublish}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-gradient-to-r from-amber-500 to-rose-500 hover:from-amber-600 hover:to-rose-600 text-white shadow-xs transition-all"
            >
              <PlusCircle className="w-4 h-4" />
              <span className="hidden sm:inline">发布</span>
            </button>
          </div>
        </div>

        {/* Mobile Navigation Row */}
        <div className="lg:hidden flex items-center justify-between py-2 border-t border-stone-100 overflow-x-auto gap-1 text-xs">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-2.5 py-1 rounded-md shrink-0 ${
              activeTab === 'all' ? 'bg-stone-900 text-white font-medium' : 'text-stone-600'
            }`}
          >
            全部
          </button>
          <button
            onClick={() => setActiveTab('life')}
            className={`px-2.5 py-1 rounded-md shrink-0 flex items-center gap-1 ${
              activeTab === 'life' ? 'bg-stone-900 text-white font-medium' : 'text-stone-600'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5 text-emerald-500" />
            生活经历
          </button>
          <button
            onClick={() => setActiveTab('insights')}
            className={`px-2.5 py-1 rounded-md shrink-0 flex items-center gap-1 ${
              activeTab === 'insights' ? 'bg-stone-900 text-white font-medium' : 'text-stone-600'
            }`}
          >
            <GraduationCap className="w-3.5 h-3.5 text-indigo-500" />
            学习心得
          </button>
          <button
            onClick={() => setActiveTab('products')}
            className={`px-2.5 py-1 rounded-md shrink-0 flex items-center gap-1 ${
              activeTab === 'products' ? 'bg-stone-900 text-white font-medium' : 'text-stone-600'
            }`}
          >
            <ShoppingBag className="w-3.5 h-3.5 text-amber-500" />
            好物集市
          </button>
          <button
            onClick={() => setActiveTab('stories')}
            className={`px-2.5 py-1 rounded-md shrink-0 flex items-center gap-1 ${
              activeTab === 'stories' ? 'bg-stone-900 text-white font-medium' : 'text-stone-600'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5 text-rose-500" />
            故事墙
          </button>
        </div>
      </div>
    </header>
  );
};
