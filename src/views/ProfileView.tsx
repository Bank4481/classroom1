import React, { useState } from 'react';
import {
  User as UserIcon,
  Mail,
  Shield,
  Save,
  CheckCircle,
  AlertCircle,
  BookOpen,
  Lock,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import type { Course } from '../types';

interface ProfileViewProps {
  courses: Course[];
  onNavigate: (view: string) => void;
}

export const ProfileView: React.FC<ProfileViewProps> = ({ courses, onNavigate }) => {
  const { user, profile, role, updateUserProfile, sendPasswordReset } = useAuth();
  const [displayName, setDisplayName] = useState(profile?.displayName || '');
  const [bio, setBio] = useState(profile?.bio || '');
  const [photoURL, setPhotoURL] = useState(profile?.photoURL || '');
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(
    null
  );

  if (!user) {
    return (
      <div className="max-w-md mx-auto my-16 p-8 bg-white rounded-2xl border text-center">
        <p className="text-sm text-slate-500">กรุณาเข้าสู่ระบบเพื่อแก้ไขโปรไฟล์</p>
      </div>
    );
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setFeedback(null);
    try {
      await updateUserProfile({
        displayName: displayName.trim(),
        bio: bio.trim(),
        photoURL: photoURL.trim(),
      });
      setFeedback({ type: 'success', message: 'บันทึกข้อมูลส่วนตัวเรียบร้อยแล้ว' });
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message || 'บันทึกไม่สำเร็จ' });
    } finally {
      setSaving(false);
    }
  };

  const handleResetPassword = async () => {
    if (!user.email) return;
    try {
      await sendPasswordReset(user.email);
      setFeedback({
        type: 'success',
        message: 'ส่งลิงก์รีเซ็ตรหัสผ่านไปยังอีเมลของคุณเรียบร้อยแล้ว',
      });
    } catch (err: any) {
      setFeedback({ type: 'error', message: 'ส่งลิงก์ไม่สำเร็จ กรุณาลองใหม่' });
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      <div className="border-b border-slate-200 pb-4">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          การตั้งค่าบัญชีและข้อมูลส่วนตัว
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 mt-1">
          จัดการข้อมูลที่แสดงต่ออาจารย์และเพื่อนร่วมชั้นในระบบ LearnSpace
        </p>
      </div>

      {feedback && (
        <div
          className={`p-4 rounded-xl text-xs flex items-center gap-2 ${
            feedback.type === 'success'
              ? 'bg-emerald-50 border border-emerald-200 text-emerald-800'
              : 'bg-rose-50 border border-rose-200 text-rose-800'
          }`}
        >
          {feedback.type === 'success' ? (
            <CheckCircle className="w-4 h-4 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 shrink-0" />
          )}
          <span>{feedback.message}</span>
        </div>
      )}

      <form onSubmit={handleSave} className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm space-y-6">
        
        {/* Avatar Preview */}
        <div className="flex items-center gap-4 pb-6 border-b border-slate-100">
          <div className="w-16 h-16 rounded-2xl bg-amber-500 text-slate-950 flex items-center justify-center font-bold text-2xl shadow-md">
            {displayName ? displayName.charAt(0).toUpperCase() : 'U'}
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900">{displayName || user.email}</h3>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-100 text-amber-900 uppercase">
                {role}
              </span>
              <span className="text-xs text-slate-400">{user.email}</span>
            </div>
          </div>
        </div>

        {/* Display Name */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            ชื่อ-นามสกุล หรือชื่อแสดงผลในระบบ
          </label>
          <input
            type="text"
            required
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            className="w-full p-2.5 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
          />
        </div>

        {/* Bio */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            คำแนะนำตัว หรือเป้าหมายการเรียนรู้ (Bio)
          </label>
          <textarea
            rows={3}
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            placeholder="เช่น สนใจด้านการพัฒนา Web Full-Stack และ AI กำลังศึกษาปีที่ 3..."
            className="w-full p-2.5 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
          />
        </div>

        {/* Role Information (Read-only for security) */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            บทบาทการใช้งาน (Role)
          </label>
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 flex items-center justify-between">
            <span className="capitalize font-semibold text-slate-900">
              {role === 'admin' ? 'ผู้ดูแลระบบ (Admin)' : role === 'teacher' ? 'อาจารย์ผู้สอน (Teacher)' : 'นักเรียน / นักศึกษา (Student)'}
            </span>
            <span className="text-[11px] text-slate-400">
              * สิทธิ์ได้รับการคุ้มครองด้วย Zero-Trust Rules
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-4">
          <button
            type="button"
            onClick={handleResetPassword}
            className="py-2.5 px-4 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-colors"
          >
            <Lock className="w-3.5 h-3.5" />
            <span>เปลี่ยนรหัสผ่าน (ส่งอีเมลรีเซ็ต)</span>
          </button>

          <button
            type="submit"
            disabled={saving}
            className="py-2.5 px-6 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl text-xs flex items-center gap-2 shadow-sm transition-colors disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'กำลังบันทึก...' : 'บันทึกการเปลี่ยนแปลง'}</span>
          </button>
        </div>
      </form>

    </div>
  );
};
