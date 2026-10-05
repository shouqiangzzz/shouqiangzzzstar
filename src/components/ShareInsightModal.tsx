import React, { useState } from 'react';
import { VideoUrlInput } from './VideoUrlInput';
import { useVideoAttachment } from '../hooks/useVideoAttachment';
import { X, GraduationCap, Image as ImageIcon, Send, Lightbulb } from 'lucide-react';
import { StudyInsight, MediaType } from '../types';

interface ShareInsightModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (insight: StudyInsight) => void | Promise<void>;
}

export const ShareInsightModal: React.FC<ShareInsightModalProps> = ({
  isOpen,
  onClose,
  onSubmit
}) => {
  const [title, setTitle] = useState('');
  const [subject, setSubject] = useState('计算机底层');
  const [difficulty, setDifficulty] = useState<'入门探索' | '进阶实战' | '底层硬核'>('进阶实战');
  const [author, setAuthor] = useState('');
  const [takeaway, setTakeaway] = useState('');
  const [content, setContent] = useState('');
  const [mediaType, setMediaType] = useState<MediaType>('mixed');
  const [coverImage, setCoverImage] = useState('');
  const videoAttachment = useVideoAttachment();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [tagsStr, setTagsStr] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim() || !takeaway.trim()) return;

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
        'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&w=1200&q=80'
      ];

      const chosenCover = coverImage.trim() || defaultCovers[Math.floor(Math.random() * defaultCovers.length)];

      const newInsight: StudyInsight = {
        id: `insight-${Date.now()}`,
        title: title.trim(),
        subject,
        difficulty,
        date: new Date().toISOString().split('T')[0],
        author: author.trim() || '求知同行者',
        authorAvatar: `https://images.unsplash.com/photo-${1535713875002 + Math.floor(Math.random() * 100)}?auto=format&fit=crop&w=120&q=80`,
        takeaway: takeaway.trim(),
        content: content.trim(),
        mediaType: video ? (mediaType === 'video' ? 'video' : 'mixed') : (mediaType === 'text' ? 'text' : 'image'),
        coverImage: chosenCover,
        images: [chosenCover],
        videoUrl: video?.url,
        videoDuration: video?.duration,
        tags: tags.length > 0 ? tags : ['学习心得', subject],
        likesCount: 1,
        comments: []
      };

      await onSubmit(newInsight);
      setTitle('');
      setTakeaway('');
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
            <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center shadow-xs">
              <GraduationCap className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-bold text-stone-900 text-base">发布学习心得与感悟</h2>
              <p className="text-stone-500 text-xs">支持视频、图解与长文笔记，分享你的深度思考与认知顿悟</p>
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
              心得主题 / 命题 <span className="text-indigo-600">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="例如：理解现代异步编程模型：从回调地狱到协程调度的思维跃迁"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3.5 py-2 text-sm bg-stone-50 border border-stone-200 rounded-xl outline-hidden focus:border-indigo-500 focus:bg-white"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">学科领域</label>
              <select
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
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
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value as any)}
                className="w-full px-3 py-2 text-xs bg-stone-50 border border-stone-200 rounded-xl outline-hidden focus:border-indigo-500"
              >
                <option value="入门探索">入门探索</option>
                <option value="进阶实战">进阶实战</option>
                <option value="底层硬核">底层硬核</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">作者署名</label>
              <input
                type="text"
                placeholder="例如：Shouqiang / 阿澈"
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-stone-50 border border-stone-200 rounded-xl outline-hidden focus:border-indigo-500 focus:bg-white"
              />
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
              placeholder="概括你最核心的思考顿悟，一针见血指明本质"
              value={takeaway}
              onChange={(e) => setTakeaway(e.target.value)}
              className="w-full px-3.5 py-2 text-xs sm:text-sm bg-indigo-50/50 border border-indigo-200 rounded-xl outline-hidden focus:border-indigo-500 focus:bg-white text-indigo-950 font-medium"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">
              详细心得正文 (支持Markdown段落、标题与列表) <span className="text-indigo-600">*</span>
            </label>
            <textarea
              required
              rows={6}
              placeholder="写下完整的学习历程、概念对比、踩坑反思、公式推导或心得体会..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-stone-50 border border-stone-200 rounded-xl outline-hidden focus:border-indigo-500 focus:bg-white resize-y"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1 flex items-center gap-1">
                <ImageIcon className="w-3.5 h-3.5 text-stone-400" />
                <span>封面配图 / 架构图解 URL</span>
              </label>
              <input
                type="url"
                placeholder="https://images.unsplash.com/..."
                value={coverImage}
                onChange={(e) => setCoverImage(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-stone-50 border border-stone-200 rounded-xl outline-hidden focus:border-indigo-500 focus:bg-white"
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
              placeholder="计算机基础 操作系统 进阶思考"
              value={tagsStr}
              onChange={(e) => setTagsStr(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-stone-50 border border-stone-200 rounded-xl outline-hidden focus:border-indigo-500 focus:bg-white"
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
              className="px-5 py-2 text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl flex items-center gap-1.5 shadow-xs transition-colors disabled:opacity-50"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{isSubmitting ? '正在发布…' : '发布学习心得'}</span>
            </button>
          </div>
          </fieldset>
        </form>
      </div>
    </div>
  );
};
