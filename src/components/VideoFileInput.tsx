import React, { useEffect, useId, useRef } from 'react';
import { Upload, X } from 'lucide-react';
import { VideoPlayer } from './VideoPlayer';
import { MAX_VIDEO_SIZE, VIDEO_FILE_ACCEPT } from '../utils/videoFile';
import type { VideoInfo } from '../utils/video';

export interface VideoFileInputProps {
  selectedFile: File | null;
  previewUrl: string;
  validationError: string | null;
  onSelectFile: (file: File | null) => void;
  onReady: (info: VideoInfo) => void;
  onInvalid: (url: string, message: string) => void;
  onChecking: (url: string) => void;
  disabled?: boolean;
  uploading: boolean;
  uploadProgress: number;
  cancelUpload: () => void;
}

const formatFileSize = (bytes: number) => bytes < 1024 * 1024
  ? `${Math.max(1, Math.round(bytes / 1024))} KB`
  : `${(bytes / (1024 * 1024)).toFixed(1)} MB`;

export const VideoFileInput: React.FC<VideoFileInputProps> = ({
  selectedFile,
  previewUrl,
  validationError,
  onSelectFile,
  onReady,
  onInvalid,
  onChecking,
  disabled = false,
  uploading,
  uploadProgress,
  cancelUpload,
}) => {
  const id = useId();
  const fileInput = useRef<HTMLInputElement>(null);
  const progress = Math.min(100, Math.max(0, Math.round(uploadProgress)));
  useEffect(() => {
    if (!selectedFile && fileInput.current) fileInput.current.value = '';
  }, [selectedFile]);

  return (
    <div className="space-y-3">
      <label htmlFor={id} className="block text-xs font-semibold text-stone-700">本地原创视频（选填）</label>
      <div className="rounded-xl border border-dashed border-amber-300 bg-amber-50/50 p-3 space-y-2">
        <div className="flex items-center gap-2 text-xs font-medium text-amber-900">
          <Upload className="w-4 h-4" />
          <span>{selectedFile ? '更换本地原创视频' : '选择本地原创视频'}</span>
        </div>
        <input
          id={id}
          ref={fileInput}
          type="file"
          accept={VIDEO_FILE_ACCEPT}
          disabled={disabled || uploading}
          aria-describedby={`${id}-help`}
          aria-invalid={Boolean(validationError)}
          className="block w-full text-xs text-stone-600 file:mr-3 file:rounded-lg file:border-0 file:bg-amber-600 file:px-3 file:py-2 file:text-xs file:font-semibold file:text-white disabled:opacity-60"
          onChange={(event) => {
            const file = event.currentTarget.files?.[0];
            // Cancelling the chooser preserves the file already selected.
            if (file) onSelectFile(file);
          }}
        />
        <p id={`${id}-help`} className="text-xs text-stone-500 leading-relaxed">
          上传你的原创视频，保留原画面、声音和节奏。先预览，发布时上传原文件；单个视频不超过 {Math.round(MAX_VIDEO_SIZE / (1024 * 1024))} MB。
        </p>
      </div>
      {selectedFile && (
        <div className="flex items-start justify-between gap-2 text-xs text-stone-600">
          <span className="min-w-0 break-all">{selectedFile.name} <span className="whitespace-nowrap text-stone-400">· {formatFileSize(selectedFile.size)}</span></span>
          <button
            type="button"
            disabled={disabled || uploading}
            className="flex shrink-0 items-center gap-1 text-stone-500 hover:text-rose-600 disabled:opacity-50"
            onClick={() => onSelectFile(null)}
          >
            <X className="w-3.5 h-3.5" />移除
          </button>
        </div>
      )}
      {validationError && !previewUrl && <p className="text-xs text-rose-600 leading-relaxed" role="alert">{validationError}</p>}
      {previewUrl && (
        <VideoPlayer
          src={previewUrl}
          title="本地原视频预览"
          verify
          localPreview
          onReady={onReady}
          onInvalid={onInvalid}
          onChecking={onChecking}
        />
      )}
      {uploading && (
        <div className="rounded-lg bg-amber-50 px-3 py-2 space-y-2">
          <div className="flex items-center justify-between gap-2 text-xs text-amber-900" role="status">
            <span>正在上传原视频 · {progress}%</span>
            {!disabled && <button type="button" onClick={cancelUpload} className="text-stone-600 underline underline-offset-2">取消上传</button>}
          </div>
          <progress aria-label="原视频上传进度" value={progress} max={100} className="block h-2 w-full accent-amber-600" />
        </div>
      )}
    </div>
  );
};
