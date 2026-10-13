import React, { useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  CheckCircle,
  Download,
  FileText,
  MessagesSquare,
  Play,
  Share2,
  HelpCircle,
  PlusCircle,
  Sparkles,
} from 'lucide-react';
import type { Course, Lesson, Discussion, UserProgress } from '../types';
import { useAuth } from '../context/AuthContext';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { doc, setDoc, deleteDoc } from 'firebase/firestore';

interface LessonViewProps {
  course: Course;
  lesson: Lesson;
  allCourseLessons: Lesson[];
  discussions: Discussion[];
  isCompleted: boolean;
  onToggleComplete: (lessonId: string, completed: boolean) => Promise<void>;
  onNavigate: (view: string, payload?: any) => void;
  onOpenNewDiscussion: (lessonId: string, courseId: string) => void;
}

export const LessonView: React.FC<LessonViewProps> = ({
  course,
  lesson,
  allCourseLessons,
  discussions,
  isCompleted,
  onToggleComplete,
  onNavigate,
  onOpenNewDiscussion,
}) => {
  const { user } = useAuth();
  const [toggling, setToggling] = useState(false);

  const sortedLessons = [...allCourseLessons].sort((a, b) => a.order - b.order);
  const currentIndex = sortedLessons.findIndex((l) => l.id === lesson.id);
  const prevLesson = currentIndex > 0 ? sortedLessons[currentIndex - 1] : null;
  const nextLesson =
    currentIndex < sortedLessons.length - 1
      ? sortedLessons[currentIndex + 1]
      : null;

  const lessonDiscussions = discussions.filter(
    (d) => d.lessonId === lesson.id
  );

  const handleToggle = async () => {
    if (!user) return;
    setToggling(true);
    try {
      await onToggleComplete(lesson.id, !isCompleted);
    } catch (err) {
      console.error('Toggle complete error:', err);
    } finally {
      setToggling(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Top Breadcrumb & Navigation */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <button
          onClick={() => onNavigate('course-detail', { courseId: course.id })}
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>กลับสู่หน้ารายวิชา: {course.title}</span>
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={handleToggle}
            disabled={toggling || !user}
            className={`py-2 px-4 rounded-xl text-xs font-semibold flex items-center gap-2 transition-colors border shadow-sm ${
              isCompleted
                ? 'bg-emerald-50 border-emerald-300 text-emerald-800 hover:bg-emerald-100'
                : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-50'
            }`}
          >
            <CheckCircle
              className={`w-4 h-4 ${
                isCompleted ? 'text-emerald-600 fill-emerald-100' : 'text-slate-400'
              }`}
            />
            <span>
              {isCompleted ? 'เรียนจบแล้ว (คลิกเพื่อยกเลิก)' : 'ทำเครื่องหมายว่าเรียนจบ'}
            </span>
          </button>
        </div>
      </div>

      {/* Lesson Title Header */}
      <div>
        <div className="flex items-center gap-2 text-xs font-medium text-amber-700 mb-1">
          <span>บทที่ {lesson.order} จาก {sortedLessons.length}</span>
          <span>·</span>
          <span>{course.title}</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          {lesson.title}
        </h1>
        <p className="text-sm text-slate-600 mt-2">{lesson.summary}</p>
      </div>

      {/* Video Lecture Player (if provided) */}
      {lesson.videoUrl ? (
        <div className="rounded-2xl overflow-hidden bg-slate-950 aspect-video shadow-xl border border-slate-800">
          <iframe
            src={lesson.videoUrl}
            title={lesson.title}
            className="w-full h-full border-0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
      ) : (
        <div className="p-8 rounded-2xl bg-gradient-to-r from-slate-900 to-slate-800 text-white flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs text-amber-400 font-semibold uppercase tracking-wider">
              เอกสารประกอบการศึกษา (Lecture Module)
            </span>
            <h3 className="text-lg font-bold text-white">เนื้อหาการบรรยายเชิงทฤษฎีและปฏิบัติ</h3>
            <p className="text-xs text-slate-300">
              อ่านและศึกษาเนื้อหาด้านล่างอย่างละเอียดก่อนเริ่มทำแบบทดสอบประจำบท
            </p>
          </div>
          <BookOpen className="w-10 h-10 text-amber-400 opacity-60 hidden sm:block" />
        </div>
      )}

      {/* Instructional Rich Text Content */}
      <div className="bg-white p-6 sm:p-10 rounded-2xl border border-slate-200 shadow-sm space-y-6">
        <h2 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-3">
          คำอธิบายและแนวคิดหลักประจำบท
        </h2>

        <div
          className="prose prose-slate max-w-none text-sm text-slate-700 leading-relaxed space-y-4"
          dangerouslySetInnerHTML={{ __html: lesson.contentHtml }}
        />

        {/* Supplementary Attachments */}
        {lesson.attachments && lesson.attachments.length > 0 && (
          <div className="pt-6 border-t border-slate-100 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-600">
              เอกสารและไฟล์ดาวน์โหลด ({lesson.attachments.length} ไฟล์)
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {lesson.attachments.map((file, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200"
                >
                  <div className="flex items-center gap-2.5 truncate">
                    <FileText className="w-4 h-4 text-amber-600 shrink-0" />
                    <div className="truncate">
                      <p className="text-xs font-bold text-slate-800 truncate">{file.name}</p>
                      <p className="text-[10px] text-slate-400">
                        {Math.round(file.size / 1024)} KB
                      </p>
                    </div>
                  </div>
                  <a
                    href={file.url}
                    download
                    className="p-1.5 rounded-lg text-slate-500 hover:text-amber-600 hover:bg-slate-200 transition-colors"
                  >
                    <Download className="w-4 h-4" />
                  </a>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Next / Prev Lesson Navigation Controls */}
      <div className="flex items-center justify-between pt-4">
        {prevLesson ? (
          <button
            onClick={() =>
              onNavigate('lesson', { lessonId: prevLesson.id, courseId: course.id })
            }
            className="py-2.5 px-4 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center gap-2 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>บทก่อนหน้า: {prevLesson.title}</span>
          </button>
        ) : (
          <div />
        )}

        {nextLesson ? (
          <button
            onClick={() =>
              onNavigate('lesson', { lessonId: nextLesson.id, courseId: course.id })
            }
            className="py-2.5 px-5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold flex items-center gap-2 transition-colors"
          >
            <span>บทถัดไป: {nextLesson.title}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        ) : (
          <button
            onClick={() => onNavigate('course-detail', { courseId: course.id })}
            className="py-2.5 px-5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold flex items-center gap-2 transition-colors"
          >
            <span>จบคอร์สบทเรียน ดูภาพรวม</span>
            <CheckCircle className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Lesson-specific Q&A Discussion Section */}
      <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <MessagesSquare className="w-5 h-5 text-amber-600" />
              <span>กระทู้ถาม-ตอบประจำบทเรียนนี้ ({lessonDiscussions.length})</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              แลกเปลี่ยนข้อสงสัยและปรึกษาอาจารย์หรือเพื่อนร่วมวิชาได้ที่นี่
            </p>
          </div>

          <button
            onClick={() => onOpenNewDiscussion(lesson.id, course.id)}
            className="py-2 px-3.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs flex items-center gap-1.5 transition-colors self-start sm:self-auto"
          >
            <PlusCircle className="w-4 h-4" />
            <span>ตั้งคำถามใหม่ในบทนี้</span>
          </button>
        </div>

        {lessonDiscussions.length > 0 ? (
          <div className="space-y-3">
            {lessonDiscussions.map((disc) => (
              <div
                key={disc.id}
                onClick={() => onNavigate('discussion-detail', { topicId: disc.id })}
                className="cursor-pointer p-4 rounded-xl bg-slate-50 hover:bg-amber-50/50 border border-slate-200 transition-colors flex items-start justify-between gap-4"
              >
                <div>
                  <h4 className="text-xs sm:text-sm font-bold text-slate-900">
                    {disc.title}
                  </h4>
                  <p className="text-xs text-slate-600 line-clamp-1 mt-1">
                    {disc.content}
                  </p>
                  <div className="flex items-center gap-3 text-[11px] text-slate-400 mt-2">
                    <span>โดย {disc.authorName}</span>
                    <span>·</span>
                    <span>{new Date(disc.createdAt).toLocaleDateString('th-TH')}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0 self-center">
                  <span className="text-xs font-semibold px-2 py-0.5 rounded bg-slate-200 text-slate-700">
                    {disc.replyCount} คำตอบ
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-slate-400 text-xs">
            ยังไม่มีคำถามในบทนี้ เป็นคนแรกที่เริ่มการสนทนา!
          </div>
        )}
      </div>

    </div>
  );
};
