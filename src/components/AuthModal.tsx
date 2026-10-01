import React, { useState } from 'react';
import { 
  X, 
  UserPlus, 
  LogIn, 
  Mail, 
  Lock, 
  User, 
  Sparkles, 
  AlertCircle, 
  CheckCircle2,
  FileText
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultMode?: 'login' | 'register';
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  defaultMode = 'register'
}) => {
  const { registerWithEmail, loginWithEmail, loginWithGoogle } = useAuth();
  
  const [mode, setMode] = useState<'login' | 'register'>(defaultMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [bio, setBio] = useState('');
  
  const [errorMsg, setErrorMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    setIsSubmitting(true);

    try {
      if (mode === 'register') {
        if (!displayName.trim()) {
          setErrorMsg('请填写用户昵称');
          setIsSubmitting(false);
          return;
        }
        if (password.length < 6) {
          setErrorMsg('密码长度不能少于 6 位');
          setIsSubmitting(false);
          return;
        }
        await registerWithEmail(email.trim(), password, displayName.trim(), bio.trim());
        setSuccessMsg('🎉 注册成功！已为您建立专属档案并安全保存至云端数据库。');
        setTimeout(() => {
          onClose();
        }, 1200);
      } else {
        await loginWithEmail(email.trim(), password);
        setSuccessMsg('欢迎回来！登录成功。');
        setTimeout(() => {
          onClose();
        }, 900);
      }
    } catch (err: any) {
      console.error(err);
      if (err.code === 'auth/email-already-in-use') {
        setErrorMsg('该邮箱已被注册，请直接登录或换用其他邮箱');
      } else if (err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
        setErrorMsg('邮箱或密码不正确，请重新输入');
      } else if (err.code === 'auth/user-not-found') {
        setErrorMsg('未找到该邮箱对应的账号，请先注册');
      } else if (err.code === 'auth/weak-password') {
        setErrorMsg('密码强度太弱，请输入至少 6 个字符');
      } else {
        setErrorMsg(err.message || '操作失败，请重试');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setErrorMsg('');
    setIsSubmitting(true);
    try {
      await loginWithGoogle();
      setSuccessMsg('Google 账号已快速授权连接！');
      setTimeout(() => {
        onClose();
      }, 900);
    } catch (err: any) {
      setErrorMsg(err.message || 'Google 登录失败');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs overflow-y-auto">
      <div 
        className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header decoration */}
        <div className="bg-gradient-to-r from-stone-900 via-stone-800 to-amber-950 p-6 text-white text-center relative overflow-hidden">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 text-stone-300 hover:text-white hover:bg-white/10 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-amber-500 to-rose-500 flex items-center justify-center mx-auto mb-3 shadow-md">
            <Sparkles className="w-6 h-6 text-white" />
          </div>

          <h2 className="text-xl font-bold font-serif tracking-tight">
            {mode === 'register' ? '加入 ShouqiangStar 星芒社区' : '欢迎登录星芒志'}
          </h2>
          <p className="text-xs text-stone-300 mt-1">
            {mode === 'register' 
              ? '注册专属账号，保存个人种草、分享生活与心得' 
              : '登录已保存的账号，畅享多模态社区互动'}
          </p>
        </div>

        {/* Tab switcher */}
        <div className="flex border-b border-stone-200 bg-stone-50">
          <button
            type="button"
            onClick={() => { setMode('register'); setErrorMsg(''); setSuccessMsg(''); }}
            className={`flex-1 py-3 text-xs sm:text-sm font-semibold flex items-center justify-center gap-1.5 border-b-2 transition-all ${
              mode === 'register'
                ? 'border-amber-600 text-stone-900 bg-white'
                : 'border-transparent text-stone-500 hover:text-stone-800'
            }`}
          >
            <UserPlus className="w-4 h-4 text-amber-600" />
            <span>新用户注册</span>
          </button>

          <button
            type="button"
            onClick={() => { setMode('login'); setErrorMsg(''); setSuccessMsg(''); }}
            className={`flex-1 py-3 text-xs sm:text-sm font-semibold flex items-center justify-center gap-1.5 border-b-2 transition-all ${
              mode === 'login'
                ? 'border-amber-600 text-stone-900 bg-white'
                : 'border-transparent text-stone-500 hover:text-stone-800'
            }`}
          >
            <LogIn className="w-4 h-4 text-amber-600" />
            <span>账号登录</span>
          </button>
        </div>

        {/* Form Body */}
        <div className="p-6 space-y-4">
          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start gap-2 animate-in fade-in">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-start gap-2 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-600" />
              <span>{successMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3.5">
            {mode === 'register' && (
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  用户昵称 / 社区称呼 <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <User className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
                  <input
                    type="text"
                    required
                    placeholder="例如：极客星人 / 算法旅者"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm bg-stone-50 border border-stone-200 rounded-xl outline-hidden focus:border-amber-500 focus:bg-white"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                电子邮箱 <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
                <input
                  type="email"
                  required
                  placeholder="yourname@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm bg-stone-50 border border-stone-200 rounded-xl outline-hidden focus:border-amber-500 focus:bg-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                登录密码 <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
                <input
                  type="password"
                  required
                  placeholder="至少包含 6 位字符"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm bg-stone-50 border border-stone-200 rounded-xl outline-hidden focus:border-amber-500 focus:bg-white"
                />
              </div>
            </div>

            {mode === 'register' && (
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  个人简介 / 个性签名 (选填)
                </label>
                <div className="relative">
                  <FileText className="w-4 h-4 absolute left-3 top-2.5 text-stone-400" />
                  <textarea
                    rows={2}
                    placeholder="例如：热爱底层思考与全栈开发，目前正在自学 CSAPP..."
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm bg-stone-50 border border-stone-200 rounded-xl outline-hidden focus:border-amber-500 focus:bg-white resize-none"
                  />
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-rose-500 hover:from-amber-600 hover:to-rose-600 text-white font-semibold text-xs sm:text-sm shadow-md transition-all flex items-center justify-center gap-1.5"
            >
              {isSubmitting ? (
                <span>正在处理中...</span>
              ) : mode === 'register' ? (
                <>
                  <UserPlus className="w-4 h-4" />
                  <span>立即注册并保存档案</span>
                </>
              ) : (
                <>
                  <LogIn className="w-4 h-4" />
                  <span>登录账号</span>
                </>
              )}
            </button>
          </form>

          {/* Social Divider */}
          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-stone-200" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="px-2 bg-white text-stone-400">或者使用第三方免密授权</span>
            </div>
          </div>

          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={isSubmitting}
            className="w-full py-2.5 px-4 rounded-xl border border-stone-300 hover:border-stone-400 bg-white hover:bg-stone-50 text-stone-700 font-medium text-xs sm:text-sm flex items-center justify-center gap-2 transition-colors shadow-2xs"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
            </svg>
            <span>使用 Google 账号一键快捷登录</span>
          </button>
        </div>
      </div>
    </div>
  );
};
