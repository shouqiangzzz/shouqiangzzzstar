import React, { useEffect, useRef, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useVideoAttachment } from '../hooks/useVideoAttachment';
import { auth, onAuthStateChanged } from '../lib/firebase';
import type { UploadedOriginalVideo } from '../lib/videoUpload';
import type { VideoInfo } from '../utils/video';
import { VideoFileInput } from './VideoFileInput';

export type RecoveredVideo = UploadedOriginalVideo & VideoInfo;
export type RecoverVideoHandler = (video: RecoveredVideo) => Promise<void>;

interface LegacyVideoRecoveryProps {
  authorId?: string;
  onRecover: RecoverVideoHandler;
  onRequestLogin?: () => void;
}

export const LegacyVideoRecovery: React.FC<LegacyVideoRecoveryProps> = ({
  authorId,
  onRecover,
  onRequestLogin,
}) => {
  const { currentUser, loading } = useAuth();
  const isAuthor = Boolean(authorId && currentUser?.uid === authorId);

  return (
    <section className="rounded-xl border border-amber-200 bg-amber-50/60 p-4 space-y-3" aria-label="旧视频迁移">
      <h2 className="font-semibold text-sm text-amber-950">旧视频需要迁移</h2>
      <p className="text-xs leading-relaxed text-stone-600">
        这条视频使用旧版上传方式。请原上传者选择原视频文件，预览后迁移到云端，即可在这里播放。
      </p>
      {loading ? (
        <p className="text-xs text-stone-500" role="status">正在确认登录状态…</p>
      ) : isAuthor && authorId ? (
        <AuthorVideoRecovery key={`${authorId}:${currentUser?.uid}`} authorId={authorId} onRecover={onRecover} />
      ) : (
        <div className="space-y-2">
          <p className="text-xs leading-relaxed text-stone-600">
            {authorId ? '请原上传者登录后，使用原视频文件完成迁移。' : '请联系站点管理员确认原上传者，再使用原视频文件完成迁移。'}
          </p>
          {!currentUser && onRequestLogin && (
            <button type="button" onClick={onRequestLogin} className="rounded-lg bg-amber-600 px-3 py-2 text-xs font-semibold text-white hover:bg-amber-700">
              登录后迁移
            </button>
          )}
        </div>
      )}
    </section>
  );
};

const AuthorVideoRecovery: React.FC<{ authorId: string; onRecover: RecoverVideoHandler }> = ({ authorId, onRecover }) => {
  const attachment = useVideoAttachment();
  const [submitting, setSubmitting] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [error, setError] = useState('');
  const submittingRef = useRef(false);
  const mounted = useRef(true);
  const accountChanged = useRef(false);

  useEffect(() => {
    mounted.current = true;
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user?.uid !== authorId) {
        accountChanged.current = true;
        attachment.cancelUpload();
      }
    });
    return () => {
      mounted.current = false;
      unsubscribe();
      attachment.cancelUpload();
    };
  }, [authorId, attachment.cancelUpload]);

  const stillOwnsDraft = () => mounted.current && !accountChanged.current && auth.currentUser?.uid === authorId;

  const handleRecover = async () => {
    if (submittingRef.current || completed || !stillOwnsDraft()) return;
    submittingRef.current = true;
    setSubmitting(true);
    setError('');
    try {
      const video = await attachment.prepareVideo();
      if (!video) throw new Error('请先选择原视频文件，并等待预览验证完成。');
      if (!stillOwnsDraft()) return;
      await onRecover(video);
      if (!stillOwnsDraft()) return;
      setCompleted(true);
      attachment.resetVideo();
    } catch (failure) {
      if (stillOwnsDraft()) {
        setError(failure instanceof Error ? failure.message : '迁移未完成，请稍后重试。');
      }
    } finally {
      submittingRef.current = false;
      if (mounted.current) setSubmitting(false);
    }
  };

  if (completed) {
    return <p className="text-xs text-emerald-700" role="status">原视频已迁移到云端，可以播放了。</p>;
  }

  return (
    <div className="space-y-3">
      <VideoFileInput
        {...attachment.inputProps}
        disabled={submitting}
        onSelectFile={(file) => {
          if (submittingRef.current) return;
          setError('');
          attachment.inputProps.onSelectFile(file);
        }}
      />
      {attachment.uploading && (
        <button type="button" onClick={attachment.cancelUpload} className="text-xs text-stone-600 underline underline-offset-2">取消上传</button>
      )}
      {error && (
        <div className="space-y-1 text-xs text-rose-700" role="alert">
          <p>{error}</p>
          <p>所选文件已保留。若已上传完成，再次保存会复用已上传的视频。</p>
        </div>
      )}
      <button
        type="button"
        disabled={submitting || !attachment.hasVideo || !attachment.canSubmit}
        onClick={handleRecover}
        className="rounded-lg bg-amber-600 px-4 py-2 text-xs font-semibold text-white hover:bg-amber-700 disabled:opacity-50"
      >
        {attachment.uploading ? `上传中 ${Math.round(attachment.uploadProgress)}%` : submitting ? '正在保存…' : error ? '重试迁移并保存' : '迁移原视频并保存'}
      </button>
    </div>
  );
};
