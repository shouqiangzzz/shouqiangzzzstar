import React, { useState } from 'react';
import { X, MessageCircle, Copy, Check, Sparkles, Mail, Github, Users, ShieldCheck, Heart } from 'lucide-react';

interface ConnectModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ConnectModal: React.FC<ConnectModalProps> = ({ isOpen, onClose }) => {
  const [copiedWeChat, setCopiedWeChat] = useState(false);
  const [copiedEmail, setCopiedEmail] = useState(false);

  if (!isOpen) return null;

  const handleCopyWeChat = () => {
    navigator.clipboard.writeText('shouqiang_star');
    setCopiedWeChat(true);
    setTimeout(() => setCopiedWeChat(false), 2000);
  };

  const handleCopyEmail = () => {
    navigator.clipboard.writeText('shouqiangzzz@gmail.com');
    setCopiedEmail(true);
    setTimeout(() => setCopiedEmail(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/80 backdrop-blur-md animate-fade-in">
      <div className="bg-stone-900 border border-stone-800 rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl relative text-stone-100 p-6 space-y-6">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-1.5 rounded-full hover:bg-stone-800 text-stone-400 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500 to-amber-600 text-stone-950 flex items-center justify-center font-bold shadow-lg shadow-amber-500/25">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white flex items-center gap-1.5">
              <span>与主理人建立真实连接</span>
              <Sparkles className="w-4 h-4 text-amber-400" />
            </h3>
            <p className="text-xs text-stone-400">
              拒绝冷冰冰的算法推荐，欢迎同频的探索者交流探讨
            </p>
          </div>
        </div>

        {/* WeChat Channel */}
        <div className="p-4 rounded-2xl bg-stone-800/60 border border-stone-700/80 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center">
                <MessageCircle className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-bold text-stone-200">主理人个人微信 / 读者社群</div>
                <div className="text-[11px] text-stone-400 font-mono">微信号：shouqiang_star</div>
              </div>
            </div>

            <button
              onClick={handleCopyWeChat}
              className="px-3 py-1.5 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 text-xs font-semibold flex items-center gap-1 transition-colors"
            >
              {copiedWeChat ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>已复制</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>复制微信号</span>
                </>
              )}
            </button>
          </div>

          <div className="text-[11px] text-stone-400 bg-stone-900/60 p-2.5 rounded-xl border border-stone-800/80 leading-relaxed">
            💬 <strong>交流群公约：</strong> 零广告推销、零割韭菜。专聊自驾实测路书、硬核底层系统、好物折旧体验与真实的穿越牛熊投资复盘。添加时请备注<strong>「星芒独立站读者」</strong>。
          </div>
        </div>

        {/* Email & GitHub Channels */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="p-3.5 rounded-2xl bg-stone-800/40 border border-stone-800 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <Mail className="w-4 h-4 text-amber-400" />
              <div>
                <div className="text-xs font-semibold text-stone-200">深度邮件咨询</div>
                <div className="text-[10px] text-stone-400 truncate max-w-[120px]">shouqiangzzz...</div>
              </div>
            </div>
            <button
              onClick={handleCopyEmail}
              className="text-xs text-amber-400 hover:text-amber-300 font-semibold"
            >
              {copiedEmail ? '已复制' : '复制'}
            </button>
          </div>

          <a
            href="https://github.com/shouqiangzzz/shouqiangzzzstar"
            target="_blank"
            rel="noreferrer"
            className="p-3.5 rounded-2xl bg-stone-800/40 border border-stone-800 flex items-center justify-between hover:bg-stone-800/80 transition-colors group"
          >
            <div className="flex items-center gap-2.5">
              <Github className="w-4 h-4 text-stone-300 group-hover:text-white" />
              <div>
                <div className="text-xs font-semibold text-stone-200">GitHub 开源仓库</div>
                <div className="text-[10px] text-stone-400">查看本项目全部源码</div>
              </div>
            </div>
            <span className="text-xs text-stone-500 group-hover:text-stone-300">★ Star</span>
          </a>
        </div>

        {/* Footer */}
        <div className="pt-2 flex items-center justify-between text-[11px] text-stone-500 border-t border-stone-800">
          <span className="flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>真诚交流 · 拒绝套路</span>
          </span>
          <span className="flex items-center gap-1 text-stone-400">
            <Heart className="w-3 h-3 text-rose-500" />
            <span>生活在于真实体验</span>
          </span>
        </div>
      </div>
    </div>
  );
};
