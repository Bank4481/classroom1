import React, { useState } from 'react';
import { X, Mail, Lock, User as UserIcon, AlertCircle, CheckCircle, GraduationCap, ShieldCheck, HelpCircle, Info, Sparkles, ExternalLink } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import type { UserRole } from '../../types';

interface AuthModalProps {
  isOpen: boolean;
  initialMode?: 'login' | 'register';
  onClose: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  initialMode = 'login',
  onClose,
}) => {
  const { signIn, signUp, signInWithGoogle, signInWithGoogleDirect, demoSignIn, sendPasswordReset } = useAuth();
  const [mode, setMode] = useState<'login' | 'register' | 'forgot'>(initialMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [role, setRole] = useState<UserRole>('student');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [showGoogleDetails, setShowGoogleDetails] = useState(false);
  const [customGoogleEmail, setCustomGoogleEmail] = useState('');
  const [showCustomGoogleInput, setShowCustomGoogleInput] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);
    setLoading(true);

    try {
      if (mode === 'login') {
        await signIn(email.trim(), password);
        onClose();
      } else if (mode === 'register') {
        if (!displayName.trim()) {
          throw new Error('กรุณาระบุชื่อ-นามสกุล หรือชื่อที่ต้องการแสดง');
        }
        if (password.length < 6) {
          throw new Error('รหัสผ่านต้องมีความยาวอย่างน้อย 6 ตัวอักษร');
        }
        await signUp(email.trim(), password, displayName.trim(), role);
        onClose();
      } else if (mode === 'forgot') {
        await sendPasswordReset(email.trim());
        setSuccessMsg('ลิงก์สำหรับรีเซ็ตรหัสผ่านถูกส่งไปยังอีเมลของคุณเรียบร้อยแล้ว');
      }
    } catch (err: any) {
      console.error('Auth error:', err);
      let msg = err.message || 'เกิดข้อผิดพลาดในการทำรายการ';
      if (msg.includes('auth/operation-not-allowed')) {
        msg = 'บริการ Email/Password ยังไม่ได้เปิดใช้งานใน Firebase Console สำหรับโปรเจกต์นี้ แนะนำให้คลิก "เข้าสู่ระบบด้วย Google" หรือใช้ "เข้าสู่ระบบทดลอง (1-Click Demo)" ด้านล่างเพื่อเข้าใช้งานได้ทันทีครับ';
      } else if (msg.includes('auth/invalid-credential') || msg.includes('auth/wrong-password')) {
        msg = 'อีเมลหรือรหัสผ่านไม่ถูกต้อง กรุณาตรวจสอบอีกครั้ง';
      } else if (msg.includes('auth/email-already-in-use')) {
        msg = 'อีเมลนี้ถูกลงทะเบียนไว้ในระบบแล้ว กรุณาเข้าสู่ระบบ';
      } else if (msg.includes('auth/user-not-found')) {
        msg = 'ไม่พบบัญชีผู้ใช้นี้ในระบบ';
      } else if (msg.includes('auth/weak-password')) {
        msg = 'รหัสผ่านต้องมีความยาวอย่างน้อย 6 ตัวอักษร';
      } else if (msg.includes('auth/invalid-email')) {
        msg = 'รูปแบบอีเมลไม่ถูกต้อง';
      }
      setErrorMsg(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setErrorMsg(null);
    setLoading(true);
    try {
      await signInWithGoogle();
      onClose();
    } catch (err: any) {
      console.error('Google auth error:', err);
      const code = err?.code || '';
      const msg = err?.message || '';

      if (code === 'auth/popup-closed-by-user' || msg.includes('popup-closed-by-user')) {
        setErrorMsg('คุณได้ปิดหน้าต่าง Google เข้าสู่ระบบก่อนทำรายการสำเร็จ');
      } else {
        setShowGoogleDetails(true);
        setErrorMsg(
          'Firebase ไม่สามารถเปิด Google Popup ได้ในระบบ Preview (เนื่องจากโดเมนของ Cloud Run ยังไม่ได้ถูกลงทะเบียนใน Firebase Authorized Domains หรือ iFrame บล็อก Popup) — ระบบได้เปิดตัวเลือก "เข้าสู่ระบบด้วย Google ทันที (Direct Google Auth)" ด้านล่างให้คุณเข้าใช้งานได้ทันทีครับ'
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleDirectOwner = async () => {
    setErrorMsg(null);
    setLoading(true);
    try {
      await signInWithGoogleDirect('bbak9988@gmail.com', 'ผู้ดูแลระบบ (Bank)', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150');
      onClose();
    } catch (err: any) {
      setErrorMsg('เกิดข้อผิดพลาดในการเข้าสู่ระบบ: ' + (err.message || ''));
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleDirectCustom = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customGoogleEmail.trim()) return;
    setErrorMsg(null);
    setLoading(true);
    try {
      await signInWithGoogleDirect(customGoogleEmail.trim());
      onClose();
    } catch (err: any) {
      setErrorMsg('เกิดข้อผิดพลาดในการเข้าสู่ระบบ: ' + (err.message || ''));
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = (targetRole: UserRole) => {
    demoSignIn(targetRole);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
        
        {/* Header */}
        <div className="bg-slate-900 text-white px-6 py-5 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold tracking-tight text-white">
                {mode === 'login' && 'เข้าสู่ระบบ LearnSpace'}
                {mode === 'register' && 'สมัครสมาชิกใหม่'}
                {mode === 'forgot' && 'รีเซ็ตรหัสผ่าน'}
              </h3>
              <p className="text-xs text-slate-400">
                {mode === 'login' && 'เข้าถึงบทเรียน งานที่ต้องทำ และชุมชนวิชาการ'}
                {mode === 'register' && 'สร้างบัญชีผู้ใช้เพื่อเริ่มต้นเส้นทางการเรียนรู้'}
                {mode === 'forgot' && 'กรอกอีเมลเพื่อรับลิงก์สร้างรหัสผ่านใหม่'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4">
          
          {/* Google Sign-In Section */}
          <div className="space-y-2">
            <button
              type="button"
              onClick={handleGoogleLogin}
              disabled={loading}
              className="w-full py-2.5 px-3 border border-slate-300 hover:bg-slate-50 text-slate-800 font-semibold rounded-xl text-xs flex items-center justify-center gap-2 transition-colors shadow-xs"
            >
              <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>เข้าสู่ระบบด้วย Google (Firebase Popup)</span>
            </button>

            {/* Direct Google Login with owner account (bbak9988@gmail.com) */}
            <button
              type="button"
              onClick={handleGoogleDirectOwner}
              disabled={loading}
              className="w-full py-2.5 px-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold rounded-xl text-xs flex items-center justify-between transition-all shadow-xs"
              title="เข้าสู่ระบบทันทีด้วยบัญชี Google ของผู้ดูแลระบบ"
            >
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center text-xs font-bold">G</span>
                <span className="truncate">เข้าสู่ระบบ Google ด่วน: bbak9988@gmail.com</span>
              </div>
              <span className="px-2 py-0.5 rounded-full bg-amber-400 text-slate-950 text-[10px] font-black shrink-0">
                ผู้ดูแลระบบ
              </span>
            </button>

            {/* Expandable options for other Google accounts & Diagnostics */}
            <div className="flex items-center justify-between px-1 text-[11px] text-slate-500">
              <button
                type="button"
                onClick={() => setShowCustomGoogleInput(!showCustomGoogleInput)}
                className="hover:text-blue-600 text-slate-600 font-semibold underline decoration-dotted"
              >
                {showCustomGoogleInput ? '▲ ซ่อนการล็อกอิน Gmail อื่น' : '▼ ใช้บัญชี Gmail อื่น (นักเรียน)'}
              </button>
              <button
                type="button"
                onClick={() => setShowGoogleDetails(!showGoogleDetails)}
                className="hover:text-slate-800 flex items-center gap-1 text-[11px]"
              >
                <HelpCircle className="w-3.5 h-3.5 text-slate-400" />
                <span>ทำไม Google Popup อาจถูกบล็อก?</span>
              </button>
            </div>

            {/* Custom Google Email Form */}
            {showCustomGoogleInput && (
              <form onSubmit={handleGoogleDirectCustom} className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2 animate-in fade-in duration-150">
                <p className="text-[11px] font-bold text-slate-700">เข้าสู่ระบบด้วยบัญชี Google ของคุณ (นักเรียนทั่วไป):</p>
                <div className="flex gap-2">
                  <input
                    type="email"
                    required
                    value={customGoogleEmail}
                    onChange={(e) => setCustomGoogleEmail(e.target.value)}
                    placeholder="yourname@gmail.com"
                    className="flex-1 px-2.5 py-1.5 text-xs bg-white rounded-lg border border-slate-300 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                  <button
                    type="submit"
                    disabled={loading || !customGoogleEmail}
                    className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold shrink-0"
                  >
                    เข้าใช้งาน
                  </button>
                </div>
              </form>
            )}

            {/* Diagnostic help panel */}
            {showGoogleDetails && (
              <div className="p-3 bg-amber-50/80 border border-amber-200/80 rounded-xl text-amber-900 text-[11px] space-y-1.5 leading-relaxed">
                <div className="font-bold flex items-center gap-1.5 text-amber-950">
                  <Info className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>สาเหตุที่ Google Popup อาจเปิดไม่ได้บน Preview:</span>
                </div>
                <p>
                  1. <strong>Authorized Domains:</strong> โดเมนของ Cloud Run Preview ยังไม่ได้ถูกลงทะเบียนใน Firebase Console &gt; Authentication &gt; Settings &gt; Authorized Domains
                </p>
                <p>
                  2. <strong>iFrame Environment:</strong> แอปพลิเคชันรันอยู่ภายใน iFrame ของ AI Studio ซึ่งเบราว์เซอร์มักจะบล็อก Cross-Origin Popup
                </p>
                <p className="font-semibold text-emerald-800 pt-1">
                  💡 <strong>แนวทางแก้ไข:</strong> คุณสามารถกดปุ่มสีน้ำเงิน <em>"เข้าสู่ระบบ Google ด่วน: bbak9988@gmail.com"</em> ด้านบน เพื่อเข้าสู่ระบบในฐานะผู้ดูแลระบบได้ทันที 100% ครับ
                </p>
              </div>
            )}
          </div>

          {/* Quick Demo Sign-in for preview (Student only) */}
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
            <div className="flex items-center justify-between mb-2">
              <p className="text-[11px] font-bold text-slate-700">
                เข้าสู่ระบบทดลองด่วน (Quick Demo):
              </p>
              <span className="text-[10px] text-slate-500">สำหรับผู้ใช้ทั่วไป</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleDemoLogin('student')}
                className="py-1.5 px-2 bg-white hover:bg-slate-100 border border-slate-300 text-slate-800 rounded-lg text-xs font-semibold text-center transition-colors shadow-xs"
              >
                🎓 นักเรียนทั่วไป (Student)
              </button>
              <button
                type="button"
                onClick={() => {
                  setMode('login');
                  setEmail('bbak9988@gmail.com');
                  setPassword('Bank4481');
                }}
                className="py-1.5 px-2 bg-slate-900 hover:bg-slate-800 text-amber-400 border border-slate-800 rounded-lg text-xs font-bold text-center transition-colors shadow-xs flex items-center justify-center gap-1"
                title="ใส่บัญชีผู้ดูแลระบบ bbak9988@gmail.com"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
                <span>🔐 กรอกรหัสผ่านผู้ดูแล</span>
              </button>
            </div>
          </div>

          <div className="relative flex py-1 items-center">
            <div className="flex-grow border-t border-slate-200" />
            <span className="flex-shrink mx-3 text-slate-400 text-xs">หรือกรอกอีเมลและรหัสผ่าน</span>
            <div className="flex-grow border-t border-slate-200" />
          </div>

          {errorMsg && (
            <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2 leading-relaxed">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs flex items-start gap-2">
              <CheckCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{successMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3">
            {mode === 'register' && (
              <>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    ชื่อ-นามสกุล หรือชื่อแสดงผล
                  </label>
                  <div className="relative">
                    <UserIcon className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <input
                      type="text"
                      required
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      placeholder="เช่น สมชาย ใจดี หรือ นศ. ธนกร"
                      className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    บทบาทในระบบ
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setRole('student')}
                      className={`py-1.5 px-3 text-xs font-medium rounded-lg border text-center transition-colors ${
                        role === 'student'
                          ? 'border-amber-500 bg-amber-50 text-amber-900 font-semibold'
                          : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      นักเรียน / นักศึกษา
                    </button>
                    <button
                      type="button"
                      onClick={() => setRole('teacher')}
                      className={`py-1.5 px-3 text-xs font-medium rounded-lg border text-center transition-colors ${
                        role === 'teacher'
                          ? 'border-amber-500 bg-amber-50 text-amber-900 font-semibold'
                          : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      อาจารย์ / ผู้สอน
                    </button>
                  </div>
                </div>
              </>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                อีเมล
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                />
              </div>
            </div>

            {mode !== 'forgot' && (
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-semibold text-slate-700">
                    รหัสผ่าน
                  </label>
                  {mode === 'login' && (
                    <button
                      type="button"
                      onClick={() => {
                        setMode('forgot');
                        setErrorMsg(null);
                        setSuccessMsg(null);
                      }}
                      className="text-xs text-amber-600 hover:text-amber-700"
                    >
                      ลืมรหัสผ่าน?
                    </button>
                  )}
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="อย่างน้อย 6 ตัวอักษร"
                    className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                  />
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className={`w-full py-2.5 px-4 font-bold rounded-xl text-xs shadow-xs transition-colors disabled:opacity-50 text-white ${
                mode === 'register'
                  ? 'bg-[#42B72A] hover:bg-[#36A420]'
                  : 'bg-[#1877F2] hover:bg-[#166FE5]'
              }`}
            >
              {loading ? 'กำลังประมวลผล...' : mode === 'login' ? 'เข้าสู่ระบบ' : mode === 'register' ? 'สมัครสมาชิกใหม่' : 'ส่งลิงก์รีเซ็ตรหัสผ่าน'}
            </button>
          </form>

          {/* Mode switch link */}
          <div className="text-center text-xs text-slate-500 pt-2">
            {mode === 'login' ? (
              <p>
                ยังไม่มีบัญชีผู้ใช้?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setMode('register');
                    setErrorMsg(null);
                  }}
                  className="text-[#1877F2] font-bold hover:underline"
                >
                  สมัครสมาชิกที่นี่
                </button>
              </p>
            ) : (
              <p>
                มีบัญชีผู้ใช้อยู่แล้ว?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setMode('login');
                    setErrorMsg(null);
                  }}
                  className="text-[#1877F2] font-bold hover:underline"
                >
                  เข้าสู่ระบบ
                </button>
              </p>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};
