import React, { useState } from 'react';
import {
  Menu,
  Plus,
  Grid,
  Search,
  User as UserIcon,
  LogOut,
  ShieldCheck,
  BookOpen,
  Calendar,
  ClipboardList,
  MessageSquare,
  LayoutDashboard,
  KeyRound,
  ExternalLink,
  GraduationCap,
  Sparkles,
  ChevronDown,
  CheckCircle2,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import type { Course, UserRole } from '../../types';

interface ClassroomNavbarProps {
  currentView: string;
  activeCourse?: Course | null;
  activeTab?: 'stream' | 'classwork' | 'people' | 'grades';
  onTabChange?: (tab: 'stream' | 'classwork' | 'people' | 'grades') => void;
  onNavigate: (view: string, payload?: any) => void;
  onOpenAuth: (mode?: 'login' | 'register') => void;
  onToggleSidebar: () => void;
  onOpenJoinClass: () => void;
  onOpenCreateClass: () => void;
}

export const ClassroomNavbar: React.FC<ClassroomNavbarProps> = ({
  currentView,
  activeCourse,
  activeTab = 'stream',
  onTabChange,
  onNavigate,
  onOpenAuth,
  onToggleSidebar,
  onOpenJoinClass,
  onOpenCreateClass,
}) => {
  const {
    user,
    profile,
    role,
    isAdmin,
    isTeacher,
    signOut,
    simulatedRole,
    setSimulatedRole,
  } = useAuth();

  const [createMenuOpen, setCreateMenuOpen] = useState(false);
  const [appsMenuOpen, setAppsMenuOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);

  const isCourseView = currentView === 'course-detail' && activeCourse;

  const classroomApps = [
    { id: 'home', label: 'ชั้นเรียน', icon: GraduationCap, color: 'bg-emerald-600' },
    { id: 'assignments', label: 'สิ่งที่ต้องทำ', icon: ClipboardList, color: 'bg-blue-600' },
    { id: 'courses', label: 'วิชาทั้งหมด', icon: BookOpen, color: 'bg-indigo-600' },
    { id: 'discussions', label: 'กระดานสนทนา', icon: MessageSquare, color: 'bg-amber-600' },
    { id: 'dashboard', label: 'แดชบอร์ด', icon: LayoutDashboard, color: 'bg-purple-600' },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-[#dadce0] h-16 px-4 flex items-center justify-between select-none shadow-xs">
      
      {/* Left: Hamburger + Google Classroom Logo / Breadcrumbs */}
      <div className="flex items-center gap-3 min-w-0">
        <button
          onClick={onToggleSidebar}
          aria-label="เมนูหลัก"
          className="w-10 h-10 rounded-full flex items-center justify-center text-[#5f6368] hover:bg-[#f1f3f4] transition-colors focus:outline-none"
        >
          <Menu className="w-5 h-5" />
        </button>

        {isCourseView ? (
          // In Course View: Show Course Title & Section
          <div className="flex items-center gap-3 min-w-0">
            <button
              onClick={() => onNavigate('home')}
              className="flex items-center gap-2 group focus:outline-none shrink-0"
              title="กลับสู่หน้าชั้นเรียนทั้งหมด"
            >
              <div className="w-8 h-8 rounded-lg bg-[#137333] border border-[#0d5926] flex items-center justify-center text-white shadow-xs">
                <GraduationCap className="w-4 h-4" />
              </div>
            </button>
            <div className="flex flex-col min-w-0">
              <span className="text-base font-semibold text-[#202124] truncate hover:underline cursor-pointer" onClick={() => onNavigate('course-detail', { courseId: activeCourse.id, tab: 'stream' })}>
                {activeCourse.title}
              </span>
              <span className="text-xs text-[#5f6368] truncate">
                {activeCourse.courseCode || activeCourse.room || 'CS-201'} • {activeCourse.term || 'ภาคเรียนที่ 1/2569'}
              </span>
            </div>
          </div>
        ) : (
          // Main Brand Logo: Google Classroom aesthetic
          <button
            onClick={() => onNavigate('home')}
            className="flex items-center gap-2 group focus:outline-none text-left"
          >
            {/* Google Classroom Green Chalkboard Icon */}
            <div className="w-9 h-9 rounded-lg bg-[#137333] border border-[#0d5926] flex items-center justify-center text-white shadow-xs group-hover:scale-105 transition-transform">
              <GraduationCap className="w-5 h-5 text-amber-300" />
            </div>

            <div className="flex items-baseline gap-1.5">
              <span className="text-xl font-bold tracking-tight text-[#202124] font-['Plus_Jakarta_Sans',sans-serif]">
                <span className="text-[#4285F4]">G</span>
                <span className="text-[#EA4335]">o</span>
                <span className="text-[#FBBC05]">o</span>
                <span className="text-[#4285F4]">g</span>
                <span className="text-[#34A853]">l</span>
                <span className="text-[#EA4335]">e</span>
                <span className="ml-1.5 text-[#5f6368] font-normal text-lg">Classroom</span>
              </span>
              <span className="hidden sm:inline-block text-[11px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                LearnSpace
              </span>
            </div>
          </button>
        )}
      </div>

      {/* Middle: In Course View, show the 4 Google Classroom Tabs */}
      {isCourseView && onTabChange ? (
        <div className="hidden md:flex items-center justify-center h-full gap-1">
          <button
            onClick={() => onTabChange('stream')}
            className={`h-full px-5 text-sm font-semibold flex items-center relative transition-colors ${
              activeTab === 'stream'
                ? 'text-[#1967d2]'
                : 'text-[#5f6368] hover:text-[#202124] hover:bg-[#f8f9fa]'
            }`}
          >
            <span>สตรีม</span>
            {activeTab === 'stream' && (
              <span className="absolute bottom-0 left-0 right-0 h-[3px] bg-[#1967d2] rounded-t-full" />
            )}
          </button>

          <button
            onClick={() => onTabChange('classwork')}
            className={`h-full px-5 text-sm font-semibold flex items-center relative transition-colors ${
              activeTab === 'classwork'
                ? 'text-[#1967d2]'
                : 'text-[#5f6368] hover:text-[#202124] hover:bg-[#f8f9fa]'
            }`}
          >
            <span>งานของชั้นเรียน</span>
            {activeTab === 'classwork' && (
              <span className="absolute bottom-0 left-0 right-0 h-[3px] bg-[#1967d2] rounded-t-full" />
            )}
          </button>

          <button
            onClick={() => onTabChange('people')}
            className={`h-full px-5 text-sm font-semibold flex items-center relative transition-colors ${
              activeTab === 'people'
                ? 'text-[#1967d2]'
                : 'text-[#5f6368] hover:text-[#202124] hover:bg-[#f8f9fa]'
            }`}
          >
            <span>ผู้คน</span>
            {activeTab === 'people' && (
              <span className="absolute bottom-0 left-0 right-0 h-[3px] bg-[#1967d2] rounded-t-full" />
            )}
          </button>

          <button
            onClick={() => onTabChange('grades')}
            className={`h-full px-5 text-sm font-semibold flex items-center relative transition-colors ${
              activeTab === 'grades'
                ? 'text-[#1967d2]'
                : 'text-[#5f6368] hover:text-[#202124] hover:bg-[#f8f9fa]'
            }`}
          >
            <span>คะแนน</span>
            {activeTab === 'grades' && (
              <span className="absolute bottom-0 left-0 right-0 h-[3px] bg-[#1967d2] rounded-t-full" />
            )}
          </button>
        </div>
      ) : (
        // When in standard views, show quick navigation pill or search
        <div className="hidden lg:flex items-center gap-1 bg-[#f1f3f4] rounded-full px-4 py-1.5 text-xs text-[#5f6368] max-w-md w-full mx-6">
          <Search className="w-4 h-4 text-[#5f6368] shrink-0" />
          <input
            type="text"
            placeholder="ค้นหาชั้นเรียน บทเรียน หรือครูผู้สอน..."
            onFocus={() => {
              if (currentView !== 'courses') onNavigate('courses');
            }}
            className="w-full bg-transparent text-[#202124] text-xs focus:outline-none placeholder-[#5f6368]"
          />
        </div>
      )}

      {/* Right: + Button, Waffle Grid, User Avatar */}
      <div className="flex items-center gap-1 sm:gap-2">
        
        {/* + Button (Create or Join class dropdown) */}
        <div className="relative">
          <button
            onClick={() => {
              setCreateMenuOpen(!createMenuOpen);
              setAppsMenuOpen(false);
              setProfileMenuOpen(false);
            }}
            aria-label="สร้างหรือเข้าร่วมชั้นเรียน"
            className="w-10 h-10 rounded-full flex items-center justify-center text-[#5f6368] hover:bg-[#f1f3f4] transition-colors focus:outline-none"
          >
            <Plus className="w-5 h-5 text-[#3c4043]" />
          </button>

          {createMenuOpen && (
            <div className="absolute right-0 mt-2 w-52 bg-white rounded-xl shadow-lg border border-[#dadce0] py-2 z-50 text-xs animate-in fade-in slide-in-from-top-2 duration-150">
              <button
                onClick={() => {
                  setCreateMenuOpen(false);
                  onOpenJoinClass();
                }}
                className="w-full px-4 py-2.5 text-left text-[#3c4043] hover:bg-[#f8f9fa] flex items-center gap-3 font-medium transition-colors"
              >
                <KeyRound className="w-4 h-4 text-[#1967d2]" />
                <span>เข้าร่วมชั้นเรียน</span>
              </button>

              {(isAdmin || isTeacher) && (
                <button
                  onClick={() => {
                    setCreateMenuOpen(false);
                    onOpenCreateClass();
                  }}
                  className="w-full px-4 py-2.5 text-left text-[#3c4043] hover:bg-[#f8f9fa] flex items-center gap-3 font-medium transition-colors"
                >
                  <Plus className="w-4 h-4 text-[#137333]" />
                  <span>สร้างชั้นเรียน</span>
                </button>
              )}

              <div className="my-1 border-t border-[#f1f3f4]" />

              <button
                onClick={() => {
                  setCreateMenuOpen(false);
                  onNavigate('courses');
                }}
                className="w-full px-4 py-2.5 text-left text-[#5f6368] hover:bg-[#f8f9fa] flex items-center gap-3 font-medium transition-colors"
              >
                <BookOpen className="w-4 h-4" />
                <span>สำรวจรายวิชาทั้งหมด</span>
              </button>
            </div>
          )}
        </div>

        {/* 9-dot Waffle Menu (Google Apps Launcher) */}
        <div className="relative">
          <button
            onClick={() => {
              setAppsMenuOpen(!appsMenuOpen);
              setCreateMenuOpen(false);
              setProfileMenuOpen(false);
            }}
            aria-label="Google แอป"
            className="w-10 h-10 rounded-full flex items-center justify-center text-[#5f6368] hover:bg-[#f1f3f4] transition-colors focus:outline-none"
          >
            <Grid className="w-5 h-5 text-[#3c4043]" />
          </button>

          {appsMenuOpen && (
            <div className="absolute right-0 mt-2 w-72 bg-white rounded-2xl shadow-xl border border-[#dadce0] p-4 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
              <div className="text-xs font-semibold text-[#5f6368] px-2 mb-3">
                LearnSpace Google Suite
              </div>
              <div className="grid grid-cols-3 gap-2 text-center">
                {classroomApps.map((app) => {
                  const Icon = app.icon;
                  return (
                    <button
                      key={app.id}
                      onClick={() => {
                        setAppsMenuOpen(false);
                        onNavigate(app.id);
                      }}
                      className="p-3 rounded-xl hover:bg-[#f1f3f4] transition-colors flex flex-col items-center gap-2 group"
                    >
                      <div className={`w-10 h-10 rounded-full ${app.color} text-white flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <span className="text-[11px] font-medium text-[#3c4043] leading-tight">
                        {app.label}
                      </span>
                    </button>
                  );
                })}
              </div>

              {isAdmin && (
                <div className="mt-3 pt-3 border-t border-[#f1f3f4]">
                  <button
                    onClick={() => {
                      setAppsMenuOpen(false);
                      onNavigate('admin');
                    }}
                    className="w-full py-2 px-3 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-900 text-xs font-bold flex items-center justify-center gap-2 transition-colors border border-amber-200"
                  >
                    <ShieldCheck className="w-4 h-4 text-amber-600" />
                    <span>คอนโซลผู้ดูแลระบบ (Admin)</span>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* User Google Account Circle */}
        <div className="relative">
          {user ? (
            <button
              onClick={() => {
                setProfileMenuOpen(!profileMenuOpen);
                setCreateMenuOpen(false);
                setAppsMenuOpen(false);
              }}
              aria-label="บัญชี Google"
              className="w-9 h-9 rounded-full ring-2 ring-[#1967d2]/20 hover:ring-[#1967d2] transition-all overflow-hidden flex items-center justify-center focus:outline-none"
            >
              {profile?.photoURL ? (
                <img
                  src={profile.photoURL}
                  alt={profile.displayName || 'Google Account'}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-[#1967d2] text-white flex items-center justify-center font-bold text-sm">
                  {(profile?.displayName || user.email || 'U')[0].toUpperCase()}
                </div>
              )}
            </button>
          ) : (
            <button
              onClick={() => onOpenAuth('login')}
              className="py-1.5 px-4 bg-[#1967d2] hover:bg-[#185abc] text-white text-xs font-semibold rounded-md transition-colors shadow-xs"
            >
              ลงชื่อเข้าใช้
            </button>
          )}

          {/* Google Profile Card Popover */}
          {profileMenuOpen && user && (
            <div className="absolute right-0 mt-2 w-80 bg-white rounded-3xl shadow-2xl border border-[#dadce0] p-6 z-50 animate-in fade-in slide-in-from-top-2 duration-150 text-center">
              
              {/* Account Email Heading */}
              <div className="text-xs text-[#5f6368] font-medium truncate mb-4">
                {user.email || 'bbak9988@gmail.com'}
              </div>

              {/* Avatar Large */}
              <div className="w-20 h-20 rounded-full mx-auto overflow-hidden ring-4 ring-[#e8f0fe] mb-3 flex items-center justify-center bg-[#1967d2] text-white text-3xl font-bold shadow-xs">
                {profile?.photoURL ? (
                  <img
                    src={profile.photoURL}
                    alt={profile.displayName || 'User'}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span>{(profile?.displayName || user.email || 'U')[0].toUpperCase()}</span>
                )}
              </div>

              {/* Display Name & Email */}
              <h3 className="text-base font-bold text-[#202124] leading-tight">
                {profile?.displayName || 'ผู้ใช้งาน LearnSpace'}
              </h3>
              <p className="text-xs text-[#5f6368] mt-0.5 font-mono">
                {user.email}
              </p>

              {/* Role Badge */}
              <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border bg-blue-50 text-blue-700 border-blue-200">
                {isAdmin ? (
                  <>
                    <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
                    <span>ผู้ดูแลระบบสูงสุด (Super Admin)</span>
                  </>
                ) : isTeacher ? (
                  <>
                    <GraduationCap className="w-3.5 h-3.5 text-emerald-600" />
                    <span>ครูผู้สอน (Teacher)</span>
                  </>
                ) : (
                  <>
                    <UserIcon className="w-3.5 h-3.5 text-slate-600" />
                    <span>นักเรียน (Student)</span>
                  </>
                )}
              </div>

              {/* Google Account Manage Pill Button */}
              <div className="mt-4">
                <button
                  onClick={() => {
                    setProfileMenuOpen(false);
                    onNavigate('profile');
                  }}
                  className="w-full py-2 px-4 rounded-full border border-[#dadce0] hover:bg-[#f8f9fa] text-xs font-medium text-[#3c4043] transition-colors"
                >
                  จัดการโปรไฟล์ LearnSpace
                </button>
              </div>

              {/* Admin Console Direct Link (If bbak9988@gmail.com / isAdmin) */}
              {isAdmin && (
                <div className="mt-2">
                  <button
                    onClick={() => {
                      setProfileMenuOpen(false);
                      onNavigate('admin');
                    }}
                    className="w-full py-2 px-4 rounded-full bg-blue-50 hover:bg-blue-100 text-blue-800 text-xs font-bold transition-colors flex items-center justify-center gap-1.5"
                  >
                    <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
                    <span>เปิดคอนโซลผู้ดูแลระบบ</span>
                  </button>
                </div>
              )}

              {/* Role Simulation for Testing */}
              {isAdmin && (
                <div className="mt-4 pt-4 border-t border-[#f1f3f4] text-left">
                  <span className="text-[11px] font-bold text-[#5f6368] block mb-1.5">
                    จำลองมุมมองสิทธิ์ (Role Simulator):
                  </span>
                  <div className="grid grid-cols-3 gap-1">
                    {(['admin', 'teacher', 'student'] as UserRole[]).map((r) => {
                      const isActive = (simulatedRole || role) === r;
                      return (
                        <button
                          key={r}
                          onClick={() => setSimulatedRole(r === role ? null : r)}
                          className={`py-1 px-2 rounded-lg text-[10px] font-bold transition-all border ${
                            isActive
                              ? 'bg-blue-600 text-white border-blue-600'
                              : 'bg-[#f8f9fa] text-[#5f6368] border-[#dadce0] hover:bg-[#f1f3f4]'
                          }`}
                        >
                          {r === 'admin' ? 'แอดมิน' : r === 'teacher' ? 'ครู' : 'นักเรียน'}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Sign Out Button */}
              <div className="mt-4 pt-4 border-t border-[#f1f3f4]">
                <button
                  onClick={async () => {
                    setProfileMenuOpen(false);
                    await signOut();
                    onNavigate('home');
                  }}
                  className="w-full py-2 px-4 rounded-full hover:bg-red-50 text-red-600 hover:text-red-700 text-xs font-bold transition-colors flex items-center justify-center gap-2"
                >
                  <LogOut className="w-4 h-4" />
                  <span>ออกจากระบบ</span>
                </button>
              </div>

            </div>
          )}
        </div>

      </div>

    </header>
  );
};
