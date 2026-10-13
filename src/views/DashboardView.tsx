import React from 'react';
import {
  LayoutDashboard,
  BookOpen,
  CheckCircle,
  FileText,
  Award,
  Clock,
  ArrowRight,
  User,
  GraduationCap,
  Sparkles,
} from 'lucide-react';
import type { Course, Lesson, Submission, QuizAttempt } from '../types';
import { useAuth } from '../context/AuthContext';

interface DashboardViewProps {
  courses: Course[];
  lessons: Lesson[];
  submissions: Submission[];
  quizAttempts: QuizAttempt[];
  completedLessonIds: string[];
  onNavigate: (view: string, payload?: any) => void;
  onOpenAuth: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  courses,
  lessons,
  submissions,
  quizAttempts,
  completedLessonIds,
  onNavigate,
  onOpenAuth,
}) => {
  const { user, profile, role, demoSignIn } = useAuth();

  if (!user) {
    return (
      <div className="max-w-xl mx-auto my-16 p-8 bg-white rounded-3xl border border-slate-200 text-center space-y-6 shadow-sm">
        <div className="w-16 h-16 rounded-2xl bg-amber-500/20 text-amber-500 flex items-center justify-center mx-auto border border-amber-500/30">
          <GraduationCap className="w-8 h-8" />
        </div>
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">ศูนย์กลางการเรียนรู้ LearnSpace</h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-2 max-w-md mx-auto leading-relaxed">
            เข้าสู่ระบบเพื่อติดตามความคืบหน้าของบทเรียน ส่งงานโครงงาน ดูคะแนนประเมิน และเข้าถึงห้องสนทนาสด
          </p>
        </div>

        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            onClick={onOpenAuth}
            className="w-full sm:w-auto py-3 px-6 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl text-xs transition-colors shadow-sm"
          >
            เข้าสู่ระบบ / สมัครสมาชิก
          </button>
        </div>

        <div className="pt-4 border-t border-slate-100">
          <p className="text-[11px] font-semibold text-slate-500 mb-2">
            หรือทดลองใช้งานทันที (1-Click Instant Demo):
          </p>
          <div className="grid grid-cols-2 gap-2 max-w-sm mx-auto">
            <button
              onClick={() => demoSignIn('student')}
              className="py-2 px-3 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 rounded-xl text-xs font-bold transition-colors"
            >
              🎓 ทดลองเป็น "นักเรียน"
            </button>
            <button
              onClick={() => demoSignIn('teacher')}
              className="py-2 px-3 bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 rounded-xl text-xs font-bold transition-colors"
            >
              👨‍🏫 ทดลองเป็น "อาจารย์"
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Filter courses user enrolled in
  const enrolledCourseIds = profile?.enrolledCourses || ['course-web-dev'];
  const myCourses = courses.filter((c) => enrolledCourseIds.includes(c.id));

  // User's submissions
  const mySubmissions = submissions.filter((s) => s.studentId === user.uid);
  const myQuizAttempts = quizAttempts.filter((q) => q.userId === user.uid);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* Header Profile Greeting */}
      <div className="bg-slate-900 text-white p-6 sm:p-8 rounded-3xl border border-slate-800 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-amber-500 text-slate-950 flex items-center justify-center font-extrabold text-2xl shadow-lg shadow-amber-500/20">
            {profile?.displayName ? profile.displayName.charAt(0).toUpperCase() : 'U'}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                สวัสดี, {profile?.displayName || 'ผู้เรียน'}
              </h1>
              <span className="text-[11px] px-2.5 py-0.5 rounded-md bg-amber-500/20 text-amber-300 border border-amber-500/40 uppercase font-semibold">
                {role}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">{user.email}</p>
            <p className="text-xs text-slate-300 mt-1 max-w-xl">{profile?.bio}</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => onNavigate('courses')}
            className="py-2.5 px-4 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs transition-colors shadow-sm"
          >
            สำรวจคอร์สเพิ่ม
          </button>
          <button
            onClick={() => onNavigate('profile')}
            className="py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-medium text-xs border border-slate-700 transition-colors"
          >
            แก้ไขโปรไฟล์
          </button>
        </div>
      </div>

      {/* 4 KPI Metrics Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-slate-500 text-xs">
            <span>คอร์สที่ลงทะเบียน</span>
            <BookOpen className="w-4 h-4 text-amber-500" />
          </div>
          <p className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-mono tabular-nums">
            {myCourses.length}
          </p>
          <p className="text-[11px] text-slate-400">หลักสูตรที่กำลังศึกษา</p>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-slate-500 text-xs">
            <span>บทเรียนที่จบแล้ว</span>
            <CheckCircle className="w-4 h-4 text-emerald-500" />
          </div>
          <p className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-mono tabular-nums">
            {completedLessonIds.length}
          </p>
          <p className="text-[11px] text-slate-400">บทเรียนที่สำเร็จ</p>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-slate-500 text-xs">
            <span>งานที่ส่งแล้ว</span>
            <FileText className="w-4 h-4 text-sky-500" />
          </div>
          <p className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-mono tabular-nums">
            {mySubmissions.length}
          </p>
          <p className="text-[11px] text-slate-400">
            ตรวจแล้ว {mySubmissions.filter((s) => s.status === 'graded').length} ชิ้น
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-slate-500 text-xs">
            <span>แบบทดสอบที่ทำ</span>
            <Award className="w-4 h-4 text-amber-500" />
          </div>
          <p className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-mono tabular-nums">
            {myQuizAttempts.length}
          </p>
          <p className="text-[11px] text-slate-400">
            ผ่าน {myQuizAttempts.filter((q) => q.passed).length} ครั้ง
          </p>
        </div>
      </div>

      {/* Active Courses Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900">
            คอร์สเรียนของฉัน ({myCourses.length})
          </h2>
          <button
            onClick={() => onNavigate('courses')}
            className="text-xs text-amber-700 hover:text-amber-800 font-semibold"
          >
            ดูคอร์สทั้งหมด
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {myCourses.map((course) => {
            const courseLessons = lessons.filter((l) => l.courseId === course.id);
            const finished = courseLessons.filter((l) =>
              completedLessonIds.includes(l.id)
            ).length;
            const pct =
              courseLessons.length > 0
                ? Math.round((finished / courseLessons.length) * 100)
                : 0;

            return (
              <div
                key={course.id}
                onClick={() => onNavigate('course-detail', { courseId: course.id })}
                className="group cursor-pointer p-5 rounded-2xl bg-white border border-slate-200 hover:shadow-md transition-all space-y-4"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-semibold text-slate-500">
                    {course.category}
                  </span>
                  <span className="text-xs font-bold text-amber-700 font-mono">
                    {pct}%
                  </span>
                </div>

                <h3 className="text-sm font-bold text-slate-900 group-hover:text-amber-600 transition-colors line-clamp-1">
                  {course.title}
                </h3>

                {/* Progress bar */}
                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-amber-500 rounded-full transition-all"
                    style={{ width: `${pct}%` }}
                  />
                </div>

                <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
                  <span>เรียนแล้ว {finished}/{courseLessons.length} บท</span>
                  <span className="font-semibold text-slate-800 group-hover:translate-x-1 transition-transform inline-flex items-center gap-1">
                    เรียนต่อ <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Submissions & Quizzes Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Recent Submissions */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b pb-3">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <FileText className="w-4 h-4 text-amber-600" />
              <span>ประวัติการส่งงานล่าสุด</span>
            </h3>
            <button
              onClick={() => onNavigate('assignments')}
              className="text-xs text-amber-700 font-semibold"
            >
              ดูทั้งหมด
            </button>
          </div>

          {mySubmissions.length > 0 ? (
            <div className="space-y-3">
              {mySubmissions.map((sub) => (
                <div
                  key={sub.id}
                  className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5"
                >
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-bold text-slate-900">{sub.assignmentTitle || 'การบ้าน'}</p>
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded font-bold ${
                        sub.status === 'graded'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {sub.status === 'graded' ? `ตรวจแล้ว (${sub.score} คะแนน)` : 'รอตรวจ'}
                    </span>
                  </div>
                  {sub.feedback && (
                    <p className="text-xs text-slate-600 italic">
                      "{sub.feedback}"
                    </p>
                  )}
                  <p className="text-[10px] text-slate-400">
                    ส่งเมื่อ {new Date(sub.submittedAt).toLocaleDateString('th-TH')}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-slate-400 py-4 text-center">
              ยังไม่มีประวัติการส่งงาน
            </p>
          )}
        </div>

        {/* Recent Quiz Attempts */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b pb-3">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Award className="w-4 h-4 text-amber-600" />
              <span>ผลคะแนนแบบทดสอบ</span>
            </h3>
          </div>

          {myQuizAttempts.length > 0 ? (
            <div className="space-y-3">
              {myQuizAttempts.map((attempt) => (
                <div
                  key={attempt.id}
                  className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between"
                >
                  <div>
                    <p className="text-xs font-bold text-slate-900">แบบทดสอบประจำวิชา</p>
                    <p className="text-[11px] text-slate-500">
                      ทำได้ {attempt.score}/{attempt.totalScore} ข้อ ({attempt.percentage}%)
                    </p>
                    <p className="text-[10px] text-slate-400">
                      {new Date(attempt.submittedAt).toLocaleDateString('th-TH')}
                    </p>
                  </div>
                  <span
                    className={`text-xs font-bold px-2.5 py-1 rounded-lg ${
                      attempt.passed
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-rose-100 text-rose-800'
                    }`}
                  >
                    {attempt.passed ? 'ผ่าน' : 'ไม่ผ่าน'}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-slate-400 py-4 text-center">
              ยังไม่มีประวัติการทำแบบทดสอบ
            </p>
          )}
        </div>

      </div>

    </div>
  );
};
