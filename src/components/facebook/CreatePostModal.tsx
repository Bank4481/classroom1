import React, { useState } from 'react';
import {
  X,
  Globe,
  Lock,
  Smile,
  Image as ImageIcon,
  Tag,
  Sparkles,
  BookOpen,
  HelpCircle,
  Megaphone,
  Award,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { db, handleFirestoreError, OperationType } from '../../lib/firebase';
import { collection, addDoc } from 'firebase/firestore';
import type { Course } from '../../types';

interface CreatePostModalProps {
  isOpen: boolean;
  onClose: () => void;
  courses: Course[];
  onPostCreated?: () => void;
}

export const CreatePostModal: React.FC<CreatePostModalProps> = ({
  isOpen,
  onClose,
  courses,
  onPostCreated,
}) => {
  const { user, profile, role } = useAuth();
  const [content, setContent] = useState('');
  const [category, setCategory] = useState<'announcement' | 'question' | 'note' | 'achievement'>('question');
  const [selectedCourseId, setSelectedCourseId] = useState<string>('');
  const [audience, setAudience] = useState<'public' | 'course'>('public');
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen) return null;

  const categories = [
    { id: 'question', label: '❓ ถามปัญหาการเรียน', desc: 'ขอคำแนะนำหรือถามข้อสงสัย' },
    { id: 'note', label: '💡 สรุปบทเรียน & ทริก', desc: 'แชร์ความรู้หรือโค้ดย่อ' },
    { id: 'achievement', label: '🎉 แชร์ความสำเร็จ', desc: 'ผ่านควิซ ส่งงาน หรือเรียนจบ' },
    { id: 'announcement', label: '📢 ประกาศทางการ', desc: 'แจ้งข่าวสารสำคัญในชั้นเรียน' },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() || !user) return;

    setSubmitting(true);
    try {
      const selectedCourse = courses.find((c) => c.id === selectedCourseId);
      const titlePrefix =
        category === 'announcement'
          ? '📢 [ประกาศ] '
          : category === 'note'
          ? '💡 [สรุปบทเรียน] '
          : category === 'achievement'
          ? '🎉 [ความสำเร็จ] '
          : '❓ [คำถาม] ';

      const title = titlePrefix + content.slice(0, 50).replace(/\n/g, ' ');

      await addDoc(collection(db, 'discussions'), {
        courseId: selectedCourseId || 'general',
        courseTitle: selectedCourse?.title || 'ฟีดการเรียนรู้ทั่วไป',
        title: title,
        content: content.trim(),
        authorId: user.uid,
        authorName: profile?.displayName || user.email?.split('@')[0] || 'ผู้เรียน LearnSpace',
        authorRole: role || 'student',
        replyCount: 0,
        isSolved: false,
        isPinned: category === 'announcement',
        createdAt: new Date().toISOString(),
      });

      setContent('');
      onClose();
      if (onPostCreated) onPostCreated();
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, 'discussions');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Facebook Style Modal Header */}
        <div className="relative px-5 py-4 border-b border-slate-200 text-center">
          <h2 className="text-base sm:text-lg font-bold text-slate-900">
            สร้างโพสต์ใน LearnSpace
          </h2>
          <button
            onClick={onClose}
            className="absolute right-4 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-[#E4E6EB] hover:bg-[#D8DADF] flex items-center justify-center text-slate-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="flex-1 p-5 overflow-y-auto space-y-4">
          
          {/* Author Profile Row */}
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-full bg-gradient-to-tr from-[#1877F2] to-sky-400 text-white flex items-center justify-center font-bold text-base shadow-xs">
              {profile?.displayName ? profile.displayName.charAt(0).toUpperCase() : 'U'}
            </div>
            <div>
              <p className="text-sm font-bold text-slate-900 leading-tight">
                {profile?.displayName || user?.email?.split('@')[0] || 'ผู้ใช้งาน'}
              </p>
              
              {/* Audience Pill */}
              <div className="mt-1 flex items-center gap-2">
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold bg-[#E4E6EB] text-slate-800 px-2 py-0.5 rounded-md">
                  <Globe className="w-3 h-3 text-slate-600" />
                  <span>สาธารณะ</span>
                </span>
                <span className="text-[11px] text-slate-500 font-medium capitalize">
                  · {role === 'teacher' ? 'อาจารย์ผู้สอน' : role === 'admin' ? 'ผู้ดูแลระบบ' : 'นักเรียน'}
                </span>
              </div>
            </div>
          </div>

          {/* Category Chips Selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5">
              เลือกประเภทโพสต์:
            </label>
            <div className="grid grid-cols-2 gap-2">
              {categories.map((c) => (
                <button
                  type="button"
                  key={c.id}
                  onClick={() => setCategory(c.id as any)}
                  className={`p-2.5 rounded-xl text-left border transition-all text-xs ${
                    category === c.id
                      ? 'bg-blue-50/70 border-[#1877F2] text-[#1877F2] font-bold shadow-xs'
                      : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <p className="truncate">{c.label}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Related Course Selector (Optional) */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">
              เกี่ยวข้องกับวิชา/คอร์ส (ถ้ามี):
            </label>
            <select
              value={selectedCourseId}
              onChange={(e) => setSelectedCourseId(e.target.value)}
              className="w-full text-xs py-2 px-3 rounded-xl border border-slate-200 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#1877F2]/20 focus:border-[#1877F2]"
            >
              <option value="">-- ไม่ระบุวิชา (โพสต์ในฟีดทั่วไป) --</option>
              {courses.map((course) => (
                <option key={course.id} value={course.id}>
                  {course.title}
                </option>
              ))}
            </select>
          </div>

          {/* Post Content Textarea */}
          <div>
            <textarea
              rows={4}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="คุณกำลังเรียนรู้อะไรอยู่? มีคำถาม โค้ดที่ติดปัญหา หรืออยากแชร์ความสำเร็จให้เพื่อนร่วมชั้นฟัง..."
              className="w-full text-sm sm:text-base text-slate-900 placeholder:text-slate-400 border-none focus:ring-0 focus:outline-none resize-none p-2"
            />
          </div>

          {/* Extra Facebook Action Bar */}
          <div className="p-3 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-between">
            <span className="text-xs font-bold text-slate-700">
              เพิ่มลงในโพสต์ของคุณ:
            </span>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setContent((prev) => prev + ' 💻 #CodeLife')}
                className="p-2 hover:bg-white rounded-full text-emerald-600 transition-colors"
                title="แท็กโค้ด"
              >
                <ImageIcon className="w-5 h-5" />
              </button>
              <button
                type="button"
                onClick={() => setContent((prev) => prev + ' 😊 ✨ ')}
                className="p-2 hover:bg-white rounded-full text-amber-500 transition-colors"
                title="ใส่อิโมจิ"
              >
                <Smile className="w-5 h-5" />
              </button>
              <button
                type="button"
                onClick={() => setContent((prev) => prev + ' #LearnSpace')}
                className="p-2 hover:bg-white rounded-full text-[#1877F2] transition-colors"
                title="แฮชแท็ก"
              >
                <Tag className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={!content.trim() || submitting}
            className="w-full py-2.5 rounded-lg bg-[#1877F2] hover:bg-[#166FE5] text-white font-bold text-sm shadow-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? 'กำลังเผยแพร่โพสต์...' : 'โพสต์'}
          </button>
        </form>
      </div>
    </div>
  );
};
