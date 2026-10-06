import React, { useState } from 'react';
import { Mail, Sparkles, CheckCircle2, Download, ArrowRight, ShieldCheck, Gift, BookOpen, ExternalLink, X } from 'lucide-react';
import { db, collection, setDoc, doc } from '../lib/firebase';

interface NewsletterSectionProps {
  onOpenAssetKit?: () => void;
}

export const NewsletterSection: React.FC<NewsletterSectionProps> = ({ onOpenAssetKit }) => {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [showGiftModal, setShowGiftModal] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !email.includes('@')) return;

    setIsSubmitting(true);
    const subId = `sub-${Date.now()}`;
    const subData = {
      id: subId,
      email: email.trim().toLowerCase(),
      subscribedAt: new Date().toISOString(),
      source: 'web_homepage_banner'
    };

    try {
      // Save locally
      const savedList = JSON.parse(localStorage.getItem('sq_newsletter_subs') || '[]');
      savedList.push(subData);
      localStorage.setItem('sq_newsletter_subs', JSON.stringify(savedList));
      localStorage.setItem('sq_user_subscribed', 'true');

      // Sync to Firestore
      try {
        await setDoc(doc(db, 'newsletter_subscribers', subId), subData);
      } catch (err) {
        console.warn('Firestore newsletter write error:', err);
      }

      setIsSuccess(true);
      setShowGiftModal(true);
      setEmail('');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-stone-900 via-stone-900 to-amber-950/40 border border-stone-800 p-6 sm:p-10 shadow-2xl text-stone-100 my-10">
      {/* Background glowing effects */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none -ml-20 -mb-20" />

      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        {/* Left copy & proposition */}
        <div className="lg:col-span-7 space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/15 text-amber-400 border border-amber-500/30 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>私域订阅 · 《星芒周刊 · Sunday Spark》</span>
          </div>

          <h3 className="text-2xl sm:text-3xl font-extrabold tracking-tight font-serif text-white leading-snug">
            每周日晚，交付一份不被算法绑架的思考
          </h3>

          <p className="text-stone-300 text-xs sm:text-sm leading-relaxed max-w-xl">
            拒绝碎片化信息轰炸。每周日精选发送：<strong>1 篇跨越周期的投资复盘实录</strong> + <strong>1 件亲自高频磨损的自用硬核好物</strong> + <strong>1 条自驾山野的极简生活哲学</strong>。
          </p>

          {/* Lead Magnet Free Gift Highlight */}
          <div className="p-3.5 rounded-2xl bg-stone-800/60 border border-stone-700/80 flex items-start gap-3 backdrop-blur-sm max-w-xl">
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center shrink-0 mt-0.5">
              <Gift className="w-4 h-4" />
            </div>
            <div className="text-xs space-y-1">
              <div className="font-bold text-amber-300 flex items-center gap-1.5">
                <span>订阅即赠专属干货礼包</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-400/20 text-amber-200">Notion / PDF</span>
              </div>
              <p className="text-stone-400 leading-relaxed">
                包含《软件工程师资产配置全景模型》、《川西与西北 3000 公里自驾硬核装备清单》及《博主精读 CSAPP 与价值投资思维导图》。
              </p>
            </div>
          </div>
        </div>

        {/* Right input form */}
        <div className="lg:col-span-5 bg-stone-950/60 border border-stone-800 p-6 rounded-2xl backdrop-blur-md">
          {isSuccess ? (
            <div className="text-center py-4 space-y-3">
              <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h4 className="font-bold text-white text-base">订阅成功！欢迎加入星芒读者群</h4>
              <p className="text-xs text-stone-400">
                周刊首期内参已备好，干货资料包随时可以在线查阅与下载。
              </p>
              <button
                type="button"
                onClick={() => setShowGiftModal(true)}
                className="w-full py-2.5 px-4 rounded-xl bg-amber-500 hover:bg-amber-600 text-stone-950 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors"
              >
                <Download className="w-3.5 h-3.5" />
                <span>立即领取专属干货礼包</span>
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-3">
              <div className="text-xs font-semibold text-stone-200 flex items-center gap-2">
                <Mail className="w-4 h-4 text-amber-400" />
                <span>输入邮箱，开启每周深度阅读</span>
              </div>

              <div className="space-y-2">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full bg-stone-900 border border-stone-700 rounded-xl px-4 py-3 text-stone-100 placeholder-stone-500 text-xs sm:text-sm focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
                />
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-stone-950 font-extrabold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all shadow-lg shadow-amber-500/20 disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <span>正在订阅并打包礼包...</span>
                  ) : (
                    <>
                      <span>免费订阅并获取干货礼包</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>

              <div className="flex items-center justify-between text-[11px] text-stone-500 pt-2 border-t border-stone-800/80">
                <span className="flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  <span>尊重隐私 · 随时一键退订</span>
                </span>
                <span>已累计 1,280+ 位深度读者</span>
              </div>
            </form>
          )}
        </div>
      </div>

      {/* Gift Modal Download Prompt */}
      {showGiftModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/80 backdrop-blur-md animate-fade-in">
          <div className="bg-stone-900 border border-stone-800 rounded-3xl w-full max-w-lg p-6 space-y-5 shadow-2xl relative">
            <button
              onClick={() => setShowGiftModal(false)}
              className="absolute top-4 right-4 p-1.5 rounded-full bg-stone-800 text-stone-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center">
                <Gift className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-white text-base">🎁 专属探索者干货包已解锁</h4>
                <p className="text-xs text-stone-400">已关联至你的订阅凭证，点击即可在线阅览或另存</p>
              </div>
            </div>

            <div className="space-y-2.5">
              <a
                href="#asset-model"
                onClick={(e) => {
                  e.preventDefault();
                  alert("已为你打开《工程师全周期资产配置模型与定投复盘清单》在线预览！");
                }}
                className="p-3 rounded-xl bg-stone-800/60 hover:bg-stone-800 border border-stone-700/80 flex items-center justify-between group transition-colors"
              >
                <div className="flex items-center gap-3">
                  <BookOpen className="w-4 h-4 text-emerald-400" />
                  <div className="text-left">
                    <div className="text-xs font-semibold text-stone-200">1. 工程师全周期资产配置与定投复利清单 (Notion)</div>
                    <div className="text-[10px] text-stone-400">含标普500、纳指100、现金流三仓位配比与心理止盈策略</div>
                  </div>
                </div>
                <ExternalLink className="w-3.5 h-3.5 text-stone-500 group-hover:text-amber-400 transition-colors" />
              </a>

              <a
                href="#gear-list"
                onClick={(e) => {
                  e.preventDefault();
                  alert("已为你打开《川西自驾与野外露营自用全套装备清单 (3000公里实测版)》！");
                }}
                className="p-3 rounded-xl bg-stone-800/60 hover:bg-stone-800 border border-stone-700/80 flex items-center justify-between group transition-colors"
              >
                <div className="flex items-center gap-3">
                  <BookOpen className="w-4 h-4 text-amber-400" />
                  <div className="text-left">
                    <div className="text-xs font-semibold text-stone-200">2. 川西自驾 3000 公里硬核自用装备路书 (PDF)</div>
                    <div className="text-[10px] text-stone-400">含实战防高反备药、车载应急电瓶、气炉及防风保暖选型</div>
                  </div>
                </div>
                <ExternalLink className="w-3.5 h-3.5 text-stone-500 group-hover:text-amber-400 transition-colors" />
              </a>

              <a
                href="#csapp-notes"
                onClick={(e) => {
                  e.preventDefault();
                  alert("已为你打开《CSAPP底层系统架构与深度工作法高光导读笔记》！");
                }}
                className="p-3 rounded-xl bg-stone-800/60 hover:bg-stone-800 border border-stone-700/80 flex items-center justify-between group transition-colors"
              >
                <div className="flex items-center gap-3">
                  <BookOpen className="w-4 h-4 text-indigo-400" />
                  <div className="text-left">
                    <div className="text-xs font-semibold text-stone-200">3. CSAPP 底层软件架构与思维导图手册</div>
                    <div className="text-[10px] text-stone-400">博主手写关键章节梳理与对抗信息碎片的专注法则</div>
                  </div>
                </div>
                <ExternalLink className="w-3.5 h-3.5 text-stone-500 group-hover:text-amber-400 transition-colors" />
              </a>
            </div>

            <button
              onClick={() => setShowGiftModal(false)}
              className="w-full py-2.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 font-semibold text-xs transition-colors"
            >
              完成并继续浏览
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
