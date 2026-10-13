import React, { useState } from 'react';
import { X, Plus, BookOpen, Sparkles, Check, AlertCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { db } from '../../lib/firebase';
import { collection, addDoc } from 'firebase/firestore';
import type { Course } from '../../types';

interface CreateClassModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCourseCreated: (course: Course) => void;
  onOpenAuth: () => void;
}

export const CreateClassModal: React.FC<CreateClassModalProps> = ({
  isOpen,
  onClose,
  onCourseCreated,
  onOpenAuth,
}) => {
  const { user, profile, isAdmin } = useAuth();

  const [title, setTitle] = useState('');
  const [section, setSection] = useState('');
  const [subject, setSubject] = useState('');
  const [room, setRoom] = useState('');
  const [courseCode, setCourseCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!user) {
      onOpenAuth();
      return;
    }

    if (!title.trim()) {
      setError('กรุณากรอกชื่อชั้นเรียน');
      return;
    }

    setLoading(true);
    try {
      const randomCode = Math.random().toString(36).substring(2, 8).toUpperCase();
      const generatedJoinCode = `LS-${randomCode}`;
      const finalCourseCode = courseCode.trim() || `CS-${Math.floor(100 + Math.random() * 899)}`;

      const slug = title.trim().toLowerCase().replace(/\s+/g, '-') + '-' + Math.floor(100 + Math.random() * 899);

      const newCourseData: Omit<Course, 'id'> = {
        title: title.trim(),
        slug,
        description: `${subject || title.trim()} ห้องเรียนออนไลน์ Google Classroom Style สำหรับการเรียนการสอนและส่งงาน`,
        instructorId: user.uid,
        instructorName: profile?.displayName || user.email || 'อาจารย์ผู้สอน',
        category: subject.trim() || 'วิทยาการคอมพิวเตอร์',
        level: 'beginner',
        coverImage:
          'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800&auto=format&fit=crop&q=80',
        courseCode: finalCourseCode,
        joinCode: generatedJoinCode,
        term: section.trim() || 'ภาคเรียนที่ 1/2569',
        room: room.trim() || 'ห้องเรียนออนไลน์ Google Classroom',
        totalLessons: 0,
        createdAt: new Date().toISOString(),
        published: true,
      };

      const docRef = await addDoc(collection(db, 'courses'), newCourseData);
      const created: Course = {
        id: docRef.id,
        ...newCourseData,
      };

      onCourseCreated(created);
      onClose();
      // Reset form
      setTitle('');
      setSection('');
      setSubject('');
      setRoom('');
      setCourseCode('');
    } catch (err: any) {
      setError(err?.message || 'เกิดข้อผิดพลาดในการสร้างห้องเรียน');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-[#dadce0] overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#dadce0]">
          <h2 className="text-lg font-semibold text-[#202124]">สร้างชั้นเรียน</h2>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full flex items-center justify-center text-[#5f6368] hover:bg-[#f1f3f4] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-[#5f6368] mb-1">
              ชื่อชั้นเรียน (ต้องระบุ) <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="เช่น วิทยาการคอมพิวเตอร์และเว็บแอปพลิเคชัน"
              required
              autoFocus
              className="w-full px-4 py-2.5 rounded-lg border border-[#dadce0] focus:border-[#1967d2] focus:ring-2 focus:ring-[#1967d2]/20 text-sm text-[#202124] transition-all outline-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#5f6368] mb-1">
                ตอนเรียน / ภาคเรียน (Section)
              </label>
              <input
                type="text"
                value={section}
                onChange={(e) => setSection(e.target.value)}
                placeholder="เช่น ภาคเรียนที่ 1/2569 ตอนที่ 1"
                className="w-full px-4 py-2.5 rounded-lg border border-[#dadce0] focus:border-[#1967d2] focus:ring-2 focus:ring-[#1967d2]/20 text-sm text-[#202124] transition-all outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#5f6368] mb-1">
                รหัสวิชา (Course Code)
              </label>
              <input
                type="text"
                value={courseCode}
                onChange={(e) => setCourseCode(e.target.value.toUpperCase())}
                placeholder="เช่น CS-201 หรือ WEB-101"
                className="w-full px-4 py-2.5 rounded-lg border border-[#dadce0] focus:border-[#1967d2] focus:ring-2 focus:ring-[#1967d2]/20 text-sm text-[#202124] uppercase font-mono transition-all outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#5f6368] mb-1">
                เรื่อง / หมวดหมู่ (Subject)
              </label>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="เช่น วิทยาการคอมพิวเตอร์, AI"
                className="w-full px-4 py-2.5 rounded-lg border border-[#dadce0] focus:border-[#1967d2] focus:ring-2 focus:ring-[#1967d2]/20 text-sm text-[#202124] transition-all outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#5f6368] mb-1">
                ห้อง (Room)
              </label>
              <input
                type="text"
                value={room}
                onChange={(e) => setRoom(e.target.value)}
                placeholder="เช่น ห้องปฏิบัติการคอมพิวเตอร์ 402"
                className="w-full px-4 py-2.5 rounded-lg border border-[#dadce0] focus:border-[#1967d2] focus:ring-2 focus:ring-[#1967d2]/20 text-sm text-[#202124] transition-all outline-none"
              />
            </div>
          </div>

          <div className="p-3 bg-[#f8f9fa] rounded-xl border border-[#dadce0] text-xs text-[#5f6368] flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>
              ระบบจะสร้างรหัสเข้าร่วมห้องเรียน (Class Code) และโฟลเดอร์สำหรับส่งงานให้อัตโนมัติ
            </span>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-3">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-5 py-2 rounded-md text-xs font-medium text-[#1967d2] hover:bg-[#e8f0fe] transition-colors"
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              disabled={loading || !title.trim()}
              className="px-6 py-2 rounded-md bg-[#1967d2] hover:bg-[#185abc] text-white text-xs font-semibold shadow-xs transition-colors disabled:opacity-50"
            >
              {loading ? 'กำลังสร้าง...' : 'สร้าง'}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
