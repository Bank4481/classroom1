import React, { useState, useEffect } from 'react';
import {
  BookOpen,
  CheckCircle,
  Clock,
  User,
  ArrowLeft,
  Play,
  FileCheck2,
  HelpCircle,
  MessagesSquare,
  Share2,
  Bookmark,
  Copy,
  Check,
  Plus,
  Send,
  MoreVertical,
  Calendar,
  Award,
  Users,
  GraduationCap,
  MessageCircle,
  Paperclip,
  ExternalLink,
  ChevronRight,
  ShieldCheck,
  Sparkles,
  Info,
  Filter,
  FileText,
  AlertCircle,
} from 'lucide-react';
import type { Course, Lesson, Quiz, Assignment, Submission, QuizAttempt, CourseAnnouncement, UserRole } from '../types';
import { useAuth } from '../context/AuthContext';
import { db } from '../lib/firebase';
import { collection, addDoc, onSnapshot, query, where, orderBy, doc, updateDoc, arrayUnion } from 'firebase/firestore';

interface CourseDetailViewProps {
  course: Course;
  lessons: Lesson[];
  quizzes: Quiz[];
  assignments: Assignment[];
  submissions?: Submission[];
  quizAttempts?: QuizAttempt[];
  completedLessonIds: string[];
  initialTab?: 'stream' | 'classwork' | 'people' | 'grades';
  onNavigate: (view: string, payload?: any) => void;
  onOpenAuth: () => void;
  onOpenMessenger?: (name: string) => void;
}

