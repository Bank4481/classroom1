import React, { useState } from 'react';
import {
  GraduationCap,
  LayoutDashboard,
  BookOpen,
  FileCheck2,
  MessagesSquare,
  ShieldCheck,
  User as UserIcon,
  LogOut,
  ChevronRight,
  Menu,
  X,
  Home,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import type { UserRole } from '../../types';

interface SidebarProps {
  currentView: string;
  onNavigate: (view: string, payload?: any) => void;
  onOpenAuth: (mode?: 'login' | 'register') => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentView,
  onNavigate,
  onOpenAuth,
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
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);

  const mainNavItems = [
    { id: 'dashboard', label: 'แดชบอร์ดการเรียน', icon: LayoutDashboard, badge: 'ศูนย์กลาง', authRequired: true },
    { id: 'courses', label: 'คอร์ส & บทเรียน', icon: BookOpen },
    { id: 'assignments', label: 'กิจกรรม & ส่งงาน', icon: FileCheck2 },
    { id: 'discussions', label: 'กระดานสนทนาสด', icon: MessagesSquare },
    { id: 'home', label: 'หน้าประชาสัมพันธ์', icon: Home },
  ];

  const handleNavClick = (id: string, authRequired?: boolean) => {
    if (authRequired && !user) {
      onOpenAuth('login');
      return;
    }
    onNavigate(id);
    setMobileDrawerOpen(false);
  };

  return (
    <>
      {/* ─────────────────────────────────────────────────────────────
          1. DESKTOP FIXED SIDEBAR (lg: >= 1024px)
      ───────────────────────────────────────────────────────────── */}
      <aside className="hidden lg:flex flex-col w-64 bg-slate-900 text-white border-r border-slate-800 shrink-0 min-h-screen sticky top-0 h-screen z-30 select-none">
        
        {/* Brand Header */}
        <div className="p-6 border-b border-slate-800 flex items-center justify-between">
          <button
            onClick={() => onNavigate('home')}
            className="flex items-center gap-3 text-left group focus:outline-none"
          >
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 group-hover:bg-amber-500 group-hover:text-slate-950 transition-colors shadow-xs">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div>
              <span className="text-lg font-bold tracking-tight text-white font-['Plus_Jakarta_Sans',sans-serif]">
                Learn<span className="text-amber-400">Space</span>
              </span>
              <p className="text-[10px] text-slate-400 font-medium">Educational Platform</p>
            </div>
          </button>
        </div>

        {/* Navigation Links Area */}
        <div className="flex-1 py-6 px-3 space-y-1.5 overflow-y-auto">
          <p className="px-3 text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">
            เมนูการใช้งานหลัก
          </p>

          {mainNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id, item.authRequired)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-amber-500 text-slate-950 font-bold shadow-sm'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/70'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className={`w-4 h-4 ${
                      isActive ? 'text-slate-950' : 'text-slate-400'
                    }`}
                  />
                  <span>{item.label}</span>
                </div>
                {item.badge && !isActive && (
                  <span className="text-[9px] px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-300 font-bold border border-amber-500/30">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}

          {(isAdmin || isTeacher) && (
            <div className="pt-4 mt-4 border-t border-slate-800/80">
              <p className="px-3 text-[11px] font-semibold text-amber-400 uppercase tracking-wider mb-2">
                สำหรับผู้สอน & ผู้ดูแล
              </p>
              <button
                onClick={() => onNavigate('admin')}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  currentView === 'admin'
                    ? 'bg-amber-500 text-slate-950 font-bold shadow-sm'
                    : 'text-amber-300 hover:text-white hover:bg-slate-800/70'
                }`}
              >
                <div className="flex items-center gap-3">
                  <ShieldCheck className="w-4 h-4 text-amber-400" />
                  <span>จัดการระบบ (CMS)</span>
                </div>
                <ChevronRight className="w-3.5 h-3.5 opacity-60" />
              </button>
            </div>
          )}
        </div>

        {/* User Card in Desktop Sidebar Bottom */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/60">
          {user ? (
            <div className="space-y-3">
              <div
                onClick={() => onNavigate('profile')}
                className="flex items-center gap-3 p-2 rounded-xl hover:bg-slate-800/60 cursor-pointer transition-colors"
              >
                <div className="w-9 h-9 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center font-bold text-xs shrink-0 shadow-xs">
                  {profile?.displayName ? profile.displayName.charAt(0).toUpperCase() : 'U'}
                </div>
                <div className="truncate flex-1">
                  <p className="text-xs font-bold text-white truncate">
                    {profile?.displayName || user.email?.split('@')[0]}
                  </p>
                  <p className="text-[10px] text-amber-400 capitalize">
                    {role === 'admin' ? 'ผู้ดูแลระบบ' : role === 'teacher' ? 'อาจารย์ผู้สอน' : 'นักเรียน'}
                  </p>
                </div>
              </div>

              {/* Quick Role Preview Buttons */}
              <div className="pt-2 border-t border-slate-800">
                <p className="text-[10px] text-slate-400 mb-1.5 font-medium">สลับมุมมองทดสอบ:</p>
                <div className="grid grid-cols-3 gap-1">
                  <button
                    onClick={() => setSimulatedRole('student')}
                    className={`text-[9px] py-1 rounded text-center transition-colors ${
                      role === 'student'
                        ? 'bg-amber-500 text-slate-950 font-bold'
                        : 'bg-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    นักเรียน
                  </button>
                  <button
                    onClick={() => setSimulatedRole('teacher')}
                    className={`text-[9px] py-1 rounded text-center transition-colors ${
                      role === 'teacher'
                        ? 'bg-amber-500 text-slate-950 font-bold'
                        : 'bg-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    อาจารย์
                  </button>
                  <button
                    onClick={() => setSimulatedRole('admin')}
                    className={`text-[9px] py-1 rounded text-center transition-colors ${
                      role === 'admin'
                        ? 'bg-amber-500 text-slate-950 font-bold'
                        : 'bg-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    แอดมิน
                  </button>
                </div>
              </div>

              <button
                onClick={signOut}
                className="w-full py-1.5 px-3 rounded-lg text-[11px] text-rose-400 hover:bg-rose-500/10 flex items-center justify-center gap-1.5 transition-colors"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>ออกจากระบบ</span>
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              <p className="text-[11px] text-slate-400 text-center">เข้าสู่ระบบเพื่อบันทึกประวัติการเรียน</p>
              <button
                onClick={() => onOpenAuth('login')}
                className="w-full py-2 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold rounded-xl text-xs transition-colors shadow-xs"
              >
                เข้าสู่ระบบ / สมัครสมาชิก
              </button>
            </div>
          )}
        </div>
      </aside>

      {/* ─────────────────────────────────────────────────────────────
          2. MOBILE TOP APP BAR (< 1024px)
      ───────────────────────────────────────────────────────────── */}
      <header className="lg:hidden sticky top-0 z-40 bg-slate-900 text-white border-b border-slate-800 px-4 h-14 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setMobileDrawerOpen(true)}
            className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800"
          >
            <Menu className="w-5 h-5" />
          </button>
          <button
            onClick={() => onNavigate('home')}
            className="flex items-center gap-2"
          >
            <div className="w-7 h-7 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center">
              <GraduationCap className="w-4 h-4" />
            </div>
            <span className="font-bold text-base tracking-tight font-['Plus_Jakarta_Sans',sans-serif]">
              Learn<span className="text-amber-400">Space</span>
            </span>
          </button>
        </div>

        <div>
          {user ? (
            <button
              onClick={() => onNavigate('profile')}
              className="w-7 h-7 rounded-full bg-amber-500 text-slate-950 flex items-center justify-center font-bold text-xs"
            >
              {profile?.displayName ? profile.displayName.charAt(0).toUpperCase() : 'U'}
            </button>
          ) : (
            <button
              onClick={() => onOpenAuth('login')}
              className="text-xs font-bold text-amber-400 hover:underline"
            >
              เข้าสู่ระบบ
            </button>
          )}
        </div>
      </header>

      {/* ─────────────────────────────────────────────────────────────
          3. MOBILE BOTTOM NAVIGATION BAR (< 1024px)
      ───────────────────────────────────────────────────────────── */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-slate-900/95 backdrop-blur-md border-t border-slate-800 px-2 py-1 flex items-center justify-around text-[10px]">
        {[
          { id: 'dashboard', label: 'แดชบอร์ด', icon: LayoutDashboard },
          { id: 'courses', label: 'บทเรียน', icon: BookOpen },
          { id: 'assignments', label: 'ส่งงาน', icon: FileCheck2 },
          { id: 'discussions', label: 'สนทนา', icon: MessagesSquare },
          { id: 'home', label: 'หน้าแรก', icon: Home },
        ].map((item) => {
          const Icon = item.icon;
          const isActive = currentView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => handleNavClick(item.id)}
              className={`flex flex-col items-center py-1 px-2.5 rounded-lg transition-colors ${
                isActive ? 'text-amber-400 font-bold' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Icon className="w-5 h-5 mb-0.5" />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* ─────────────────────────────────────────────────────────────
          4. MOBILE DRAWER OVERLAY
      ───────────────────────────────────────────────────────────── */}
      {mobileDrawerOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div
            className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs"
            onClick={() => setMobileDrawerOpen(false)}
          />
          <div className="relative w-72 bg-slate-900 text-white h-full flex flex-col justify-between p-6 shadow-2xl z-10 border-r border-slate-800">
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-6">
                <div className="flex items-center gap-2">
                  <GraduationCap className="w-6 h-6 text-amber-400" />
                  <span className="font-bold text-lg">LearnSpace</span>
                </div>
                <button
                  onClick={() => setMobileDrawerOpen(false)}
                  className="p-1 text-slate-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-2">
                {mainNavItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = currentView === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => handleNavClick(item.id, item.authRequired)}
                      className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-xl text-xs font-semibold ${
                        isActive ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-300'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      <span>{item.label}</span>
                    </button>
                  );
                })}

                {(isAdmin || isTeacher) && (
                  <button
                    onClick={() => {
                      onNavigate('admin');
                      setMobileDrawerOpen(false);
                    }}
                    className="w-full flex items-center gap-3 px-3.5 py-3 rounded-xl text-xs font-bold text-amber-300 bg-amber-500/10 border border-amber-500/20 mt-4"
                  >
                    <ShieldCheck className="w-4 h-4 text-amber-400" />
                    <span>จัดการระบบ (Admin CMS)</span>
                  </button>
                )}
              </div>
            </div>

            {user && (
              <div className="pt-4 border-t border-slate-800 space-y-3">
                <div className="text-xs">
                  <p className="font-bold text-white">{profile?.displayName}</p>
                  <p className="text-[10px] text-slate-400">{user.email}</p>
                </div>
                <button
                  onClick={() => {
                    signOut();
                    setMobileDrawerOpen(false);
                  }}
                  className="w-full py-2 text-xs text-rose-400 font-semibold border border-rose-500/20 rounded-xl hover:bg-rose-500/10"
                >
                  ออกจากระบบ
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};
