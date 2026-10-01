import React, { useState } from 'react';
import { 
  X, 
  User, 
  Mail, 
  Calendar, 
  ShieldCheck, 
  LogOut, 
  Edit3, 
  Check, 
  Heart, 
  ShoppingBag,
  Sparkles
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface UserProfileDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  plantedCount: number;
  ordersCount: number;
  onOpenPlanted: () => void;
  onOpenCart: () => void;
}

export const UserProfileDrawer: React.FC<UserProfileDrawerProps> = ({
  isOpen,
  onClose,
  plantedCount,
  ordersCount,
  onOpenPlanted,
  onOpenCart
}) => {
  const { userProfile, currentUser, logout, updateBio } = useAuth();
  const [isEditingBio, setIsEditingBio] = useState(false);
  const [bioInput, setBioInput] = useState(userProfile?.bio || '');
  const [savedToast, setSavedToast] = useState(false);

  if (!isOpen || !userProfile) return null;

  const handleSaveBio = async () => {
    await updateBio(bioInput);
    setIsEditingBio(false);
    setSavedToast(true);
    setTimeout(() => setSavedToast(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/60 backdrop-blur-xs flex justify-end">
      <div 
        className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col justify-between animate-in slide-in-from-right duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-stone-200 flex items-center justify-between bg-stone-50">
          <div className="flex items-center gap-2">
            <User className="w-5 h-5 text-amber-600" />
            <h2 className="font-bold text-stone-900 text-base">个人用户中心</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-stone-400 hover:text-stone-700 hover:bg-stone-200/60 rounded-full"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* User Card */}
          <div className="p-5 rounded-2xl bg-gradient-to-br from-stone-900 to-amber-950 text-white shadow-lg space-y-4">
            <div className="flex items-center gap-4">
              <img
                src={userProfile.photoURL}
                alt={userProfile.displayName}
                className="w-16 h-16 rounded-full object-cover border-2 border-amber-400/80 shadow-md bg-stone-800"
              />
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-lg text-white truncate font-serif">
                    {userProfile.displayName}
                  </h3>
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-400 text-stone-950 shrink-0">
                    {userProfile.role === 'creator' ? '主理人 / 创作者' : '正式社区成员'}
                  </span>
                </div>
                <p className="text-xs text-stone-300 truncate mt-0.5">
                  {userProfile.email}
                </p>
                <div className="flex items-center gap-1 text-[11px] text-amber-200/80 mt-1">
                  <Calendar className="w-3 h-3" />
                  <span>注册于 {userProfile.createdAt ? userProfile.createdAt.split('T')[0] : '2026-10-01'}</span>
                </div>
              </div>
            </div>

            {/* Cloud Database Persistence Badge */}
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 text-xs text-amber-200 border border-white/10">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>数据已实时同步至 Google Cloud Firestore 数据库</span>
            </div>
          </div>

          {/* Bio Section */}
          <div className="p-4 rounded-xl bg-stone-50 border border-stone-200 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-stone-700 flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                <span>个性签名 / 个人简介</span>
              </span>
              {!isEditingBio ? (
                <button
                  onClick={() => { setIsEditingBio(true); setBioInput(userProfile.bio || ''); }}
                  className="text-xs text-amber-600 hover:text-amber-700 flex items-center gap-1"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>编辑</span>
                </button>
              ) : (
                <button
                  onClick={handleSaveBio}
                  className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 flex items-center gap-1"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>保存至数据库</span>
                </button>
              )}
            </div>

            {isEditingBio ? (
              <textarea
                rows={3}
                value={bioInput}
                onChange={(e) => setBioInput(e.target.value)}
                placeholder="填写你的自我介绍、研究领域或兴趣爱好..."
                className="w-full p-2.5 text-xs bg-white border border-stone-200 rounded-lg outline-hidden focus:border-amber-500"
              />
            ) : (
              <p className="text-xs text-stone-600 leading-relaxed italic">
                "{userProfile.bio || '这个人很低调，还没有写个人简介。'}"
              </p>
            )}

            {savedToast && (
              <p className="text-[11px] text-emerald-600 font-medium">✓ 签名已成功保存至云端数据库！</p>
            )}
          </div>

          {/* Quick Statistics Links */}
          <div className="space-y-2">
            <h4 className="text-xs font-semibold text-stone-500 uppercase tracking-wider">我的互动数据</h4>
            
            <div className="grid grid-cols-2 gap-3">
              <div 
                onClick={() => {
                  onClose();
                  onOpenPlanted();
                }}
                className="p-3.5 rounded-xl bg-stone-50 border border-stone-200 hover:border-rose-300 cursor-pointer transition-all group"
              >
                <div className="flex items-center justify-between text-xs text-stone-500 mb-1">
                  <span>我的种草</span>
                  <Heart className="w-4 h-4 text-rose-500 group-hover:scale-110 transition-transform" />
                </div>
                <div className="text-xl font-bold text-stone-900 font-serif">
                  {plantedCount} <span className="text-xs font-normal text-stone-400">件好物</span>
                </div>
              </div>

              <div 
                onClick={() => {
                  onClose();
                  onOpenCart();
                }}
                className="p-3.5 rounded-xl bg-stone-50 border border-stone-200 hover:border-amber-300 cursor-pointer transition-all group"
              >
                <div className="flex items-center justify-between text-xs text-stone-500 mb-1">
                  <span>我的订单</span>
                  <ShoppingBag className="w-4 h-4 text-amber-600 group-hover:scale-110 transition-transform" />
                </div>
                <div className="text-xl font-bold text-stone-900 font-serif">
                  {ordersCount} <span className="text-xs font-normal text-stone-400">笔记录</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Logout Button */}
        <div className="p-6 border-t border-stone-200 bg-stone-50">
          <button
            onClick={async () => {
              await logout();
              onClose();
            }}
            className="w-full py-2.5 px-4 rounded-xl border border-stone-300 hover:border-rose-300 hover:bg-rose-50 text-stone-700 hover:text-rose-600 text-xs font-semibold flex items-center justify-center gap-2 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>退出当前账号</span>
          </button>
        </div>
      </div>
    </div>
  );
};
