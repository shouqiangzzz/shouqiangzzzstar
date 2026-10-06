import React, { useState, useRef } from 'react';
import { 
  Upload, 
  Video, 
  Link as LinkIcon, 
  X, 
  CheckCircle2, 
  AlertTriangle, 
  RefreshCw, 
  Play, 
  Clock, 
  Film, 
  Sparkles,
  Info
} from 'lucide-react';
import { 
  validateShortVideo, 
  saveVideoBlob, 
  PRESET_SHORT_VIDEOS,
  formatDuration 
} from '../services/videoStorage';
import { SmartVideoPlayer } from './SmartVideoPlayer';

interface VideoUploadFieldProps {
  label: string;
  value: string;
  duration?: string;
  onChange: (videoUrl: string, duration?: string) => void;
  onPosterGenerated?: (posterUrl: string) => void;
  helperText?: string;
}

export const VideoUploadField: React.FC<VideoUploadFieldProps> = ({
  label,
  value,
  duration,
  onChange,
  onPosterGenerated,
  helperText
}) => {
  const [activeTab, setActiveTab] = useState<'upload' | 'url' | 'presets'>('upload');
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Handle local video file upload with STRICT 30-second duration check
  const handleFileProcess = async (file: File) => {
    setIsProcessing(true);
    setStatusMessage({ type: 'info', text: '正在解码视频并严格核验时长（限制 30 秒以内）...' });

    try {
      const validation = await validateShortVideo(file, 30);
      
      if (!validation.valid) {
        setStatusMessage({
          type: 'error',
          text: validation.error || '视频不符合要求，仅支持 30 秒以内短视频。'
        });
        setIsProcessing(false);
        return;
      }

      // Valid: save to local IndexedDB and generate preview
      const result = await saveVideoBlob(file);
      
      onChange(result.videoKey, result.durationFormatted);
      if (result.posterDataUrl && onPosterGenerated) {
        onPosterGenerated(result.posterDataUrl);
      }

      setStatusMessage({
        type: 'success',
        text: `✅ 视频核验通过：时长 ${result.durationFormatted}（符合 30 秒以内短视频规范），已准备就绪！`
      });
    } catch (err: any) {
      setStatusMessage({
        type: 'error',
        text: err?.message || '视频处理失败，请重试。'
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileProcess(e.dataTransfer.files[0]);
    }
  };

  const handleClear = () => {
    onChange('', '');
    setStatusMessage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSelectPreset = (preset: typeof PRESET_SHORT_VIDEOS[0]) => {
    onChange(preset.url, preset.duration);
    if (preset.poster && onPosterGenerated) {
      onPosterGenerated(preset.poster);
    }
    setStatusMessage({
      type: 'success',
      text: `已选用精选短视频《${preset.title}》（时长 ${preset.duration}）`
    });
  };

  return (
    <div className="space-y-2">
      {/* Label and Duration Badge */}
      <div className="flex items-center justify-between">
        <label className="block text-xs font-semibold text-stone-700 flex items-center gap-1.5">
          <Film className="w-3.5 h-3.5 text-amber-500" />
          <span>{label}</span>
          <span className="text-[11px] font-normal text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
            仅限 30 秒以内短视频
          </span>
        </label>
        {duration && (
          <span className="text-[11px] font-mono text-stone-500 flex items-center gap-1">
            <Clock className="w-3 h-3 text-stone-400" />
            <span>时长: {duration}</span>
          </span>
        )}
      </div>

      {/* Tabs */}
      <div className="flex rounded-xl bg-stone-100 p-1 text-xs font-medium border border-stone-200">
        <button
          type="button"
          onClick={() => setActiveTab('upload')}
          className={`flex-1 py-1.5 px-3 rounded-lg flex items-center justify-center gap-1.5 transition-all ${
            activeTab === 'upload'
              ? 'bg-white text-stone-900 shadow-xs font-semibold'
              : 'text-stone-500 hover:text-stone-900'
          }`}
        >
          <Upload className="w-3.5 h-3.5 text-amber-500" />
          <span>本地上传 (≤30s)</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('url')}
          className={`flex-1 py-1.5 px-3 rounded-lg flex items-center justify-center gap-1.5 transition-all ${
            activeTab === 'url'
              ? 'bg-white text-stone-900 shadow-xs font-semibold'
              : 'text-stone-500 hover:text-stone-900'
          }`}
        >
          <LinkIcon className="w-3.5 h-3.5 text-blue-500" />
          <span>网络链接 / B站</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('presets')}
          className={`flex-1 py-1.5 px-3 rounded-lg flex items-center justify-center gap-1.5 transition-all ${
            activeTab === 'presets'
              ? 'bg-white text-stone-900 shadow-xs font-semibold'
              : 'text-stone-500 hover:text-stone-900'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
          <span>推荐短视频库</span>
        </button>
      </div>

      {/* Content Area 1: Local Upload */}
      {activeTab === 'upload' && (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`relative border-2 border-dashed rounded-xl p-5 text-center cursor-pointer transition-all ${
            isDragging
              ? 'border-amber-500 bg-amber-50/50'
              : 'border-stone-200 hover:border-amber-400 bg-stone-50/60 hover:bg-stone-50'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="video/mp4,video/webm,video/quicktime,video/x-m4v"
            className="hidden"
            onChange={(e) => {
              if (e.target.files && e.target.files[0]) {
                handleFileProcess(e.target.files[0]);
              }
            }}
          />

          <div className="flex flex-col items-center justify-center gap-2">
            <div className="w-10 h-10 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center shadow-xs">
              {isProcessing ? (
                <RefreshCw className="w-5 h-5 animate-spin" />
              ) : (
                <Upload className="w-5 h-5" />
              )}
            </div>
            <div>
              <p className="text-xs font-semibold text-stone-800">
                {isProcessing ? '正在智能核验视频时长与格式...' : '点击选择或将本地视频拖拽到此处'}
              </p>
              <p className="text-[11px] text-stone-500 mt-0.5">
                支持 MP4、WebM、MOV 格式 · <strong className="text-amber-700">严格限制时长 30 秒以内</strong>
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Content Area 2: URL Input */}
      {activeTab === 'url' && (
        <div className="space-y-2">
          <div className="relative">
            <input
              type="url"
              placeholder="请输入短视频直链 (https://...mp4) 或 B站链接 (https://www.bilibili.com/video/BV...)"
              value={value.startsWith('sq_video://') ? '' : value}
              onChange={(e) => {
                onChange(e.target.value.trim(), '0:15');
                setStatusMessage(null);
              }}
              className="w-full pl-8 pr-3 py-2 text-xs bg-stone-50 border border-stone-200 rounded-xl outline-hidden focus:border-amber-500"
            />
            <LinkIcon className="w-3.5 h-3.5 text-stone-400 absolute left-2.5 top-3" />
          </div>
          <p className="text-[10px] text-stone-400 flex items-center gap-1">
            <Info className="w-3 h-3 text-stone-400" />
            <span>支持直接输入 MP4 直链，亦支持直接粘贴 B站（Bilibili）视频链接，系统将自动适配播放。</span>
          </p>
        </div>
      )}

      {/* Content Area 3: Presets */}
      {activeTab === 'presets' && (
        <div className="grid grid-cols-2 gap-2">
          {PRESET_SHORT_VIDEOS.map((preset) => (
            <button
              key={preset.id}
              type="button"
              onClick={() => handleSelectPreset(preset)}
              className={`p-2.5 rounded-xl border text-left flex items-start gap-2.5 transition-all ${
                value === preset.url
                  ? 'border-amber-500 bg-amber-50/70 shadow-xs ring-1 ring-amber-500'
                  : 'border-stone-200 hover:border-amber-300 bg-white'
              }`}
            >
              <img
                src={preset.poster}
                alt={preset.title}
                className="w-12 h-12 rounded-lg object-cover bg-stone-100 shrink-0 border border-stone-100"
              />
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  <span className="text-[9px] px-1 py-0.2 rounded-sm bg-stone-100 text-stone-600 font-semibold">
                    {preset.category}
                  </span>
                  <span className="text-[9px] text-amber-600 font-bold font-mono">
                    {preset.duration}
                  </span>
                </div>
                <h5 className="font-bold text-xs text-stone-900 truncate mt-0.5">{preset.title}</h5>
                <p className="text-[10px] text-stone-400 truncate">{preset.description}</p>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Status Alert */}
      {statusMessage && (
        <div className={`p-2.5 rounded-xl text-xs flex items-start gap-2 ${
          statusMessage.type === 'error'
            ? 'bg-rose-50 text-rose-800 border border-rose-200'
            : statusMessage.type === 'success'
            ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
            : 'bg-amber-50 text-amber-800 border border-amber-200'
        }`}>
          {statusMessage.type === 'error' && <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />}
          {statusMessage.type === 'success' && <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />}
          {statusMessage.type === 'info' && <RefreshCw className="w-4 h-4 text-amber-600 shrink-0 mt-0.5 animate-spin" />}
          <div className="flex-1 font-medium leading-relaxed">{statusMessage.text}</div>
        </div>
      )}

      {/* Active Video Live Preview Player */}
      {value && (
        <div className="space-y-1.5 pt-1">
          <div className="flex items-center justify-between text-xs text-stone-500">
            <span className="font-semibold text-stone-700 flex items-center gap-1">
              <Play className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
              <span>当前已挂载视频预览（可直接试播）</span>
            </span>
            <button
              type="button"
              onClick={handleClear}
              className="text-stone-400 hover:text-rose-600 text-xs flex items-center gap-0.5 transition-colors"
            >
              <X className="w-3.5 h-3.5" />
              <span>移除视频</span>
            </button>
          </div>

          <SmartVideoPlayer
            src={value}
            duration={duration}
            className="w-full max-h-[220px]"
          />
        </div>
      )}

      {helperText && !statusMessage && (
        <p className="text-[11px] text-stone-400 leading-relaxed">{helperText}</p>
      )}
    </div>
  );
};
