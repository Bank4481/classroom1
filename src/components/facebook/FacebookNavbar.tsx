import React, { useState } from 'react';
import {
  GraduationCap,
  Search,
  Home,
  Tv,
  Users,
  ClipboardList,
  Trophy,
  Plus,
  MessageCircle,
  Bell,
  User as UserIcon,
  LogOut,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Sparkles,
  BookOpen,
  Menu,
  X,
  FileText,
  HelpCircle,
  Award,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface FacebookNavbarProps {
  currentView: string;
  onNavigate: (view: string, payload?: any) => void;
  onOpenAuth: (mode?: 'login' | 'register') => void;
  onToggleMessenger: () => void;
  onOpenCreatePost: () => void;
  onOpenJoinClass?: () => void;
  messengerUnreadCount?: number;
}

export const FacebookNavbar: React.FC<FacebookNavbarProps> = ({
  currentView,
  onNavigate,
  onOpenAuth,
  onToggleMessenger,
  onOpenCreatePost,
  onOpenJoinClass,
  messengerUnreadCount = 0,
}) => {
  const { user, profile, role, isAdmin, isTeacher, signOut, simulatedRole, setSimulatedRole } = useAuth();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [createMenuOpen, setCreateMenuOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Center navigation tabs matching Facebook Web exactly
  const navTabs = [
    { id: 'home', label: 'หน้าหลัก', icon: Home },
    { id: 'courses', label: 'คอร์สเรียน', icon: Tv },
    { id: 'discussions', label: 'กลุ่ม & ชุมชน', icon: Users },
    { id: 'assignments', label: 'การบ้าน', icon: ClipboardList },
    { id: 'dashboard', label: 'แดชบอร์ด & ควิซ', icon: Trophy, authRequired: true },
  ];

  const handleTabClick = (id: string, authRequired?: boolean) => {
    if (authRequired && !user) {
      onOpenAuth('login');
      return;
    }
    onNavigate(id);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      onNavigate('courses', { search: searchQuery.trim() });
    }
  };

  // Mock notifications representing real classroom events
  const notifications = [
    {
      id: '1',
      title: 'อาจารย์ได้ตรวจการบ้านแล้ว',
      desc: 'ตรวจการบ้าน Assignment: ระบบวิเคราะห์ข้อมูล ได้รับ 100 คะแนนเต็ม 🎉',
      time: '10 นาทีที่แล้ว',
      unread: true,
      actionView: 'assignments',
    },
    {
      id: '2',
      title: 'มีคำถามใหม่ในวิชาที่กำลังศึกษา',
      desc: 'นายสมชาย โพสต์คำถาม: "การจัดการ State ด้วย React Hook ทำอย่างไร?"',
      time: '1 ชั่วโมงที่แล้ว',
      unread: true,
      actionView: 'discussions',
    },
    {
      id: '3',
      title: 'ควิซประจำสัปดาห์เปิดแล้ว',
      desc: 'แบบทดสอบ Quiz 1: พื้นฐานการเขียนโปรแกรม เปิดให้ทดสอบแล้ววันนี้',
      time: '3 ชั่วโมงที่แล้ว',
      unread: false,
      actionView: 'courses',
    },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-[#CED0D4]/70 shadow-[0_2px_4px_rgba(0,0,0,0.06)] h-14 select-none">
      <div className="h-full px-4 flex items-center justify-between gap-2 max-w-[1920px] mx-auto">
        
        {/* =========================================================
            LEFT SECTION: Facebook-style Logo & Pill Search Bar
        ========================================================= */}
        <div className="flex items-center gap-2.5 shrink-0">
          {/* Facebook Brand Mark (Circle with vivid Facebook Blue) */}
          <button
            onClick={() => onNavigate('home')}
            className="flex items-center gap-2 text-left group focus:outline-none"
            title="LearnSpace หน้าแรก"
          >
            <div className="w-10 h-10 rounded-full bg-[#1877F2] hover:bg-[#166FE5] flex items-center justify-center text-white shadow-xs transition-transform active:scale-95">
              <span className="font-extrabold text-2xl tracking-tighter font-sans -mt-0.5">
                L
              </span>
            </div>
            <div className="hidden xl:block">
              <span className="text-xl font-black text-[#1877F2] tracking-tight font-sans">
                LearnSpace
              </span>
            </div>
          </button>

          {/* Facebook Pill Search Bar */}
          <form
            onSubmit={handleSearchSubmit}
            className="hidden sm:flex items-center bg-[#F0F2F5] hover:bg-[#E4E6EB] transition-colors rounded-full px-3 py-2 w-48 md:w-64 lg:w-72"
          >
            <Search className="w-4 h-4 text-slate-500 shrink-0 mr-2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ค้นหาใน LearnSpace..."
              className="bg-transparent text-xs text-slate-900 placeholder:text-slate-500 w-full focus:outline-none"
            />
          </form>
        </div>

        {/* =========================================================
            CENTER SECTION: Facebook Primary Navigation Tabs
        ========================================================= */}
        <nav className="hidden md:flex items-center h-full max-w-2xl flex-1 justify-center px-2">
          {navTabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = currentView === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => handleTabClick(tab.id, tab.authRequired)}
                title={tab.label}
                className={`relative flex items-center justify-center flex-1 h-full px-4 lg:px-7 group transition-all ${
                  isActive
                    ? 'text-[#1877F2] border-b-[3.5px] border-[#1877F2]'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <div
                  className={`flex items-center justify-center w-full py-2 rounded-lg transition-colors ${
                    isActive ? '' : 'group-hover:bg-[#F0F2F5]'
                  }`}
                >
                  <Icon
                    className={`w-6 h-6 transition-transform group-hover:scale-105 ${
                      isActive ? 'stroke-[2.4px]' : 'stroke-[1.8px]'
                    }`}
                  />
                </div>
              </button>
            );
          })}
        </nav>

        {/* =========================================================
            RIGHT SECTION: Actions (Create, Messenger, Notif, Profile)
        ========================================================= */}
        <div className="flex items-center gap-2 shrink-0">
          
          {/* 1. Quick Create Button (+) */}
          {user && (
            <div className="relative">
              <button
                onClick={() => {
                  setCreateMenuOpen(!createMenuOpen);
                  setNotificationsOpen(false);
                  setProfileDropdownOpen(false);
                }}
                className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
                  createMenuOpen
                    ? 'bg-blue-100 text-[#1877F2]'
                    : 'bg-[#E4E6EB] hover:bg-[#D8DADF] text-slate-800'
                }`}
                title="สร้าง"
              >
                <Plus className="w-5 h-5" />
              </button>

              {createMenuOpen && (
                <div
                  className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-2xl border border-slate-200 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150"
                  onMouseLeave={() => setCreateMenuOpen(false)}
                >
                  <div className="px-4 py-2 border-b border-slate-100">
                    <p className="text-xs font-bold text-slate-900">สร้างสิ่งใหม่</p>
                  </div>
                  <div className="py-1">
                    <button
                      onClick={() => {
                        setCreateMenuOpen(false);
                        onOpenCreatePost();
                      }}
                      className="w-full px-4 py-2 text-left text-xs font-medium text-slate-700 hover:bg-[#F0F2F5] flex items-center gap-3"
                    >
                      <div className="w-8 h-8 rounded-full bg-blue-50 text-[#1877F2] flex items-center justify-center">
                        <FileText className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="font-semibold text-slate-900">โพสต์ในฟีด</p>
                        <p className="text-[10px] text-slate-500">แชร์คำถามหรือบันทึกการเรียน</p>
                      </div>
                    </button>

                    <button
                      onClick={() => {
                        setCreateMenuOpen(false);
                        onNavigate('assignments');
                      }}
                      className="w-full px-4 py-2 text-left text-xs font-medium text-slate-700 hover:bg-[#F0F2F5] flex items-center gap-3"
                    >
                      <div className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center">
                        <ClipboardList className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="font-semibold text-slate-900">ส่งการบ้าน</p>
                        <p className="text-[10px] text-slate-500">ส่งงานและตรวจสอบผลตรวจ</p>
                      </div>
                    </button>

                    <button
                      onClick={() => {
                        setCreateMenuOpen(false);
                        onNavigate('courses');
                      }}
                      className="w-full px-4 py-2 text-left text-xs font-medium text-slate-700 hover:bg-[#F0F2F5] flex items-center gap-3"
                    >
                      <div className="w-8 h-8 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center">
                        <BookOpen className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="font-semibold text-slate-900">ดูรายวิชาทั้งหมด</p>
                        <p className="text-[10px] text-slate-500">แคตตาล็อกและบทเรียนออนไลน์</p>
                      </div>
                    </button>

                    {onOpenJoinClass && (
                      <button
                        onClick={() => {
                          setCreateMenuOpen(false);
                          onOpenJoinClass();
                        }}
                        className="w-full px-4 py-2 text-left text-xs font-medium text-slate-700 hover:bg-[#F0F2F5] flex items-center gap-3"
                      >
                        <div className="w-8 h-8 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center">
                          <GraduationCap className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="font-semibold text-slate-900">เข้าร่วมชั้นเรียนด้วยรหัส</p>
                          <p className="text-[10px] text-slate-500">กรอกรหัสจากครูผู้สอนเพื่อเข้าเรียน</p>
                        </div>
                      </button>
                    )}

                    {isAdmin && (
                      <button
                        onClick={() => {
                          setCreateMenuOpen(false);
                          onNavigate('admin');
                        }}
                        className="w-full px-4 py-2 text-left text-xs font-medium text-slate-700 hover:bg-[#F0F2F5] flex items-center gap-3 border-t border-slate-100"
                      >
                        <div className="w-8 h-8 rounded-full bg-purple-50 text-purple-600 flex items-center justify-center">
                          <ShieldCheck className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="font-semibold text-slate-900">จัดการบทเรียน & ระบบ (Admin CMS)</p>
                          <p className="text-[10px] text-slate-500">เพิ่ม/ลด/แก้ไขเนื้อหาทุกส่วน</p>
                        </div>
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* 2. Messenger Floating Chat Toggle */}
          <button
            onClick={onToggleMessenger}
            className="relative w-10 h-10 rounded-full bg-[#E4E6EB] hover:bg-[#D8DADF] flex items-center justify-center text-slate-800 transition-colors"
            title="Messenger แชตสด"
          >
            <MessageCircle className="w-5 h-5" />
            <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 text-white text-[9px] font-bold flex items-center justify-center border-2 border-white animate-pulse">
              ●
            </span>
          </button>

          {/* 3. Notifications Bell Dropdown */}
          <div className="relative">
            <button
              onClick={() => {
                setNotificationsOpen(!notificationsOpen);
                setProfileDropdownOpen(false);
                setCreateMenuOpen(false);
              }}
              className={`relative w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
                notificationsOpen
                  ? 'bg-blue-100 text-[#1877F2]'
                  : 'bg-[#E4E6EB] hover:bg-[#D8DADF] text-slate-800'
              }`}
              title="การแจ้งเตือน"
            >
              <Bell className="w-5 h-5" />
              <span className="absolute -top-1 -right-1 px-1.5 py-0.5 rounded-full bg-[#E41E3F] text-white text-[10px] font-bold flex items-center justify-center border-2 border-white shadow-xs">
                2
              </span>
            </button>

            {notificationsOpen && (
              <div
                className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-slate-200 py-3 z-50 animate-in fade-in slide-in-from-top-2 duration-150"
                onMouseLeave={() => setNotificationsOpen(false)}
              >
                <div className="px-4 pb-2 border-b border-slate-100 flex items-center justify-between">
                  <h3 className="text-base font-bold text-slate-900">การแจ้งเตือน</h3>
                  <span className="text-xs text-[#1877F2] font-semibold cursor-pointer hover:underline">
                    ทำเครื่องหมายว่าอ่านแล้ว
                  </span>
                </div>

                <div className="divide-y divide-slate-100 max-h-96 overflow-y-auto">
                  {notifications.map((n) => (
                    <div
                      key={n.id}
                      onClick={() => {
                        onNavigate(n.actionView);
                        setNotificationsOpen(false);
                      }}
                      className={`p-3.5 hover:bg-[#F0F2F5] transition-colors cursor-pointer flex gap-3 ${
                        n.unread ? 'bg-blue-50/40' : ''
                      }`}
                    >
                      <div className="w-10 h-10 rounded-full bg-blue-100 text-[#1877F2] flex items-center justify-center shrink-0">
                        <Sparkles className="w-5 h-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-slate-900 leading-tight">
                          {n.title}
                        </p>
                        <p className="text-xs text-slate-600 mt-0.5 leading-snug line-clamp-2">
                          {n.desc}
                        </p>
                        <p className="text-[10px] text-[#1877F2] font-semibold mt-1">
                          {n.time}
                        </p>
                      </div>
                      {n.unread && (
                        <span className="w-2.5 h-2.5 rounded-full bg-[#1877F2] self-center shrink-0" />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* 4. User Profile Dropdown / Sign In Buttons */}
          {user ? (
            <div className="relative">
              <button
                onClick={() => {
                  setProfileDropdownOpen(!profileDropdownOpen);
                  setNotificationsOpen(false);
                  setCreateMenuOpen(false);
                }}
                className="relative focus:outline-none"
                title="บัญชีของคุณ"
              >
                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#1877F2] to-sky-400 text-white flex items-center justify-center font-bold text-sm shadow-xs border-2 border-transparent hover:border-slate-300 transition-colors">
                  {profile?.displayName ? profile.displayName.charAt(0).toUpperCase() : 'U'}
                </div>
                <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 rounded-full border-2 border-white ring-1 ring-emerald-400" />
              </button>

              {profileDropdownOpen && (
                <div
                  className="absolute right-0 mt-2 w-72 bg-white text-slate-800 rounded-2xl shadow-2xl border border-slate-200 py-3 z-50 animate-in fade-in slide-in-from-top-2 duration-150"
                  onMouseLeave={() => setProfileDropdownOpen(false)}
                >
                  {/* User Profile Header Card */}
                  <div
                    onClick={() => {
                      setProfileDropdownOpen(false);
                      onNavigate('profile');
                    }}
                    className="mx-3 p-3 rounded-xl bg-slate-50 hover:bg-[#F0F2F5] cursor-pointer transition-colors border border-slate-200/80 flex items-center gap-3 mb-2"
                  >
                    <div className="w-11 h-11 rounded-full bg-[#1877F2] text-white flex items-center justify-center font-bold text-base shadow-xs shrink-0">
                      {profile?.displayName ? profile.displayName.charAt(0).toUpperCase() : 'U'}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-bold text-slate-900 truncate">
                        {profile?.displayName || user.email?.split('@')[0]}
                      </p>
                      <p className="text-[11px] text-slate-500 truncate">{user.email}</p>
                      <p className="text-[10px] text-[#1877F2] font-semibold mt-0.5 capitalize">
                        ดูโปรไฟล์ของคุณ
                      </p>
                    </div>
                  </div>

                  {/* Navigation Links */}
                  <div className="py-1 px-1">
                    <button
                      onClick={() => {
                        setProfileDropdownOpen(false);
                        onNavigate('dashboard');
                      }}
                      className="w-full px-3 py-2 text-left text-xs font-semibold text-slate-700 hover:bg-[#F0F2F5] rounded-xl flex items-center gap-3"
                    >
                      <Trophy className="w-4 h-4 text-amber-500" />
                      <span>แดชบอร์ดความก้าวหน้า & ควิซ</span>
                    </button>

                    <button
                      onClick={() => {
                        setProfileDropdownOpen(false);
                        onNavigate('assignments');
                      }}
                      className="w-full px-3 py-2 text-left text-xs font-semibold text-slate-700 hover:bg-[#F0F2F5] rounded-xl flex items-center gap-3"
                    >
                      <ClipboardList className="w-4 h-4 text-emerald-600" />
                      <span>รายการการบ้านของฉัน</span>
                    </button>

                    {isAdmin && (
                      <button
                        onClick={() => {
                          setProfileDropdownOpen(false);
                          onNavigate('admin');
                        }}
                        className="w-full px-3 py-2 text-left text-xs font-semibold text-purple-700 hover:bg-purple-50 rounded-xl flex items-center gap-3"
                      >
                        <ShieldCheck className="w-4 h-4 text-purple-600" />
                        <span>ศูนย์ควบคุมผู้ดูแลระบบ (Admin CMS)</span>
                      </button>
                    )}
                  </div>

                  {/* Role Switcher - Visible strictly to actual owner admin to test view */}
                  {user?.email?.toLowerCase() === 'bbak9988@gmail.com' && (
                    <div className="mx-3 my-2 p-2.5 rounded-xl bg-[#F0F2F5] border border-slate-200">
                      <p className="text-[10px] font-bold text-slate-600 mb-1.5 flex items-center justify-between">
                        <span>สลับมุมมองทดสอบ (Owner Tool):</span>
                        <span className="text-[9px] text-[#1877F2] font-semibold">bbak9988</span>
                      </p>
                      <div className="grid grid-cols-2 gap-1">
                        <button
                          onClick={() => setSimulatedRole('student')}
                          className={`text-[10px] py-1 rounded-md text-center font-bold transition-colors ${
                            role === 'student'
                              ? 'bg-[#1877F2] text-white shadow-xs'
                              : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
                          }`}
                        >
                          มุมมองนักเรียน
                        </button>
                        <button
                          onClick={() => setSimulatedRole(null)}
                          className={`text-[10px] py-1 rounded-md text-center font-bold transition-colors ${
                            isAdmin
                              ? 'bg-purple-700 text-white shadow-xs'
                              : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
                          }`}
                        >
                          มุมมองผู้ดูแล
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Log Out */}
                  <div className="pt-1 px-1 border-t border-slate-100">
                    <button
                      onClick={async () => {
                        setProfileDropdownOpen(false);
                        await signOut();
                        onNavigate('home');
                      }}
                      className="w-full px-3 py-2 text-left text-xs font-semibold text-rose-600 hover:bg-rose-50 rounded-xl flex items-center gap-3"
                    >
                      <LogOut className="w-4 h-4 text-rose-500" />
                      <span>ออกจากระบบ</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={() => onOpenAuth('login')}
                className="px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-[#F0F2F5] rounded-lg transition-colors"
              >
                เข้าสู่ระบบ
              </button>
              <button
                onClick={() => onOpenAuth('register')}
                className="px-3.5 py-1.5 text-xs font-bold text-white bg-[#1877F2] hover:bg-[#166FE5] rounded-lg shadow-xs transition-colors whitespace-nowrap"
              >
                สร้างบัญชีใหม่
              </button>
            </div>
          )}

          {/* Mobile Menu Hamburger */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-slate-600 hover:bg-[#F0F2F5] rounded-full"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-b border-slate-200 shadow-xl px-4 py-3 space-y-2">
          {navTabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = currentView === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  handleTabClick(tab.id, tab.authRequired);
                  setMobileMenuOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold ${
                  isActive
                    ? 'bg-blue-50 text-[#1877F2]'
                    : 'text-slate-700 hover:bg-[#F0F2F5]'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      )}
    </header>
  );
};
