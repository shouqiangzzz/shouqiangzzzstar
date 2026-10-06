import React, { useState, useEffect } from 'react';
import { 
  X, 
  ShieldCheck, 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  Eye, 
  Trash2, 
  Sliders, 
  Mail, 
  FileText, 
  ShoppingBag, 
  BookOpen, 
  GraduationCap, 
  MessageSquare,
  Bot,
  RefreshCw,
  Plus,
  Check,
  ToggleLeft,
  ToggleRight,
  ExternalLink
} from 'lucide-react';
import { LifePost, ProductItem, StoryItem, StudyInsight, ModerationRule, ModerationEmailNotification, ContentStatus } from '../types';
import { db, collection, onSnapshot } from '../lib/firebase';
import { SmartVideoPlayer } from './SmartVideoPlayer';
import { 
  getModerationRules, 
  saveModerationRules, 
  getEmailNotifications, 
  DEFAULT_MODERATION_RULES,
  markEmailAsRead,
  getModerationMode,
  saveModerationMode,
  ModerationMode
} from '../services/aiModeration';

interface AdminConsoleModalProps {
  isOpen: boolean;
  onClose: () => void;
  posts: LifePost[];
  products: ProductItem[];
  stories: StoryItem[];
  insights: StudyInsight[];
  onUpdatePostStatus: (id: string, status: ContentStatus) => void;
  onUpdateProductStatus: (id: string, status: ContentStatus) => void;
  onUpdateStoryStatus: (id: string, status: ContentStatus) => void;
  onUpdateInsightStatus: (id: string, status: ContentStatus) => void;
  onDeletePost: (id: string) => void;
  onDeleteProduct: (id: string) => void;
  onDeleteStory: (id: string) => void;
  onDeleteInsight: (id: string) => void;
}

