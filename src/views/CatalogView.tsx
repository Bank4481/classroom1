import React, { useState } from 'react';
import { Search, Filter, BookOpen, Clock, User, ArrowRight, Sparkles, KeyRound, Plus } from 'lucide-react';
import type { Course } from '../types';

interface CatalogViewProps {
  courses: Course[];
  initialSearch?: string;
  onNavigate: (view: string, payload?: any) => void;
  onOpenJoinClass?: () => void;
  onOpenCreateClass?: () => void;
}

export const CatalogView: React.FC<CatalogViewProps> = ({
  courses,
  initialSearch = '',
  onNavigate,
  onOpenJoinClass,
  onOpenCreateClass,
}) => {
  const [search, setSearch] = useState(initialSearch);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedLevel, setSelectedLevel] = useState<string>('all');

  const categories = [
    { id: 'all', label: 'ทุกหมวดหมู่' },
    { id: 'วิทยาการคอมพิวเตอร์', label: 'วิทยาการคอมพิวเตอร์' },
    { id: 'ข้อมูลและปัญญาประดิษฐ์', label: 'ข้อมูลและ AI' },
    { id: 'วิทยาศาสตร์และคณิตศาสตร์', label: 'คณิตศาสตร์และวิทย์' },
  ];

  const levels = [
    { id: 'all', label: 'ทุกระดับ' },
    { id: 'beginner', label: 'ระดับต้น (Beginner)' },
    { id: 'intermediate', label: 'ระดับกลาง (Intermediate)' },
    { id: 'advanced', label: 'ระดับสูง (Advanced)' },
  ];

  const filteredCourses = courses.filter((course) => {
    const matchesSearch =
      search === '' ||
      course.title.toLowerCase().includes(search.toLowerCase()) ||
      course.description.toLowerCase().includes(search.toLowerCase()) ||
      course.instructorName.toLowerCase().includes(search.toLowerCase()) ||
      (course.courseCode && course.courseCode.toLowerCase().includes(search.toLowerCase())) ||
      (course.joinCode && course.joinCode.toLowerCase().includes(search.toLowerCase()));

    const matchesCategory =
      selectedCategory === 'all' || course.category === selectedCategory;

    const matchesLevel =
      selectedLevel === 'all' || course.level === selectedLevel;

    return matchesSearch && matchesCategory && matchesLevel;
  });

  return (
    <div className="max-w-7xl mx-auto px-6 py-8 space-y-6">
      
      {/* Header with Join Class CTA */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#dadce0] pb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#202124] tracking-tight">
            คลังรายวิชาและห้องเรียน (All Classrooms & Courses)
          </h1>
          <p className="text-sm text-[#5f6368] mt-1">
            ค้นหาห้องเรียนและบทเรียนที่เปิดสอน เข้าเรียน ส่งงาน และทำแบบทดสอบ
          </p>
        </div>

        <div className="flex items-center gap-2 self-start md:self-auto">
          {onOpenJoinClass && (
            <button
              onClick={onOpenJoinClass}
              className="py-2 px-4 rounded-full border border-[#dadce0] hover:bg-[#f8f9fa] text-[#1967d2] hover:border-[#1967d2] text-xs font-semibold transition-colors flex items-center gap-2 shadow-2xs"
            >
              <KeyRound className="w-3.5 h-3.5" />
              <span>เข้าร่วมด้วยรหัส</span>
            </button>
          )}

          {onOpenCreateClass && (
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

      {/* Filter and Search Bar */}
      <div className="bg-white p-5 rounded-2xl border border-[#dadce0] shadow-2xs space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
          
          {/* Search Input */}
          <div className="md:col-span-6 relative">
            <Search className="w-4 h-4 text-[#5f6368] absolute left-3.5 top-3" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="ค้นหาชื่อวิชา รหัสวิชา หรืออาจารย์ผู้สอน..."
              className="w-full pl-10 pr-4 py-2 text-sm rounded-lg border border-[#dadce0] focus:border-[#1967d2] focus:ring-2 focus:ring-[#1967d2]/20 text-[#202124] transition-all outline-none"
            />
          </div>

          {/* Level Filter Dropdown */}
          <div className="md:col-span-3">
            <select
              value={selectedLevel}
              onChange={(e) => setSelectedLevel(e.target.value)}
              className="w-full py-2 px-3 text-sm rounded-lg border border-[#dadce0] bg-white text-[#3c4043] focus:border-[#1967d2] focus:ring-2 focus:ring-[#1967d2]/20 transition-all outline-none"
            >
              {levels.map((lvl) => (
                <option key={lvl.id} value={lvl.id}>
                  {lvl.label}
                </option>
              ))}
            </select>
          </div>

          {/* Reset button */}
          <div className="md:col-span-3 flex justify-end">
            {(search || selectedCategory !== 'all' || selectedLevel !== 'all') && (
              <button
                onClick={() => {
                  setSearch('');
                  setSelectedCategory('all');
                  setSelectedLevel('all');
                }}
                className="text-xs text-[#1967d2] hover:underline font-semibold py-2 px-3 self-center"
              >
                ล้างตัวกรองทั้งหมด
              </button>
            )}
          </div>
        </div>

        {/* Category Pills (Functional filter tabs) */}
        <div className="flex flex-wrap gap-2 pt-2 border-t border-[#f1f3f4]">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                selectedCategory === cat.id
                  ? 'bg-[#e8f0fe] text-[#1967d2] font-semibold'
                  : 'bg-[#f1f3f4] text-[#5f6368] hover:bg-[#e8eaed] hover:text-[#202124]'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Course Grid */}
      {filteredCourses.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCourses.map((course) => (
            <div
              key={course.id}
              onClick={() => onNavigate('course-detail', { courseId: course.id, tab: 'stream' })}
              className="group cursor-pointer rounded-xl bg-white border border-[#dadce0] overflow-hidden hover:shadow-md transition-all flex flex-col"
            >
              <div className="relative aspect-[16/9] bg-slate-900 overflow-hidden">
                <img
                  src={course.coverImage}
                  alt={course.title}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute top-3 left-3 bg-[#202124]/80 backdrop-blur-xs text-white text-[11px] font-medium px-2.5 py-1 rounded-md">
                  {course.category}
                </div>
                <div className="absolute top-3 right-3 bg-[#1967d2] text-white text-[10px] font-bold px-2 py-0.5 rounded uppercase shadow-xs">
                  {course.courseCode || 'CS-201'}
                </div>
              </div>

              <div className="p-5 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="text-base font-bold text-[#202124] group-hover:text-[#1967d2] transition-colors line-clamp-1 mb-1.5">
                    {course.title}
                  </h3>
                  <p className="text-xs text-[#5f6368] line-clamp-2 leading-relaxed mb-4">
                    {course.description}
                  </p>
                </div>

                <div className="pt-4 border-t border-[#f1f3f4] flex items-center justify-between text-xs text-[#5f6368]">
                  <span className="font-medium text-[#3c4043]">ครู: {course.instructorName}</span>
                  <div className="flex items-center gap-1 text-[#1967d2] font-semibold">
                    <BookOpen className="w-3.5 h-3.5" />
                    <span>{course.totalLessons || 4} บทเรียน</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-16 bg-white rounded-2xl border border-[#dadce0] p-8">
          <BookOpen className="w-12 h-12 text-[#bdc1c6] mx-auto mb-3" />
          <h3 className="text-base font-bold text-[#202124]">ไม่พบคอร์สที่ตรงกับเงื่อนไขการค้นหา</h3>
          <p className="text-xs text-[#5f6368] mt-1 max-w-sm mx-auto">
            ลองปรับเปลี่ยนคำค้นหา หรือรีเซ็ตตัวกรองเพื่อดูรายวิชาอื่นในระบบ
          </p>
          <button
            onClick={() => {
              setSearch('');
              setSelectedCategory('all');
              setSelectedLevel('all');
            }}
            className="mt-4 px-4 py-2 bg-[#1967d2] text-white rounded-md text-xs font-semibold hover:bg-[#185abc] transition-colors"
          >
            แสดงคอร์สทั้งหมด
          </button>
        </div>
      )}

    </div>
  );
};
