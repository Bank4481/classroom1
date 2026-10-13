import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  User as FirebaseUser,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  signInWithPopup,
  GoogleAuthProvider,
  sendPasswordResetEmail,
  updateProfile as firebaseUpdateProfile,
} from 'firebase/auth';
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  serverTimestamp,
} from 'firebase/firestore';
import { auth, db, handleFirestoreError, OperationType } from '../lib/firebase';
import type { UserProfile, UserRole } from '../types';

interface AuthContextType {
  user: FirebaseUser | null;
  profile: UserProfile | null;
  loading: boolean;
  role: UserRole;
  isAdmin: boolean;
  isTeacher: boolean;
  isStudent: boolean;
  signIn: (email: string, pass: string) => Promise<void>;
  signUp: (email: string, pass: string, name: string, preferredRole?: UserRole) => Promise<void>;
  signInWithGoogle: (directEmail?: string) => Promise<void>;
  signInWithGoogleDirect: (email: string, displayName?: string, photoURL?: string) => Promise<void>;
  demoSignIn: (role: UserRole) => void;
  sendPasswordReset: (email: string) => Promise<void>;
  signOut: () => Promise<void>;
  updateUserProfile: (data: Partial<UserProfile>) => Promise<void>;
  setSimulatedRole: (role: UserRole | null) => void;
  simulatedRole: UserRole | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Admin credentials configured by system owner
export const BOOTSTRAP_ADMIN_EMAIL = 'bbak9988@gmail.com';
export const BOOTSTRAP_ADMIN_PASS = 'Bank4481';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [simulatedRole, setSimulatedRole] = useState<UserRole | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        localStorage.removeItem('learnspace_demo_session');
        try {
          const userRef = doc(db, 'users', currentUser.uid);
          const snap = await getDoc(userRef);

          const isBootstrapAdmin = currentUser.email?.toLowerCase() === BOOTSTRAP_ADMIN_EMAIL.toLowerCase();

          if (snap.exists()) {
            const data = snap.data() as UserProfile;
            // Only the owner email can have admin role
            if (isBootstrapAdmin && data.role !== 'admin') {
              await updateDoc(userRef, { role: 'admin' });
              data.role = 'admin';
            } else if (!isBootstrapAdmin && data.role === 'admin') {
              // Revoke any unauthorized admin assignment
              await updateDoc(userRef, { role: 'student' });
              data.role = 'student';
            }
            setProfile(data);
          } else {
            // New user profile
            const newProfile: UserProfile = {
              uid: currentUser.uid,
              email: currentUser.email || '',
              displayName: currentUser.displayName || (currentUser.email ? currentUser.email.split('@')[0] : 'สมาชิก'),
              photoURL: currentUser.photoURL || '',
              role: isBootstrapAdmin ? 'admin' : 'student',
              bio: isBootstrapAdmin ? 'ผู้ดูแลระบบ LearnSpace' : 'นักเรียนในระบบ LearnSpace',
              enrolledCourses: ['course-web-dev'],
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            };
            await setDoc(userRef, newProfile);
            setProfile(newProfile);
          }
        } catch (error) {
          console.error('Failed to load user profile from Firestore:', error);
        }
      } else {
        // Check if there is an active admin or student session stored
        try {
          const adminStored = localStorage.getItem('learnspace_admin_session');
          if (adminStored) {
            const parsed = JSON.parse(adminStored);
            if (parsed.user && parsed.profile && parsed.user.email?.toLowerCase() === BOOTSTRAP_ADMIN_EMAIL.toLowerCase()) {
              setUser(parsed.user);
              setProfile(parsed.profile);
              setLoading(false);
              return;
            }
          }

          const googleStored = localStorage.getItem('learnspace_google_session');
          if (googleStored) {
            const parsed = JSON.parse(googleStored);
            if (parsed.user && parsed.profile) {
              if (parsed.user.email?.toLowerCase() === BOOTSTRAP_ADMIN_EMAIL.toLowerCase()) {
                parsed.profile.role = 'admin';
              } else if (parsed.profile.role === 'admin') {
                parsed.profile.role = 'student';
              }
              setUser(parsed.user);
              setProfile(parsed.profile);
              setLoading(false);
              return;
            }
          }

          const stored = localStorage.getItem('learnspace_demo_session');
          if (stored) {
            const parsed = JSON.parse(stored);
            if (parsed.user && parsed.profile) {
              // Ensure demo session never has admin role
              if (parsed.profile.role === 'admin') {
                parsed.profile.role = 'student';
              }
              setUser(parsed.user);
              setProfile(parsed.profile);
              setLoading(false);
              return;
            }
          }
        } catch (e) {
          console.warn('Could not read session from localStorage', e);
        }
        setUser(null);
        setProfile(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signIn = async (email: string, pass: string) => {
    const cleanEmail = email.trim().toLowerCase();
    const isOwnerAdmin = cleanEmail === BOOTSTRAP_ADMIN_EMAIL.toLowerCase();

    // Specific security check for Admin
    if (isOwnerAdmin) {
      if (pass !== BOOTSTRAP_ADMIN_PASS) {
        throw new Error('รหัสผ่านผู้ดูแลระบบไม่ถูกต้อง กรุณาใส่รหัสผ่านที่ถูกต้อง');
      }

      // Try Firebase authentication first
      try {
        await signInWithEmailAndPassword(auth, cleanEmail, pass);
        return;
      } catch (err: any) {
        console.warn('Firebase auth sign-in for admin failed, trying fallback creation or local admin session:', err);
        try {
          await createUserWithEmailAndPassword(auth, cleanEmail, pass);
          return;
        } catch (createErr) {
          // If Firebase operation is not allowed or failed, securely grant admin session locally
          const adminFirebaseUser = {
            uid: 'admin-bbak9988-owner',
            email: BOOTSTRAP_ADMIN_EMAIL,
            displayName: 'ผู้ดูแลระบบ (Bank)',
            photoURL: '',
            emailVerified: true,
          } as unknown as FirebaseUser;

          const adminProfile: UserProfile = {
            uid: 'admin-bbak9988-owner',
            email: BOOTSTRAP_ADMIN_EMAIL,
            displayName: 'ผู้ดูแลระบบ (Bank)',
            photoURL: '',
            role: 'admin',
            bio: 'ผู้ดูแลระบบหลัก LearnSpace (สิทธิ์เต็ม)',
            enrolledCourses: ['course-web-dev', 'course-data-ai'],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };

          setUser(adminFirebaseUser);
          setProfile(adminProfile);
          localStorage.setItem(
            'learnspace_admin_session',
            JSON.stringify({ user: adminFirebaseUser, profile: adminProfile })
          );
          localStorage.removeItem('learnspace_demo_session');
          return;
        }
      }
    }

    // Regular users sign in
    await signInWithEmailAndPassword(auth, cleanEmail, pass);
  };

  const signUp = async (email: string, pass: string, name: string, preferredRole: UserRole = 'student') => {
    const cleanEmail = email.trim().toLowerCase();
    const isOwnerAdmin = cleanEmail === BOOTSTRAP_ADMIN_EMAIL.toLowerCase();

    if (isOwnerAdmin && pass !== BOOTSTRAP_ADMIN_PASS) {
      throw new Error(`การสมัครบัญชีผู้ดูแลระบบจำเป็นต้องใช้รหัสผ่านที่กำหนด (${BOOTSTRAP_ADMIN_PASS})`);
    }

    const cred = await createUserWithEmailAndPassword(auth, cleanEmail, pass);
    if (name) {
      await firebaseUpdateProfile(cred.user, { displayName: name });
    }

    // Only owner email can ever be admin; normal signups are strictly student
    const finalRole: UserRole = isOwnerAdmin ? 'admin' : (preferredRole === 'teacher' ? 'teacher' : 'student');

    const userProfile: UserProfile = {
      uid: cred.user.uid,
      email: cred.user.email || cleanEmail,
      displayName: name || cleanEmail.split('@')[0],
      photoURL: '',
      role: finalRole,
      bio: isOwnerAdmin ? 'ผู้ดูแลระบบ LearnSpace' : (finalRole === 'teacher' ? 'อาจารย์ผู้สอน' : 'นักเรียนในระบบ LearnSpace'),
      enrolledCourses: ['course-web-dev'],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    try {
      await setDoc(doc(db, 'users', cred.user.uid), userProfile);
      setProfile(userProfile);
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `users/${cred.user.uid}`);
    }
  };

  const signInWithGoogleDirect = async (email: string, displayName?: string, photoURL?: string) => {
    const cleanEmail = email.trim().toLowerCase();
    const isOwnerAdmin = cleanEmail === BOOTSTRAP_ADMIN_EMAIL.toLowerCase();

    const mockUid = isOwnerAdmin ? 'admin-bbak9988-owner' : `google-user-${cleanEmail.replace(/[^a-zA-Z0-9]/g, '_')}`;
    const name = displayName || (isOwnerAdmin ? 'ผู้ดูแลระบบ (Bank)' : (cleanEmail.split('@')[0] || 'ผู้ใช้ Google'));
    const photo = photoURL || (isOwnerAdmin
      ? 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'
      : 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150');

    const googleUser = {
      uid: mockUid,
      email: cleanEmail,
      displayName: name,
      photoURL: photo,
      emailVerified: true,
      providerData: [
        {
          providerId: 'google.com',
          uid: mockUid,
          displayName: name,
          email: cleanEmail,
          photoURL: photo,
          phoneNumber: null,
        },
      ],
    } as unknown as FirebaseUser;

    const userProfile: UserProfile = {
      uid: mockUid,
      email: cleanEmail,
      displayName: name,
      photoURL: photo,
      role: isOwnerAdmin ? 'admin' : 'student',
      bio: isOwnerAdmin ? 'ผู้ดูแลระบบ LearnSpace (ยืนยันผ่านบัญชี Google)' : 'นักเรียนในระบบ LearnSpace (บัญชี Google)',
      enrolledCourses: ['course-web-dev', 'course-data-ai'],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setUser(googleUser);
    setProfile(userProfile);
    setSimulatedRole(null);

    if (isOwnerAdmin) {
      localStorage.setItem('learnspace_admin_session', JSON.stringify({ user: googleUser, profile: userProfile }));
      localStorage.removeItem('learnspace_demo_session');
      localStorage.removeItem('learnspace_google_session');
    } else {
      localStorage.setItem('learnspace_google_session', JSON.stringify({ user: googleUser, profile: userProfile }));
      localStorage.removeItem('learnspace_demo_session');
      localStorage.removeItem('learnspace_admin_session');
    }

    try {
      await setDoc(doc(db, 'users', mockUid), userProfile, { merge: true });
    } catch (e) {
      console.warn('Could not persist Google user to Firestore (working offline/preview mode):', e);
    }
  };

  const signInWithGoogle = async (directEmail?: string) => {
    if (directEmail) {
      await signInWithGoogleDirect(directEmail);
      return;
    }

    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: 'select_account' });
    try {
      const res = await signInWithPopup(auth, provider);
      if (res && res.user) {
        const isOwner = res.user.email?.toLowerCase() === BOOTSTRAP_ADMIN_EMAIL.toLowerCase();
        const profileData: UserProfile = {
          uid: res.user.uid,
          email: res.user.email || '',
          displayName: res.user.displayName || (res.user.email ? res.user.email.split('@')[0] : 'ผู้ใช้ Google'),
          photoURL: res.user.photoURL || '',
          role: isOwner ? 'admin' : 'student',
          bio: isOwner ? 'ผู้ดูแลระบบ LearnSpace (ยืนยันผ่าน Google)' : 'นักเรียนในระบบ LearnSpace',
          enrolledCourses: ['course-web-dev', 'course-data-ai'],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        setUser(res.user);
        setProfile(profileData);
        try {
          await setDoc(doc(db, 'users', res.user.uid), profileData, { merge: true });
        } catch (e) {
          console.warn('Could not write Google user profile to Firestore:', e);
        }
      }
    } catch (popupErr: any) {
      console.warn('Firebase signInWithPopup failed:', popupErr);
      throw popupErr;
    }
  };

  const demoSignIn = (targetRole: UserRole) => {
    // Admin demo is permanently disabled - admin must sign in with bbak9988@gmail.com and Bank4481
    if (targetRole === 'admin') {
      throw new Error('ไม่สามารถเข้าสู่ระบบผู้ดูแลระบบผ่านปุ่มทดลองได้ กรุณาใช้อีเมล bbak9988@gmail.com และรหัสผ่าน Bank4481 หรือเข้าด้วย Google');
    }

    let mockName = 'ธนกร (นักศึกษาตัวอย่าง)';
    let mockEmail = 'student.demo@learnspace.ac.th';
    let mockUid = 'demo-student-user';
    let mockBio = 'นักศึกษาทดลองระบบ LearnSpace';

    if (targetRole === 'teacher') {
      mockName = 'ผศ.ดร. สมชาย มั่นคง (อาจารย์ตัวอย่าง)';
      mockEmail = 'teacher.somchai@learnspace.ac.th';
      mockUid = 'demo-teacher-somchai';
      mockBio = 'อาจารย์ประจำภาควิชาวิทยาการคอมพิวเตอร์';
    }

    const demoFirebaseUser = {
      uid: mockUid,
      email: mockEmail,
      displayName: mockName,
      photoURL: '',
      emailVerified: true,
    } as unknown as FirebaseUser;

    const demoProfile: UserProfile = {
      uid: mockUid,
      email: mockEmail,
      displayName: mockName,
      photoURL: '',
      role: targetRole === 'teacher' ? 'teacher' : 'student',
      bio: mockBio,
      enrolledCourses: ['course-web-dev', 'course-data-ai'],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setUser(demoFirebaseUser);
    setProfile(demoProfile);
    setSimulatedRole(null);

    try {
      localStorage.removeItem('learnspace_admin_session');
      localStorage.removeItem('learnspace_google_session');
      localStorage.setItem(
        'learnspace_demo_session',
        JSON.stringify({ user: demoFirebaseUser, profile: demoProfile })
      );
    } catch (e) {
      console.warn('Could not persist demo session to localStorage', e);
    }
  };

  const sendPasswordReset = async (email: string) => {
    await sendPasswordResetEmail(auth, email);
  };

  const signOut = async () => {
    setUser(null);
    setProfile(null);
    setSimulatedRole(null);
    try {
      localStorage.removeItem('learnspace_demo_session');
      localStorage.removeItem('learnspace_admin_session');
      localStorage.removeItem('learnspace_google_session');
    } catch (e) {
      // ignore
    }
    try {
      await firebaseSignOut(auth);
    } catch (e) {
      // ignore
    }
  };

  const updateUserProfile = async (data: Partial<UserProfile>) => {
    if (!user || !profile) return;
    const updated = {
      ...profile,
      ...data,
      updatedAt: new Date().toISOString(),
    };
    setProfile(updated);

    if (user.uid.startsWith('demo-') || user.uid.startsWith('admin-bbak9988')) {
      return; // local user doesn't write directly to firestore if offline
    }

    try {
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, {
        ...data,
        updatedAt: serverTimestamp(),
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `users/${user.uid}`);
    }
  };

  // STRICT ACCESS CONTROL: Only user with email bbak9988@gmail.com can be Admin
  const isActualAdmin = Boolean(user && user.email?.toLowerCase() === BOOTSTRAP_ADMIN_EMAIL.toLowerCase());
  const isAdmin = isActualAdmin && (simulatedRole ? simulatedRole === 'admin' : true);
  const isTeacher = (!isAdmin && (profile?.role === 'teacher' || simulatedRole === 'teacher'));
  const isStudent = !isAdmin && !isTeacher;
  const effectiveRole: UserRole = isAdmin ? 'admin' : (isTeacher ? 'teacher' : 'student');

  const handleSetSimulatedRole = (newRole: UserRole | null) => {
    // Only the actual owner admin can toggle simulated view to test student perspective
    if (!isActualAdmin) {
      return;
    }
    setSimulatedRole(newRole);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        loading,
        role: effectiveRole,
        isAdmin,
        isTeacher,
        isStudent,
        signIn,
        signUp,
        signInWithGoogle,
        signInWithGoogleDirect,
        demoSignIn,
        sendPasswordReset,
        signOut,
        updateUserProfile,
        setSimulatedRole: handleSetSimulatedRole,
        simulatedRole,
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
