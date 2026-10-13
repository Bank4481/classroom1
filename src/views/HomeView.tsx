import React, { useState } from 'react';
import {
  GraduationCap,
  Plus,
  KeyRound,
  MoreVertical,
  Folder,
  FileText,
  TrendingUp,
  Calendar,
  Clock,
  CheckCircle,
  Copy,
  Check,
  ExternalLink,
  BookOpen,
  Sparkles,
  Users,
  ShieldCheck,
  ArrowRight,
  Filter,
} from 'lucide-react';
import type { Course, SiteSettings, Discussion, Reply } from '../types';
import { useAuth } from '../context/AuthContext';

interface HomeViewProps {
  courses: Course[];
  settings?: SiteSettings | null;
  discussions?: Discussion[];
  replies?: Reply[];
  onNavigate: (view: string, payload?: any) => void;
  onOpenAuth: (mode?: 'login' | 'register') => void;
  onOpenJoinClass?: () => void;
  onOpenCreateClass?: () => void;
  onOpenMessengerWithContact?: (name: string) => void;
}

export const HomeView: React.FC<HomeViewProps> = ({
  courses,
  onNavigate,
  onOpenAuth,
  onOpenJoinClass,
  onOpenCreateClass,
}) => {
  const { user, profile, isAdmin, isTeacher } = useAuth();

  const [filterTab, setFilterTab] = useState<'all' | 'teaching' | 'enrolled'>('all');
  const [activeMenuCourseId, setActiveMenuCourseId] = useState<string | null>(null);
  const [copiedCodeCourseId, setCopiedCodeCourseId] = useState<string | null>(null);

  const enrolledCourseIds = profile?.enrolledCourses || [];

  // Theme gradient banners matching Google Classroom's rich headers
  const classroomThemes = [
    {
      gradient: 'from-[#1967d2] to-[#1256b0]',
      pattern: 'bg-gradient-to-r from-blue-700 via-indigo-600 to-blue-800',
      badgeColor: 'bg-blue-500/30 text-white',
    },
    {
      gradient: 'from-[#137333] to-[#0d5926]',
      pattern: 'bg-gradient-to-r from-emerald-700 via-teal-700 to-green-800',
      badgeColor: 'bg-emerald-500/30 text-white',
    },
    {
      gradient: 'from-[#9334e6] to-[#7627be]',
      pattern: 'bg-gradient-to-r from-purple-700 via-violet-700 to-indigo-800',
      badgeColor: 'bg-purple-500/30 text-white',
    },
    {
      gradient: 'from-[#c5221f] to-[#a31b18]',
      pattern: 'bg-gradient-to-r from-rose-700 via-red-600 to-orange-700',
      badgeColor: 'bg-rose-500/30 text-white',
    },
    {
      gradient: 'from-[#e37400] to-[#b85e00]',
      pattern: 'bg-gradient-to-r from-amber-600 via-orange-600 to-yellow-700',
      badgeColor: 'bg-amber-500/30 text-white',
    },
    {
      gradient: 'from-[#007b83] to-[#005f66]',
      pattern: 'bg-gradient-to-r from-teal-700 via-cyan-800 to-blue-800',
      badgeColor: 'bg-teal-500/30 text-white',
    },
  ];

  // Filtering courses
  const filteredCourses = courses.filter((course) => {
    if (filterTab === 'teaching') {
      return course.instructorId === user?.uid || isAdmin;
    }
    if (filterTab === 'enrolled') {
      return enrolledCourseIds.includes(course.id);
    }
    return true;
  });

  const handleCopyCode = (course: Course, e: React.MouseEvent) => {
    e.stopPropagation();
    const code = course.joinCode || course.courseCode || course.id;
    navigator.clipboard.writeText(code);
    setCopiedCodeCourseId(course.id);
    setTimeout(() => setCopiedCodeCourseId(null), 2000);
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-[#ffffff] text-[#202124]">
      
      {/* Sub-Header / Google Classroom Tool Bar */}
      <div className="border-b border-[#dadce0] bg-white sticky top-16 z-30 px-6 py-3">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          
          {/* Tabs: ทั้งหมด, กำลังสอน, ลงทะเบียนเรียนแล้ว */}
          <div className="flex items-center gap-1">
            <button
              onClick={() => setFilterTab('all')}
              className={`px-4 py-2 rounded-full text-xs font-semibold transition-all ${
                filterTab === 'all'
                  ? 'bg-[#e8f0fe] text-[#1967d2]'
                  : 'text-[#5f6368] hover:bg-[#f1f3f4] hover:text-[#202124]'
              }`}
            >
              ชั้นเรียนทั้งหมด ({courses.length})
            </button>

            {(isAdmin || isTeacher) && (
              <button
                onClick={() => setFilterTab('teaching')}
                className={`px-4 py-2 rounded-full text-xs font-semibold transition-all ${
                  filterTab === 'teaching'
                    ? 'bg-[#e8f0fe] text-[#1967d2]'
                    : 'text-[#5f6368] hover:bg-[#f1f3f4] hover:text-[#202124]'
                }`}
              >
                กำลังสอน ({courses.filter((c) => c.instructorId === user?.uid || isAdmin).length})
              </button>
            )}

            <button
              onClick={() => setFilterTab('enrolled')}
              className={`px-4 py-2 rounded-full text-xs font-semibold transition-all ${
                filterTab === 'enrolled'
                  ? 'bg-[#e8f0fe] text-[#1967d2]'
                  : 'text-[#5f6368] hover:bg-[#f1f3f4] hover:text-[#202124]'
              }`}
            >
              ลงทะเบียนเรียนแล้ว ({enrolledCourseIds.length})
            </button>
          </div>

          {/* Action buttons on the right: เข้าร่วมชั้นเรียน & สร้างชั้นเรียน */}
          <div className="flex items-center gap-2 self-end sm:self-auto">
            <button
              onClick={onOpenJoinClass}
              className="py-2 px-4 rounded-full border border-[#dadce0] hover:bg-[#f8f9fa] text-[#1967d2] hover:border-[#1967d2] text-xs font-semibold transition-colors flex items-center gap-2 shadow-2xs"
            >
              <KeyRound className="w-3.5 h-3.5" />
              <span>เข้าร่วมชั้นเรียน</span>
            </button>

            {(isAdmin || isTeacher) && (
              <button
                onClick={onOpenCreateClass}
                className="py-2 px-4 rounded-full bg-[#1967d2] hover:bg-[#185abc] text-white text-xs font-semibold transition-colors flex items-center gap-2 shadow-xs"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>สร้างชั้นเรียน</span>
              </button>
            )}
          </div>

        </div>
      </div>

      {/* Main Grid of Google Classroom Cards */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        
        {filteredCourses.length === 0 ? (
          // Empty State Styled exactly like Google Classroom
          <div className="max-w-md mx-auto my-16 p-8 text-center bg-white border border-[#dadce0] rounded-3xl shadow-xs space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center mx-auto">
              <GraduationCap className="w-8 h-8" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-[#202124]">
                ไม่พบชั้นเรียนในส่วนนี้
              </h2>
              <p className="text-xs text-[#5f6368] mt-1.5 leading-relaxed">
                เข้าร่วมชั้นเรียนด้วยรหัสจากคุณครู หรือสร้างชั้นเรียนใหม่เพื่อเริ่มจัดกิจกรรมการสอน
              </p>
            </div>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-2 pt-2">
              <button
                onClick={onOpenJoinClass}
                className="w-full sm:w-auto py-2.5 px-5 rounded-full border border-[#dadce0] hover:bg-[#f8f9fa] text-[#1967d2] font-semibold text-xs transition-colors flex items-center justify-center gap-2"
              >
                <KeyRound className="w-4 h-4" />
                <span>เข้าร่วมด้วยรหัส</span>
              </button>
              {(isAdmin || isTeacher) && (
                <button
                  onClick={onOpenCreateClass}
                  className="w-full sm:w-auto py-2.5 px-5 rounded-full bg-[#1967d2] hover:bg-[#185abc] text-white font-semibold text-xs transition-colors flex items-center justify-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  <span>สร้างชั้นเรียนใหม่</span>
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredCourses.map((course, idx) => {
              const theme = classroomThemes[idx % classroomThemes.length];
              const isMenuOpen = activeMenuCourseId === course.id;
              const isCopied = copiedCodeCourseId === course.id;
              const isEnrolled = enrolledCourseIds.includes(course.id);
              const joinCode = course.joinCode || course.courseCode || course.id;

              return (
                <div
                  key={course.id}
                  className="group bg-white rounded-xl border border-[#dadce0] hover:shadow-md transition-all duration-200 flex flex-col overflow-hidden relative"
                >
                  
                  {/* Google Classroom Card Header Banner */}
                  <div
                    onClick={() =>
                      onNavigate('course-detail', { courseId: course.id, tab: 'stream' })
                    }
                    className={`h-36 ${theme.pattern} p-4 text-white relative cursor-pointer flex flex-col justify-between select-none`}
                  >
                    {/* Top Row: Title & 3-dot Menu */}
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0 pr-8">
                        <h3 className="text-lg font-bold leading-snug truncate hover:underline" title={course.title}>
                          {course.title}
                        </h3>
                        <p className="text-xs text-white/90 truncate mt-0.5">
                          {course.courseCode || 'CS-201'} • {course.term || 'ภาคเรียนที่ 1/2569'}
                        </p>
                      </div>

                      {/* 3-dot Menu Button */}
                      <div className="relative" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() =>
                            setActiveMenuCourseId(isMenuOpen ? null : course.id)
                          }
                          aria-label="ตัวเลือกเพิ่มเติม"
                          className="w-8 h-8 rounded-full flex items-center justify-center text-white/90 hover:bg-white/20 transition-colors focus:outline-none"
                        >
                          <MoreVertical className="w-4 h-4" />
                        </button>

                        {/* Card Menu Dropdown */}
                        {isMenuOpen && (
                          <div className="absolute right-0 mt-1 w-52 bg-white rounded-xl shadow-xl border border-[#dadce0] py-1.5 z-20 text-xs text-[#3c4043] animate-in fade-in duration-100">
                            <button
                              onClick={(e) => {
                                handleCopyCode(course, e);
                                setActiveMenuCourseId(null);
                              }}
                              className="w-full px-4 py-2 text-left hover:bg-[#f8f9fa] flex items-center gap-2.5"
                            >
                              <Copy className="w-3.5 h-3.5 text-[#1967d2]" />
                              <span>คัดลอกรหัสชั้นเรียน ({joinCode})</span>
                            </button>

                            <button
                              onClick={() => {
                                setActiveMenuCourseId(null);
                                onNavigate('course-detail', {
                                  courseId: course.id,
                                  tab: 'classwork',
                                });
                              }}
                              className="w-full px-4 py-2 text-left hover:bg-[#f8f9fa] flex items-center gap-2.5"
                            >
                              <FileText className="w-3.5 h-3.5 text-[#137333]" />
                              <span>ดูงานของชั้นเรียน</span>
                            </button>

                            <button
                              onClick={() => {
                                setActiveMenuCourseId(null);
                                onNavigate('course-detail', {
                                  courseId: course.id,
                                  tab: 'grades',
                                });
                              }}
                              className="w-full px-4 py-2 text-left hover:bg-[#f8f9fa] flex items-center gap-2.5"
                            >
                              <TrendingUp className="w-3.5 h-3.5 text-purple-600" />
                              <span>ดูผลคะแนน</span>
                            </button>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Teacher Name in Banner Bottom */}
                    <div className="text-xs text-white/90 truncate font-medium">
                      ครูผู้สอน: {course.instructorName}
                    </div>

                    {/* Floating Teacher Avatar (Overlapping bottom right of banner) */}
                    <div className="absolute -bottom-6 right-4 z-10 w-14 h-14 rounded-full ring-2 ring-white shadow-md overflow-hidden bg-white flex items-center justify-center text-[#1967d2] font-bold text-lg select-none">
                      {course.instructorName.trim()[0]}
                    </div>
                  </div>

                  {/* Google Classroom Card Body: Upcoming due tasks */}
                  <div
                    onClick={() =>
                      onNavigate('course-detail', { courseId: course.id, tab: 'stream' })
                    }
                    className="p-4 flex-1 flex flex-col justify-between min-h-[96px] cursor-pointer"
                  >
                    <div className="space-y-1">
                      <div className="text-[11px] font-semibold text-[#5f6368] uppercase tracking-wider flex items-center gap-1.5">
                        <Clock className="w-3 h-3 text-[#1967d2]" />
                        <span>กำหนดส่งเร็วๆ นี้</span>
                      </div>

                      <p className="text-xs text-[#3c4043] leading-relaxed pt-1">
                        {idx % 2 === 0 ? (
                          <span className="font-medium text-[#202124] hover:text-[#1967d2] transition-colors">
                            ครบกำหนด วันพรุ่งนี้ 23:59: แบบทดสอบหรือการบ้านประจำบท
                          </span>
                        ) : (
                          <span className="text-[#5f6368] italic">
                            ไม่มีงานที่ครบกำหนดเร็วๆ นี้
                          </span>
                        )}
                      </p>
                    </div>

                    {/* Copied Code Notification Toast inside card */}
                    {isCopied && (
                      <div className="text-[11px] text-emerald-700 font-semibold bg-emerald-50 px-2 py-1 rounded-md border border-emerald-200 flex items-center gap-1 mt-2">
                        <Check className="w-3 h-3" />
                        <span>คัดลอกรหัส {joinCode} สำเร็จ!</span>
                      </div>
                    )}
                  </div>

                  {/* Google Classroom Card Footer: 2 Action Icons */}
                  <div className="border-t border-[#dadce0] px-3 py-2 flex items-center justify-between bg-white">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[11px] text-[#5f6368] font-mono font-semibold px-2 py-0.5 rounded bg-[#f1f3f4]">
                        {joinCode}
                      </span>
                    </div>

                    <div className="flex items-center gap-1">
                      {/* 1. Open Your Work / Grades Button */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onNavigate('course-detail', {
                            courseId: course.id,
                            tab: 'grades',
                          });
                        }}
                        title={`เปิดสมุดพก/คะแนนสำหรับ ${course.title}`}
                        className="w-9 h-9 rounded-full flex items-center justify-center text-[#5f6368] hover:bg-[#f1f3f4] hover:text-[#1967d2] transition-colors"
                      >
                        <TrendingUp className="w-4 h-4" />
                      </button>

                      {/* 2. Open Class Folder / Materials Button */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onNavigate('course-detail', {
                            courseId: course.id,
                            tab: 'classwork',
                          });
                        }}
                        title={`เปิดงานและเนื้อหาสำหรับ ${course.title}`}
                        className="w-9 h-9 rounded-full flex items-center justify-center text-[#5f6368] hover:bg-[#f1f3f4] hover:text-[#1967d2] transition-colors"
                      >
                        <Folder className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                </div>
              );
            })}
          </div>
        )}

      </div>

    </div>
  );
};
