import React, { useState, useRef } from 'react';
import { Upload, Image as ImageIcon, Link as LinkIcon, X, CheckCircle, AlertTriangle, RefreshCw } from 'lucide-react';

interface ImageUploadFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  placeholder?: string;
  helperText?: string;
}

/**
 * Resizes and compresses an image file to a lightweight Base64 Data URL
 */
const compressImageFile = (file: File, maxDimension = 1200, quality = 0.85): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (readerEvent) => {
      const img = new Image();
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        if (width > maxDimension || height > maxDimension) {
          if (width > height) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          } else {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(readerEvent.target?.result as string);
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);

        // Try webp first, fallback to jpeg
        try {
          const dataUrl = canvas.toDataURL('image/webp', quality);
          resolve(dataUrl);
        } catch {
          const dataUrl = canvas.toDataURL('image/jpeg', quality);
          resolve(dataUrl);
        }
      };
      img.onerror = () => reject(new Error('图片加载解析失败'));
      img.src = readerEvent.target?.result as string;
    };
    reader.onerror = () => reject(new Error('读取本地文件失败'));
    reader.readAsDataURL(file);
  });
};

export const ImageUploadField: React.FC<ImageUploadFieldProps> = ({
  label,
  value,
  onChange,
  required = false,
  placeholder = 'https://... 或点击上方按钮上传本地图片',
  helperText
}) => {
  const [mode, setMode] = useState<'upload' | 'url'>('upload');
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [warningMsg, setWarningMsg] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Validate URL whenever value changes in URL mode
  const handleUrlChange = (newUrl: string) => {
    onChange(newUrl);
    setWarningMsg('');

    const clean = newUrl.trim().toLowerCase();
    if (clean.endsWith('.html') || clean.endsWith('.htm') || clean.includes('/tupian/') && clean.endsWith('.html')) {
      setWarningMsg('⚠️ 提示：您输入的似乎是网页页面链接（以 .html 结尾），而不是直接的图片文件（如 .jpg / .png）。建议在网页上右键点击图片选择「复制图片地址」，或直接切换到【本地上传】选择图片文件。');
    }
  };

  // Process File Selection
  const handleFileProcess = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      setWarningMsg('请选择有效的图片文件（JPG、PNG、WebP、GIF 等）');
      return;
    }

    setIsProcessing(true);
    setWarningMsg('');
    try {
      const base64Data = await compressImageFile(file);
      onChange(base64Data);
    } catch (err: any) {
      setWarningMsg(err.message || '图片压缩处理失败，请重试');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileProcess(file);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleFileProcess(file);
    }
  };

  return (
    <div className="space-y-2">
      {/* Label and Mode Switcher */}
      <div className="flex items-center justify-between">
        <label className="block text-xs font-semibold text-stone-700">
          {label} {required && <span className="text-amber-600">*</span>}
        </label>
        
        <div className="flex items-center gap-1 bg-stone-100 p-0.5 rounded-lg text-[11px]">
          <button
            type="button"
            onClick={() => setMode('upload')}
            className={`px-2 py-0.5 rounded-md font-medium transition-all flex items-center gap-1 ${
              mode === 'upload' ? 'bg-white text-stone-900 shadow-2xs font-semibold' : 'text-stone-500 hover:text-stone-800'
            }`}
          >
            <Upload className="w-3 h-3" />
            <span>本地上传</span>
          </button>
          <button
            type="button"
            onClick={() => setMode('url')}
            className={`px-2 py-0.5 rounded-md font-medium transition-all flex items-center gap-1 ${
              mode === 'url' ? 'bg-white text-stone-900 shadow-2xs font-semibold' : 'text-stone-500 hover:text-stone-800'
            }`}
          >
            <LinkIcon className="w-3 h-3" />
            <span>网络链接</span>
          </button>
        </div>
      </div>

      {/* Hidden Native File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        onChange={handleFileInputChange}
        className="hidden"
      />

      {/* Preview if image is set */}
      {value ? (
        <div className="relative rounded-xl border border-stone-200 bg-stone-50 p-2 flex items-center gap-3">
          <div className="w-16 h-16 rounded-lg bg-stone-200 overflow-hidden shrink-0 border border-stone-300 relative group">
            <img
              src={value}
              alt="预览图"
              className="w-full h-full object-cover"
              onError={(e) => {
                // Graceful fallback for broken links
                e.currentTarget.src = 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=400&q=80';
              }}
            />
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1 text-xs font-semibold text-emerald-700">
              <CheckCircle className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span>图片已成功载入</span>
            </div>
            <p className="text-[11px] text-stone-500 truncate mt-0.5 font-mono">
              {value.startsWith('data:image') ? '本地已压缩就绪 (Base64)' : value}
            </p>
            <div className="flex gap-2 mt-1.5">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="text-[11px] text-amber-600 hover:text-amber-700 font-medium flex items-center gap-0.5"
              >
                <RefreshCw className="w-3 h-3" />
                <span>更换图片</span>
              </button>
              <button
                type="button"
                onClick={() => onChange('')}
                className="text-[11px] text-rose-500 hover:text-rose-600 font-medium flex items-center gap-0.5"
              >
                <X className="w-3 h-3" />
                <span>删除清除</span>
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* Empty State: Upload Dropzone or URL input */
        <>
          {mode === 'upload' ? (
            <div
              onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`p-4 rounded-xl border-2 border-dashed transition-all cursor-pointer text-center ${
                isDragging 
                  ? 'border-amber-500 bg-amber-50/60' 
                  : 'border-stone-300 hover:border-amber-400 bg-stone-50/60 hover:bg-stone-50'
              }`}
            >
              {isProcessing ? (
                <div className="flex flex-col items-center justify-center py-2 space-y-2">
                  <RefreshCw className="w-5 h-5 text-amber-600 animate-spin" />
                  <span className="text-xs text-stone-600">正在智能压缩并导入本地图片...</span>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-1 space-y-1.5">
                  <div className="w-8 h-8 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center">
                    <Upload className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs font-semibold text-stone-800">
                      点击选择本地文件
                    </span>
                    <span className="text-xs text-stone-500"> 或拖拽图片至此处</span>
                  </div>
                  <p className="text-[11px] text-stone-400">
                    支持 JPG、PNG、WebP、GIF，自动压缩适配
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div className="relative">
              <input
                type="url"
                value={value}
                onChange={(e) => handleUrlChange(e.target.value)}
                placeholder={placeholder}
                className="w-full px-3 py-2 text-xs bg-stone-50 border border-stone-200 rounded-xl outline-hidden focus:border-amber-500 focus:bg-white"
              />
            </div>
          )}
        </>
      )}

      {/* Warning Alert if bad URL like .html */}
      {warningMsg && (
        <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-start gap-1.5 animate-in fade-in">
          <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <div className="leading-relaxed">{warningMsg}</div>
        </div>
      )}

      {helperText && !warningMsg && (
        <p className="text-[11px] text-stone-400">{helperText}</p>
      )}
    </div>
  );
};
