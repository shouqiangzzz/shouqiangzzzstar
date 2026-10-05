import React, { useState } from 'react';
import { VideoUrlInput } from './VideoUrlInput';
import { useVideoAttachment } from '../hooks/useVideoAttachment';
import { X, MessageSquarePlus, Image as ImageIcon, Send } from 'lucide-react';
import { StoryItem } from '../types';

interface ShareStoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (story: StoryItem) => void | Promise<void>;
}

export const ShareStoryModal: React.FC<ShareStoryModalProps> = ({
  isOpen,
  onClose,
  onSubmit
}) => {
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [roleBadge, setRoleBadge] = useState('');
  const [category, setCategory] = useState('生活感悟');
  const [summary, setSummary] = useState('');
  const [content, setContent] = useState('');
  const [coverImage, setCoverImage] = useState('');
  const videoAttachment = useVideoAttachment();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [tagsStr, setTagsStr] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;

    if (isSubmitting) return;
    setSubmitError('');
    setIsSubmitting(true);
    try {
      const video = videoAttachment.requireVideo();
      const tags = tagsStr
        .split(/[,，、 ]+/)
        .map(t => t.trim())
        .filter(Boolean);

      const defaultCovers = [
        'https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=1200&q=80'
      ];

      const newStory: StoryItem = {
        id: `story-${Date.now()}`,
        title: title.trim(),
        author: author.trim() || '匿名的故事旅人',
        authorAvatar: `https://images.unsplash.com/photo-${1500648767791 + Math.floor(Math.random() * 100)}?auto=format&fit=crop&w=120&q=80`,
        roleBadge: roleBadge.trim() || '社区故事家',
        date: new Date().toISOString().split('T')[0],
        category,
        summary: summary.trim() || content.slice(0, 80) + '...',
        content: content.trim(),
        coverImage: coverImage.trim() || defaultCovers[Math.floor(Math.random() * defaultCovers.length)],
        videoUrl: video?.url,
        videoDuration: video?.duration,
        tags: tags.length > 0 ? tags : ['故事分享', '生活'],
        likesCount: 1,
        comments: []
      };

      await onSubmit(newStory);
      setTitle('');
      setSummary('');
      setContent('');
      setCoverImage('');
      videoAttachment.setVideoUrl('');
      setTagsStr('');
      onClose();
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : '发布失败，请重试。');
    } finally {
      setIsSubmitting(false);
    }
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
            <div className="w-8 h-8 rounded-lg bg-rose-100 text-rose-600 flex items-center justify-center">
              <MessageSquarePlus className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-bold text-stone-900 text-base">分享我的故事</h2>
              <p className="text-stone-500 text-xs">在这里和大家分享你的生活、学习蜕变或难忘经历</p>
            </div>
          </div>
          <button
            onClick={onClose}
              disabled={isSubmitting}
            className="p-1.5 text-stone-400 hover:text-stone-700 hover:bg-stone-200/60 rounded-full"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="overflow-y-auto p-6 space-y-4">
          {submitError && <p role="alert" className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-xl p-3">{submitError}</p>}
          <fieldset disabled={isSubmitting} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">
              故事标题 <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="例如：那一年我辞去工作，自学编程重塑人生..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3.5 py-2 text-sm bg-stone-50 border border-stone-200 rounded-xl outline-hidden focus:border-rose-500 focus:bg-white"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                你的称呼 / 笔名
              </label>
              <input
                type="text"
                placeholder="例如：林溪清"
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-stone-50 border border-stone-200 rounded-xl outline-hidden focus:border-rose-500 focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                身份标签 (选填)
              </label>
              <input
                type="text"
                placeholder="例如：全栈工程师 / 徒步爱好者"
                value={roleBadge}
                onChange={(e) => setRoleBadge(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-stone-50 border border-stone-200 rounded-xl outline-hidden focus:border-rose-500 focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                分类
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-stone-50 border border-stone-200 rounded-xl outline-hidden focus:border-rose-500 focus:bg-white"
              >
                <option value="生活感悟">生活感悟</option>
                <option value="学习蜕变">学习蜕变</option>
                <option value="职场进阶">职场进阶</option>
                <option value="野性自然">野性自然</option>
                <option value="生活美学">生活美学</option>
                <option value="好物心声">好物心声</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">
              一句话故事摘要
            </label>
            <input
              type="text"
              placeholder="概括这篇故事的核心亮点（留空将自动截取正文）"
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-stone-50 border border-stone-200 rounded-xl outline-hidden focus:border-rose-500 focus:bg-white"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">
              故事正文 <span className="text-rose-500">*</span>
            </label>
            <textarea
              required
              rows={6}
              placeholder="畅所欲言，分享你的真切感受、故事起伏、经验或者给读者的真诚建议..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-stone-50 border border-stone-200 rounded-xl outline-hidden focus:border-rose-500 focus:bg-white resize-y"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1 flex items-center gap-1">
                <ImageIcon className="w-3.5 h-3.5 text-stone-400" />
                <span>封面配图 URL (选填)</span>
              </label>
              <input
                type="url"
                placeholder="https://images.unsplash.com/..."
                value={coverImage}
                onChange={(e) => setCoverImage(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-stone-50 border border-stone-200 rounded-xl outline-hidden focus:border-rose-500 focus:bg-white"
              />
            </div>

            <VideoUrlInput {...videoAttachment.inputProps} />
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">
              标签 (以空格或逗号分隔)
            </label>
            <input
              type="text"
              placeholder="跨界 勇气 学习 摄影"
              value={tagsStr}
              onChange={(e) => setTagsStr(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-stone-50 border border-stone-200 rounded-xl outline-hidden focus:border-rose-500 focus:bg-white"
            />
          </div>

          <div className="pt-3 border-t border-stone-200 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 text-xs font-medium text-stone-600 hover:bg-stone-100 rounded-xl"
            >
              取消
            </button>
            <button
              type="submit"
              disabled={isSubmitting || Boolean(videoAttachment.videoUrl.trim() && !videoAttachment.videoInfo)}
              className="px-5 py-2 text-xs font-semibold bg-rose-600 hover:bg-rose-700 text-white rounded-xl flex items-center gap-1.5 shadow-xs transition-colors disabled:opacity-50"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{isSubmitting ? '正在发布…' : '立即公开发布'}</span>
            </button>
          </div>
          </fieldset>
        </form>
      </div>
    </div>
  );
};
