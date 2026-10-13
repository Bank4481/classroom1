import React, { useState } from 'react';
import {
  GraduationCap,
  Menu,
  X,
  User as UserIcon,
  LogOut,
  ShieldCheck,
  BookOpen,
  LayoutDashboard,
  CheckCircle2,
  MessagesSquare,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface NavbarProps {
  currentView: string;
  onNavigate: (view: string, payload?: any) => void;
  onOpenAuth: (mode?: 'login' | 'register') => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentView, onNavigate, onOpenAuth }) => {
  const { user, profile, role, isAdmin, isTeacher, signOut, simulatedRole, setSimulatedRole } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);

  const navLinks = [
    { id: 'home', label: 'หน้าแรก' },
    { id: 'courses', label: 'คอร์สบทเรียน' },
    { id: 'assignments', label: 'กิจกรรม & ส่งงาน' },
    { id: 'discussions', label: 'กระดานถาม-ตอบ' },
    { id: 'dashboard', label: 'แดชบอร์ด', authRequired: true },
  ];

  const handleLinkClick = (id: string, authRequired?: boolean) => {
    if (authRequired && !user) {
      onOpenAuth('login');
      return;
    }
    onNavigate(id);
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 bg-slate-900 text-white border-b border-slate-800 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-8">
          
          {/* Zone 1: Single text element Brand Wordmark with subtle seal */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => onNavigate('home')}
              className="flex items-center gap-2.5 text-left group focus:outline-none"
            >
              <div className="w-9 h-9 rounded-lg bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 group-hover:bg-amber-500 group-hover:text-slate-950 transition-colors">
                <GraduationCap className="w-5 h-5" />
              </div>
              <span className="text-xl font-bold tracking-tight text-white font-['Plus_Jakarta_Sans',sans-serif] whitespace-nowrap">
                Learn<span className="text-amber-400">Space</span>
              </span>
            </button>
          </div>

          {/* Zone 2: 4-5 Clean single-line text navigation links */}
          <nav className="hidden md:flex items-center gap-7 text-sm font-medium">
            {navLinks.map((link) => {
              const active = currentView === link.id;
              return (
                <button
                  key={link.id}
                  onClick={() => handleLinkClick(link.id, link.authRequired)}
                  className={`transition-colors whitespace-nowrap py-1 relative ${
                    active ? 'text-amber-400 font-semibold' : 'text-slate-300 hover:text-white'
                  }`}
                >
                  {link.label}
                  {active && (
                    <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-amber-400 rounded-full" />
                  )}
                </button>
              );
            })}

            {(isAdmin || isTeacher) && (
              <button
                onClick={() => onNavigate('admin')}
                className={`transition-colors whitespace-nowrap py-1 flex items-center gap-1.5 ${
                  currentView === 'admin' ? 'text-amber-400 font-semibold' : 'text-amber-300 hover:text-amber-200'
                }`}
              >
                <ShieldCheck className="w-4 h-4 text-amber-400" />
                <span>ระบบผู้ดูแล</span>
              </button>
            )}
          </nav>

          {/* Zone 3: 1 Primary Action / User Profile Dropdown */}
          <div className="flex items-center gap-3 shrink-0">
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                  className="flex items-center gap-2.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700/80 border border-slate-700 transition-colors text-left focus:outline-none"
                >
                  <div className="w-7 h-7 rounded-full bg-amber-500 text-slate-950 flex items-center justify-center font-bold text-xs">
                    {profile?.displayName ? profile.displayName.charAt(0).toUpperCase() : 'U'}
                  </div>
                  <div className="hidden lg:block">
                    <p className="text-xs font-medium text-white truncate max-w-[120px]">
                      {profile?.displayName || user.email?.split('@')[0]}
                    </p>
                    <p className="text-[10px] text-amber-400 capitalize">
                      {role === 'admin' ? 'ผู้ดูแลระบบ' : role === 'teacher' ? 'อาจารย์ผู้สอน' : 'นักเรียน'}
                    </p>
                  </div>
                </button>

                {profileDropdownOpen && (
                  <div
                    className="absolute right-0 mt-2 w-64 bg-white text-slate-800 rounded-xl shadow-xl border border-slate-200 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150"
                    onMouseLeave={() => setProfileDropdownOpen(false)}
                  >
                    <div className="px-4 py-2 border-b border-slate-100">
                      <p className="text-xs text-slate-400">เข้าสู่ระบบด้วย</p>
                      <p className="text-sm font-semibold text-slate-900 truncate">{user.email}</p>
                      <div className="mt-1 flex items-center gap-1.5">
                        <span className="text-[10px] px-2 py-0.5 rounded bg-slate-100 font-medium text-slate-700 uppercase">
                          {role}
                        </span>
                        {simulatedRole && (
                          <span className="text-[10px] text-amber-600 font-medium">
                            (มุมมองจำลอง)
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="py-1">
                      <button
                        onClick={() => {
                          setProfileDropdownOpen(false);
                          onNavigate('dashboard');
                        }}
                        className="w-full px-4 py-2 text-left text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2.5"
                      >
                        <LayoutDashboard className="w-4 h-4 text-slate-500" />
                        <span>แดชบอร์ดของฉัน</span>
                      </button>

                      <button
                        onClick={() => {
                          setProfileDropdownOpen(false);
                          onNavigate('profile');
                        }}
                        className="w-full px-4 py-2 text-left text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2.5"
                      >
                        <UserIcon className="w-4 h-4 text-slate-500" />
                        <span>ข้อมูลส่วนตัว</span>
                      </button>

                      {(isAdmin || isTeacher) && (
                        <button
                          onClick={() => {
                            setProfileDropdownOpen(false);
                            onNavigate('admin');
                          }}
                          className="w-full px-4 py-2 text-left text-sm text-amber-700 hover:bg-amber-50 flex items-center gap-2.5"
                        >
                          <ShieldCheck className="w-4 h-4 text-amber-600" />
                          <span>แผงควบคุมผู้ดูแล (CMS)</span>
                        </button>
                      )}
                    </div>

                    {/* Role switcher preview for test/evaluation */}
                    <div className="px-4 py-2 border-t border-slate-100 bg-slate-50/50">
                      <p className="text-[11px] text-slate-500 mb-1 font-medium">สลับมุมมองทดสอบ (Preview Role):</p>
                      <div className="grid grid-cols-3 gap-1">
                        <button
                          onClick={() => setSimulatedRole('student')}
                          className={`text-[10px] py-1 rounded text-center transition-colors ${
                            role === 'student' ? 'bg-amber-500 text-slate-900 font-bold' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
                          }`}
                        >
                          นักเรียน
                        </button>
                        <button
                          onClick={() => setSimulatedRole('teacher')}
                          className={`text-[10px] py-1 rounded text-center transition-colors ${
                            role === 'teacher' ? 'bg-amber-500 text-slate-900 font-bold' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
                          }`}
                        >
                          ครูผู้สอน
                        </button>
                        <button
                          onClick={() => setSimulatedRole('admin')}
                          className={`text-[10px] py-1 rounded text-center transition-colors ${
                            role === 'admin' ? 'bg-amber-500 text-slate-900 font-bold' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
                          }`}
                        >
                          แอดมิน
                        </button>
                      </div>
                    </div>

                    <div className="pt-1 border-t border-slate-100">
                      <button
                        onClick={async () => {
                          setProfileDropdownOpen(false);
                          await signOut();
                          onNavigate('home');
                        }}
                        className="w-full px-4 py-2 text-left text-sm text-rose-600 hover:bg-rose-50 flex items-center gap-2.5"
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
                  className="px-3.5 py-1.5 text-xs font-medium text-slate-300 hover:text-white transition-colors"
                >
                  เข้าสู่ระบบ
                </button>
                <button
                  onClick={() => onOpenAuth('register')}
                  className="px-4 py-2 text-xs font-semibold text-slate-950 bg-amber-400 hover:bg-amber-300 rounded-lg shadow-sm transition-colors whitespace-nowrap"
                >
                  สมัครสมาชิก
                </button>
              </div>
            )}

            {/* Mobile Hamburger Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-slate-400 hover:text-white rounded-lg focus:outline-none"
              aria-label="Toggle Navigation"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-800 bg-slate-950 px-4 pt-3 pb-6 space-y-2">
          {navLinks.map((link) => (
            <button
              key={link.id}
              onClick={() => handleLinkClick(link.id, link.authRequired)}
              className={`block w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium ${
                currentView === link.id
                  ? 'bg-slate-800 text-amber-400 font-semibold'
                  : 'text-slate-300 hover:bg-slate-900'
              }`}
            >
              {link.label}
            </button>
          ))}

          {(isAdmin || isTeacher) && (
            <button
              onClick={() => {
                onNavigate('admin');
                setMobileMenuOpen(false);
              }}
              className="block w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium text-amber-300 bg-amber-500/10 hover:bg-amber-500/20"
            >
              ระบบผู้ดูแล (Admin CMS)
            </button>
          )}

          {!user && (
            <div className="pt-3 border-t border-slate-800 grid grid-cols-2 gap-2">
              <button
                onClick={() => {
                  onOpenAuth('login');
                  setMobileMenuOpen(false);
                }}
                className="w-full py-2 text-xs text-center border border-slate-700 text-slate-200 rounded-lg"
              >
                เข้าสู่ระบบ
              </button>
              <button
                onClick={() => {
                  onOpenAuth('register');
                  setMobileMenuOpen(false);
                }}
                className="w-full py-2 text-xs text-center bg-amber-400 text-slate-950 font-bold rounded-lg"
              >
                สมัครสมาชิก
              </button>
            </div>
          )}
        </div>
      )}
    </header>
  );
};
