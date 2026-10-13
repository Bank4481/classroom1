import React from 'react';
import {
  Home,
  Calendar,
  ClipboardList,
  GraduationCap,
  Archive,
  Settings,
  ShieldCheck,
  BookOpen,
  X,
  Plus,
  KeyRound,
  CheckCircle2,
  FolderOpen,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import type { Course } from '../../types';

interface ClassroomSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  currentView: string;
  courses: Course[];
  activeCourseId?: string;
  onNavigate: (view: string, payload?: any) => void;
  onOpenJoinClass: () => void;
  onOpenCreateClass: () => void;
}

export const ClassroomSidebar: React.FC<ClassroomSidebarProps> = ({
  isOpen,
  onClose,
  currentView,
  courses,
  activeCourseId,
  onNavigate,
  onOpenJoinClass,
  onOpenCreateClass,
}) => {
  const { user, profile, isAdmin, isTeacher } = useAuth();

  // Enrolled courses & teaching courses
  const enrolledCourseIds = profile?.enrolledCourses || [];
  const enrolledCourses = courses.filter((c) => enrolledCourseIds.includes(c.id));
  const teachingCourses = courses.filter((c) => c.instructorId === user?.uid || isAdmin);

  // Palette of avatar colors for Google Classroom course icons
  const courseColors = [
    'bg-[#1967d2]', // Google Blue
    'bg-[#137333]', // Google Green
    'bg-[#9334e6]', // Google Purple
    'bg-[#c5221f]', // Google Red
    'bg-[#e37400]', // Google Orange
    'bg-[#007b83]', // Google Teal
  ];

  const handleItemClick = (view: string, payload?: any) => {
    onNavigate(view, payload);
    // On mobile screens, close drawer automatically
    if (window.innerWidth < 1024) {
      onClose();
    }
  };

  return (
    <>
      {/* Backdrop overlay for mobile / tablet */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-xs transition-opacity lg:hidden"
        />
      )}

      {/* Slide-out Drawer */}
      <aside
        className={`fixed top-16 left-0 bottom-0 z-40 w-72 bg-white border-r border-[#dadce0] overflow-y-auto transition-transform duration-200 ease-in-out select-none flex flex-col justify-between ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="py-2 space-y-1">
          
          {/* 1. Classes (ชั้นเรียน) */}
          <button
            onClick={() => handleItemClick('home')}
            className={`w-full flex items-center gap-4 px-6 py-3 text-sm font-medium transition-colors text-left ${
              currentView === 'home' && !activeCourseId
                ? 'bg-[#e8f0fe] text-[#1967d2] font-semibold rounded-r-full'
                : 'text-[#3c4043] hover:bg-[#f1f3f4] rounded-r-full'
            }`}
          >
            <Home className="w-5 h-5 shrink-0" />
            <span className="truncate">ชั้นเรียน (Classes)</span>
          </button>

          {/* 2. Calendar (ปฏิทิน) */}
          <button
            onClick={() => handleItemClick('assignments', { filter: 'calendar' })}
            className={`w-full flex items-center gap-4 px-6 py-3 text-sm font-medium transition-colors text-left ${
              currentView === 'assignments' && !activeCourseId
                ? 'bg-[#e8f0fe] text-[#1967d2] font-semibold rounded-r-full'
                : 'text-[#3c4043] hover:bg-[#f1f3f4] rounded-r-full'
            }`}
          >
            <Calendar className="w-5 h-5 shrink-0" />
            <span className="truncate">ปฏิทินและกำหนดส่ง</span>
          </button>

          {/* Divider */}
          <div className="my-2 border-t border-[#dadce0]" />

          {/* 3. Teaching Section (กำลังสอน) - If teacher or admin */}
          {(isAdmin || isTeacher) && (
            <div className="space-y-0.5">
              <div className="px-6 py-2 text-xs font-semibold text-[#5f6368] uppercase tracking-wider flex items-center justify-between">
                <span>กำลังสอน</span>
                <span className="text-[11px] font-normal text-[#5f6368]">
                  ({teachingCourses.length})
                </span>
              </div>

              {/* To Review (สิ่งที่ต้องตรวจ) */}
              <button
                onClick={() => handleItemClick('assignments', { filter: 'review' })}
                className="w-full flex items-center gap-4 px-6 py-2.5 text-sm font-medium text-[#3c4043] hover:bg-[#f1f3f4] rounded-r-full transition-colors text-left"
              >
                <ClipboardList className="w-5 h-5 text-[#137333] shrink-0" />
                <span className="truncate">สิ่งที่ต้องตรวจ</span>
              </button>

              {/* Course list under Teaching */}
              {teachingCourses.map((course, idx) => {
                const colorClass = courseColors[idx % courseColors.length];
                const isActive = activeCourseId === course.id;
                return (
                  <button
                    key={course.id}
                    onClick={() =>
                      handleItemClick('course-detail', { courseId: course.id, tab: 'stream' })
                    }
                    className={`w-full flex items-center gap-3.5 px-6 py-2 text-sm transition-colors text-left rounded-r-full ${
                      isActive
                        ? 'bg-[#e8f0fe] text-[#1967d2] font-semibold'
                        : 'text-[#3c4043] hover:bg-[#f1f3f4]'
                    }`}
                  >
                    <div
                      className={`w-7 h-7 rounded-full ${colorClass} text-white flex items-center justify-center text-xs font-bold shrink-0 shadow-2xs`}
                    >
                      {course.title.trim()[0]}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-xs font-medium leading-tight">
                        {course.title}
                      </div>
                      <div className="truncate text-[11px] text-[#5f6368]">
                        {course.courseCode || course.term || 'กำลังสอน'}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}

          {/* Divider */}
          <div className="my-2 border-t border-[#dadce0]" />

          {/* 4. Enrolled Section (ลงทะเบียนเรียนแล้ว) */}
          <div className="space-y-0.5">
            <div className="px-6 py-2 text-xs font-semibold text-[#5f6368] uppercase tracking-wider flex items-center justify-between">
              <span>ลงทะเบียนเรียนแล้ว</span>
              <span className="text-[11px] font-normal text-[#5f6368]">
                ({enrolledCourses.length})
              </span>
            </div>

            {/* To-Do (สิ่งที่ต้องทำ) */}
            <button
              onClick={() => handleItemClick('assignments', { filter: 'todo' })}
              className="w-full flex items-center gap-4 px-6 py-2.5 text-sm font-medium text-[#3c4043] hover:bg-[#f1f3f4] rounded-r-full transition-colors text-left"
            >
              <ClipboardList className="w-5 h-5 text-[#1967d2] shrink-0" />
              <span className="truncate">สิ่งที่ต้องทำ (To-do)</span>
            </button>

            {/* Enrolled Courses list */}
            {enrolledCourses.length > 0 ? (
              enrolledCourses.map((course, idx) => {
                const colorClass = courseColors[(idx + 2) % courseColors.length];
                const isActive = activeCourseId === course.id;
                return (
                  <button
                    key={course.id}
                    onClick={() =>
                      handleItemClick('course-detail', { courseId: course.id, tab: 'stream' })
                    }
                    className={`w-full flex items-center gap-3.5 px-6 py-2 text-sm transition-colors text-left rounded-r-full ${
                      isActive
                        ? 'bg-[#e8f0fe] text-[#1967d2] font-semibold'
                        : 'text-[#3c4043] hover:bg-[#f1f3f4]'
                    }`}
                  >
                    <div
                      className={`w-7 h-7 rounded-full ${colorClass} text-white flex items-center justify-center text-xs font-bold shrink-0 shadow-2xs`}
                    >
                      {course.title.trim()[0]}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-xs font-medium leading-tight">
                        {course.title}
                      </div>
                      <div className="truncate text-[11px] text-[#5f6368]">
                        {course.instructorName}
                      </div>
                    </div>
                  </button>
                );
              })
            ) : (
              <div className="px-6 py-2 text-[11px] text-[#5f6368] italic">
                ยังไม่ได้ลงทะเบียนเรียนรายวิชาใด
              </div>
            )}
          </div>

          {/* Divider */}
          <div className="my-2 border-t border-[#dadce0]" />

          {/* 5. Archived & Settings */}
          <button
            onClick={() => handleItemClick('courses')}
            className="w-full flex items-center gap-4 px-6 py-2.5 text-sm font-medium text-[#3c4043] hover:bg-[#f1f3f4] rounded-r-full transition-colors text-left"
          >
            <BookOpen className="w-5 h-5 text-[#5f6368] shrink-0" />
            <span className="truncate">คลังรายวิชาทั้งหมด</span>
          </button>

          <button
            onClick={() => handleItemClick('profile')}
            className={`w-full flex items-center gap-4 px-6 py-2.5 text-sm font-medium transition-colors text-left ${
              currentView === 'profile'
                ? 'bg-[#e8f0fe] text-[#1967d2] font-semibold rounded-r-full'
                : 'text-[#3c4043] hover:bg-[#f1f3f4] rounded-r-full'
            }`}
          >
            <Settings className="w-5 h-5 text-[#5f6368] shrink-0" />
            <span className="truncate">การตั้งค่า (Settings)</span>
          </button>

          {/* 6. Admin Panel link for bbak9988@gmail.com */}
          {isAdmin && (
            <button
              onClick={() => handleItemClick('admin')}
              className={`w-full flex items-center gap-4 px-6 py-2.5 text-sm font-bold transition-colors text-left ${
                currentView === 'admin'
                  ? 'bg-amber-100 text-amber-900 font-bold rounded-r-full'
                  : 'text-amber-800 hover:bg-amber-50 rounded-r-full'
              }`}
            >
              <ShieldCheck className="w-5 h-5 text-amber-600 shrink-0" />
              <span className="truncate">ระบบผู้ดูแล (bbak9988)</span>
            </button>
          )}

        </div>

        {/* Footer in Drawer: Join with code quick button */}
        <div className="p-4 border-t border-[#dadce0] bg-[#f8f9fa]">
          <button
            onClick={() => {
              onOpenJoinClass();
              if (window.innerWidth < 1024) onClose();
            }}
            className="w-full py-2.5 px-3 rounded-full border border-[#dadce0] bg-white hover:bg-[#f1f3f4] text-xs font-semibold text-[#1967d2] transition-colors flex items-center justify-center gap-2 shadow-2xs"
          >
            <KeyRound className="w-4 h-4 text-[#1967d2]" />
            <span>เข้าร่วมด้วยรหัสชั้นเรียน</span>
          </button>
        </div>
      </aside>
    </>
  );
};
