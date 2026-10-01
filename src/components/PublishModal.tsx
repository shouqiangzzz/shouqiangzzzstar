import React, { useState } from 'react';
import { 
  X, 
  Sparkles, 
  BookOpen, 
  ShoppingBag, 
  Video, 
  Image as ImageIcon, 
  FileText, 
  Plus,
  GraduationCap,
  Lightbulb
} from 'lucide-react';
import { LifePost, ProductItem, StudyInsight, MediaType, PostCategory, ProductCategory } from '../types';

interface PublishModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddPost: (post: LifePost) => void;
  onAddProduct: (product: ProductItem) => void;
  onAddInsight?: (insight: StudyInsight) => void;
}

export const PublishModal: React.FC<PublishModalProps> = ({
  isOpen,
  onClose,
  onAddPost,
  onAddProduct,
  onAddInsight
}) => {
  const [activeType, setActiveType] = useState<'post' | 'insight' | 'product'>('post');

  // Post form state
  const [postTitle, setPostTitle] = useState('');
  const [postCategory, setPostCategory] = useState<PostCategory>('study');
  const [postLocation, setPostLocation] = useState('');
  const [postSummary, setPostSummary] = useState('');
  const [postContent, setPostContent] = useState('');
  const [postMediaType, setPostMediaType] = useState<MediaType>('mixed');
  const [postCoverImage, setPostCoverImage] = useState('');
  const [postVideoUrl, setPostVideoUrl] = useState('');
  const [postTags, setPostTags] = useState('');

  // Insight form state
  const [insightTitle, setInsightTitle] = useState('');
  const [insightSubject, setInsightSubject] = useState('计算机底层');
  const [insightDifficulty, setInsightDifficulty] = useState<'入门探索' | '进阶实战' | '底层硬核'>('进阶实战');
  const [insightTakeaway, setInsightTakeaway] = useState('');
  const [insightContent, setInsightContent] = useState('');
  const [insightMediaType, setInsightMediaType] = useState<MediaType>('mixed');
  const [insightCoverImage, setInsightCoverImage] = useState('');
  const [insightVideoUrl, setInsightVideoUrl] = useState('');
  const [insightTags, setInsightTags] = useState('');

  // Product form state
  const [prodName, setProdName] = useState('');
  const [prodCategory, setProdCategory] = useState<ProductCategory>('electronics');
  const [prodPrice, setProdPrice] = useState('');
  const [prodOriginalPrice, setProdOriginalPrice] = useState('');
  const [prodBadge, setProdBadge] = useState('');
  const [prodHighlightReason, setProdHighlightReason] = useState('');
  const [prodDescription, setProdDescription] = useState('');
  const [prodImage, setProdImage] = useState('');

  if (!isOpen) return null;

  const handlePostSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!postTitle.trim() || !postContent.trim()) return;

    const tags = postTags.split(/[,，、 ]+/).map(t => t.trim()).filter(Boolean);
    const cover = postCoverImage.trim() || 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=1200&q=80';

    const newPost: LifePost = {
      id: `post-${Date.now()}`,
      title: postTitle.trim(),
      category: postCategory,
      date: new Date().toISOString().split('T')[0],
      location: postLocation.trim() || undefined,
      summary: postSummary.trim() || postContent.slice(0, 70) + '...',
      content: postContent.trim(),
      mediaType: postMediaType,
      coverImage: cover,
      images: [cover],
      videoUrl: postVideoUrl.trim() || undefined,
      videoDuration: postVideoUrl.trim() ? '0:30' : undefined,
      tags: tags.length > 0 ? tags : ['生活记录'],
      likesCount: 1,
      bookmarksCount: 0,
      comments: []
    };

    onAddPost(newPost);
    onClose();
  };

  const handleInsightSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!insightTitle.trim() || !insightContent.trim() || !insightTakeaway.trim()) return;

    const tags = insightTags.split(/[,，、 ]+/).map(t => t.trim()).filter(Boolean);
    const cover = insightCoverImage.trim() || 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=1200&q=80';

    const newInsight: StudyInsight = {
      id: `insight-${Date.now()}`,
      title: insightTitle.trim(),
      subject: insightSubject,
      difficulty: insightDifficulty,
      date: new Date().toISOString().split('T')[0],
      author: 'Shouqiang',
      authorAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&q=80',
      takeaway: insightTakeaway.trim(),
      content: insightContent.trim(),
      mediaType: insightMediaType,
      coverImage: cover,
      images: [cover],
      videoUrl: insightVideoUrl.trim() || undefined,
      videoDuration: insightVideoUrl.trim() ? '0:20' : undefined,
      tags: tags.length > 0 ? tags : ['学习心得', insightSubject],
      likesCount: 1,
      comments: []
    };

    if (onAddInsight) {
      onAddInsight(newInsight);
    }
    onClose();
  };

  const handleProductSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!prodName.trim() || !prodPrice.trim() || !prodHighlightReason.trim()) return;

    const priceNum = parseFloat(prodPrice) || 99;
    const origPriceNum = prodOriginalPrice ? parseFloat(prodOriginalPrice) : undefined;
    const img = prodImage.trim() || 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?auto=format&fit=crop&w=800&q=80';

    const newProduct: ProductItem = {
      id: `prod-${Date.now()}`,
      name: prodName.trim(),
      category: prodCategory,
      price: priceNum,
      originalPrice: origPriceNum,
      rating: 5.0,
      reviewsCount: 1,
      image: img,
      gallery: [img],
      tag: prodCategory === 'electronics' ? '数码硬件' : prodCategory === 'books' ? '书籍经典' : prodCategory === 'snacks' ? '严选零食' : '自驾路书',
      badge: prodBadge.trim() || '博主新品首发',
      highlightReason: prodHighlightReason.trim(),
      description: prodDescription.trim() || prodHighlightReason.trim(),
      inStock: true,
      likesCount: 1,
      plantedCount: 0,
      comments: []
    };

    onAddProduct(newProduct);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/70 backdrop-blur-xs overflow-y-auto">
      <div 
        className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl overflow-hidden my-auto flex flex-col max-h-[92vh] animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-stone-200 bg-stone-50">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-amber-500 text-white flex items-center justify-center shadow-xs">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-bold text-stone-900 text-base">创作者工作室 · 内容发布</h2>
              <p className="text-stone-500 text-xs">发布经历、学习心得感悟，或上架自用严选好物</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-stone-400 hover:text-stone-700 hover:bg-stone-200/60 rounded-full"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switch */}
        <div className="flex border-b border-stone-200 px-6 pt-2 bg-stone-50/50 overflow-x-auto">
          <button
            onClick={() => setActiveType('post')}
            className={`flex items-center gap-2 py-2.5 px-3.5 text-xs sm:text-sm font-semibold border-b-2 shrink-0 transition-all ${
              activeType === 'post'
                ? 'border-amber-600 text-amber-900 bg-white rounded-t-lg'
                : 'border-transparent text-stone-500 hover:text-stone-800'
            }`}
          >
            <BookOpen className="w-4 h-4 text-emerald-600" />
            <span>生活与经历</span>
          </button>

          <button
            onClick={() => setActiveType('insight')}
            className={`flex items-center gap-2 py-2.5 px-3.5 text-xs sm:text-sm font-semibold border-b-2 shrink-0 transition-all ${
              activeType === 'insight'
                ? 'border-indigo-600 text-indigo-900 bg-white rounded-t-lg'
                : 'border-transparent text-stone-500 hover:text-stone-800'
            }`}
          >
            <GraduationCap className="w-4 h-4 text-indigo-600" />
            <span>学习心得与感悟</span>
          </button>

          <button
            onClick={() => setActiveType('product')}
            className={`flex items-center gap-2 py-2.5 px-3.5 text-xs sm:text-sm font-semibold border-b-2 shrink-0 transition-all ${
              activeType === 'product'
                ? 'border-amber-600 text-amber-900 bg-white rounded-t-lg'
                : 'border-transparent text-stone-500 hover:text-stone-800'
            }`}
          >
            <ShoppingBag className="w-4 h-4 text-amber-600" />
            <span>自用好物</span>
          </button>
        </div>

        {/* Form Body */}
        {activeType === 'post' && (
          <form onSubmit={handlePostSubmit} className="overflow-y-auto p-6 space-y-4">
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                文章 / 经历标题 <span className="text-amber-600">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="例如：2026从零自学系统架构与全栈实践复盘..."
                value={postTitle}
                onChange={(e) => setPostTitle(e.target.value)}
                className="w-full px-3.5 py-2 text-sm bg-stone-50 border border-stone-200 rounded-xl outline-hidden focus:border-amber-500 focus:bg-white"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">经历类别</label>
                <select
                  value={postCategory}
                  onChange={(e) => setPostCategory(e.target.value as PostCategory)}
                  className="w-full px-3 py-2 text-xs bg-stone-50 border border-stone-200 rounded-xl outline-hidden focus:border-amber-500"
                >
                  <option value="study">深度学习</option>
                  <option value="life">生活日常</option>
                  <option value="tech">数码探索</option>
                  <option value="milestone">人生里程碑</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">媒体类型</label>
                <select
                  value={postMediaType}
                  onChange={(e) => setPostMediaType(e.target.value as MediaType)}
                  className="w-full px-3 py-2 text-xs bg-stone-50 border border-stone-200 rounded-xl outline-hidden focus:border-amber-500"
                >
                  <option value="mixed">图文 + 视频</option>
                  <option value="video">主要视频</option>
                  <option value="image">摄影图集</option>
                  <option value="text">纯文字随笔</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">地点 (选填)</label>
                <input
                  type="text"
                  placeholder="例如：杭州 · 西湖"
                  value={postLocation}
                  onChange={(e) => setPostLocation(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-stone-50 border border-stone-200 rounded-xl outline-hidden focus:border-amber-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">概要简介</label>
              <input
                type="text"
                placeholder="一句话提炼核心认知或亮点"
                value={postSummary}
                onChange={(e) => setPostSummary(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-stone-50 border border-stone-200 rounded-xl outline-hidden focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                详细正文 (支持Markdown分段与列表) <span className="text-amber-600">*</span>
              </label>
              <textarea
                required
                rows={6}
                placeholder="写下完整的经历细节、学习步骤或感悟体会..."
                value={postContent}
                onChange={(e) => setPostContent(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-stone-50 border border-stone-200 rounded-xl outline-hidden focus:border-amber-500 focus:bg-white resize-y"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1 flex items-center gap-1">
                  <ImageIcon className="w-3.5 h-3.5 text-stone-400" />
                  <span>封面配图 URL</span>
                </label>
                <input
                  type="url"
                  placeholder="https://..."
                  value={postCoverImage}
                  onChange={(e) => setPostCoverImage(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-stone-50 border border-stone-200 rounded-xl outline-hidden focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1 flex items-center gap-1">
                  <Video className="w-3.5 h-3.5 text-stone-400" />
                  <span>视频文件 URL (支持mp4)</span>
                </label>
                <input
                  type="url"
                  placeholder="https://...mp4"
                  value={postVideoUrl}
                  onChange={(e) => setPostVideoUrl(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-stone-50 border border-stone-200 rounded-xl outline-hidden focus:border-amber-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">标签</label>
              <input
                type="text"
                placeholder="例如：编程 效率 思考"
                value={postTags}
                onChange={(e) => setPostTags(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-stone-50 border border-stone-200 rounded-xl outline-hidden focus:border-amber-500"
              />
            </div>

            <div className="pt-3 border-t border-stone-200 flex justify-end gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-medium text-stone-600 hover:bg-stone-100 rounded-xl"
              >
                取消
              </button>
              <button
                type="submit"
                className="px-5 py-2 text-xs font-semibold bg-amber-600 hover:bg-amber-700 text-white rounded-xl shadow-xs transition-colors"
              >
                发布到生活与经历
              </button>
            </div>
          </form>
        )}

        {/* Insight Form */}
        {activeType === 'insight' && (
          <form onSubmit={handleInsightSubmit} className="overflow-y-auto p-6 space-y-4">
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                心得主题 / 命题 <span className="text-indigo-600">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="例如：理解现代异步编程模型：从回调地狱到协程调度的思维跃迁"
                value={insightTitle}
                onChange={(e) => setInsightTitle(e.target.value)}
                className="w-full px-3.5 py-2 text-sm bg-stone-50 border border-stone-200 rounded-xl outline-hidden focus:border-indigo-500 focus:bg-white"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">学科领域</label>
                <select
                  value={insightSubject}
                  onChange={(e) => setInsightSubject(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-stone-50 border border-stone-200 rounded-xl outline-hidden focus:border-indigo-500"
                >
                  <option value="计算机底层">计算机底层</option>
                  <option value="前端与架构">前端与架构</option>
                  <option value="算法思想">算法思想</option>
                  <option value="学习方法论">学习方法论</option>
                  <option value="工程实践">工程实践</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">难度等级</label>
                <select
                  value={insightDifficulty}
                  onChange={(e) => setInsightDifficulty(e.target.value as any)}
                  className="w-full px-3 py-2 text-xs bg-stone-50 border border-stone-200 rounded-xl outline-hidden focus:border-indigo-500"
                >
                  <option value="入门探索">入门探索</option>
                  <option value="进阶实战">进阶实战</option>
                  <option value="底层硬核">底层硬核</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1 flex items-center gap-1">
                <Lightbulb className="w-3.5 h-3.5 text-amber-500" />
                <span>一句话核心顿悟 / Takeaway <span className="text-indigo-600">*</span></span>
              </label>
              <input
                type="text"
                required
                placeholder="一针见血概括这篇心得的核心精髓"
                value={insightTakeaway}
                onChange={(e) => setInsightTakeaway(e.target.value)}
                className="w-full px-3.5 py-2 text-xs sm:text-sm bg-indigo-50/50 border border-indigo-200 rounded-xl outline-hidden focus:border-indigo-500 focus:bg-white text-indigo-950 font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                详细正文 (支持Markdown) <span className="text-indigo-600">*</span>
              </label>
              <textarea
                required
                rows={6}
                placeholder="写下完整的理解过程、逻辑推导、对比反思与代码/概念总结..."
                value={insightContent}
                onChange={(e) => setInsightContent(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-stone-50 border border-stone-200 rounded-xl outline-hidden focus:border-indigo-500 focus:bg-white resize-y"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1 flex items-center gap-1">
                  <ImageIcon className="w-3.5 h-3.5 text-stone-400" />
                  <span>配图 / 架构图解 URL</span>
                </label>
                <input
                  type="url"
                  placeholder="https://..."
                  value={insightCoverImage}
                  onChange={(e) => setInsightCoverImage(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-stone-50 border border-stone-200 rounded-xl outline-hidden focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1 flex items-center gap-1">
                  <Video className="w-3.5 h-3.5 text-stone-400" />
                  <span>视频文件 URL (支持mp4)</span>
                </label>
                <input
                  type="url"
                  placeholder="https://...mp4"
                  value={insightVideoUrl}
                  onChange={(e) => setInsightVideoUrl(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-stone-50 border border-stone-200 rounded-xl outline-hidden focus:border-indigo-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">标签</label>
              <input
                type="text"
                placeholder="例如：操作系统 架构 学习心得"
                value={insightTags}
                onChange={(e) => setInsightTags(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-stone-50 border border-stone-200 rounded-xl outline-hidden focus:border-indigo-500"
              />
            </div>

            <div className="pt-3 border-t border-stone-200 flex justify-end gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-medium text-stone-600 hover:bg-stone-100 rounded-xl"
              >
                取消
              </button>
              <button
                type="submit"
                className="px-5 py-2 text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-xs transition-colors"
              >
                发布到学习心得
              </button>
            </div>
          </form>
        )}

        {/* Product Form */}
        {activeType === 'product' && (
          <form onSubmit={handleProductSubmit} className="overflow-y-auto p-6 space-y-4">
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                好物名称 <span className="text-amber-600">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="例如：4K OLED便携屏幕 / CSAPP原书 / 云南冷萃黑咖 / 318自驾路书"
                value={prodName}
                onChange={(e) => setProdName(e.target.value)}
                className="w-full px-3.5 py-2 text-sm bg-stone-50 border border-stone-200 rounded-xl outline-hidden focus:border-amber-500 focus:bg-white"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">产品类目</label>
                <select
                  value={prodCategory}
                  onChange={(e) => setProdCategory(e.target.value as ProductCategory)}
                  className="w-full px-3 py-2 text-xs bg-stone-50 border border-stone-200 rounded-xl outline-hidden focus:border-amber-500"
                >
                  <option value="electronics">电子产品</option>
                  <option value="books">书籍</option>
                  <option value="snacks">零食</option>
                  <option value="travel">旅游攻略</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  售价 (元) <span className="text-amber-600">*</span>
                </label>
                <input
                  type="number"
                  step="0.1"
                  required
                  placeholder="例如：199"
                  value={prodPrice}
                  onChange={(e) => setProdPrice(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-stone-50 border border-stone-200 rounded-xl outline-hidden focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">原价 (元，选填)</label>
                <input
                  type="number"
                  step="0.1"
                  placeholder="例如：299"
                  value={prodOriginalPrice}
                  onChange={(e) => setProdOriginalPrice(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-stone-50 border border-stone-200 rounded-xl outline-hidden focus:border-amber-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                推荐徽标 / 认证标签
              </label>
              <input
                type="text"
                placeholder="例如：博主自用同款 1年+ / 程序员解压推荐"
                value={prodBadge}
                onChange={(e) => setProdBadge(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-stone-50 border border-stone-200 rounded-xl outline-hidden focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                博主自用推荐理由 <span className="text-amber-600">*</span>
              </label>
              <textarea
                required
                rows={2}
                placeholder="简述你在什么场景下使用它，它为你解决了什么痛点..."
                value={prodHighlightReason}
                onChange={(e) => setProdHighlightReason(e.target.value)}
                className="w-full px-3.5 py-2 text-xs sm:text-sm bg-stone-50 border border-stone-200 rounded-xl outline-hidden focus:border-amber-500 focus:bg-white resize-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                详细介绍与使用指南
              </label>
              <textarea
                rows={4}
                placeholder="详细说明产品做工、材质、使用感受、常见问题..."
                value={prodDescription}
                onChange={(e) => setProdDescription(e.target.value)}
                className="w-full px-3.5 py-2 text-xs sm:text-sm bg-stone-50 border border-stone-200 rounded-xl outline-hidden focus:border-amber-500 focus:bg-white resize-y"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                商品图片 URL
              </label>
              <input
                type="url"
                placeholder="https://..."
                value={prodImage}
                onChange={(e) => setProdImage(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-stone-50 border border-stone-200 rounded-xl outline-hidden focus:border-amber-500"
              />
            </div>

            <div className="pt-3 border-t border-stone-200 flex justify-end gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-medium text-stone-600 hover:bg-stone-100 rounded-xl"
              >
                取消
              </button>
              <button
                type="submit"
                className="px-5 py-2 text-xs font-semibold bg-amber-600 hover:bg-amber-700 text-white rounded-xl shadow-xs transition-colors"
              >
                上架到好物集市
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
