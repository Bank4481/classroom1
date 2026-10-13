import React, { useState } from 'react';
import { X, KeyRound, CheckCircle, AlertCircle, ArrowRight, BookOpen, Sparkles } from 'lucide-react';
import type { Course } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { db } from '../../lib/firebase';
import { doc, updateDoc, arrayUnion } from 'firebase/firestore';

interface JoinClassModalProps {
  isOpen: boolean;
  onClose: () => void;
  courses: Course[];
  onCourseJoined: (course: Course) => void;
  onOpenAuth: () => void;
}

export const JoinClassModal: React.FC<JoinClassModalProps> = ({
  isOpen,
  onClose,
  courses,
  onCourseJoined,
  onOpenAuth,
}) => {
  const { user, profile, updateUserProfile } = useAuth();
  const [code, setCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [successCourse, setSuccessCourse] = useState<Course | null>(null);
  const [joining, setJoining] = useState(false);

  if (!isOpen) return null;

  const handleJoin = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setError(null);
    const cleanCode = code.trim().toUpperCase();

    if (!cleanCode) {
      setError('กรุณากรอกรหัสชั้นเรียน');
      return;
    }

    if (!user) {
      onOpenAuth();
      return;
    }

    // Find course by joinCode, courseCode, or id
    const matched = courses.find(
      (c) =>
        (c.joinCode && c.joinCode.toUpperCase() === cleanCode) ||
        (c.courseCode && c.courseCode.toUpperCase() === cleanCode) ||
        c.id.toUpperCase() === cleanCode
    );

    if (!matched) {
      setError(`ไม่พบห้องเรียนที่มีรหัส "${cleanCode}" กรุณาตรวจสอบรหัสจากครูผู้สอนอีกครั้ง`);
      return;
    }

    setJoining(true);
    try {
      const currentList = profile?.enrolledCourses || [];
      if (!currentList.includes(matched.id)) {
        await updateUserProfile({
          enrolledCourses: [...currentList, matched.id],
        });

        // Also update Firestore directly
        try {
          const userDocRef = doc(db, 'users', user.uid);
          await updateDoc(userDocRef, {
            enrolledCourses: arrayUnion(matched.id),
          });
        } catch {
          // Fallback handled in local profile state
        }
      }

      setSuccessCourse(matched);
      setTimeout(() => {
        onCourseJoined(matched);
        onClose();
        setCode('');
        setSuccessCourse(null);
      }, 1200);
    } catch (err: any) {
      setError(err?.message || 'เกิดข้อผิดพลาดในการเข้าร่วมชั้นเรียน');
    } finally {
      setJoining(false);
    }
  };

  const handleQuickCode = (sampleCode: string) => {
    setCode(sampleCode);
    setError(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden relative">
        {/* Header */}
        <div className="p-6 bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 text-white relative">
          <button
            onClick={onClose}
            className="absolute top-5 right-5 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center">
              <KeyRound className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <h2 className="text-xl font-bold tracking-tight">เข้าร่วมชั้นเรียน</h2>
              <p className="text-xs text-blue-100">ระบบห้องเรียนออนไลน์ Google Classroom Style</p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5">
          {successCourse ? (
            <div className="text-center py-6 space-y-3 animate-in zoom-in-95 duration-200">
              <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">เข้าร่วมชั้นเรียนสำเร็จ!</h3>
              <p className="text-sm text-slate-600 font-medium">
                {successCourse.title} ({successCourse.courseCode || successCourse.joinCode})
              </p>
              <p className="text-xs text-slate-400">กำลังนำคุณเข้าสู่หน้าสตรีมของห้องเรียน...</p>
            </div>
          ) : (
            <form onSubmit={handleJoin} className="space-y-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700">
                  รหัสชั้นเรียน (Class Code)
                </label>
                <div className="relative">
                  <KeyRound className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                  <input
                    type="text"
                    value={code}
                    onChange={(e) => setCode(e.target.value.toUpperCase())}
                    placeholder="เช่น LS-201WEB หรือ CS-201"
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-300 text-sm font-mono uppercase tracking-wider font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
                    autoFocus
                  />
                </div>
                <p className="text-[11px] text-slate-500">
                  ขอรหัสชั้นเรียน 6–8 ตัวอักษรจากครูผู้สอน แล้วนำมากรอกที่นี่
                </p>
              </div>

              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              {/* Quick sample codes for demo */}
              <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-100 space-y-2">
                <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-600">
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  <span>หรือคลิกเลือกรหัสห้องเรียนตัวอย่างในระบบ:</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {courses.slice(0, 3).map((c) => (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => handleQuickCode(c.joinCode || c.courseCode || c.id)}
                      className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 hover:border-blue-500 text-slate-700 hover:text-blue-600 text-xs font-mono font-bold transition-all shadow-xs"
                    >
                      {c.joinCode || c.courseCode || c.id}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-50 text-xs font-semibold transition-colors"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  disabled={joining || !code.trim()}
                  className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-colors flex items-center gap-2 shadow-md shadow-blue-600/20 disabled:opacity-50"
                >
                  {joining ? (
                    'กำลังเข้าร่วม...'
                  ) : (
                    <>
                      <span>เข้าร่วมห้องเรียน</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