export const AdminConsoleModal: React.FC<AdminConsoleModalProps> = ({
  isOpen,
  onClose,
  posts,
  products,
  stories,
  insights,
  onUpdatePostStatus,
  onUpdateProductStatus,
  onUpdateStoryStatus,
  onUpdateInsightStatus,
  onDeletePost,
  onDeleteProduct,
  onDeleteStory,
  onDeleteInsight
}) => {
  const [activeTab, setActiveTab] = useState<'content' | 'queue' | 'rules' | 'emails'>('queue');
  const [contentFilter, setContentFilter] = useState<'all' | 'products' | 'posts' | 'insights' | 'stories'>('all');
  const [rules, setRules] = useState<ModerationRule[]>([]);
  const [emails, setEmails] = useState<ModerationEmailNotification[]>([]);
  const [rulesSavedToast, setRulesSavedToast] = useState(false);
  const [selectedInspectItem, setSelectedInspectItem] = useState<any>(null);
  const [moderationMode, setModerationMode] = useState<ModerationMode>(getModerationMode());

  // Load rules and emails on open, and listen to Cloud Firestore real-time emails
  useEffect(() => {
    if (isOpen) {
      setRules(getModerationRules());
      const localEmails = getEmailNotifications();
      setEmails(localEmails);

      const unsub = onSnapshot(collection(db, 'moderation_emails'), (snapshot) => {
        if (!snapshot.empty) {
          const cloudEmails: ModerationEmailNotification[] = [];
          snapshot.forEach(docSnap => cloudEmails.push(docSnap.data() as ModerationEmailNotification));
          setEmails(prev => {
            const cloudIds = new Set(cloudEmails.map(e => e.id));
            const localOnly = prev.filter(e => !cloudIds.has(e.id));
            return [...cloudEmails, ...localOnly];
          });
        }
      }, (err) => console.warn("Firestore emails listener error:", err));

      return () => unsub();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Flatten all items for unified management: put newest user posts and insights at the top!
  const allItems = [
    ...(posts || []).map(p => ({
      ...p,
      _type: 'post' as const,
      _title: p.title || '',
      _cover: p.coverImage || '',
      _author: p.authorName || (typeof p.id === 'string' && p.id.includes('user') ? '算法旅客' : '生活记录'),
      _date: p.date || '2026-10-01'
    })),
    ...(insights || []).map(i => ({
      ...i,
      _type: 'insight' as const,
      _title: i.title || '',
      _cover: i.coverImage || '',
      _author: i.author || (typeof i.id === 'string' && i.id.includes('user') ? '算法旅客' : '学习心得'),
      _date: i.date || '2026-10-01'
    })),
    ...(products || []).map(p => ({
      ...p,
      _type: 'product' as const,
      _title: p.name || '',
      _cover: p.image || '',
      _author: p.authorName || '集市好物',
      _date: p.date || '2026-10-01'
    })),
    ...(stories || []).map(s => ({
      ...s,
      _type: 'story' as const,
      _title: s.title || '',
      _cover: s.coverImage || '',
      _author: s.author || '社区故事',
      _date: s.date || '2026-10-01'
    }))
  ].sort((a, b) => {
    // Put today's (2026-10-01) items and user posts at the very top
    if (a._date === '2026-10-01' && b._date !== '2026-10-01') return -1;
    if (b._date === '2026-10-01' && a._date !== '2026-10-01') return 1;
    return 0;
  });

  // Filter pending items for the moderation queue
  const pendingQueue = allItems.filter(item => item.status === 'pending');
  // Recent user submitted items (for quick audit review)
  const recentUserItems = allItems.filter(item => {
    const author = item._author || '';
    const title = item._title || '';
    return author === '算法旅客' || title.includes('毛笔') || title.includes('旅行');
  });

  // Filter content by tab filter
  const filteredContent = allItems.filter(item => {
    if (contentFilter === 'all') return true;
    if (contentFilter === 'products') return item._type === 'product';
    if (contentFilter === 'posts') return item._type === 'post';
    if (contentFilter === 'insights') return item._type === 'insight';
    if (contentFilter === 'stories') return item._type === 'story';
    return true;
  });

  const handleToggleRule = (ruleId: string) => {
    const updated = rules.map(r => r.id === ruleId ? { ...r, enabled: !r.enabled } : r);
    setRules(updated);
    saveModerationRules(updated);
    setRulesSavedToast(true);
    setTimeout(() => setRulesSavedToast(false), 2000);
  };

  const handleResetRules = () => {
    setRules(DEFAULT_MODERATION_RULES);
    saveModerationRules(DEFAULT_MODERATION_RULES);
    setRulesSavedToast(true);
    setTimeout(() => setRulesSavedToast(false), 2000);
  };

  const handleApprovePending = (item: any) => {
    if (item._type === 'product') onUpdateProductStatus(item.id, 'published');
    if (item._type === 'post') onUpdatePostStatus(item.id, 'published');
    if (item._type === 'insight') onUpdateInsightStatus(item.id, 'published');
    if (item._type === 'story') onUpdateStoryStatus(item.id, 'published');
  };

  const handleRejectPending = (item: any) => {
    if (item._type === 'product') onUpdateProductStatus(item.id, 'rejected');
    if (item._type === 'post') onUpdatePostStatus(item.id, 'rejected');
    if (item._type === 'insight') onUpdateInsightStatus(item.id, 'rejected');
    if (item._type === 'story') onUpdateStoryStatus(item.id, 'rejected');
  };

  const handleToggleShelf = (item: any) => {
    const newStatus = (item.status === 'published' || !item.status) ? 'offline' : 'published';
    if (item._type === 'product') onUpdateProductStatus(item.id, newStatus);
    if (item._type === 'post') onUpdatePostStatus(item.id, newStatus);
    if (item._type === 'insight') onUpdateInsightStatus(item.id, newStatus);
    if (item._type === 'story') onUpdateStoryStatus(item.id, newStatus);
  };

  const handleDeleteItem = (item: any) => {
    if (confirm(`确定要从全站永久删除《${item._title}》吗？`)) {
      if (item._type === 'product') onDeleteProduct(item.id);
      if (item._type === 'post') onDeletePost(item.id);
      if (item._type === 'insight') onDeleteInsight(item.id);
      if (item._type === 'story') onDeleteStory(item.id);
    }
  };

  const getTypeBadge = (type: string) => {
    switch (type) {
      case 'product':
        return <span className="px-2 py-0.5 rounded-md bg-amber-100 text-amber-800 text-[10px] font-semibold flex items-center gap-1"><ShoppingBag className="w-3 h-3" /> 好物</span>;
      case 'post':
        return <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 text-[10px] font-semibold flex items-center gap-1"><BookOpen className="w-3 h-3" /> 经历</span>;
      case 'insight':
        return <span className="px-2 py-0.5 rounded-md bg-indigo-100 text-indigo-800 text-[10px] font-semibold flex items-center gap-1"><GraduationCap className="w-3 h-3" /> 心得</span>;
      default:
        return <span className="px-2 py-0.5 rounded-md bg-rose-100 text-rose-800 text-[10px] font-semibold flex items-center gap-1"><MessageSquare className="w-3 h-3" /> 故事</span>;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-xs overflow-y-auto">
      <div 
        className="relative w-full max-w-5xl bg-white rounded-2xl shadow-2xl overflow-hidden my-auto flex flex-col max-h-[92vh] animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-stone-200 bg-gradient-to-r from-stone-900 to-amber-950 text-white">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500 text-stone-950 flex items-center justify-center font-bold shadow-md">
              <ShieldCheck className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-bold text-base tracking-wide font-serif">全站管理员控制台 · AI 智能审核中心</h2>
                <span className="px-2 py-0.5 rounded-full bg-amber-400 text-stone-950 text-[10px] font-bold">
                  超级主理人权限
                </span>
              </div>
              <p className="text-xs text-stone-300">
                具备全站内容上下架控制、Gemini AI 智能体审核规则管理与人工审核通知
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-stone-300 hover:text-white hover:bg-white/10 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-stone-200 px-6 bg-stone-50 overflow-x-auto text-xs sm:text-sm font-semibold">
          <button
            onClick={() => setActiveTab('queue')}
            className={`py-3 px-4 border-b-2 transition-all flex items-center gap-1.5 shrink-0 ${
              activeTab === 'queue'
                ? 'border-amber-600 text-amber-950 bg-white font-bold'
                : 'border-transparent text-stone-500 hover:text-stone-800'
            }`}
          >
            <AlertTriangle className="w-4 h-4 text-amber-600" />
            <span>待审队列与人工审核</span>
            {pendingQueue.length > 0 && (
              <span className="px-1.5 py-0.2 bg-rose-500 text-white text-[10px] rounded-full font-mono">
                {pendingQueue.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('content')}
            className={`py-3 px-4 border-b-2 transition-all flex items-center gap-1.5 shrink-0 ${
              activeTab === 'content'
                ? 'border-amber-600 text-amber-950 bg-white font-bold'
                : 'border-transparent text-stone-500 hover:text-stone-800'
            }`}
          >
            <Sliders className="w-4 h-4 text-indigo-600" />
            <span>全站内容上下架总览 ({allItems.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('rules')}
            className={`py-3 px-4 border-b-2 transition-all flex items-center gap-1.5 shrink-0 ${
              activeTab === 'rules'
                ? 'border-amber-600 text-amber-950 bg-white font-bold'
                : 'border-transparent text-stone-500 hover:text-stone-800'
            }`}
          >
            <Bot className="w-4 h-4 text-emerald-600" />
            <span>AI 审核规则设定 ({rules.filter(r => r.enabled).length}项生效)</span>
          </button>

          <button
            onClick={() => setActiveTab('emails')}
            className={`py-3 px-4 border-b-2 transition-all flex items-center gap-1.5 shrink-0 ${
              activeTab === 'emails'
                ? 'border-amber-600 text-amber-950 bg-white font-bold'
                : 'border-transparent text-stone-500 hover:text-stone-800'
            }`}
          >
            <Mail className="w-4 h-4 text-rose-500" />
            <span>管理员邮件提醒日志 ({emails.length})</span>
          </button>
        </div>

        {/* Global Moderation Mode Toggle Bar */}
        <div className="bg-stone-100/90 border-b border-stone-200 px-6 py-2.5 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <Bot className="w-4 h-4 text-amber-600 shrink-0" />
            <span className="font-bold text-stone-800">全站审核策略模式：</span>
            <span className="text-stone-600">
              {moderationMode === 'strict_human_approval' 
                ? '【先审后发（推荐）】普通用户发布内容先由 AI 初审分析，全部存入待审队列并发送邮件，待管理员确认后方可上架' 
                : '【AI 自主放行】AI 智能体自主放行无风险内容，仅在存疑或违规时拦截并转入人工审核'}
            </span>
          </div>

          <div className="flex items-center gap-1 bg-white p-1 rounded-lg border border-stone-200 shadow-2xs">
            <button
              onClick={() => {
                setModerationMode('strict_human_approval');
                saveModerationMode('strict_human_approval');
                setRulesSavedToast(true);
                setTimeout(() => setRulesSavedToast(false), 2000);
              }}
              className={`px-2.5 py-1 rounded-md font-semibold transition-all ${
                moderationMode === 'strict_human_approval'
                  ? 'bg-amber-600 text-white shadow-xs'
                  : 'text-stone-500 hover:text-stone-800'
              }`}
            >
              先审后发 (默认)
            </button>
            <button
              onClick={() => {
                setModerationMode('ai_auto_publish');
                saveModerationMode('ai_auto_publish');
                setRulesSavedToast(true);
                setTimeout(() => setRulesSavedToast(false), 2000);
              }}
              className={`px-2.5 py-1 rounded-md font-semibold transition-all ${
                moderationMode === 'ai_auto_publish'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-stone-500 hover:text-stone-800'
              }`}
            >
              AI 自主放行
            </button>
          </div>
        </div>

        {/* Tab 1: PENDING QUEUE (待审队列) */}
        {activeTab === 'queue' && (
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-950 flex items-start gap-2.5">
              <Bot className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold">Gemini AI 智能审核说明：</p>
                <p className="mt-0.5 text-stone-600 leading-relaxed">
                  普通用户发布的合规内容由 AI 自动批准上架；当内容存在潜在争议、医疗/高风险投资关键词或边界模糊时，AI 会判定为「需人工核验」并暂不上架，同时向管理员邮箱（shouqiangzzz@gmail.com）下发待审邮件提醒。您可在此一键处理。
                </p>
              </div>
            </div>

            {pendingQueue.length === 0 ? (
              <div className="space-y-6">
                <div className="py-6 text-center text-stone-400 space-y-1.5 bg-stone-50 rounded-xl border border-stone-200">
                  <CheckCircle2 className="w-8 h-8 mx-auto text-emerald-500/80" />
                  <p className="font-semibold text-stone-700 text-xs">当前没有处于待审状态的内容</p>
                  <p className="text-[11px] text-stone-400">所有提交的内容均已完成审核上架。您可随时在下方对新用户提交的内容进行复核操作。</p>
                </div>

                {recentUserItems.length > 0 && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between pb-1 border-b border-stone-200">
                      <h4 className="font-bold text-xs text-stone-800 flex items-center gap-1.5">
                        <Bot className="w-3.5 h-3.5 text-amber-600" />
                        <span>新用户（算法旅客）上传内容审核通道</span>
                      </h4>
                      <span className="text-[11px] text-stone-500">共 {recentUserItems.length} 项已上架在线</span>
                    </div>

                    <div className="space-y-2.5">
                      {recentUserItems.map(item => (
                        <div key={item.id} className="p-3.5 rounded-xl border border-stone-200 bg-white hover:border-amber-300 transition-all flex flex-col md:flex-row gap-3 items-start md:items-center justify-between">
                          <div className="flex items-start gap-3 min-w-0 flex-1">
                            {item._cover && (
                              <img src={item._cover} alt="" className="w-12 h-12 rounded-lg object-cover border border-stone-100 shrink-0" />
                            )}
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-2 flex-wrap">
                                {getTypeBadge(item._type)}
                                <h5 className="font-bold text-xs text-stone-900 truncate">{item._title}</h5>
                                <span className="text-[10px] px-1.5 py-0.5 rounded-sm bg-emerald-100 text-emerald-800 font-semibold">已上架在线</span>
                              </div>
                              <p className="text-[11px] text-stone-400 mt-0.5">
                                作者：{item._author} · 日期：{item._date}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 self-end md:self-center shrink-0">
                            <button
                              onClick={() => {
                                if (item._type === 'product') onUpdateProductStatus(item.id, 'pending');
                                if (item._type === 'post') onUpdatePostStatus(item.id, 'pending');
                                if (item._type === 'insight') onUpdateInsightStatus(item.id, 'pending');
                                if (item._type === 'story') onUpdateStoryStatus(item.id, 'pending');
                              }}
                              className="px-2.5 py-1 rounded-md text-xs font-semibold bg-amber-50 text-amber-900 hover:bg-amber-100 border border-amber-300 transition-all"
                            >
                              转入待审
                            </button>
                            <button
                              onClick={() => {
                                if (item._type === 'product') onUpdateProductStatus(item.id, 'offline');
                                if (item._type === 'post') onUpdatePostStatus(item.id, 'offline');
                                if (item._type === 'insight') onUpdateInsightStatus(item.id, 'offline');
                                if (item._type === 'story') onUpdateStoryStatus(item.id, 'offline');
                              }}
                              className="px-2.5 py-1 rounded-md text-xs font-semibold bg-stone-100 text-stone-700 hover:bg-stone-200 border border-stone-300 transition-all"
                            >
                              一键下架
                            </button>
                            <button
                              onClick={() => setSelectedInspectItem(item)}
                              className="p-1.5 text-stone-400 hover:text-stone-700 hover:bg-stone-100 rounded-md"
                              title="查看详情"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-3">
                {pendingQueue.map((item) => (
                  <div key={item.id} className="p-4 rounded-xl border border-stone-200 bg-white hover:border-amber-300 transition-all shadow-xs flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
                    <div className="flex items-start gap-3 min-w-0 flex-1">
                      {item._cover ? (
                        <img 
                          src={item._cover} 
                          alt="" 
                          className="w-14 h-14 rounded-lg object-cover bg-stone-100 shrink-0 border"
                          onError={(e) => { e.currentTarget.src = 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=200&q=80'; }}
                        />
                      ) : (
                        <div className="w-14 h-14 rounded-lg bg-stone-100 text-stone-400 flex items-center justify-center shrink-0">
                          <FileText className="w-6 h-6" />
                        </div>
                      )}
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          {getTypeBadge(item._type)}
                          <h4 className="font-bold text-sm text-stone-900 truncate">{item._title}</h4>
                          <span className="text-[10px] px-1.5 py-0.5 rounded-sm bg-amber-100 text-amber-800 font-semibold">待人工复核</span>
                        </div>
                        <p className="text-xs text-stone-500 mt-0.5">
                          发布者：{item._author} · 日期：{item._date}
                        </p>
                        {item.moderation?.reason && (
                          <div className="mt-1 text-xs text-amber-900 bg-amber-50 p-2 rounded-lg border border-amber-200/60 flex items-start gap-1.5">
                            <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                            <span>AI 疑虑原因：{item.moderation.reason}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 w-full md:w-auto justify-end shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-stone-100">
                      <button
                        onClick={() => setSelectedInspectItem(item)}
                        className="px-3 py-1.5 rounded-lg border border-stone-200 text-xs font-medium text-stone-600 hover:bg-stone-100 flex items-center gap-1"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>完整详情</span>
                      </button>
                      <button
                        onClick={() => handleRejectPending(item)}
                        className="px-3 py-1.5 rounded-lg border border-rose-200 bg-rose-50 text-xs font-semibold text-rose-700 hover:bg-rose-100 flex items-center gap-1"
                      >
                        <XCircle className="w-3.5 h-3.5" />
                        <span>违规驳回</span>
                      </button>
                      <button
                        onClick={() => handleApprovePending(item)}
                        className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-xs font-semibold text-white shadow-xs flex items-center gap-1"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>批准上架</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 2: ALL CONTENT ON/OFF SHELF MANAGEMENT (全站上下架) */}
        {activeTab === 'content' && (
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {/* Filter buttons */}
            <div className="flex items-center justify-between flex-wrap gap-2 pb-2 border-b border-stone-200">
              <div className="flex items-center gap-1.5 overflow-x-auto text-xs font-medium">
                <button
                  onClick={() => setContentFilter('all')}
                  className={`px-3 py-1.5 rounded-lg transition-all ${contentFilter === 'all' ? 'bg-stone-900 text-white font-semibold' : 'bg-stone-100 text-stone-600 hover:bg-stone-200'}`}
                >
                  全部内容 ({allItems.length})
                </button>
                <button
                  onClick={() => setContentFilter('products')}
                  className={`px-3 py-1.5 rounded-lg transition-all ${contentFilter === 'products' ? 'bg-amber-600 text-white font-semibold' : 'bg-stone-100 text-stone-600 hover:bg-stone-200'}`}
                >
                  自用好物 ({products.length})
                </button>
                <button
                  onClick={() => setContentFilter('posts')}
                  className={`px-3 py-1.5 rounded-lg transition-all ${contentFilter === 'posts' ? 'bg-emerald-600 text-white font-semibold' : 'bg-stone-100 text-stone-600 hover:bg-stone-200'}`}
                >
                  生活博文 ({posts.length})
                </button>
                <button
                  onClick={() => setContentFilter('insights')}
                  className={`px-3 py-1.5 rounded-lg transition-all ${contentFilter === 'insights' ? 'bg-indigo-600 text-white font-semibold' : 'bg-stone-100 text-stone-600 hover:bg-stone-200'}`}
                >
                  学习心得 ({insights.length})
                </button>
                <button
                  onClick={() => setContentFilter('stories')}
                  className={`px-3 py-1.5 rounded-lg transition-all ${contentFilter === 'stories' ? 'bg-rose-600 text-white font-semibold' : 'bg-stone-100 text-stone-600 hover:bg-stone-200'}`}
                >
                  故事墙 ({stories.length})
                </button>
              </div>

              <div className="text-xs text-stone-500">
                可随时对任意内容进行 <span className="text-emerald-600 font-semibold">上架</span> 或 <span className="text-rose-600 font-semibold">下架</span> 操作
              </div>
            </div>

            {/* Content List */}
            <div className="space-y-2.5">
              {filteredContent.map((item) => {
                const isPublished = item.status === 'published' || !item.status;
                const isOffline = item.status === 'offline';
                const isPending = item.status === 'pending';
                const isRejected = item.status === 'rejected';

                return (
                  <div key={item.id} className="p-3.5 rounded-xl border border-stone-200 bg-white hover:border-stone-300 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      {item._cover ? (
                        <img 
                          src={item._cover} 
                          alt="" 
                          className="w-12 h-12 rounded-lg object-cover bg-stone-100 shrink-0 border"
                          onError={(e) => { e.currentTarget.src = 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=200&q=80'; }}
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-lg bg-stone-100 text-stone-400 flex items-center justify-center shrink-0">
                          <FileText className="w-5 h-5" />
                        </div>
                      )}
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          {getTypeBadge(item._type)}
                          <h4 className="font-semibold text-xs sm:text-sm text-stone-900 truncate max-w-xs">{item._title}</h4>
                          
                          {/* Shelf status pill */}
                          {isPublished && (
                            <span className="px-1.5 py-0.5 rounded-sm bg-emerald-100 text-emerald-800 text-[10px] font-bold">已上架在线</span>
                          )}
                          {isOffline && (
                            <span className="px-1.5 py-0.5 rounded-sm bg-stone-200 text-stone-700 text-[10px] font-bold">已下架隐蔽</span>
                          )}
                          {isPending && (
                            <span className="px-1.5 py-0.5 rounded-sm bg-amber-100 text-amber-800 text-[10px] font-bold">待审核</span>
                          )}
                          {isRejected && (
                            <span className="px-1.5 py-0.5 rounded-sm bg-rose-100 text-rose-800 text-[10px] font-bold">已驳回</span>
                          )}
                        </div>
                        <p className="text-[11px] text-stone-400 mt-0.5">
                          作者：{item._author} · 发布日期：{item._date}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                      {/* Move to pending button */}
                      {!isPending && (
                        <button
                          onClick={() => {
                            if (item._type === 'product') onUpdateProductStatus(item.id, 'pending');
                            if (item._type === 'post') onUpdatePostStatus(item.id, 'pending');
                            if (item._type === 'insight') onUpdateInsightStatus(item.id, 'pending');
                            if (item._type === 'story') onUpdateStoryStatus(item.id, 'pending');
                          }}
                          className="px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-amber-50 text-amber-900 hover:bg-amber-100 border border-amber-300 transition-all"
                        >
                          转入待审
                        </button>
                      )}

                      {/* Shelf toggle button */}
                      <button
                        onClick={() => handleToggleShelf(item)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                          isPublished
                            ? 'bg-stone-100 text-stone-700 hover:bg-stone-200 hover:text-stone-900 border border-stone-300'
                            : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs'
                        }`}
                      >
                        {isPublished ? '一键下架' : '批准上架'}
                      </button>

                      <button
                        onClick={() => handleDeleteItem(item)}
                        className="p-1.5 text-stone-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                        title="从数据库永久删除"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Tab 3: AI RULES SETTING (审核规则设定) */}
        {activeTab === 'rules' && (
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-stone-200">
              <div>
                <h3 className="font-bold text-stone-900 text-sm">Gemini AI 智能体审核规则库</h3>
                <p className="text-xs text-stone-500">这些规则将作为系统 Prompt 注入 Gemini 审核智能体，实时决定普通用户内容的准入与转人工决策</p>
              </div>
              <button
                onClick={handleResetRules}
                className="px-3 py-1.5 text-xs text-stone-600 hover:text-stone-900 bg-stone-100 hover:bg-stone-200 rounded-lg"
              >
                重置为默认规则
              </button>
            </div>

            {rulesSavedToast && (
              <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-1.5 animate-in fade-in">
                <Check className="w-4 h-4 text-emerald-600" />
                <span>AI 审核规则已保存并实时生效！</span>
              </div>
            )}

            <div className="space-y-3">
              {rules.map((rule) => (
                <div key={rule.id} className="p-4 rounded-xl border border-stone-200 bg-white hover:border-amber-300 transition-all flex items-start justify-between gap-4">
                  <div className="space-y-1 min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-xs sm:text-sm text-stone-900">{rule.ruleName}</h4>
                      <span className={`text-[10px] px-2 py-0.2 rounded-full font-semibold ${
                        rule.severity === 'strict' ? 'bg-rose-100 text-rose-800' : 'bg-amber-100 text-amber-800'
                      }`}>
                        {rule.severity === 'strict' ? '严苛级 (违规即拒)' : '适中级 (存疑转人工)'}
                      </span>
                    </div>
                    <p className="text-xs text-stone-600 leading-relaxed">{rule.description}</p>
                  </div>

                  <button
                    onClick={() => handleToggleRule(rule.id)}
                    className={`p-1 text-2xl transition-colors shrink-0 ${
                      rule.enabled ? 'text-emerald-600' : 'text-stone-300'
                    }`}
                    title={rule.enabled ? '点击禁用该规则' : '点击启用该规则'}
                  >
                    {rule.enabled ? <ToggleRight className="w-8 h-8" /> : <ToggleLeft className="w-8 h-8" />}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 4: ADMIN EMAIL NOTIFICATIONS LOG (邮件提醒日志) */}
        {activeTab === 'emails' && (
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            <div className="p-3.5 rounded-xl bg-indigo-50 border border-indigo-200 text-xs text-indigo-950 flex items-start gap-2.5">
              <Mail className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold">管理员邮件提醒服务 (shouqiangzzz@gmail.com)：</p>
                <p className="mt-0.5 text-stone-600 leading-relaxed">
                  当 AI 审核遇到争议或边界模糊内容时，除记录到待审队列外，还会即时触发发送提醒邮件至主理人邮箱，告知发件详情与 AI 疑虑原因。
                </p>
              </div>
            </div>

            {emails.length === 0 ? (
              <div className="py-16 text-center text-stone-400 space-y-2">
                <Mail className="w-12 h-12 mx-auto text-stone-300" />
                <p className="font-semibold text-stone-700">暂无待审邮件通知</p>
                <p className="text-xs text-stone-400">当普通用户提交存疑内容时，系统将在此记录详细的邮件提醒凭证。</p>
              </div>
            ) : (
              <div className="space-y-3">
                {emails.map((mail) => (
                  <div key={mail.id} className="p-4 rounded-xl border border-stone-200 bg-white hover:border-indigo-300 transition-all space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-stone-900">收件箱: {mail.toEmail}</span>
                        <span className="text-[10px] px-2 py-0.5 rounded-md bg-indigo-100 text-indigo-800 font-mono">已派发</span>
                      </div>
                      <span className="text-stone-400">{mail.timestamp.replace('T', ' ').slice(0, 19)}</span>
                    </div>

                    <h4 className="font-semibold text-xs sm:text-sm text-stone-800">{mail.subject}</h4>
                    
                    <div className="p-2.5 rounded-lg bg-stone-50 border border-stone-100 text-xs text-stone-600 space-y-1">
                      <p><span className="font-semibold text-stone-700">提交作者：</span>{mail.authorName}</p>
                      <p><span className="font-semibold text-stone-700">目标内容：</span>《{mail.contentTitle}》</p>
                      <p><span className="font-semibold text-amber-700">AI 触发原因：</span>{mail.aiReason}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Detail Inspection Modal */}
        {selectedInspectItem && (
          <div 
            className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs"
            onClick={() => setSelectedInspectItem(null)}
          >
            <div 
              className="w-full max-w-lg bg-white rounded-2xl p-6 space-y-4 max-h-[85vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between pb-2 border-b">
                <h3 className="font-bold text-sm text-stone-900">内容详情审核</h3>
                <button onClick={() => setSelectedInspectItem(null)} className="p-1 text-stone-400 hover:text-stone-700">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div>
                <h4 className="font-bold text-base text-stone-900">{selectedInspectItem._title}</h4>
                <p className="text-xs text-stone-400 mt-0.5">作者：{selectedInspectItem._author} · 日期：{selectedInspectItem._date}</p>
              </div>

              {selectedInspectItem.videoUrl ? (
                <div className="space-y-1.5">
                  <div className="text-[11px] font-semibold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200/80 flex items-center justify-between">
                    <span>🎬 上传视频媒体审查预览</span>
                    <span className="font-mono text-stone-500">{selectedInspectItem.videoDuration || '0:15'}</span>
                  </div>
                  <SmartVideoPlayer
                    src={selectedInspectItem.videoUrl}
                    poster={selectedInspectItem._cover}
                    title={selectedInspectItem._title}
                    duration={selectedInspectItem.videoDuration}
                    className="w-full max-h-[280px]"
                  />
                </div>
              ) : selectedInspectItem._cover && (
                <img 
                  src={selectedInspectItem._cover} 
                  alt="" 
                  className="w-full h-48 object-cover rounded-xl border"
                  onError={(e) => { e.currentTarget.src = 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=600&q=80'; }}
                />
              )}

              <div className="p-3 rounded-xl bg-stone-50 text-xs text-stone-700 leading-relaxed whitespace-pre-wrap">
                {selectedInspectItem.content || selectedInspectItem.description || selectedInspectItem.summary || '无文本内容'}
              </div>

              {selectedInspectItem.moderation && (
                <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-950">
                  <span className="font-bold">AI 评估分析：</span>
                  <p className="mt-1">{selectedInspectItem.moderation.reason}</p>
                </div>
              )}

              <div className="flex justify-end gap-2 pt-2 border-t">
                <button
                  onClick={() => {
                    handleRejectPending(selectedInspectItem);
                    setSelectedInspectItem(null);
                  }}
                  className="px-3.5 py-1.5 rounded-xl border border-rose-300 text-rose-700 text-xs font-semibold hover:bg-rose-50"
                >
                  驳回不予上架
                </button>
                <button
                  onClick={() => {
                    handleApprovePending(selectedInspectItem);
                    setSelectedInspectItem(null);
                  }}
                  className="px-4 py-1.5 rounded-xl bg-emerald-600 text-white text-xs font-semibold hover:bg-emerald-700"
                >
                  批准上架
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
