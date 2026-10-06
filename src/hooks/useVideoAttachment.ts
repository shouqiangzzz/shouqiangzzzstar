import { useCallback, useEffect, useRef, useState } from 'react';
import { uploadOriginalVideo } from '../lib/videoUpload';
import type { UploadedOriginalVideo } from '../lib/videoUpload';
import { getVideoFileError } from '../utils/videoFile';
import { getVideoUrlError, isValidVideoDuration } from '../utils/video';
import type { VideoInfo } from '../utils/video';
import type { VideoFileInputProps } from '../components/VideoFileInput';

interface SelectedVideo {
  file: File;
  duration: string;
  durationSeconds: number;
}

export interface PreparedVideo extends UploadedOriginalVideo {
  duration: string;
  durationSeconds: number;
}

interface ActiveUpload {
  file: File;
  controller: AbortController;
  promise: Promise<PreparedVideo>;
}

export const useVideoAttachment = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [videoInfo, setVideoInfo] = useState<VideoInfo | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const source = useRef<{ file: File | null; url: string; error: string | null }>({ file: null, url: '', error: null });
  const validatedVideo = useRef<VideoInfo | null>(null);
  const uploadedVideo = useRef<{ file: File; video: PreparedVideo } | null>(null);
  const activeUpload = useRef<ActiveUpload | null>(null);
  const objectUrls = useRef(new Set<string>());
  const mounted = useRef(true);

  // Passive cleanup runs after the old player's layout cleanup has stopped playback.
  // Releasing every obsolete URL also handles rapid selections before a render commits.
  useEffect(() => {
    for (const url of objectUrls.current) {
      if (url !== previewUrl) {
        URL.revokeObjectURL(url);
        objectUrls.current.delete(url);
      }
    }
  }, [previewUrl]);

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
      activeUpload.current?.controller.abort();
      for (const url of objectUrls.current) URL.revokeObjectURL(url);
      objectUrls.current.clear();
    };
  }, []);

  const onSelectFile = useCallback((file: File | null) => {
    if (activeUpload.current) return;
    let error = file ? getVideoFileError(file) : null;
    let url = '';
    if (file && !error) {
      try {
        url = URL.createObjectURL(file);
        objectUrls.current.add(url);
      } catch {
        error = '无法读取这个本地视频，请重新选择文件。';
      }
    }
    source.current = { file, url, error };
    validatedVideo.current = null;
    // Keep a successful upload for a publication retry only while its File is selected.
    if (uploadedVideo.current?.file !== file) uploadedVideo.current = null;
    setSelectedFile(file);
    setPreviewUrl(url);
    setValidationError(error);
    setVideoInfo(null);
    setUploadProgress(0);
  }, []);

  const onReady = useCallback((info: VideoInfo) => {
    if (info.url !== source.current.url || !source.current.file || !isValidVideoDuration(info.durationSeconds)) return;
    validatedVideo.current = info;
    source.current.error = null;
    setValidationError(null);
    setVideoInfo(info);
  }, []);

  const onInvalid = useCallback((url: string, message: string) => {
    if (url !== source.current.url) return;
    validatedVideo.current = null;
    source.current.error = message;
    setValidationError(message);
    setVideoInfo(null);
  }, []);

  const onChecking = useCallback((url: string) => {
    if (url !== source.current.url) return;
    validatedVideo.current = null;
    source.current.error = null;
    setValidationError(null);
    setVideoInfo(null);
  }, []);

  const requireVideo = useCallback((): SelectedVideo | undefined => {
    const { file, url, error } = source.current;
    if (!file) return undefined;
    const invalid = getVideoFileError(file) || error;
    if (invalid) throw new Error(invalid);
    const video = validatedVideo.current;
    if (!video || video.url !== url || !isValidVideoDuration(video.durationSeconds)) {
      throw new Error('原视频尚未读取完成，请等待预览加载并确认画面和节奏。');
    }
    return { file, duration: video.duration, durationSeconds: video.durationSeconds };
  }, []);

  const prepareVideo = useCallback(async (): Promise<PreparedVideo | undefined> => {
    const selected = requireVideo();
    if (!selected) return undefined;
    if (uploadedVideo.current?.file === selected.file) return uploadedVideo.current.video;
    if (activeUpload.current?.file === selected.file) return activeUpload.current.promise;

    const controller = new AbortController();
    const upload: ActiveUpload = {
      file: selected.file,
      controller,
      // Defer transfer until the operation and cancellation controller are registered.
      promise: Promise.resolve().then(async () => {
        try {
          const result = await uploadOriginalVideo(selected.file, (percent) => {
            if (mounted.current && activeUpload.current === upload) setUploadProgress(percent);
          }, controller.signal);
          if (controller.signal.aborted || source.current.file !== selected.file) {
            throw new Error('已取消视频上传。');
          }
          const invalidUrl = getVideoUrlError(result.url);
          if (invalidUrl || !result.url) throw new Error('未取得可播放的上传视频，请重新上传原文件。');
          const video: PreparedVideo = { ...result, duration: selected.duration, durationSeconds: selected.durationSeconds };
          uploadedVideo.current = { file: selected.file, video };
          return video;
        } finally {
          if (activeUpload.current === upload) {
            activeUpload.current = null;
            if (mounted.current) setUploading(false);
          }
        }
      }),
    };
    activeUpload.current = upload;
    setUploading(true);
    setUploadProgress(0);
    return upload.promise;
  }, [requireVideo]);

  const cancelUpload = useCallback(() => activeUpload.current?.controller.abort(), []);

  const resetVideo = useCallback(() => {
    activeUpload.current?.controller.abort();
    source.current = { file: null, url: '', error: null };
    validatedVideo.current = null;
    uploadedVideo.current = null;
    setSelectedFile(null);
    setPreviewUrl('');
    setVideoInfo(null);
    setValidationError(null);
    setUploadProgress(0);
  }, []);

  const inputProps: VideoFileInputProps = {
    selectedFile,
    previewUrl,
    validationError,
    onSelectFile,
    onReady,
    onInvalid,
    onChecking,
    disabled: uploading,
    uploading,
    uploadProgress,
    cancelUpload,
  };
  return {
    hasVideo: Boolean(selectedFile),
    canSubmit: !selectedFile || Boolean(videoInfo && !validationError),
    videoInfo,
    inputProps,
    requireVideo,
    prepareVideo,
    resetVideo,
    uploading,
    uploadProgress,
    cancelUpload,
  };
};