export const CourseDetailView: React.FC<CourseDetailViewProps> = ({
  course,
  lessons,
  quizzes,
  assignments,
  submissions = [],
  quizAttempts = [],
  completedLessonIds,
  initialTab = 'stream',
  onNavigate,
  onOpenAuth,
  onOpenMessenger,
}) => {
  const { user, profile, updateUserProfile, isAdmin, isTeacher } = useAuth();
  const [activeTab, setActiveTab] = useState<'stream' | 'classwork' | 'people' | 'grades'>(initialTab);
  const [enrolling, setEnrolling] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  // Classwork filter
  const [classworkFilter, setClassworkFilter] = useState<'all' | 'lessons' | 'assignments' | 'quizzes'>('all');

  // Announcement composer state
  const [announcementText, setAnnouncementText] = useState('');
  const [announcementLink, setAnnouncementLink] = useState('');
  const [showAnnouncementBox, setShowAnnouncementBox] = useState(false);
  const [postingAnnouncement, setPostingAnnouncement] = useState(false);

  // Local announcements state (realtime + fallback)
  const [announcements, setAnnouncements] = useState<CourseAnnouncement[]>([]);
  const [announcementComments, setAnnouncementComments] = useState<Record<string, string>>({});
  const [submittingComment, setSubmittingComment] = useState<Record<string, boolean>>({});

  const isEnrolled = profile?.enrolledCourses?.includes(course.id) || false;
  const isInstructorOrAdmin = isAdmin || user?.uid === course.instructorId;

  const joinCode = course.joinCode || course.courseCode || course.id.toUpperCase().slice(0, 8);
  const courseCode = course.courseCode || 'CS-201';
  const term = course.term || 'ภาคเรียนที่ 1/2569';
  const room = course.room || 'ห้องเรียนออนไลน์';

  // Realtime load course announcements
  useEffect(() => {
    try {
      const q = query(
        collection(db, 'course_announcements'),
        where('courseId', '==', course.id)
      );
      const unsub = onSnapshot(
        q,
        (snap) => {
          const list = snap.docs.map((d) => ({ id: d.id, ...d.data() } as CourseAnnouncement));
          list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
          setAnnouncements(list);
        },
        (err) => {
          // Fallback initial announcement
          setAnnouncements([
            {
              id: 'init-ann-1',
              courseId: course.id,
              authorId: course.instructorId,
              authorName: course.instructorName,
              authorRole: 'teacher',
              content: `ยินดีต้อนรับนักเรียนทุกคนเข้าสู่รายวิชา ${course.title} ประจำ${term} ขอให้นักเรียนตรวจสอบเอกสารและเริ่มศึกษาบทเรียนที่ 1 ได้ในแท็บงานในชั้นเรียนครับ`,
              createdAt: course.createdAt || new Date().toISOString(),
              likesCount: 5,
              comments: [
                {
                  id: 'c1',
                  announcementId: 'init-ann-1',
                  authorId: 'student-1',
                  authorName: 'กิตติศักดิ์ พรหมมา',
                  authorRole: 'student',
                  content: 'สวัสดีครับอาจารย์ พร้อมเรียนแล้วครับ!',
                  createdAt: new Date().toISOString(),
                },
              ],
            },
          ]);
        }
      );
      return () => unsub();
    } catch {
      // Offline fallback
    }
  }, [course.id, course.title, course.instructorName, term]);

  const handleCopyCode = () => {
    navigator.clipboard.writeText(joinCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleEnroll = async () => {
    if (!user) {
      onOpenAuth();
      return;
    }
    setEnrolling(true);
    try {
      const currentList = profile?.enrolledCourses || [];
      if (!currentList.includes(course.id)) {
        await updateUserProfile({
          enrolledCourses: [...currentList, course.id],
        });
      }
      if (courseLessons.length > 0) {
        onNavigate('lesson', { lessonId: courseLessons[0].id, courseId: course.id });
      }
    } catch (err) {
      console.error('Enroll error:', err);
    } finally {
      setEnrolling(false);
    }
  };

  const handlePostAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!announcementText.trim() || !user) return;

    setPostingAnnouncement(true);
    const newAnn: Omit<CourseAnnouncement, 'id'> = {
      courseId: course.id,
      authorId: user.uid,
      authorName: profile?.displayName || user.email?.split('@')[0] || 'ผู้ใช้งาน',
      authorRole: profile?.role || 'student',
      content: announcementText.trim(),
      createdAt: new Date().toISOString(),
      likesCount: 0,
      comments: [],
    };

    try {
      await addDoc(collection(db, 'course_announcements'), newAnn);
      setAnnouncementText('');
      setAnnouncementLink('');
      setShowAnnouncementBox(false);
    } catch (err) {
      // Local state fallback
      setAnnouncements((prev) => [
        { id: `local-${Date.now()}`, ...newAnn } as CourseAnnouncement,
        ...prev,
      ]);
      setAnnouncementText('');
      setShowAnnouncementBox(false);
    } finally {
      setPostingAnnouncement(false);
    }
  };

  const handleAddComment = async (announcementId: string) => {
    const text = announcementComments[announcementId]?.trim();
    if (!text || !user) return;

    setSubmittingComment((prev) => ({ ...prev, [announcementId]: true }));
    const newComment = {
      id: `comment-${Date.now()}`,
      announcementId,
      authorId: user.uid,
      authorName: profile?.displayName || user.email?.split('@')[0] || 'ผู้ใช้งาน',
      authorRole: profile?.role || 'student',
      content: text,
      createdAt: new Date().toISOString(),
    };

    try {
      const annRef = doc(db, 'course_announcements', announcementId);
      await updateDoc(annRef, {
        comments: arrayUnion(newComment),
      });
    } catch {
      // Local fallback
      setAnnouncements((prev) =>
        prev.map((ann) =>
          ann.id === announcementId
            ? { ...ann, comments: [...(ann.comments || []), newComment] }
            : ann
        )
      );
    } finally {
      setAnnouncementComments((prev) => ({ ...prev, [announcementId]: '' }));
      setSubmittingComment((prev) => ({ ...prev, [announcementId]: false }));
    }
  };

  const courseLessons = lessons
    .filter((l) => l.courseId === course.id)
    .sort((a, b) => a.order - b.order);

  const courseQuizzes = quizzes.filter((q) => q.courseId === course.id);
  const courseAssignments = assignments.filter((a) => a.courseId === course.id);

  const completedCount = courseLessons.filter((l) =>
    completedLessonIds.includes(l.id)
  ).length;

  const progressPercent =
    courseLessons.length > 0
      ? Math.round((completedCount / courseLessons.length) * 100)
      : 0;

  // Student assignment submissions in this course
  const mySubmissions = user
    ? submissions.filter(
        (s) => s.courseId === course.id && s.studentId === user.uid
      )
    : [];

  const myQuizAttempts = user
    ? quizAttempts.filter(
        (q) => q.courseId === course.id && q.userId === user.uid
      )
    : [];

  // Upcoming assignments (not yet passed due date or unsubmitted)
  const upcomingAssignments = courseAssignments.slice(0, 3);

  return (
    <div className="min-h-screen bg-[#ffffff] pb-16">
      {/* =========================================================
          TOP GOOGLE CLASSROOM TAB NAVIGATION BAR
      ========================================================= */}
      <div className="bg-white border-b border-[#dadce0] sticky top-16 z-30 shadow-2xs">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex items-center justify-between">
          <div className="flex items-center gap-3 py-2">
            <button
              onClick={() => onNavigate('courses')}
              className="p-2 rounded-full hover:bg-slate-100 text-slate-600 transition-colors"
              title="กลับไปยังรายวิชาทั้งหมด"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="hidden sm:block">
              <span className="text-xs font-semibold text-blue-600 uppercase tracking-wider font-mono">
                {courseCode}
              </span>
              <h2 className="text-sm font-bold text-slate-900 truncate max-w-[200px] md:max-w-xs">
                {course.title}
              </h2>
            </div>
          </div>

          {/* 4 Google Classroom Tabs */}
          <nav className="flex items-center space-x-1 sm:space-x-4">
            <button
              onClick={() => setActiveTab('stream')}
              className={`py-3.5 px-3 sm:px-4 text-xs sm:text-sm font-bold border-b-2 transition-all flex items-center gap-1.5 ${
                activeTab === 'stream'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-slate-600 hover:text-slate-900 hover:border-slate-300'
              }`}
            >
              <MessageCircle className="w-4 h-4" />
              <span>สตรีม</span>
            </button>

            <button
              onClick={() => setActiveTab('classwork')}
              className={`py-3.5 px-3 sm:px-4 text-xs sm:text-sm font-bold border-b-2 transition-all flex items-center gap-1.5 ${
                activeTab === 'classwork'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-slate-600 hover:text-slate-900 hover:border-slate-300'
              }`}
            >
              <BookOpen className="w-4 h-4" />
              <span>งานในชั้นเรียน</span>
              <span className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded-full font-mono">
                {courseLessons.length + courseAssignments.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('people')}
              className={`py-3.5 px-3 sm:px-4 text-xs sm:text-sm font-bold border-b-2 transition-all flex items-center gap-1.5 ${
                activeTab === 'people'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-slate-600 hover:text-slate-900 hover:border-slate-300'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>สมาชิก</span>
            </button>

            <button
              onClick={() => setActiveTab('grades')}
              className={`py-3.5 px-3 sm:px-4 text-xs sm:text-sm font-bold border-b-2 transition-all flex items-center gap-1.5 ${
                activeTab === 'grades'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-slate-600 hover:text-slate-900 hover:border-slate-300'
              }`}
            >
              <Award className="w-4 h-4" />
              <span>คะแนน</span>
            </button>
          </nav>

          {/* Quick Enroll / Progress Pill */}
          <div className="flex items-center gap-2">
            {!isEnrolled ? (
              <button
                onClick={handleEnroll}
                disabled={enrolling}
                className="py-1.5 px-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition-all shadow-xs disabled:opacity-50 flex items-center gap-1.5"
              >
                <Play className="w-3.5 h-3.5 fill-white" />
                <span>{enrolling ? 'กำลังเข้า...' : 'ลงทะเบียนฟรี'}</span>
              </button>
            ) : (
              <div className="hidden lg:flex items-center gap-2 bg-emerald-50 text-emerald-800 border border-emerald-200 px-3 py-1 rounded-full text-xs font-semibold">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                <span>ความคืบหน้า {progressPercent}%</span>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-6">
        {/* =========================================================
            TAB 1: STREAM (สตรีม - หน้าแรกห้องเรียน ประกาศ ฟีดคำถาม)
        ========================================================= */}
        {activeTab === 'stream' && (
          <div className="space-y-6">
            {/* Google Classroom Hero Banner */}
            <div className="relative rounded-3xl overflow-hidden shadow-md bg-gradient-to-r from-blue-700 via-indigo-700 to-sky-700 text-white min-h-[220px] flex flex-col justify-end p-6 sm:p-8">
              {/* Optional Background image with subtle overlay */}
              {course.coverImage && (
                <img
                  src={course.coverImage}
                  alt={course.title}
                  referrerPolicy="no-referrer"
                  className="absolute inset-0 w-full h-full object-cover mix-blend-overlay opacity-30"
                />
              )}

              <div className="relative z-10 space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-md bg-white/20 backdrop-blur-md text-xs font-mono font-bold tracking-wider">
                    {courseCode}
                  </span>
                  <span className="text-xs text-blue-100 font-medium">
                    · {term} · {room}
                  </span>
                </div>

                <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight text-white drop-shadow-xs">
                  {course.title}
                </h1>

                <p className="text-xs sm:text-sm text-blue-100 max-w-2xl line-clamp-2">
                  {course.description}
                </p>

                <div className="pt-2 flex items-center gap-2 text-xs text-blue-100">
                  <User className="w-3.5 h-3.5 text-amber-300" />
                  <span>ผู้สอน: {course.instructorName}</span>
                </div>
              </div>
            </div>

            {/* Grid Layout: Left Sidebar (Join code & Upcoming) + Right Main Stream Feed */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              
              {/* LEFT SIDEBAR (4 Cols on desktop) */}
              <div className="lg:col-span-4 space-y-4">
                
                {/* 1. Join Code Card */}
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                      รหัสชั้นเรียน
                    </span>
                    <button
                      onClick={handleCopyLink}
                      className="text-xs text-blue-600 hover:text-blue-800 font-semibold flex items-center gap-1"
                      title="คัดลอกลิงก์คำเชิญ"
                    >
                      {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Share2 className="w-3.5 h-3.5" />}
                      <span>{copiedLink ? 'คัดลอกแล้ว' : 'แชร์ลิงก์'}</span>
                    </button>
                  </div>

                  <div className="flex items-center justify-between bg-slate-50 border border-slate-200 rounded-xl px-4 py-3">
                    <span className="font-mono text-xl font-extrabold text-blue-600 tracking-wider">
                      {joinCode}
                    </span>
                    <button
                      onClick={handleCopyCode}
                      className="p-2 rounded-lg bg-white border border-slate-200 hover:bg-blue-50 hover:text-blue-600 text-slate-600 transition-colors shadow-2xs"
                      title="คัดลอกรหัส"
                    >
                      {copiedCode ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>
                  <p className="text-[11px] text-slate-400">
                    นักเรียนสามารถนำรหัสนี้ไปกรอกเพื่อเข้าร่วมห้องเรียนได้ทันที
                  </p>
                </div>

                {/* 2. Upcoming Assignments Card */}
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                    <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-blue-600" />
                      <span>กำหนดส่งเร็วๆ นี้</span>
                    </span>
                    <button
                      onClick={() => setActiveTab('classwork')}
                      className="text-[11px] text-blue-600 hover:underline font-semibold"
                    >
                      ดูทั้งหมด
                    </button>
                  </div>

                  {upcomingAssignments.length === 0 ? (
                    <p className="text-xs text-slate-500 py-3 text-center">
                      ไม่มีงานที่ต้องส่งเร็วๆ นี้ 🎉
                    </p>
                  ) : (
                    <div className="space-y-2.5">
                      {upcomingAssignments.map((a) => (
                        <div
                          key={a.id}
                          onClick={() => onNavigate('assignments', { assignmentId: a.id })}
                          className="p-2.5 rounded-xl hover:bg-slate-50 border border-transparent hover:border-slate-200 cursor-pointer transition-all group"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <h4 className="text-xs font-bold text-slate-800 group-hover:text-blue-600 transition-colors line-clamp-1">
                              {a.title}
                            </h4>
                            <span className="text-[10px] text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded-sm font-semibold shrink-0">
                              {a.maxScore} คะแนน
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-400 mt-1 flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            <span>ครบกำหนด: {new Date(a.dueDate).toLocaleDateString('th-TH')}</span>
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* 3. Teacher Quick Connect */}
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-sm">
                      {course.instructorName.charAt(0)}
                    </div>
                    <div>
                      <p className="text-[11px] text-slate-400">ครูประจำวิชา</p>
                      <p className="text-xs font-bold text-slate-800">{course.instructorName}</p>
                    </div>
                  </div>
                  {onOpenMessenger && (
                    <button
                      onClick={() => onOpenMessenger(course.instructorName)}
                      className="p-2 rounded-xl bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors"
                      title="ส่งข้อความหาอาจารย์"
                    >
                      <MessageCircle className="w-4 h-4" />
                    </button>
                  )}
                </div>

              </div>

              {/* RIGHT MAIN STREAM FEED (8 Cols on desktop) */}
              <div className="lg:col-span-8 space-y-4">
                
                {/* Announcement Composer Box */}
                <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs">
                  {!showAnnouncementBox ? (
                    <div
                      onClick={() => {
                        if (!user) {
                          onOpenAuth();
                        } else {
                          setShowAnnouncementBox(true);
                        }
                      }}
                      className="flex items-center gap-3 cursor-pointer group"
                    >
                      <div className="w-10 h-10 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center font-bold text-xs shrink-0">
                        {user ? (profile?.displayName?.charAt(0) || user.email?.charAt(0).toUpperCase()) : <User className="w-4 h-4" />}
                      </div>
                      <div className="flex-1 py-2.5 px-4 rounded-full bg-[#F0F2F5] group-hover:bg-slate-200/80 text-xs text-slate-500 transition-colors">
                        ประกาศบางสิ่งในชั้นเรียนของคุณ...
                      </div>
                    </div>
                  ) : (
                    <form onSubmit={handlePostAnnouncement} className="space-y-3">
                      <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                        <span className="text-xs font-bold text-slate-700">
                          ประกาศในชั้นเรียน ({course.title})
                        </span>
                        <button
                          type="button"
                          onClick={() => setShowAnnouncementBox(false)}
                          className="text-xs text-slate-400 hover:text-slate-600"
                        >
                          ยกเลิก
                        </button>
                      </div>

                      <textarea
                        value={announcementText}
                        onChange={(e) => setAnnouncementText(e.target.value)}
                        placeholder="เขียนข้อความ ข้อมูลประกาศ คำแนะนำ หรือคำถามสำหรับชั้นเรียน..."
                        rows={3}
                        className="w-full p-3 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 resize-none"
                        autoFocus
                      />

                      <div className="flex items-center justify-between pt-1">
                        <span className="text-[11px] text-slate-400">
                          แชร์กับนักเรียนทุกคนในห้องเรียน
                        </span>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => setShowAnnouncementBox(false)}
                            className="px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-100"
                          >
                            ยกเลิก
                          </button>
                          <button
                            type="submit"
                            disabled={postingAnnouncement || !announcementText.trim()}
                            className="px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-colors disabled:opacity-50 flex items-center gap-1.5 shadow-xs"
                          >
                            <Send className="w-3.5 h-3.5" />
                            <span>{postingAnnouncement ? 'กำลังโพสต์...' : 'โพสต์ประกาศ'}</span>
                          </button>
                        </div>
                      </div>
                    </form>
                  )}
                </div>

                {/* Announcements Feed Items */}
                <div className="space-y-4">
                  {announcements.map((ann) => (
                    <div
                      key={ann.id}
                      className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden"
                    >
                      {/* Post Header */}
                      <div className="p-4 sm:p-5 flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-xs">
                            {ann.authorName.charAt(0)}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="text-xs sm:text-sm font-bold text-slate-900">
                                {ann.authorName}
                              </h4>
                              {ann.authorRole === 'teacher' && (
                                <span className="bg-blue-100 text-blue-700 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                                  <GraduationCap className="w-3 h-3" />
                                  <span>อาจารย์</span>
                                </span>
                              )}
                              {ann.authorRole === 'admin' && (
                                <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                                  <ShieldCheck className="w-3 h-3" />
                                  <span>ผู้ดูแลระบบ</span>
                                </span>
                              )}
                            </div>
                            <span className="text-[11px] text-slate-400">
                              {new Date(ann.createdAt).toLocaleDateString('th-TH', {
                                day: 'numeric',
                                month: 'short',
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Post Body */}
                      <div className="px-4 sm:px-5 pb-3">
                        <p className="text-xs sm:text-sm text-slate-700 whitespace-pre-line leading-relaxed">
                          {ann.content}
                        </p>
                      </div>

                      {/* Comments Section */}
                      <div className="bg-slate-50 border-t border-slate-100 p-4 sm:p-5 space-y-3">
                        {/* Existing comments */}
                        {ann.comments && ann.comments.length > 0 && (
                          <div className="space-y-2.5">
                            {ann.comments.map((c) => (
                              <div key={c.id} className="flex items-start gap-2.5">
                                <div className="w-7 h-7 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">
                                  {c.authorName.charAt(0)}
                                </div>
                                <div className="bg-white p-2.5 rounded-2xl border border-slate-200 text-xs flex-1 shadow-2xs">
                                  <div className="flex items-center gap-1.5 mb-0.5">
                                    <span className="font-bold text-slate-900">{c.authorName}</span>
                                    {c.authorRole === 'teacher' && (
                                      <span className="text-[9px] bg-blue-50 text-blue-600 px-1.5 rounded-sm font-semibold">
                                        อาจารย์
                                      </span>
                                    )}
                                  </div>
                                  <p className="text-slate-700">{c.content}</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Comment Input */}
                        <div className="flex items-center gap-2 pt-1">
                          <input
                            type="text"
                            value={announcementComments[ann.id] || ''}
                            onChange={(e) =>
                              setAnnouncementComments((prev) => ({
                                ...prev,
                                [ann.id]: e.target.value,
                              }))
                            }
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                handleAddComment(ann.id);
                              }
                            }}
                            placeholder="เพิ่มความคิดเห็นในชั้นเรียน..."
                            className="flex-1 py-2 px-3.5 rounded-full border border-slate-300 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
                          />
                          <button
                            type="button"
                            onClick={() => handleAddComment(ann.id)}
                            disabled={
                              submittingComment[ann.id] ||
                              !announcementComments[ann.id]?.trim()
                            }
                            className="p-2 rounded-full bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-40 transition-colors shrink-0 shadow-xs"
                            title="ส่งความคิดเห็น"
                          >
                            <Send className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

              </div>

            </div>
          </div>
        )}

        {/* =========================================================
            TAB 2: CLASSWORK (งานในชั้นเรียน - บทเรียน, การบ้าน, แบบทดสอบ)
        ========================================================= */}
        {activeTab === 'classwork' && (
          <div className="space-y-6">
            
            {/* Action Bar for Teachers / Admins */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-700">กรองเนื้อหา:</span>
                <div className="flex flex-wrap gap-1.5">
                  {(['all', 'lessons', 'assignments', 'quizzes'] as const).map((filterKey) => (
                    <button
                      key={filterKey}
                      onClick={() => setClassworkFilter(filterKey)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                        classworkFilter === filterKey
                          ? 'bg-blue-600 text-white shadow-xs'
                          : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                      }`}
                    >
                      {filterKey === 'all' && 'ทั้งหมด'}
                      {filterKey === 'lessons' && `บทเรียน (${courseLessons.length})`}
                      {filterKey === 'assignments' && `การบ้าน (${courseAssignments.length})`}
                      {filterKey === 'quizzes' && `แบบทดสอบ (${courseQuizzes.length})`}
                    </button>
                  ))}
                </div>
              </div>

              {isInstructorOrAdmin && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onNavigate('admin')}
                    className="py-2 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center gap-1.5 transition-colors shadow-xs"
                  >
                    <Plus className="w-4 h-4" />
                    <span>จัดการเนื้อหาในผู้ดูแล</span>
                  </button>
                </div>
              )}
            </div>

            {/* Curriculum Group 1: Lessons */}
            {(classworkFilter === 'all' || classworkFilter === 'lessons') && (
              <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
                <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center">
                      <BookOpen className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-slate-900">หน่วยการเรียนรู้และบทเรียน</h3>
                      <p className="text-[11px] text-slate-500">
                        เรียนสำเร็จ {completedCount} จาก {courseLessons.length} บท ({progressPercent}%)
                      </p>
                    </div>
                  </div>
                </div>

                <div className="divide-y divide-slate-100">
                  {courseLessons.length === 0 ? (
                    <p className="p-6 text-xs text-slate-500 text-center">ยังไม่มีบทเรียนในรายวิชานี้</p>
                  ) : (
                    courseLessons.map((lesson) => {
                      const isCompleted = completedLessonIds.includes(lesson.id);
                      return (
                        <div
                          key={lesson.id}
                          onClick={() =>
                            onNavigate('lesson', { lessonId: lesson.id, courseId: course.id })
                          }
                          className="p-4 sm:p-5 hover:bg-blue-50/40 transition-colors flex items-start justify-between gap-4 cursor-pointer group"
                        >
                          <div className="flex items-start gap-3.5">
                            <div
                              className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 ${
                                isCompleted
                                  ? 'bg-emerald-100 text-emerald-700'
                                  : 'bg-slate-100 text-slate-700 group-hover:bg-blue-100 group-hover:text-blue-700'
                              }`}
                            >
                              {isCompleted ? <CheckCircle className="w-4 h-4 text-emerald-600" /> : lesson.order}
                            </div>
                            <div>
                              <h4 className="text-xs sm:text-sm font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                                {lesson.title}
                              </h4>
                              <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">{lesson.summary}</p>
                              {lesson.attachments && lesson.attachments.length > 0 && (
                                <div className="mt-1 flex items-center gap-1.5 text-[10px] text-slate-400">
                                  <Paperclip className="w-3 h-3" />
                                  <span>{lesson.attachments.length} เอกสารแนบ</span>
                                </div>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center gap-2 shrink-0 self-center">
                            <span
                              className={`px-3 py-1 rounded-lg text-xs font-semibold ${
                                isCompleted
                                  ? 'bg-emerald-50 text-emerald-700'
                                  : 'bg-blue-50 text-blue-700 group-hover:bg-blue-600 group-hover:text-white'
                              } transition-colors`}
                            >
                              {isCompleted ? 'ทบทวน' : 'เข้าเรียน'}
                            </span>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            )}

            {/* Curriculum Group 2: Assignments */}
            {(classworkFilter === 'all' || classworkFilter === 'assignments') && (
              <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
                <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center">
                      <FileCheck2 className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-slate-900">งานที่มอบหมายและการบ้าน</h3>
                      <p className="text-[11px] text-slate-500">
                        ส่งงานพร้อมไฟล์หรือข้อความเพื่อให้อาจารย์ตรวจและให้คะแนน
                      </p>
                    </div>
                  </div>
                </div>

                <div className="divide-y divide-slate-100">
                  {courseAssignments.length === 0 ? (
                    <p className="p-6 text-xs text-slate-500 text-center">ไม่มีงานที่มอบหมายในรายวิชานี้</p>
                  ) : (
                    courseAssignments.map((a) => {
                      const mySub = mySubmissions.find((s) => s.assignmentId === a.id);
                      return (
                        <div
                          key={a.id}
                          onClick={() => onNavigate('assignments', { assignmentId: a.id })}
                          className="p-4 sm:p-5 hover:bg-amber-50/30 transition-colors flex items-start justify-between gap-4 cursor-pointer group"
                        >
                          <div className="flex items-start gap-3.5">
                            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                              <FileText className="w-4 h-4" />
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <h4 className="text-xs sm:text-sm font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                                  {a.title}
                                </h4>
                                <span className="text-[10px] font-mono bg-slate-100 text-slate-600 px-2 py-0.5 rounded-sm">
                                  {a.maxScore} คะแนน
                                </span>
                              </div>
                              <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">{a.instructions}</p>
                              <p className="text-[10px] text-slate-400 mt-1 flex items-center gap-1">
                                <Calendar className="w-3 h-3" />
                                <span>ครบกำหนด: {new Date(a.dueDate).toLocaleDateString('th-TH')}</span>
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 shrink-0 self-center">
                            {mySub ? (
                              <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-emerald-100 text-emerald-800 flex items-center gap-1">
                                <CheckCircle className="w-3.5 h-3.5" />
                                <span>{mySub.status === 'graded' ? `ตรวจแล้ว (${mySub.score}/${a.maxScore})` : 'ส่งแล้ว'}</span>
                              </span>
                            ) : (
                              <span className="px-3 py-1 rounded-lg text-xs font-semibold bg-amber-500 text-white hover:bg-amber-600 transition-colors">
                                ส่งงาน
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            )}

            {/* Curriculum Group 3: Quizzes */}
            {(classworkFilter === 'all' || classworkFilter === 'quizzes') && (
              <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
                <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center">
                      <HelpCircle className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-slate-900">แบบทดสอบและวัดประเมินผล</h3>
                      <p className="text-[11px] text-slate-500">
                        แบบทดสอบปรนัยตรวจคะแนนอัตโนมัติ พร้อมเฉลยละเอียด
                      </p>
                    </div>
                  </div>
                </div>

                <div className="divide-y divide-slate-100">
                  {courseQuizzes.length === 0 ? (
                    <p className="p-6 text-xs text-slate-500 text-center">ไม่มีแบบทดสอบในรายวิชานี้</p>
                  ) : (
                    courseQuizzes.map((quiz) => {
                      const attempt = myQuizAttempts.find((qa) => qa.quizId === quiz.id);
                      return (
                        <div
                          key={quiz.id}
                          onClick={() => onNavigate('quiz', { quizId: quiz.id, courseId: course.id })}
                          className="p-4 sm:p-5 hover:bg-purple-50/30 transition-colors flex items-start justify-between gap-4 cursor-pointer group"
                        >
                          <div className="flex items-start gap-3.5">
                            <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
                              <HelpCircle className="w-4 h-4" />
                            </div>
                            <div>
                              <h4 className="text-xs sm:text-sm font-bold text-slate-900 group-hover:text-purple-700 transition-colors">
                                {quiz.title}
                              </h4>
                              <p className="text-xs text-slate-500 mt-0.5">
                                {quiz.questions?.length || 0} ข้อ · เกณฑ์ผ่าน {quiz.passingScore}%
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 shrink-0 self-center">
                            {attempt ? (
                              <span
                                className={`px-2.5 py-1 rounded-lg text-xs font-bold flex items-center gap-1 ${
                                  attempt.passed
                                    ? 'bg-emerald-100 text-emerald-800'
                                    : 'bg-red-100 text-red-800'
                                }`}
                              >
                                {attempt.passed ? (
                                  <>
                                    <CheckCircle className="w-3.5 h-3.5" />
                                    <span>ผ่าน ({attempt.score}/{attempt.totalScore})</span>
                                  </>
                                ) : (
                                  <>
                                    <AlertCircle className="w-3.5 h-3.5" />
                                    <span>สอบใหม่ ({attempt.score}/{attempt.totalScore})</span>
                                  </>
                                )}
                              </span>
                            ) : (
                              <span className="px-3 py-1 rounded-lg text-xs font-semibold bg-purple-600 text-white hover:bg-purple-700 transition-colors">
                                เริ่มทำแบบทดสอบ
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            )}

          </div>
        )}

        {/* =========================================================
            TAB 3: PEOPLE (สมาชิก - อาจารย์ผู้สอน และเพื่อนร่วมชั้น)
        ========================================================= */}
        {activeTab === 'people' && (
          <div className="space-y-6">
            
            {/* Teachers Section */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-4">
              <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
                <h3 className="text-base font-bold text-blue-600 flex items-center gap-2">
                  <GraduationCap className="w-5 h-5" />
                  <span>ครูผู้สอน (Teachers)</span>
                </h3>
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-sm shadow-xs">
                    {course.instructorName.charAt(0)}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">{course.instructorName}</h4>
                    <p className="text-xs text-slate-500">อาจารย์ผู้สอนหลัก · {course.category}</p>
                  </div>
                </div>

                {onOpenMessenger && (
                  <button
                    onClick={() => onOpenMessenger(course.instructorName)}
                    className="p-2.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-600 transition-colors"
                    title="ส่งข้อความสนทนา"
                  >
                    <MessageCircle className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>

            {/* Students Section */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-4">
              <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
                <h3 className="text-base font-bold text-blue-600 flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  <span>เพื่อนร่วมชั้น (Classmates)</span>
                </h3>
                <span className="text-xs text-slate-500 font-semibold">
                  สมาชิกในห้องเรียน
                </span>
              </div>

              {/* Sample / Enrolled Student List */}
              <div className="divide-y divide-slate-100">
                {[
                  { name: 'กิตติศักดิ์ พรหมมา', role: 'นักเรียน', status: 'เรียนแล้ว 2 บท' },
                  { name: 'สิรินทรา วงศ์สว่าง', role: 'นักเรียน', status: 'เรียนแล้ว 3 บท' },
                  { name: 'พงศกร ทัศนีย์กุล', role: 'นักเรียน', status: 'เพิ่งส่งการบ้าน' },
                  { name: 'อภิชญา รัตนไพศาล', role: 'นักเรียน', status: 'สอบผ่านควิซ' },
                ].map((s, idx) => (
                  <div key={idx} className="py-3 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center font-bold text-xs">
                        {s.name.charAt(0)}
                      </div>
                      <div>
                        <h4 className="text-xs sm:text-sm font-bold text-slate-800">{s.name}</h4>
                        <p className="text-[11px] text-slate-400">{s.status}</p>
                      </div>
                    </div>
                    {onOpenMessenger && (
                      <button
                        onClick={() => onOpenMessenger(s.name)}
                        className="p-2 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-slate-50 transition-colors"
                      >
                        <MessageCircle className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

          </div>
        )}

        {/* =========================================================
            TAB 4: GRADES (คะแนน - สำหรับดูผลคะแนนงานและควิซ)
        ========================================================= */}
        {activeTab === 'grades' && (
          <div className="space-y-6">
            
            {/* Student's Personal Gradebook Summary */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <Award className="w-5 h-5 text-amber-500" />
                  <h3 className="text-base font-bold text-slate-900">
                    {isInstructorOrAdmin ? 'สมุดบันทึกคะแนน (Gradebook)' : 'สมุดพกผลการเรียนของฉัน'}
                  </h3>
                </div>
                <span className="text-xs bg-blue-50 text-blue-700 font-bold px-2.5 py-1 rounded-md">
                  ความคืบหน้ารวม {progressPercent}%
                </span>
              </div>

              {/* Assignment Scores Table */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  คะแนนงานที่มอบหมาย
                </h4>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-slate-200 text-slate-500 bg-slate-50">
                        <th className="py-2.5 px-3 font-semibold">ชื่องาน</th>
                        <th className="py-2.5 px-3 font-semibold">กำหนดส่ง</th>
                        <th className="py-2.5 px-3 font-semibold">สถานะ</th>
                        <th className="py-2.5 px-3 font-semibold text-right">คะแนนที่ได้ / เต็ม</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {courseAssignments.length === 0 ? (
                        <tr>
                          <td colSpan={4} className="py-4 text-center text-slate-400">
                            ไม่มีงานในรายวิชานี้
                          </td>
                        </tr>
                      ) : (
                        courseAssignments.map((a) => {
                          const sub = mySubmissions.find((s) => s.assignmentId === a.id);
                          return (
                            <tr key={a.id} className="hover:bg-slate-50">
                              <td className="py-3 px-3 font-bold text-slate-900">{a.title}</td>
                              <td className="py-3 px-3 text-slate-500">
                                {new Date(a.dueDate).toLocaleDateString('th-TH')}
                              </td>
                              <td className="py-3 px-3">
                                {sub ? (
                                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                                    {sub.status === 'graded' ? 'ให้คะแนนแล้ว' : 'ส่งแล้ว'}
                                  </span>
                                ) : (
                                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">
                                    ยังไม่ส่ง
                                  </span>
                                )}
                              </td>
                              <td className="py-3 px-3 text-right font-mono font-bold text-slate-800">
                                {sub?.score !== undefined && sub?.score !== null
                                  ? `${sub.score} / ${a.maxScore}`
                                  : `- / ${a.maxScore}`}
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Quizzes Scores Table */}
              <div className="space-y-3 pt-4 border-t border-slate-100">
                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  คะแนนแบบทดสอบ (Quizzes)
                </h4>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-slate-200 text-slate-500 bg-slate-50">
                        <th className="py-2.5 px-3 font-semibold">ชื่อแบบทดสอบ</th>
                        <th className="py-2.5 px-3 font-semibold">เกณฑ์ผ่าน</th>
                        <th className="py-2.5 px-3 font-semibold">ผลการสอบ</th>
                        <th className="py-2.5 px-3 font-semibold text-right">คะแนน</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {courseQuizzes.length === 0 ? (
                        <tr>
                          <td colSpan={4} className="py-4 text-center text-slate-400">
                            ไม่มีแบบทดสอบในรายวิชานี้
                          </td>
                        </tr>
                      ) : (
                        courseQuizzes.map((quiz) => {
                          const attempt = myQuizAttempts.find((qa) => qa.quizId === quiz.id);
                          return (
                            <tr key={quiz.id} className="hover:bg-slate-50">
                              <td className="py-3 px-3 font-bold text-slate-900">{quiz.title}</td>
                              <td className="py-3 px-3 text-slate-500">{quiz.passingScore}%</td>
                              <td className="py-3 px-3">
                                {attempt ? (
                                  <span
                                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                      attempt.passed
                                        ? 'bg-emerald-100 text-emerald-800'
                                        : 'bg-red-100 text-red-800'
                                    }`}
                                  >
                                    {attempt.passed ? 'ผ่าน' : 'ไม่ผ่าน'}
                                  </span>
                                ) : (
                                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-600">
                                    ยังไม่ทำ
                                  </span>
                                )}
                              </td>
                              <td className="py-3 px-3 text-right font-mono font-bold text-slate-800">
                                {attempt ? `${attempt.score} / ${attempt.totalScore}` : '-'}
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>

          </div>
        )}
      </div>
    </div>
  );
};
