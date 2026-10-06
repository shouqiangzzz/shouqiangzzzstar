import React, { useState, useEffect } from 'react';
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
  FileText,
  Phone,
  ShieldCheck,
  Smartphone,
  Send,
  QrCode,
  ArrowRight,
  ExternalLink
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultMode?: 'login' | 'register' | 'phone';
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  defaultMode = 'register'
}) => {
  const { 
    registerWithEmail, 
    loginWithEmail, 
    loginWithGoogle, 
    loginWithWechat,
    loginWithWhatsApp,
    sendPhoneVerificationCode,
    registerOrLoginWithPhone
  } = useAuth();
  
  // Registration methods: 'phone' | 'register' | 'login'
  const [activeTab, setActiveTab] = useState<'register' | 'login' | 'phone'>(
    defaultMode === 'phone' ? 'phone' : defaultMode
  );

  // Email form fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [bio, setBio] = useState('');

  // Phone form fields
  const [phoneNumber, setPhoneNumber] = useState('');
  const [smsCode, setSmsCode] = useState('');
  const [phoneDisplayName, setPhoneDisplayName] = useState('');
  const [countdown, setCountdown] = useState(0);
  const [isSendingCode, setIsSendingCode] = useState(false);
  const [smsToast, setSmsToast] = useState<string | null>(null);

  // WeChat Modal / State
  const [isWeChatModalOpen, setIsWeChatModalOpen] = useState(false);
  const [weChatNickname, setWeChatNickname] = useState('');

  // WhatsApp Modal / State
  const [isWhatsAppModalOpen, setIsWhatsAppModalOpen] = useState(false);
  const [waCountryCode, setWaCountryCode] = useState('+86');
  const [waPhoneNumber, setWaPhoneNumber] = useState('');
  const [waNickname, setWaNickname] = useState('');
  
  const [errorMsg, setErrorMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  // Countdown timer for SMS
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [countdown]);

  if (!isOpen) return null;

  // Handle SMS code dispatch
  const handleSendCode = async () => {
    setErrorMsg('');
    if (!/^1[3-9]\d{9}$/.test(phoneNumber.trim())) {
      setErrorMsg('请输入正确的11位中国大陆手机号码');
      return;
    }

    setIsSendingCode(true);
    try {
      const res = await sendPhoneVerificationCode(phoneNumber.trim());
      setCountdown(60);
      setSmsToast(res.message);
      setSmsCode(res.code); // auto-fill for testing
    } catch (err: any) {
      setErrorMsg(err.message || '获取验证码失败，请重试');
    } finally {
      setIsSendingCode(false);
    }
  };

  // Handle phone submission
  const handlePhoneSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    setIsSubmitting(true);

    try {
      if (!phoneNumber.trim()) {
        setErrorMsg('请填写手机号');
        setIsSubmitting(false);
        return;
      }
      if (!smsCode.trim()) {
        setErrorMsg('请填写6位短信验证码');
        setIsSubmitting(false);
        return;
      }

      await registerOrLoginWithPhone(
        phoneNumber.trim(),
        smsCode.trim(),
        phoneDisplayName.trim() || undefined
      );

      setSuccessMsg('🎉 手机短信验证通过！已完成注册并跳转登录。');
      setTimeout(() => {
        onClose();
      }, 1000);
    } catch (err: any) {
      setErrorMsg(err.message || '手机号验证失败');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle email submission
  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    setIsSubmitting(true);

    try {
      if (activeTab === 'register') {
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
        setSuccessMsg('🎉 注册成功！档案已安全写入云端 Firestore 数据库，正在跳转登录...');
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
      if (err.code === 'auth/operation-not-allowed') {
        setErrorMsg('邮箱密码注册服务未在 Firebase 后台开放。建议点击下方「微信一键登录」、「WhatsApp登录」、「手机验证码注册」或「Google登录」！');
      } else if (err.code === 'auth/email-already-in-use') {
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

  // Handle WeChat Direct / Jump Register & Login
  const handleDirectWechatAuth = async () => {
    setErrorMsg('');
    setIsSubmitting(true);
    try {
      await loginWithWechat(weChatNickname.trim() || undefined);
      setSuccessMsg('💚 微信授权注册成功！正在为您自动跳转登录...');
      setTimeout(() => {
        setIsWeChatModalOpen(false);
        onClose();
      }, 1000);
    } catch (err: any) {
      setErrorMsg(err.message || '微信授权失败');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle WhatsApp Direct / Jump Register & Login
  const handleDirectWhatsAppAuth = async () => {
    setErrorMsg('');
    setIsSubmitting(true);
    try {
      const targetPhone = waPhoneNumber.trim() || '13888888888';
      await loginWithWhatsApp(targetPhone, waNickname.trim() || undefined, waCountryCode);
      setSuccessMsg('💬 WhatsApp 授权注册成功！正在为您自动跳转登录...');
      setTimeout(() => {
        setIsWhatsAppModalOpen(false);
        onClose();
      }, 1000);
    } catch (err: any) {
      setErrorMsg(err.message || 'WhatsApp 授权失败');
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-xs overflow-y-auto">
      <div 
        className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header decoration */}
        <div className="bg-gradient-to-r from-stone-900 via-stone-800 to-amber-950 p-5 sm:p-6 text-white text-center relative overflow-hidden">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 text-stone-300 hover:text-white hover:bg-white/10 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-amber-500 to-rose-500 flex items-center justify-center mx-auto mb-2.5 shadow-md">
            <Sparkles className="w-5 h-5 text-white" />
          </div>

          <h2 className="text-xl font-bold font-serif tracking-tight">
            {activeTab === 'register' && '加入 ShouqiangStar 星芒社区'}
            {activeTab === 'login' && '欢迎登录 ShouqiangStar'}
            {activeTab === 'phone' && '手机短信快捷注册 / 登录'}
          </h2>
          <p className="text-xs text-stone-300 mt-1">
            支持微信、WhatsApp、手机验证码、邮箱及 Google 全渠道注册与跳转登录
          </p>
        </div>

        {/* Tab switcher: 手机号注册 / 邮箱注册 / 账号登录 */}
        <div className="flex border-b border-stone-200 bg-stone-50 text-xs">
          <button
            type="button"
            onClick={() => { setActiveTab('phone'); setErrorMsg(''); setSuccessMsg(''); }}
            className={`flex-1 py-3 font-semibold flex items-center justify-center gap-1.5 border-b-2 transition-all ${
              activeTab === 'phone'
                ? 'border-emerald-500 text-stone-900 bg-white'
                : 'border-transparent text-stone-500 hover:text-stone-800'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5 text-emerald-600" />
            <span>手机号验证码</span>
          </button>

          <button
            type="button"
            onClick={() => { setActiveTab('register'); setErrorMsg(''); setSuccessMsg(''); }}
            className={`flex-1 py-3 font-semibold flex items-center justify-center gap-1.5 border-b-2 transition-all ${
              activeTab === 'register'
                ? 'border-amber-600 text-stone-900 bg-white'
                : 'border-transparent text-stone-500 hover:text-stone-800'
            }`}
          >
            <UserPlus className="w-3.5 h-3.5 text-amber-600" />
            <span>邮箱注册</span>
          </button>

          <button
            type="button"
            onClick={() => { setActiveTab('login'); setErrorMsg(''); setSuccessMsg(''); }}
            className={`flex-1 py-3 font-semibold flex items-center justify-center gap-1.5 border-b-2 transition-all ${
              activeTab === 'login'
                ? 'border-amber-600 text-stone-900 bg-white'
                : 'border-transparent text-stone-500 hover:text-stone-800'
            }`}
          >
            <LogIn className="w-3.5 h-3.5 text-amber-600" />
            <span>密码登录</span>
          </button>
        </div>

        {/* Form Body */}
        <div className="p-5 sm:p-6 space-y-4">
          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start gap-2 animate-in fade-in">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <div className="leading-relaxed">{errorMsg}</div>
            </div>
          )}

          {successMsg && (
            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-start gap-2 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-600" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* SMS Notification Banner */}
          {smsToast && activeTab === 'phone' && (
            <div className="p-3 rounded-xl bg-indigo-50 border border-indigo-200 text-indigo-900 text-xs flex items-start gap-2 animate-in fade-in">
              <ShieldCheck className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-indigo-950">短信验证码已下发至手机：</p>
                <p className="font-mono mt-0.5">{smsToast}</p>
              </div>
            </div>
          )}

          {/* ========================================= */}
          {/* TAB 1: PHONE SMS REGISTRATION & LOGIN    */}
          {/* ========================================= */}
          {activeTab === 'phone' && (
            <form onSubmit={handlePhoneSubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  手机号码 <span className="text-rose-500">*</span>
                </label>
                <div className="relative flex items-center">
                  <div className="absolute left-3 flex items-center gap-1 text-stone-500 text-xs font-medium border-r border-stone-200 pr-2">
                    <Phone className="w-3.5 h-3.5 text-stone-400" />
                    <span>+86</span>
                  </div>
                  <input
                    type="tel"
                    maxLength={11}
                    required
                    placeholder="输入11位手机号码"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, ''))}
                    className="w-full pl-20 pr-3 py-2 text-xs sm:text-sm bg-stone-50 border border-stone-200 rounded-xl outline-hidden focus:border-emerald-500 focus:bg-white font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  短信验证码 <span className="text-rose-500">*</span>
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    maxLength={6}
                    required
                    placeholder="输入6位验证码"
                    value={smsCode}
                    onChange={(e) => setSmsCode(e.target.value.trim())}
                    className="flex-1 px-3 py-2 text-xs sm:text-sm bg-stone-50 border border-stone-200 rounded-xl outline-hidden focus:border-emerald-500 focus:bg-white font-mono tracking-widest text-center"
                  />
                  <button
                    type="button"
                    disabled={isSendingCode || countdown > 0 || !phoneNumber}
                    onClick={handleSendCode}
                    className={`px-3.5 py-2 rounded-xl text-xs font-semibold shrink-0 transition-all ${
                      countdown > 0 || isSendingCode || !phoneNumber
                        ? 'bg-stone-100 text-stone-400 border border-stone-200 cursor-not-allowed'
                        : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs'
                    }`}
                  >
                    {countdown > 0 ? `${countdown}s 后重新获取` : isSendingCode ? '发送中...' : '获取验证码'}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  社区昵称 (选填)
                </label>
                <div className="relative">
                  <User className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
                  <input
                    type="text"
                    placeholder="例如：极客星人 (留空自动生成)"
                    value={phoneDisplayName}
                    onChange={(e) => setPhoneDisplayName(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm bg-stone-50 border border-stone-200 rounded-xl outline-hidden focus:border-emerald-500 focus:bg-white"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-semibold text-xs sm:text-sm shadow-md transition-all flex items-center justify-center gap-1.5"
              >
                {isSubmitting ? (
                  <span>正在验证并跳转登录...</span>
                ) : (
                  <>
                    <Smartphone className="w-4 h-4" />
                    <span>手机验证码注册并登录</span>
                  </>
                )}
              </button>
            </form>
          )}

          {/* ========================================= */}
          {/* TAB 2 & 3: EMAIL REGISTER / LOGIN         */}
          {/* ========================================= */}
          {(activeTab === 'register' || activeTab === 'login') && (
            <form onSubmit={handleEmailSubmit} className="space-y-3.5">
              {activeTab === 'register' && (
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

              {activeTab === 'register' && (
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    个人简介 / 个性签名 (选填)
                  </label>
                  <div className="relative">
                    <FileText className="w-4 h-4 absolute left-3 top-2.5 text-stone-400" />
                    <textarea
                      rows={2}
                      placeholder="热爱底层思考与全栈开发，探索与记录..."
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
                ) : activeTab === 'register' ? (
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
          )}

          {/* Social Divider */}
          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-stone-200" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="px-2 bg-white text-stone-400">第三方快捷授权通道</span>
            </div>
          </div>

          {/* --- WECHAT & WHATSAPP BUTTONS (最下方接口) --- */}
          <div className="space-y-2">
            {/* 1. WeChat Button */}
            <button
              type="button"
              onClick={() => setIsWeChatModalOpen(true)}
              disabled={isSubmitting}
              className="w-full py-2.5 px-4 rounded-xl border border-emerald-500 bg-[#07C160] hover:bg-[#06AD56] text-white font-semibold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all shadow-sm shadow-emerald-600/20 active:scale-[0.99]"
            >
              <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                <path d="M8.5 2C4.36 2 1 4.91 1 8.5c0 2.06 1.11 3.91 2.87 5.12L3 17l3.65-1.12C7.39 16.24 8.18 16.5 9 16.5c.34 0 .67-.03 1-.09-.27-.76-.41-1.57-.41-2.41 0-4.14 3.81-7.5 8.5-7.5.31 0 .62.02.92.05C17.77 3.94 13.52 2 8.5 2zm-2.25 4a1.25 1.25 0 110 2.5 1.25 1.25 0 010-2.5zm5.5 0a1.25 1.25 0 110 2.5 1.25 1.25 0 010-2.5zM17.5 8c-3.86 0-7 2.69-7 6s3.14 6 7 6c.71 0 1.39-.1 2.02-.28L23 21l-.9-2.73C23.63 17.15 24.5 15.67 24.5 14c0-3.31-3.14-6-7-6zm-2.25 3.5a1 1 0 110 2 1 1 0 010-2zm4.5 0a1 1 0 110 2 1 1 0 010-2z" />
              </svg>
              <span>微信一键授权快捷注册 / 登录</span>
            </button>

            {/* 2. WhatsApp Button */}
            <button
              type="button"
              onClick={() => setIsWhatsAppModalOpen(true)}
              disabled={isSubmitting}
              className="w-full py-2.5 px-4 rounded-xl border border-[#25D366] bg-[#25D366] hover:bg-[#20bd5a] text-white font-semibold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all shadow-sm shadow-[#25D366]/20 active:scale-[0.99]"
            >
              <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/>
              </svg>
              <span>WhatsApp 一键授权快捷注册 / 登录</span>
            </button>

            {/* 3. Google Button */}
            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={isSubmitting}
              className="w-full py-2.5 px-4 rounded-xl border border-stone-200 hover:border-stone-300 bg-white hover:bg-stone-50 text-stone-700 font-medium text-xs sm:text-sm flex items-center justify-center gap-2 transition-colors shadow-2xs"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
              </svg>
              <span>使用 Google 账号一键登录</span>
            </button>
          </div>
        </div>
      </div>

      {/* --- WECHAT AUTHORIZATION MODAL --- */}
      {isWeChatModalOpen && (
        <div 
          className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs animate-in fade-in"
          onClick={() => setIsWeChatModalOpen(false)}
        >
          <div 
            className="w-full max-w-sm bg-white rounded-2xl shadow-2xl overflow-hidden p-6 text-center space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-2 border-b border-stone-100">
              <div className="flex items-center gap-2 text-emerald-600 font-bold text-sm">
                <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                  <path d="M8.5 2C4.36 2 1 4.91 1 8.5c0 2.06 1.11 3.91 2.87 5.12L3 17l3.65-1.12C7.39 16.24 8.18 16.5 9 16.5c.34 0 .67-.03 1-.09-.27-.76-.41-1.57-.41-2.41 0-4.14 3.81-7.5 8.5-7.5.31 0 .62.02.92.05C17.77 3.94 13.52 2 8.5 2zm-2.25 4a1.25 1.25 0 110 2.5 1.25 1.25 0 010-2.5zm5.5 0a1.25 1.25 0 110 2.5 1.25 1.25 0 010-2.5zM17.5 8c-3.86 0-7 2.69-7 6s3.14 6 7 6c.71 0 1.39-.1 2.02-.28L23 21l-.9-2.73C23.63 17.15 24.5 15.67 24.5 14c0-3.31-3.14-6-7-6zm-2.25 3.5a1 1 0 110 2 1 1 0 010-2zm4.5 0a1 1 0 110 2 1 1 0 010-2z" />
                </svg>
                <span>微信快捷跳转 · 注册与登录</span>
              </div>
              <button
                onClick={() => setIsWeChatModalOpen(false)}
                className="p-1 text-stone-400 hover:text-stone-700 rounded-full"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="py-2">
              <div className="w-40 h-40 mx-auto bg-stone-50 rounded-xl p-2.5 border border-stone-200 flex flex-col items-center justify-center relative shadow-xs">
                <img
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${encodeURIComponent(typeof window !== 'undefined' ? window.location.href : 'https://shouqiangzzzstar.ai.studio')}`}
                  alt="微信授权二维码"
                  className="w-36 h-36 rounded-lg object-contain"
                />
              </div>
              <p className="text-xs text-stone-500 mt-2">
                支持手机微信扫码直达本站，或点击下方直接授权登录
              </p>
            </div>

            <div className="text-left space-y-1.5">
              <label className="block text-[11px] font-semibold text-stone-600">
                微信昵称 / 社区称呼 (可选)
              </label>
              <input
                type="text"
                placeholder="例如：微信星友"
                value={weChatNickname}
                onChange={(e) => setWeChatNickname(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-stone-50 border border-stone-200 rounded-xl outline-hidden focus:border-emerald-500"
              />
            </div>

            <button
              type="button"
              disabled={isSubmitting}
              onClick={handleDirectWechatAuth}
              className="w-full py-2.5 rounded-xl bg-[#07C160] hover:bg-[#06AD56] text-white font-semibold text-xs sm:text-sm shadow-md transition-all flex items-center justify-center gap-1.5"
            >
              {isSubmitting ? (
                <span>正在授权并跳转...</span>
              ) : (
                <>
                  <span>一键微信授权注册并跳转登录</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* --- WHATSAPP AUTHORIZATION MODAL --- */}
      {isWhatsAppModalOpen && (
        <div 
          className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs animate-in fade-in"
          onClick={() => setIsWhatsAppModalOpen(false)}
        >
          <div 
            className="w-full max-w-sm bg-white rounded-2xl shadow-2xl overflow-hidden p-6 text-center space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-2 border-b border-stone-100">
              <div className="flex items-center gap-2 text-[#25D366] font-bold text-sm">
                <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                  <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/>
                </svg>
                <span>WhatsApp 快捷跳转 · 注册与登录</span>
              </div>
              <button
                onClick={() => setIsWhatsAppModalOpen(false)}
                className="p-1 text-stone-400 hover:text-stone-700 rounded-full"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="py-2">
              <div className="w-16 h-16 mx-auto rounded-2xl bg-[#25D366]/15 flex items-center justify-center text-[#25D366] shadow-sm mb-3">
                <svg className="w-10 h-10 fill-current" viewBox="0 0 24 24">
                  <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/>
                </svg>
              </div>
              <p className="text-xs text-stone-600 font-medium">
                输入您的 WhatsApp 手机号或直接点击一键跳转授权注册
              </p>
            </div>

            <div className="space-y-2.5 text-left">
              <div>
                <label className="block text-[11px] font-semibold text-stone-600 mb-1">
                  WhatsApp 手机号 (选填)
                </label>
                <div className="flex gap-2">
                  <select
                    value={waCountryCode}
                    onChange={(e) => setWaCountryCode(e.target.value)}
                    className="w-24 px-2 py-2 text-xs bg-stone-50 border border-stone-200 rounded-xl outline-hidden"
                  >
                    <option value="+86">+86 (中国)</option>
                    <option value="+1">+1 (美国/加拿大)</option>
                    <option value="+44">+44 (英国)</option>
                    <option value="+852">+852 (中国香港)</option>
                    <option value="+65">+65 (新加坡)</option>
                    <option value="+81">+81 (日本)</option>
                    <option value="+60">+60 (马来西亚)</option>
                  </select>
                  <input
                    type="tel"
                    placeholder="例如 13800138000"
                    value={waPhoneNumber}
                    onChange={(e) => setWaPhoneNumber(e.target.value.replace(/\D/g, ''))}
                    className="flex-1 px-3 py-2 text-xs bg-stone-50 border border-stone-200 rounded-xl outline-hidden focus:border-[#25D366]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-stone-600 mb-1">
                  显示昵称 (可选)
                </label>
                <input
                  type="text"
                  placeholder="例如：WA星友 (留空自动生成)"
                  value={waNickname}
                  onChange={(e) => setWaNickname(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-stone-50 border border-stone-200 rounded-xl outline-hidden focus:border-[#25D366]"
                />
              </div>
              {/* Direct WhatsApp Web/App launcher */}
              <div className="pt-1">
                <a
                  href={`https://wa.me/${waCountryCode.replace(/\D/g, '')}${waPhoneNumber.trim() || '8613800000000'}?text=${encodeURIComponent('Hello! 我正在访问 ShouqiangStar 星芒社区，正在进行账号认证。')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs text-[#25D366] hover:underline"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>在 WhatsApp App / 网页版中发起会话验证</span>
                </a>
              </div>
            </div>

            <button
              type="button"
              disabled={isSubmitting}
              onClick={handleDirectWhatsAppAuth}
              className="w-full py-2.5 rounded-xl bg-[#25D366] hover:bg-[#20bd5a] text-white font-semibold text-xs sm:text-sm shadow-md transition-all flex items-center justify-center gap-1.5 active:scale-[0.99]"
            >
              {isSubmitting ? (
                <span>正在授权并跳转...</span>
              ) : (
                <>
                  <span>一键 WhatsApp 授权注册并跳转登录</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
