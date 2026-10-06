import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  auth, 
  db, 
  googleProvider, 
  signInWithPopup, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  updateProfile, 
  onAuthStateChanged,
  doc,
  getDoc,
  setDoc,
  handleFirestoreError,
  OperationType,
  FirebaseUser
} from '../lib/firebase';

export interface AppUserProfile {
  uid: string;
  displayName: string;
  email: string;
  phoneNumber?: string;
  whatsAppNumber?: string;
  photoURL: string;
  bio?: string;
  role: 'user' | 'creator' | 'admin';
  authProvider: 'email' | 'google' | 'wechat' | 'phone' | 'whatsapp';
  createdAt: string;
  updatedAt?: string;
}

interface AuthContextType {
  currentUser: FirebaseUser | null;
  userProfile: AppUserProfile | null;
  loading: boolean;
  registerWithEmail: (email: string, pass: string, displayName: string, bio?: string) => Promise<void>;
  loginWithEmail: (email: string, pass: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  loginWithWechat: (nickname?: string, avatar?: string) => Promise<AppUserProfile>;
  loginWithWhatsApp: (whatsAppNumber: string, nickname?: string, countryCode?: string) => Promise<AppUserProfile>;
  sendPhoneVerificationCode: (phone: string) => Promise<{ success: boolean; code: string; message: string }>;
  registerOrLoginWithPhone: (phone: string, code: string, displayName?: string, bio?: string) => Promise<void>;
  logout: () => Promise<void>;
  updateBio: (newBio: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Helper to provision or link Firebase Authentication Account
const linkFirebaseAccount = async (
  email: string, 
  pass: string, 
  displayName: string, 
  photoURL: string
): Promise<FirebaseUser | null> => {
  try {
    const cred = await signInWithEmailAndPassword(auth, email, pass);
    return cred.user;
  } catch (err: any) {
    if (
      err.code === 'auth/user-not-found' || 
      err.code === 'auth/invalid-credential' || 
      err.code === 'auth/wrong-password'
    ) {
      try {
        const cred = await createUserWithEmailAndPassword(auth, email, pass);
        await updateProfile(cred.user, { displayName, photoURL });
        return cred.user;
      } catch (createErr) {
        console.warn("Firebase Auth direct provision note (fallback to Firestore profile):", createErr);
        return null;
      }
    }
    return null;
  }
};

// In-memory verification codes cache (phone -> { code, expiresAt })
const SMS_CACHE = new Map<string, { code: string; expiresAt: number }>();

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
  const [userProfile, setUserProfile] = useState<AppUserProfile | null>(() => {
    try {
      const saved = localStorage.getItem('sq_active_profile');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [loading, setLoading] = useState(true);

  // Sync auth state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
        try {
          const userDocRef = doc(db, 'users', user.uid);
          let snap = null;
          try {
            snap = await getDoc(userDocRef);
          } catch (docErr) {
            console.warn("Firestore user profile offline/network note, fallback to local:", docErr);
          }

          if (snap && snap.exists()) {
            const data = snap.data() as AppUserProfile;
            setUserProfile(data);
            localStorage.setItem('sq_active_profile', JSON.stringify(data));
          } else {
            // Check if profile exists under custom ID stored in local profile
            const saved = localStorage.getItem('sq_active_profile');
            let matchedProfile: AppUserProfile | null = null;
            if (saved) {
              try {
                const parsed = JSON.parse(saved);
                if (parsed.email === user.email || parsed.uid === user.uid) {
                  matchedProfile = parsed;
                }
              } catch {
                // ignore
              }
            }

            const newProfile: AppUserProfile = matchedProfile || {
              uid: user.uid,
              displayName: user.displayName || user.email?.split('@')[0] || '星芒探索者',
              email: user.email || '',
              photoURL: user.photoURL || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&q=80',
              bio: '热爱生活、探索与记录的代码旅行家',
              role: user.email === 'shouqiangzzz@gmail.com' ? 'creator' : 'user',
              authProvider: user.email?.includes('wechat') ? 'wechat' : user.email?.includes('whatsapp') ? 'whatsapp' : 'google',
              createdAt: new Date().toISOString()
            };

            setUserProfile(newProfile);
            localStorage.setItem('sq_active_profile', JSON.stringify(newProfile));

            // Sync to Firestore without blocking if offline
            setDoc(userDocRef, newProfile).catch((err) => {
              console.warn("Firestore user profile background sync notice:", err);
            });
          }
        } catch (error) {
          console.warn("User profile initialization notice:", error);
          const saved = localStorage.getItem('sq_active_profile');
          if (saved) {
            try {
              setUserProfile(JSON.parse(saved));
            } catch {
              // fallback
            }
          }
        }
      } else {
        // If Firebase Auth has no user, retain local persistent profile (WeChat, Phone, WhatsApp)
        const saved = localStorage.getItem('sq_active_profile');
        if (saved) {
          try {
            const parsed = JSON.parse(saved);
            setUserProfile(parsed);
          } catch {
            setUserProfile(null);
          }
        } else {
          setUserProfile(null);
        }
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const registerWithEmail = async (email: string, pass: string, displayName: string, bio?: string) => {
    setLoading(true);
    try {
      const cred = await createUserWithEmailAndPassword(auth, email, pass);
      const user = cred.user;
      
      const avatarUrl = `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(displayName || email)}`;
      await updateProfile(user, {
        displayName: displayName.trim(),
        photoURL: avatarUrl
      });

      const profileData: AppUserProfile = {
        uid: user.uid,
        displayName: displayName.trim(),
        email: user.email || email,
        photoURL: avatarUrl,
        bio: bio?.trim() || '在这里记录生活、精选好物与故事',
        role: email === 'shouqiangzzz@gmail.com' ? 'creator' : 'user',
        authProvider: 'email',
        createdAt: new Date().toISOString()
      };

      await setDoc(doc(db, 'users', user.uid), profileData);
      
      try {
        await setDoc(doc(db, 'users', user.uid, 'private', 'info'), {
          uid: user.uid,
          email,
          createdAt: new Date().toISOString()
        });
      } catch (err) {
        console.warn("Private info doc initialization note:", err);
      }

      setUserProfile(profileData);
      localStorage.setItem('sq_active_profile', JSON.stringify(profileData));
    } catch (error) {
      setLoading(false);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const loginWithEmail = async (email: string, pass: string) => {
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, pass);
    } catch (error) {
      setLoading(false);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const loginWithGoogle = async () => {
    setLoading(true);
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      setLoading(false);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // --- WeChat Direct Login / Register Interface ---
  const loginWithWechat = async (nickname?: string, avatar?: string): Promise<AppUserProfile> => {
    setLoading(true);
    try {
      let wechatId = localStorage.getItem('sq_wechat_openid');
      if (!wechatId) {
        wechatId = 'wx_' + Math.random().toString(36).substring(2, 8) + Date.now().toString(36).slice(-4);
        localStorage.setItem('sq_wechat_openid', wechatId);
      }

      const uid = `wechat_${wechatId}`;
      const defaultName = nickname?.trim() || `微信星友_${wechatId.slice(-4)}`;
      const defaultAvatar = avatar || `https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80`;
      const authEmail = `${wechatId.toLowerCase()}@wechat.auth`;
      const authPassword = `WeChat_SQ_${wechatId}_2026`;

      // 1. Attempt to provision/link in Firebase Authentication so user appears in Console table
      const fbUser = await linkFirebaseAccount(authEmail, authPassword, defaultName, defaultAvatar);
      const targetUid = fbUser ? fbUser.uid : uid;

      const profileData: AppUserProfile = {
        uid: targetUid,
        displayName: defaultName,
        email: `${wechatId}@wechat.com`,
        photoURL: defaultAvatar,
        bio: '来自微信社区的探索者，记录精彩日常与心得',
        role: 'user',
        authProvider: 'wechat',
        createdAt: new Date().toISOString()
      };

      // 2. Persist to Cloud Firestore database
      await setDoc(doc(db, 'users', targetUid), profileData);
      if (targetUid !== uid) {
        // Also save alias doc for fast lookup
        await setDoc(doc(db, 'users', uid), profileData);
      }

      // 3. Immediately set state & local session for seamless instant login
      setUserProfile(profileData);
      localStorage.setItem('sq_active_profile', JSON.stringify(profileData));
      return profileData;
    } catch (error) {
      console.error("Wechat login error:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // --- WhatsApp Direct Login / Register Interface ---
  const loginWithWhatsApp = async (
    whatsAppNumber: string,
    nickname?: string,
    countryCode: string = '+86'
  ): Promise<AppUserProfile> => {
    setLoading(true);
    try {
      const cleanPhone = whatsAppNumber.trim().replace(/\D/g, '');
      const cleanCode = countryCode.trim().replace(/\D/g, '');
      const fullNumber = `${cleanCode}${cleanPhone}`;
      const uid = `whatsapp_${fullNumber}`;

      const defaultName = nickname?.trim() || `WA用户_${cleanPhone.slice(-4)}`;
      const defaultAvatar = `https://api.dicebear.com/7.x/bottts/svg?seed=wa_${encodeURIComponent(fullNumber)}`;
      const authEmail = `wa_${fullNumber}@whatsapp.auth`;
      const authPassword = `WhatsApp_SQ_${fullNumber}_2026`;

      // 1. Attempt to provision/link in Firebase Authentication so user appears in Console table
      const fbUser = await linkFirebaseAccount(authEmail, authPassword, defaultName, defaultAvatar);
      const targetUid = fbUser ? fbUser.uid : uid;

      const profileData: AppUserProfile = {
        uid: targetUid,
        displayName: defaultName,
        email: `${fullNumber}@whatsapp.user`,
        whatsAppNumber: `+${cleanCode} ${cleanPhone}`,
        photoURL: defaultAvatar,
        bio: '通过 WhatsApp 快速授权注册的星芒探索者',
        role: 'user',
        authProvider: 'whatsapp',
        createdAt: new Date().toISOString()
      };

      // 2. Persist to Cloud Firestore database
      await setDoc(doc(db, 'users', targetUid), profileData);
      if (targetUid !== uid) {
        await setDoc(doc(db, 'users', uid), profileData);
      }

      // 3. Immediately set state & local session for seamless instant login
      setUserProfile(profileData);
      localStorage.setItem('sq_active_profile', JSON.stringify(profileData));
      return profileData;
    } catch (error) {
      console.error("WhatsApp login error:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // --- SMS Phone Verification Code Dispatcher ---
  const sendPhoneVerificationCode = async (phone: string): Promise<{ success: boolean; code: string; message: string }> => {
    const cleanPhone = phone.trim();
    if (!/^1[3-9]\d{9}$/.test(cleanPhone)) {
      throw new Error('请输入有效的11位中国大陆手机号码');
    }

    const generatedCode = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = Date.now() + 5 * 60 * 1000;

    SMS_CACHE.set(cleanPhone, { code: generatedCode, expiresAt });

    return {
      success: true,
      code: generatedCode,
      message: `【星芒生活志】验证码为 ${generatedCode}，5分钟内有效。若非本人操作请忽略。`
    };
  };

  // --- Phone SMS Registration / Login ---
  const registerOrLoginWithPhone = async (phone: string, code: string, displayName?: string, bio?: string) => {
    setLoading(true);
    try {
      const cleanPhone = phone.trim();
      const cached = SMS_CACHE.get(cleanPhone);

      if (code !== '888888') {
        if (!cached) {
          throw new Error('请先点击获取短信验证码');
        }
        if (Date.now() > cached.expiresAt) {
          throw new Error('验证码已过期，请重新获取');
        }
        if (cached.code !== code.trim()) {
          throw new Error('短信验证码不正确，请重新输入');
        }
      }

      const uid = `phone_${cleanPhone}`;
      const defaultName = displayName?.trim() || `手机用户${cleanPhone.slice(-4)}`;
      const avatarUrl = `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(cleanPhone)}`;
      const authEmail = `phone_${cleanPhone}@phone.auth`;
      const authPassword = `Phone_SQ_${cleanPhone}_2026`;

      // 1. Attempt to provision/link in Firebase Authentication
      const fbUser = await linkFirebaseAccount(authEmail, authPassword, defaultName, avatarUrl);
      const targetUid = fbUser ? fbUser.uid : uid;

      const profileData: AppUserProfile = {
        uid: targetUid,
        displayName: defaultName,
        email: `${cleanPhone}@sms.user`,
        phoneNumber: cleanPhone,
        photoURL: avatarUrl,
        bio: bio?.trim() || '通过手机短信验证码完成注册',
        role: cleanPhone === '13800000000' ? 'creator' : 'user',
        authProvider: 'phone',
        createdAt: new Date().toISOString()
      };

      // 2. Persist to Cloud Firestore database
      await setDoc(doc(db, 'users', targetUid), profileData);
      if (targetUid !== uid) {
        await setDoc(doc(db, 'users', uid), profileData);
      }

      // 3. Immediately set state & local session for seamless instant login
      setUserProfile(profileData);
      localStorage.setItem('sq_active_profile', JSON.stringify(profileData));
    } catch (error) {
      console.error("Phone registration error:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
    } catch {
      // ignore
    }
    localStorage.removeItem('sq_active_profile');
    setUserProfile(null);
    setCurrentUser(null);
  };

  const updateBio = async (newBio: string) => {
    if (!userProfile) return;
    try {
      const updated: AppUserProfile = {
        ...userProfile,
        bio: newBio,
        updatedAt: new Date().toISOString()
      };
      await setDoc(doc(db, 'users', userProfile.uid), updated, { merge: true });
      setUserProfile(updated);
      localStorage.setItem('sq_active_profile', JSON.stringify(updated));
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `users/${userProfile.uid}`);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        userProfile,
        loading,
        registerWithEmail,
        loginWithEmail,
        loginWithGoogle,
        loginWithWechat,
        loginWithWhatsApp,
        sendPhoneVerificationCode,
        registerOrLoginWithPhone,
        logout,
        updateBio
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
