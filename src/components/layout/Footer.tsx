import React from 'react';
import { GraduationCap, Shield, HelpCircle, ExternalLink } from 'lucide-react';

interface FooterProps {
  onNavigate: (view: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  return (
    <footer className="bg-white text-[#5f6368] border-t border-[#dadce0] text-xs">
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          
          {/* Brand */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#137333] border border-[#0d5926] flex items-center justify-center text-white shadow-2xs">
              <GraduationCap className="w-4 h-4 text-amber-300" />
            </div>
            <div>
              <span className="text-sm font-semibold text-[#202124]">
                LearnSpace Classroom
              </span>
              <p className="text-[11px] text-[#5f6368]">
                ระบบห้องเรียนออนไลน์ Google Classroom Style เพื่อการเรียนการสอนยุคใหม่
              </p>
            </div>
          </div>

          {/* Quick Links */}
          <div className="flex flex-wrap items-center gap-6 text-xs text-[#5f6368]">
            <button
              onClick={() => onNavigate('home')}
              className="hover:text-[#1967d2] hover:underline transition-colors"
            >
              ชั้นเรียนทั้งหมด
            </button>
            <button
              onClick={() => onNavigate('assignments')}
              className="hover:text-[#1967d2] hover:underline transition-colors"
            >
              สิ่งที่ต้องทำ
            </button>
            <button
              onClick={() => onNavigate('courses')}
              className="hover:text-[#1967d2] hover:underline transition-colors"
            >
              คลังรายวิชา
            </button>
            <button
              onClick={() => onNavigate('discussions')}
              className="hover:text-[#1967d2] hover:underline transition-colors"
            >
              กระดานถาม-ตอบ
            </button>
            <button
              onClick={() => onNavigate('dashboard')}
              className="hover:text-[#1967d2] hover:underline transition-colors"
            >
              แดชบอร์ด
            </button>
          </div>

          {/* Privacy & Legal */}
          <div className="flex items-center gap-4 text-[11px] text-[#5f6368]">
            <span className="hover:underline cursor-pointer">ความเป็นส่วนตัว</span>
            <span>•</span>
            <span className="hover:underline cursor-pointer">ข้อกำหนด</span>
            <span>•</span>
            <span className="hover:underline cursor-pointer">ความช่วยเหลือ</span>
          </div>

        </div>

        <div className="mt-4 pt-4 border-t border-[#f1f3f4] text-center md:text-left text-[11px] text-[#80868b] flex flex-col sm:flex-row items-center justify-between gap-2">
          <p>© 2026 LearnSpace. ขับเคลื่อนด้วย Google Cloud Firestore & Firebase Auth</p>
          <p>ผู้ดูแลระบบหลัก: bbak9988@gmail.com</p>
        </div>
      </div>
    </footer>
  );
};
