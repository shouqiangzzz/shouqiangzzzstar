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
  photoURL: string;
  bio?: string;
  role: 'user' | 'creator' | 'admin';
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
  logout: () => Promise<void>;
  updateBio: (newBio: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
  const [userProfile, setUserProfile] = useState<AppUserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  // Sync auth state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
        try {
          const userDocRef = doc(db, 'users', user.uid);
          const snap = await getDoc(userDocRef);
          if (snap.exists()) {
            setUserProfile(snap.data() as AppUserProfile);
          } else {
            // First time login via external provider (e.g. Google)
            const newProfile: AppUserProfile = {
              uid: user.uid,
              displayName: user.displayName || user.email?.split('@')[0] || '星芒探索者',
              email: user.email || '',
              photoURL: user.photoURL || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&q=80',
              bio: '热爱生活、探索与记录的代码旅行家',
              role: user.email === 'shouqiangzzz@gmail.com' ? 'creator' : 'user',
              createdAt: new Date().toISOString()
            };
            await setDoc(userDocRef, newProfile);
            setUserProfile(newProfile);
          }
        } catch (error) {
          console.error("Failed to load user profile:", error);
        }
      } else {
        setUserProfile(null);
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
        createdAt: new Date().toISOString()
      };

      // Persist to Cloud Firestore
      await setDoc(doc(db, 'users', user.uid), profileData);
      
      // Save isolated private data
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

  const logout = async () => {
    await signOut(auth);
    setUserProfile(null);
  };

  const updateBio = async (newBio: string) => {
    if (!currentUser || !userProfile) return;
    try {
      const updated = {
        ...userProfile,
        bio: newBio,
        updatedAt: new Date().toISOString()
      };
      await setDoc(doc(db, 'users', currentUser.uid), updated, { merge: true });
      setUserProfile(updated);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `users/${currentUser.uid}`);
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
