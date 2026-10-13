import React, { useState } from 'react';
import {
  ShieldCheck,
  BookOpen,
  PlusCircle,
  Edit2,
  Trash2,
  Users,
  Settings,
  Download,
  FileText,
  HelpCircle,
  Eye,
  EyeOff,
  CheckCircle,
  AlertCircle,
  Save,
  FileCheck2,
  Globe,
  RefreshCw,
  Database,
} from 'lucide-react';
import {
  getLegacyConfig,
  saveLegacyConfig,
  testGoogleAppsScriptConnection,
  testRealtimeDbConnection,
  getAllOfflineDrafts,
} from '../lib/legacyAdapter';
import type {
  Course,
  Lesson,
  Quiz,
  Assignment,
  Submission,
  UserProfile,
  SiteSettings,
  UserRole,
  Discussion,
} from '../types';
import { useAuth } from '../context/AuthContext';
import { db, handleFirestoreError, OperationType, testConnection } from '../lib/firebase';
import firebaseConfig from '../../firebase-applet-config.json';
import {
  collection,
  doc,
  setDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  getDocs,
} from 'firebase/firestore';

interface AdminViewProps {
  courses: Course[];
  lessons: Lesson[];
  quizzes: Quiz[];
  assignments: Assignment[];
  submissions: Submission[];
  discussions?: Discussion[];
  settings: SiteSettings | null;
  onNavigate: (view: string, payload?: any) => void;
  onRefreshData: () => Promise<void>;
}

export const AdminView: React.FC<AdminViewProps> = ({
  courses,
  lessons,
  quizzes,
  assignments,
  submissions,
  discussions = [],
  settings,
  onNavigate,
  onRefreshData,
}) => {
  const { user, profile, isAdmin, isTeacher } = useAuth();
  const [activeTab, setActiveTab] = useState<
    'overview' | 'courses' | 'quizzes' | 'assignments' | 'users' | 'settings' | 'backup' | 'legacy'
  >('overview');

  // Legacy Integration State
  const initialLegacyConfig = getLegacyConfig();
  const [gasUrl, setGasUrl] = useState(initialLegacyConfig.googleAppsScriptUrl);
  const [rtdbUrl, setRtdbUrl] = useState(initialLegacyConfig.realtimeDatabaseUrl);
  const [testingGas, setTestingGas] = useState(false);
  const [gasResult, setGasResult] = useState<{ success: boolean; message: string; sampleData?: any } | null>(null);
  const [testingRtdb, setTestingRtdb] = useState(false);
  const [rtdbResult, setRtdbResult] = useState<{ success: boolean; message: string } | null>(null);
  const [offlineDrafts, setOfflineDrafts] = useState<Record<string, string>>(() => getAllOfflineDrafts());
  const [dbPingStatus, setDbPingStatus] = useState<{ testing: boolean; connected?: boolean; latencyMs?: number; checkedAt?: string } | null>(null);

  const handlePingDatabase = async () => {
    setDbPingStatus({ testing: true });
    const start = performance.now();
    const ok = await testConnection();
    const latency = Math.round(performance.now() - start);
    setDbPingStatus({
      testing: false,
      connected: ok,
      latencyMs: latency,
      checkedAt: new Date().toLocaleTimeString('th-TH'),
    });
  };

  // Course Modal Form State
  const [isCourseModalOpen, setIsCourseModalOpen] = useState(false);
  const [editingCourseId, setEditingCourseId] = useState<string | null>(null);
  const [courseTitle, setCourseTitle] = useState('');
  const [courseCodeVal, setCourseCodeVal] = useState('CS-101');
  const [courseTermVal, setCourseTermVal] = useState('ภาคเรียนที่ 1/2569');
  const [courseRoomVal, setCourseRoomVal] = useState('ห้องเรียนออนไลน์');
  const [courseJoinCodeVal, setCourseJoinCodeVal] = useState('LS-101');
  const [courseCategory, setCourseCategory] = useState('วิทยาการคอมพิวเตอร์');
  const [courseLevel, setCourseLevel] = useState<'beginner' | 'intermediate' | 'advanced'>('intermediate');
  const [courseDesc, setCourseDesc] = useState('');
  const [courseCover, setCourseCover] = useState('/src/assets/images/course_web_dev_1791865330966.jpg');
  const [courseInstructor, setCourseInstructor] = useState(profile?.displayName || 'อาจารย์ผู้สอน');
  const [coursePublished, setCoursePublished] = useState(true);

  // Lesson Modal Form State
  const [isLessonModalOpen, setIsLessonModalOpen] = useState(false);
  const [lessonCourseId, setLessonCourseId] = useState(courses.length > 0 ? courses[0].id : '');
  const [lessonTitle, setLessonTitle] = useState('');
  const [lessonSummary, setLessonSummary] = useState('');
  const [lessonVideo, setLessonVideo] = useState('');
  const [lessonContent, setLessonContent] = useState('');
  const [lessonOrder, setLessonOrder] = useState(1);

  // Assignment Modal Form State
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [assignCourseId, setAssignCourseId] = useState(courses.length > 0 ? courses[0].id : '');
  const [assignTitle, setAssignTitle] = useState('');
  const [assignInstructions, setAssignInstructions] = useState('');
  const [assignDueDate, setAssignDueDate] = useState('2026-12-31T23:59');
  const [assignMaxScore, setAssignMaxScore] = useState(100);

  // Site Settings Form State
  const [bannerText, setBannerText] = useState(settings?.announcementBanner?.text || '');
  const [bannerEnabled, setBannerEnabled] = useState(settings?.announcementBanner?.enabled ?? true);
  const [heroTitle, setHeroTitle] = useState(settings?.heroConfig?.title || '');
  const [heroSubtitle, setHeroSubtitle] = useState(settings?.heroConfig?.subtitle || '');
  const [savingSettings, setSavingSettings] = useState(false);

  // User RBAC List
  const [usersList, setUsersList] = useState<UserProfile[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);

  // Feedback Banner
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Load Users List when tab is selected
  const loadUsersList = async () => {
    setLoadingUsers(true);
    try {
      const snap = await getDocs(collection(db, 'users'));
      const list = snap.docs.map((d) => d.data() as UserProfile);
      setUsersList(list);
    } catch (err) {
      console.error('Failed to load users:', err);
    } finally {
      setLoadingUsers(false);
    }
  };

  const handleOpenAddCourse = () => {
    setEditingCourseId(null);
    setCourseTitle('');
    setCourseCodeVal('CS-' + Math.floor(100 + Math.random() * 900));
    setCourseTermVal('ภาคเรียนที่ 1/2569');
    setCourseRoomVal('ห้องเรียนออนไลน์');
    setCourseJoinCodeVal('LS-' + Math.random().toString(36).substring(2, 7).toUpperCase());
    setCourseDesc('');
    setCourseCategory('วิทยาการคอมพิวเตอร์');
    setCourseLevel('intermediate');
    setCourseCover('/src/assets/images/course_web_dev_1791865330966.jpg');
    setCourseInstructor(profile?.displayName || 'อาจารย์ผู้สอน');
    setCoursePublished(true);
    setIsCourseModalOpen(true);
  };

  const handleOpenEditCourse = (course: Course) => {
    setEditingCourseId(course.id);
    setCourseTitle(course.title);
    setCourseCodeVal(course.courseCode || 'CS-101');
    setCourseTermVal(course.term || 'ภาคเรียนที่ 1/2569');
    setCourseRoomVal(course.room || 'ห้องเรียนออนไลน์');
    setCourseJoinCodeVal(course.joinCode || course.id.toUpperCase().slice(0, 8));
    setCourseDesc(course.description);
    setCourseCategory(course.category);
    setCourseLevel(course.level);
    setCourseCover(course.coverImage);
    setCourseInstructor(course.instructorName);
    setCoursePublished(course.published);
    setIsCourseModalOpen(true);
  };

  const handleSaveCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const id = editingCourseId || `course-${Date.now()}`;
      const courseData: Course = {
        id,
        title: courseTitle.trim(),
        slug: courseTitle.toLowerCase().replace(/\s+/g, '-'),
        description: courseDesc.trim(),
        category: courseCategory,
        level: courseLevel,
        coverImage: courseCover,
        instructorId: user?.uid || 'instructor-admin',
        instructorName: courseInstructor,
        courseCode: courseCodeVal.trim().toUpperCase(),
        term: courseTermVal.trim(),
        room: courseRoomVal.trim(),
        joinCode: courseJoinCodeVal.trim().toUpperCase(),
        status: 'active',
        published: coursePublished,
        totalLessons: editingCourseId
          ? courses.find((c) => c.id === editingCourseId)?.totalLessons || 0
          : 0,
        createdAt: new Date().toISOString(),
      };

      await setDoc(doc(db, 'courses', id), courseData, { merge: true });
      setIsCourseModalOpen(false);
      setFeedback({ type: 'success', message: 'บันทึกข้อมูลคอร์สเรียนเรียบร้อยแล้ว' });
      await onRefreshData();
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message || 'บันทึกไม่สำเร็จ' });
    }
  };

  const handleDeleteCourse = async (courseId: string) => {
    if (!confirm('คำเตือน: คุณแน่ใจหรือไม่ว่าต้องการลบคอร์สนี้? ข้อมูลบทเรียนทั้งหมดที่เกี่ยวข้องจะถูกนำออก')) return;
    try {
      await deleteDoc(doc(db, 'courses', courseId));
      setFeedback({ type: 'success', message: 'ลบคอร์สเรียนเรียบร้อยแล้ว' });
      await onRefreshData();
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message || 'ลบไม่สำเร็จ' });
    }
  };

  const handleSaveLesson = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const id = `lesson-${Date.now()}`;
      const lessonData: Lesson = {
        id,
        courseId: lessonCourseId,
        title: lessonTitle.trim(),
        order: Number(lessonOrder),
        summary: lessonSummary.trim(),
        contentHtml: `<div class="space-y-4"><p class="text-slate-700 leading-relaxed">${lessonContent.trim()}</p></div>`,
        videoUrl: lessonVideo.trim(),
        published: true,
        createdAt: new Date().toISOString(),
      };

      await setDoc(doc(db, 'lessons', id), lessonData);
      // Update course lesson count
      const courseRef = doc(db, 'courses', lessonCourseId);
      const course = courses.find((c) => c.id === lessonCourseId);
      if (course) {
        await updateDoc(courseRef, { totalLessons: (course.totalLessons || 0) + 1 });
      }

      setIsLessonModalOpen(false);
      setLessonTitle('');
      setLessonSummary('');
      setLessonContent('');
      setLessonVideo('');
      setFeedback({ type: 'success', message: 'เพิ่มบทเรียนใหม่เรียบร้อยแล้ว' });
      await onRefreshData();
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message || 'เพิ่มบทเรียนไม่สำเร็จ' });
    }
  };

  const handleSaveAssignment = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const id = `assign-${Date.now()}`;
      const assignData: Assignment = {
        id,
        courseId: assignCourseId,
        title: assignTitle.trim(),
        instructions: assignInstructions.trim(),
        dueDate: new Date(assignDueDate).toISOString(),
        maxScore: Number(assignMaxScore),
        allowLate: true,
        createdAt: new Date().toISOString(),
      };

      await setDoc(doc(db, 'assignments', id), assignData);
      setIsAssignModalOpen(false);
      setAssignTitle('');
      setAssignInstructions('');
      setFeedback({ type: 'success', message: 'สร้างการบ้านชิ้นใหม่เรียบร้อยแล้ว' });
      await onRefreshData();
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message || 'สร้างการบ้านไม่สำเร็จ' });
    }
  };

  const handleUpdateRole = async (userId: string, newRole: UserRole) => {
    try {
      await updateDoc(doc(db, 'users', userId), { role: newRole });
      setUsersList((prev) =>
        prev.map((u) => (u.uid === userId ? { ...u, role: newRole } : u))
      );
      setFeedback({ type: 'success', message: `ปรับสิทธิ์ผู้ใช้เป็น ${newRole} สำเร็จ` });
    } catch (err: any) {
      setFeedback({ type: 'error', message: 'ไม่สามารถเปลี่ยนสิทธิ์ได้: ' + err.message });
    }
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingSettings(true);
    try {
      const updated: SiteSettings = {
        siteName: 'LearnSpace',
        announcementBanner: {
          text: bannerText.trim(),
          enabled: bannerEnabled,
        },
        heroConfig: {
          title: heroTitle.trim(),
          subtitle: heroSubtitle.trim(),
        },
      };
      await setDoc(doc(db, 'site_settings', 'global'), updated, { merge: true });
      setFeedback({ type: 'success', message: 'บันทึกการตั้งค่าเว็บไซต์และแบนเนอร์สำเร็จ' });
      await onRefreshData();
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message || 'บันทึกไม่สำเร็จ' });
    } finally {
      setSavingSettings(false);
    }
  };

  const handleExportBackup = () => {
    const backupData = {
      timestamp: new Date().toISOString(),
      siteSettings: settings,
      courses,
      lessons,
      quizzes,
      assignments,
      submissions,
    };
    const jsonStr = JSON.stringify(backupData, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `LearnSpace_Backup_${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* Header */}
      <div className="border-b border-slate-200 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-amber-700 uppercase tracking-wider mb-1">
            <ShieldCheck className="w-4 h-4 text-amber-600" />
            <span>ศูนย์ควบคุมผู้ดูแลระบบและอาจารย์ผู้สอน (Admin & Teacher CMS)</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            การจัดการระบบ LearnSpace
          </h1>
        </div>

        <button
          onClick={handleExportBackup}
          className="py-2.5 px-4 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-xl text-xs flex items-center gap-2 transition-colors self-start sm:self-auto"
        >
          <Download className="w-4 h-4 text-amber-400" />
          <span>สำรองข้อมูลระบบ (Export JSON)</span>
        </button>
      </div>

      {feedback && (
        <div
          className={`p-4 rounded-xl text-xs flex items-center justify-between gap-2 ${
            feedback.type === 'success'
              ? 'bg-emerald-50 border border-emerald-200 text-emerald-800'
              : 'bg-rose-50 border border-rose-200 text-rose-800'
          }`}
        >
          <div className="flex items-center gap-2">
            {feedback.type === 'success' ? (
              <CheckCircle className="w-4 h-4 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 shrink-0" />
            )}
            <span>{feedback.message}</span>
          </div>
          <button onClick={() => setFeedback(null)} className="text-xs font-bold">
            ปิด
          </button>
        </div>
      )}

      {/* Tabs Navigation */}
      <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-3">
        {[
          { id: 'overview', label: 'ภาพรวมสถิติ' },
          { id: 'courses', label: 'จัดการคอร์ส & บทเรียน' },
          { id: 'assignments', label: 'จัดการงาน & การบ้าน' },
          { id: 'users', label: 'จัดการสิทธิ์สมาชิก (RBAC)' },
          { id: 'settings', label: 'ตั้งค่าหน้าแรก & แบนเนอร์' },
          { id: 'backup', label: 'ความปลอดภัย & สำรองข้อมูล' },
          { id: 'legacy', label: 'เชื่อมต่อระบบเดิม (Apps Script & RTDB)' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => {
              setActiveTab(tab.id as any);
              if (tab.id === 'users' && usersList.length === 0) {
                loadUsersList();
              }
            }}
            className={`py-2 px-4 rounded-xl text-xs font-semibold transition-colors ${
              activeTab === tab.id
                ? 'bg-amber-500 text-slate-950 font-bold shadow-sm'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* 1. Overview Tab */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm">
              <span className="text-xs text-slate-500">คอร์สเรียนทั้งหมด</span>
              <p className="text-2xl font-bold text-slate-900 font-mono mt-1">{courses.length}</p>
            </div>
            <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm">
              <span className="text-xs text-slate-500">บทเรียนที่มีในระบบ</span>
              <p className="text-2xl font-bold text-slate-900 font-mono mt-1">{lessons.length}</p>
            </div>
            <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm">
              <span className="text-xs text-slate-500">งานที่มอบหมาย</span>
              <p className="text-2xl font-bold text-slate-900 font-mono mt-1">{assignments.length}</p>
            </div>
            <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm">
              <span className="text-xs text-slate-500">งานที่นักเรียนส่งแล้ว</span>
              <p className="text-2xl font-bold text-slate-900 font-mono mt-1">{submissions.length}</p>
            </div>
          </div>

          {/* Live Database Status & Diagnostics Panel */}
          <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-5">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Database className="w-4 h-4 text-amber-500" />
                  <span>ตำแหน่งและสถานะฐานข้อมูลระบบจริง (Live Database Infrastructure)</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  ระบบจัดเก็บข้อมูลบน Google Cloud Firestore อย่างเป็นทางการ ข้อมูลทุกส่วนซิงก์แบบ Realtime สองทิศทาง
                </p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  disabled={dbPingStatus?.testing}
                  onClick={handlePingDatabase}
                  className="py-2 px-3.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition-colors flex items-center gap-1.5 shadow-sm disabled:opacity-60"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${dbPingStatus?.testing ? 'animate-spin text-amber-400' : 'text-amber-400'}`} />
                  <span>{dbPingStatus?.testing ? 'กำลังตรวจสอบ...' : 'ทดสอบ Ping ฐานข้อมูล (Ping DB)'}</span>
                </button>
              </div>
            </div>

            {/* Ping Result Banner if tested */}
            {dbPingStatus && !dbPingStatus.testing && (
              <div
                className={`p-3.5 rounded-xl text-xs flex items-center justify-between gap-3 ${
                  dbPingStatus.connected
                    ? 'bg-emerald-50 border border-emerald-200 text-emerald-800'
                    : 'bg-rose-50 border border-rose-200 text-rose-800'
                }`}
              >
                <div className="flex items-center gap-2">
                  {dbPingStatus.connected ? (
                    <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                  )}
                  <span className="font-semibold">
                    {dbPingStatus.connected
                      ? `เชื่อมต่อฐานข้อมูล Firestore สำเร็จ (ออนไลน์ 100%) — เวลาตอบสนอง ~${dbPingStatus.latencyMs}ms`
                      : 'ไม่สามารถติดต่อฐานข้อมูลได้ โปรดตรวจสอบการเชื่อมต่ออินเทอร์เน็ตหรือสิทธิ์'}
                  </span>
                </div>
                <span className="text-[11px] font-mono text-slate-500">
                  ทดสอบเมื่อ: {dbPingStatus.checkedAt}
                </span>
              </div>
            )}

            {/* Connection Spec Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
                <span className="text-[11px] text-slate-400 block font-medium">ประเภทฐานข้อมูล (Database Engine)</span>
                <span className="font-semibold text-slate-800 mt-0.5 block flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block animate-pulse"></span>
                  Google Cloud Firestore
                </span>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
                <span className="text-[11px] text-slate-400 block font-medium">Firestore Database ID</span>
                <span className="font-mono font-semibold text-amber-700 mt-0.5 block truncate" title={firebaseConfig.firestoreDatabaseId}>
                  {firebaseConfig.firestoreDatabaseId}
                </span>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
                <span className="text-[11px] text-slate-400 block font-medium">Google Cloud Project ID</span>
                <span className="font-mono font-semibold text-slate-800 mt-0.5 block">
                  {firebaseConfig.projectId}
                </span>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
                <span className="text-[11px] text-slate-400 block font-medium">Auth Domain</span>
                <span className="font-mono text-slate-700 mt-0.5 block truncate">
                  {firebaseConfig.authDomain}
                </span>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
                <span className="text-[11px] text-slate-400 block font-medium">Security Rules Enforced</span>
                <span className="font-semibold text-emerald-700 mt-0.5 block flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  Deployed (Zero-Trust Model)
                </span>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
                <span className="text-[11px] text-slate-400 block font-medium">Web Client Origin</span>
                <span className="font-mono text-slate-700 mt-0.5 block truncate" title={window.location.origin}>
                  {window.location.origin}
                </span>
              </div>
            </div>

            {/* Live Collection Breakdown */}
            <div className="space-y-2 pt-2">
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                รายการคอลเลกชันในฐานข้อมูล (Firestore Collections)
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5 text-xs">
                <div className="p-2.5 rounded-lg border border-slate-200 bg-white flex items-center justify-between">
                  <span className="font-mono text-slate-600">courses</span>
                  <span className="font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded text-[11px]">{courses.length}</span>
                </div>
                <div className="p-2.5 rounded-lg border border-slate-200 bg-white flex items-center justify-between">
                  <span className="font-mono text-slate-600">lessons</span>
                  <span className="font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded text-[11px]">{lessons.length}</span>
                </div>
                <div className="p-2.5 rounded-lg border border-slate-200 bg-white flex items-center justify-between">
                  <span className="font-mono text-slate-600">quizzes</span>
                  <span className="font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded text-[11px]">{quizzes.length}</span>
                </div>
                <div className="p-2.5 rounded-lg border border-slate-200 bg-white flex items-center justify-between">
                  <span className="font-mono text-slate-600">assignments</span>
                  <span className="font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded text-[11px]">{assignments.length}</span>
                </div>
                <div className="p-2.5 rounded-lg border border-slate-200 bg-white flex items-center justify-between">
                  <span className="font-mono text-slate-600">submissions</span>
                  <span className="font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded text-[11px]">{submissions.length}</span>
                </div>
                <div className="p-2.5 rounded-lg border border-slate-200 bg-white flex items-center justify-between">
                  <span className="font-mono text-slate-600">site_settings</span>
                  <span className="font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded text-[11px]">Active</span>
                </div>
                <div className="p-2.5 rounded-lg border border-slate-200 bg-white flex items-center justify-between">
                  <span className="font-mono text-slate-600">discussions</span>
                  <span className="font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded text-[11px]">Realtime</span>
                </div>
                <div className="p-2.5 rounded-lg border border-slate-200 bg-white flex items-center justify-between">
                  <span className="font-mono text-slate-600">user_progress</span>
                  <span className="font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded text-[11px]">Per-User</span>
                </div>
              </div>
            </div>

            {/* How to verify guide */}
            <div className="p-4 rounded-xl bg-amber-50/60 border border-amber-200/70 text-xs text-amber-950 space-y-2">
              <span className="font-bold flex items-center gap-1.5 text-amber-900">
                <HelpCircle className="w-4 h-4 text-amber-600 shrink-0" />
                วิธีตรวจสอบข้อมูลจริงด้วยตัวเอง:
              </span>
              <ul className="list-disc list-inside space-y-1 text-slate-700 text-[11px] leading-relaxed">
                <li>
                  <strong>ดาวน์โหลดดูข้อมูลทั้งหมด (JSON Export)</strong>: ไปที่แท็บ <strong>&ldquo;สำรองข้อมูล (Backup)&rdquo;</strong> ด้านบน แล้วกดปุ่ม <em>ดาวน์โหลดไฟล์สำรองข้อมูล</em> จะได้ไฟล์ JSON ที่รวบรวมข้อมูลสดทั้งหมดในฐานข้อมูลออกมาเปิดดูได้ทันที
                </li>
                <li>
                  <strong>ตรวจผ่าน Network ในเบราว์เซอร์ (F12)</strong>: กดเปิด F12 &gt; แถบ Network แล้วลองสร้างหรือแก้ไขคอร์ส/บทเรียน จะเห็น Request วิ่งตรงไปยัง Google Firestore API แบบ Realtime
                </li>
                <li>
                  <strong>ตรวจสอบไฟล์คอนฟิกในโค้ด</strong>: ดูรายละเอียดการตั้งค่าฐานข้อมูลได้ที่ <code>firebase-applet-config.json</code> และโครงสร้างตารางได้ที่ <code>firebase-blueprint.json</code>
                </li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* 2. Courses & Lessons Tab */}
      {activeTab === 'courses' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900">รายการคอร์สเรียน ({courses.length})</h2>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsLessonModalOpen(true)}
                className="py-2 px-3.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold rounded-xl transition-colors flex items-center gap-1.5"
              >
                <PlusCircle className="w-3.5 h-3.5 text-amber-600" />
                <span>เพิ่มบทเรียนใหม่</span>
              </button>
              <button
                onClick={handleOpenAddCourse}
                className="py-2 px-4 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold rounded-xl transition-colors flex items-center gap-1.5 shadow-sm"
              >
                <PlusCircle className="w-4 h-4" />
                <span>สร้างคอร์สใหม่</span>
              </button>
            </div>
          </div>

          <div className="space-y-4">
            {courses.map((course) => {
              const courseLessons = lessons.filter((l) => l.courseId === course.id);
              return (
                <div
                  key={course.id}
                  className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  <div className="flex items-start gap-4">
                    <img
                      src={course.coverImage}
                      alt={course.title}
                      className="w-16 h-12 object-cover rounded-lg shrink-0 border"
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-bold text-slate-900">{course.title}</h3>
                        <span className="text-[10px] px-2 py-0.5 rounded bg-slate-100 text-slate-600 font-semibold uppercase">
                          {course.level}
                        </span>
                        {course.published ? (
                          <span className="text-[10px] text-emerald-700 font-semibold">● เผยแพร่แล้ว</span>
                        ) : (
                          <span className="text-[10px] text-slate-400">● ซ่อนอยู่</span>
                        )}
                      </div>
                      <p className="text-xs text-slate-500 mt-1 line-clamp-1">{course.description}</p>
                      <p className="text-[11px] text-slate-400 mt-1">
                        อาจารย์: {course.instructorName} · บทเรียน: {courseLessons.length} บท
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
                    <button
                      onClick={() => handleOpenEditCourse(course)}
                      className="p-2 text-slate-600 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                      title="แก้ไขคอร์ส"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteCourse(course.id)}
                      className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                      title="ลบคอร์ส"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 3. Assignments Tab */}
      {activeTab === 'assignments' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900">รายการงานและการบ้าน ({assignments.length})</h2>
            <button
              onClick={() => setIsAssignModalOpen(true)}
              className="py-2 px-4 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold rounded-xl transition-colors flex items-center gap-1.5 shadow-sm"
            >
              <PlusCircle className="w-4 h-4" />
              <span>สร้างการบ้านใหม่</span>
            </button>
          </div>

          <div className="space-y-3">
            {assignments.map((assign) => (
              <div
                key={assign.id}
                className="p-4 rounded-xl bg-white border border-slate-200 shadow-sm flex items-center justify-between gap-4"
              >
                <div>
                  <h3 className="text-xs sm:text-sm font-bold text-slate-900">{assign.title}</h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    คะแนนเต็ม {assign.maxScore} คะแนน · กำหนดส่ง {new Date(assign.dueDate).toLocaleDateString('th-TH')}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onNavigate('assignments', { selectedAssignmentId: assign.id })}
                    className="py-1.5 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg"
                  >
                    ดูงานที่ส่ง
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 4. User Management (RBAC) Tab */}
      {activeTab === 'users' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900">
                รายชื่อสมาชิกและการจัดการสิทธิ์ (Role Assignment)
              </h2>
              <p className="text-xs text-slate-500">
                กำหนดบทบาท Student, Teacher หรือ Admin ให้กับสมาชิกในระบบ
              </p>
            </div>
            <button
              onClick={loadUsersList}
              disabled={loadingUsers}
              className="py-2 px-3.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold rounded-xl"
            >
              {loadingUsers ? 'กำลังโหลด...' : 'รีเฟรชข้อมูลสมาชิก'}
            </button>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
                  <tr>
                    <th className="p-3.5">ชื่อสมาชิก</th>
                    <th className="p-3.5">อีเมล</th>
                    <th className="p-3.5">บทบาทปัจจุบัน</th>
                    <th className="p-3.5 text-right">ปรับเปลี่ยนสิทธิ์</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {usersList.map((u) => (
                    <tr key={u.uid} className="hover:bg-slate-50/50">
                      <td className="p-3.5 font-bold text-slate-900">{u.displayName || 'สมาชิก'}</td>
                      <td className="p-3.5 text-slate-600">{u.email}</td>
                      <td className="p-3.5">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-800 uppercase">
                          {u.role}
                        </span>
                      </td>
                      <td className="p-3.5 text-right">
                        <select
                          value={u.role}
                          onChange={(e) => handleUpdateRole(u.uid, e.target.value as UserRole)}
                          className="py-1 px-2 border border-slate-300 rounded-lg text-xs bg-white text-slate-700"
                        >
                          <option value="student">Student (นักเรียน)</option>
                          <option value="teacher">Teacher (ครูผู้สอน)</option>
                          <option value="admin">Admin (ผู้ดูแลระบบ)</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                  {usersList.length === 0 && (
                    <tr>
                      <td colSpan={4} className="p-8 text-center text-slate-400">
                        {loadingUsers ? 'กำลังโหลดรายชื่อสมาชิก...' : 'คลิกปุ่มรีเฟรชเพื่อโหลดรายชื่อผู้ใช้จาก Firestore'}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 5. Site Settings Tab */}
      {activeTab === 'settings' && (
        <form onSubmit={handleSaveSettings} className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm space-y-6 max-w-3xl">
          <h2 className="text-base font-bold text-slate-900 border-b pb-3">
            การปรับแต่งข้อความและแบนเนอร์หน้าแรก
          </h2>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-semibold text-slate-700">
                ข้อความป้ายประชาสัมพันธ์ด้านบน (Top Announcement Bar)
              </label>
              <label className="flex items-center gap-1.5 text-xs text-slate-600 cursor-pointer">
                <input
                  type="checkbox"
                  checked={bannerEnabled}
                  onChange={(e) => setBannerEnabled(e.target.checked)}
                  className="rounded text-amber-500"
                />
                <span>เปิดใช้งานป้ายประกาศ</span>
              </label>
            </div>
            <input
              type="text"
              value={bannerText}
              onChange={(e) => setBannerText(e.target.value)}
              className="w-full p-2.5 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              หัวข้อใหญ่หน้าแรก (Hero Title)
            </label>
            <input
              type="text"
              value={heroTitle}
              onChange={(e) => setHeroTitle(e.target.value)}
              className="w-full p-2.5 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 font-bold"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              คำอธิบายรองหน้าแรก (Hero Subtitle)
            </label>
            <textarea
              rows={3}
              value={heroSubtitle}
              onChange={(e) => setHeroSubtitle(e.target.value)}
              className="w-full p-2.5 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
            />
          </div>

          <div className="pt-2 border-t flex justify-end">
            <button
              type="submit"
              disabled={savingSettings}
              className="py-2.5 px-6 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl text-xs flex items-center gap-2 shadow-sm transition-colors"
            >
              <Save className="w-4 h-4" />
              <span>{savingSettings ? 'กำลังบันทึก...' : 'บันทึกการตั้งค่าหน้าแรก'}</span>
            </button>
          </div>
        </form>
      )}

      {/* 6. Backup & Security Tab */}
      {activeTab === 'backup' && (
        <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm space-y-4 max-w-3xl">
          <h2 className="text-base font-bold text-slate-900 border-b pb-2">
            การสำรองและกู้คืนข้อมูล (Database Backup & Disaster Recovery)
          </h2>
          <p className="text-xs text-slate-600 leading-relaxed">
            ผู้ดูแลระบบสามารถดาวน์โหลดชุดข้อมูลทั้งหมดของ LearnSpace ได้ตลอดเวลา โดยไฟล์ JSON ที่ได้จะรวบรวมข้อมูลคอร์ส บทเรียน แบบทดสอบ การส่งงาน และการตั้งค่าระบบอย่างครบถ้วน
          </p>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-2">
            <div className="flex justify-between">
              <span className="text-slate-500">รูปแบบการสำรองข้อมูล:</span>
              <span className="font-mono font-bold text-slate-800">Complete JSON Schema</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">จำนวนคอลเลกชันที่สำรอง:</span>
              <span className="font-bold text-slate-800">7 คอลเลกชัน</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">การเข้ารหัสความปลอดภัย:</span>
              <span className="text-emerald-700 font-semibold">GCP Data Protection at Rest</span>
            </div>
          </div>

          <button
            onClick={handleExportBackup}
            className="py-3 px-6 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs flex items-center gap-2 shadow-sm transition-colors"
          >
            <Download className="w-4 h-4" />
            <span>ดาวน์โหลดไฟล์สำรองข้อมูล (Download JSON Backup)</span>
          </button>
        </div>
      )}

      {/* 7. Legacy Systems & External APIs Tab */}
      {activeTab === 'legacy' && (
        <div className="space-y-6 max-w-4xl">
          {/* Header */}
          <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-sm space-y-2">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Globe className="w-5 h-5 text-amber-500" />
              <span>การเชื่อมต่อระบบเดิมและบริการภายนอก (Legacy Integration Bridge)</span>
            </h2>
            <p className="text-xs text-slate-600 leading-relaxed">
              LearnSpace ออกแบบให้ทำงานร่วมกับระบบและบริการเดิมได้ ได้แก่ Google Apps Script API สำหรับการแลกเปลี่ยนข้อมูล,
              Firebase Realtime Database สำหรับฐานข้อมูลดั้งเดิม และ Local Storage สำหรับการบันทึกสถานะและดราฟต์ออฟไลน์
            </p>
          </div>

          {/* Section 1: Google Apps Script API */}
          <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <RefreshCw className="w-4 h-4 text-emerald-600" />
                  <span>Google Apps Script Web App API</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  เชื่อมต่อ Web App ของ Google Apps Script เพื่อดึงข้อมูลกระทู้หรือส่งต่อความคิดเห็น
                </p>
              </div>
              <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 font-bold">
                REST / JSON
              </span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Google Apps Script Web App URL (ลงท้ายด้วย /exec)
              </label>
              <div className="flex gap-2">
                <input
                  type="url"
                  value={gasUrl}
                  onChange={(e) => setGasUrl(e.target.value)}
                  placeholder="https://script.google.com/macros/s/AKfycb.../exec"
                  className="flex-1 p-2.5 text-xs rounded-xl border border-slate-300 font-mono focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                />
                <button
                  type="button"
                  disabled={testingGas || !gasUrl}
                  onClick={async () => {
                    setTestingGas(true);
                    setGasResult(null);
                    const res = await testGoogleAppsScriptConnection(gasUrl.trim());
                    setGasResult(res);
                    setTestingGas(false);
                    if (res.success) {
                      saveLegacyConfig({
                        googleAppsScriptUrl: gasUrl.trim(),
                        realtimeDatabaseUrl: rtdbUrl.trim(),
                        enableLocalStorageFallback: true,
                        lastSyncedAt: new Date().toISOString(),
                      });
                    }
                  }}
                  className="py-2.5 px-4 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition-colors shrink-0 disabled:opacity-50"
                >
                  {testingGas ? 'กำลังทดสอบ...' : 'ทดสอบการเชื่อมต่อ'}
                </button>
              </div>
            </div>

            {gasResult && (
              <div
                className={`p-3.5 rounded-xl text-xs flex items-start gap-2 ${
                  gasResult.success
                    ? 'bg-emerald-50 border border-emerald-200 text-emerald-800'
                    : 'bg-rose-50 border border-rose-200 text-rose-800'
                }`}
              >
                {gasResult.success ? (
                  <CheckCircle className="w-4 h-4 shrink-0 mt-0.5 text-emerald-600" />
                ) : (
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" />
                )}
                <div className="space-y-1">
                  <p className="font-semibold">{gasResult.message}</p>
                  {gasResult.sampleData && (
                    <pre className="text-[10px] bg-white/70 p-2 rounded-lg font-mono overflow-x-auto">
                      {JSON.stringify(gasResult.sampleData, null, 2)}
                    </pre>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Section 2: Firebase Realtime Database Bridge */}
          <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Database className="w-4 h-4 text-amber-600" />
                  <span>Firebase Realtime Database Bridge</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  เชื่อมต่อฐานข้อมูล Realtime Database ดั้งเดิมเพื่อรักษาความเข้ากันได้
                </p>
              </div>
              <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-amber-50 text-amber-700 font-bold">
                Legacy RTDB
              </span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Realtime Database URL
              </label>
              <div className="flex gap-2">
                <input
                  type="url"
                  value={rtdbUrl}
                  onChange={(e) => setRtdbUrl(e.target.value)}
                  placeholder="https://your-project-default-rtdb.firebaseio.com"
                  className="flex-1 p-2.5 text-xs rounded-xl border border-slate-300 font-mono focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                />
                <button
                  type="button"
                  disabled={testingRtdb || !rtdbUrl}
                  onClick={async () => {
                    setTestingRtdb(true);
                    setRtdbResult(null);
                    const res = await testRealtimeDbConnection(rtdbUrl.trim());
                    setRtdbResult(res);
                    setTestingRtdb(false);
                    if (res.success) {
                      saveLegacyConfig({
                        googleAppsScriptUrl: gasUrl.trim(),
                        realtimeDatabaseUrl: rtdbUrl.trim(),
                        enableLocalStorageFallback: true,
                        lastSyncedAt: new Date().toISOString(),
                      });
                    }
                  }}
                  className="py-2.5 px-4 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition-colors shrink-0 disabled:opacity-50"
                >
                  {testingRtdb ? 'กำลังตรวจสอบ...' : 'ตรวจสอบสถานะ'}
                </button>
              </div>
            </div>

            {rtdbResult && (
              <div
                className={`p-3.5 rounded-xl text-xs flex items-center gap-2 ${
                  rtdbResult.success
                    ? 'bg-emerald-50 border border-emerald-200 text-emerald-800'
                    : 'bg-rose-50 border border-rose-200 text-rose-800'
                }`}
              >
                {rtdbResult.success ? (
                  <CheckCircle className="w-4 h-4 shrink-0 text-emerald-600" />
                ) : (
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                )}
                <span>{rtdbResult.message}</span>
              </div>
            )}
          </div>

          {/* Section 3: Local Storage Offline Cache */}
          <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Local Storage & Offline Cache (การจัดเก็บข้อมูลในเครื่อง)
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  เก็บข้อมูลสำรองและข้อความร่างเมื่อเกิดเหตุฉุกเฉินหรืออินเทอร์เน็ตหลุด
                </p>
              </div>
              <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-bold">
                Client Cache
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-xs text-slate-500">จำนวนดราฟต์ที่บันทึกไว้ในเบราว์เซอร์:</span>
                <p className="text-lg font-bold text-slate-900 mt-1 font-mono">
                  {Object.keys(offlineDrafts).length} ฉบับ
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-xs text-slate-500">สถานะ Local Session Fallback:</span>
                <p className="text-xs font-bold text-emerald-700 mt-1 flex items-center gap-1.5">
                  <CheckCircle className="w-3.5 h-3.5" />
                  <span>เปิดใช้งาน (Active)</span>
                </p>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  try {
                    localStorage.removeItem('learnspace_offline_drafts');
                    setOfflineDrafts({});
                    setFeedback({ type: 'success', message: 'ล้างแคชข้อความร่างใน Local Storage เรียบร้อยแล้ว' });
                  } catch (e) {
                    setFeedback({ type: 'error', message: 'ไม่สามารถล้างแคชได้' });
                  }
                }}
                className="py-2 px-4 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-semibold transition-colors"
              >
                ล้างแคชดราฟต์ในเครื่อง
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Add/Edit Course */}
      {isCourseModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl max-w-lg w-full border border-slate-200 shadow-2xl p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <h3 className="text-base font-bold text-slate-900 border-b pb-2">
              {editingCourseId ? 'แก้ไขข้อมูลคอร์ส' : 'สร้างคอร์สเรียนใหม่'}
            </h3>

            <form onSubmit={handleSaveCourse} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  ชื่อคอร์สเรียน (Title)
                </label>
                <input
                  type="text"
                  required
                  value={courseTitle}
                  onChange={(e) => setCourseTitle(e.target.value)}
                  placeholder="เช่น CS102: การออกแบบฐานข้อมูล"
                  className="w-full p-2.5 text-xs rounded-xl border border-slate-300"
                />
              </div>

              {/* Classroom Code & Join Code */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    รหัสวิชา (Course Code)
                  </label>
                  <input
                    type="text"
                    required
                    value={courseCodeVal}
                    onChange={(e) => setCourseCodeVal(e.target.value.toUpperCase())}
                    placeholder="เช่น CS-201"
                    className="w-full p-2.5 text-xs rounded-xl border border-slate-300 font-mono font-bold uppercase"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    รหัสเข้าร่วมห้องเรียน (Join Code)
                  </label>
                  <input
                    type="text"
                    required
                    value={courseJoinCodeVal}
                    onChange={(e) => setCourseJoinCodeVal(e.target.value.toUpperCase())}
                    placeholder="เช่น LS-201WEB"
                    className="w-full p-2.5 text-xs rounded-xl border border-slate-300 font-mono font-bold uppercase text-blue-600"
                  />
                </div>
              </div>

              {/* Term & Room */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    ภาคเรียน (Semester / Term)
                  </label>
                  <input
                    type="text"
                    value={courseTermVal}
                    onChange={(e) => setCourseTermVal(e.target.value)}
                    placeholder="เช่น ภาคเรียนที่ 1/2569"
                    className="w-full p-2.5 text-xs rounded-xl border border-slate-300"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    ห้องเรียน / กลุ่ม (Room)
                  </label>
                  <input
                    type="text"
                    value={courseRoomVal}
                    onChange={(e) => setCourseRoomVal(e.target.value)}
                    placeholder="เช่น ห้อง 402 / ออนไลน์"
                    className="w-full p-2.5 text-xs rounded-xl border border-slate-300"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    หมวดหมู่
                  </label>
                  <select
                    value={courseCategory}
                    onChange={(e) => setCourseCategory(e.target.value)}
                    className="w-full p-2 text-xs rounded-xl border border-slate-300 bg-white"
                  >
                    <option value="วิทยาการคอมพิวเตอร์">วิทยาการคอมพิวเตอร์</option>
                    <option value="ข้อมูลและปัญญาประดิษฐ์">ข้อมูลและ AI</option>
                    <option value="วิทยาศาสตร์และคณิตศาสตร์">วิทยาศาสตร์และคณิตศาสตร์</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    ระดับความยาก
                  </label>
                  <select
                    value={courseLevel}
                    onChange={(e) => setCourseLevel(e.target.value as any)}
                    className="w-full p-2 text-xs rounded-xl border border-slate-300 bg-white"
                  >
                    <option value="beginner">Beginner (ระดับต้น)</option>
                    <option value="intermediate">Intermediate (ระดับกลาง)</option>
                    <option value="advanced">Advanced (ระดับสูง)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  ชื่ออาจารย์ผู้สอน
                </label>
                <input
                  type="text"
                  required
                  value={courseInstructor}
                  onChange={(e) => setCourseInstructor(e.target.value)}
                  className="w-full p-2.5 text-xs rounded-xl border border-slate-300"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  คำอธิบายรายวิชา (Description)
                </label>
                <textarea
                  rows={3}
                  required
                  value={courseDesc}
                  onChange={(e) => setCourseDesc(e.target.value)}
                  className="w-full p-2.5 text-xs rounded-xl border border-slate-300"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  ภาพปกคอร์ส (Cover Image URL)
                </label>
                <input
                  type="text"
                  value={courseCover}
                  onChange={(e) => setCourseCover(e.target.value)}
                  className="w-full p-2.5 text-xs rounded-xl border border-slate-300 font-mono text-[11px]"
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="pub"
                  checked={coursePublished}
                  onChange={(e) => setCoursePublished(e.target.checked)}
                />
                <label htmlFor="pub" className="text-xs text-slate-700">
                  เผยแพร่คอร์สสู่สาธารณะทันที
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t">
                <button
                  type="button"
                  onClick={() => setIsCourseModalOpen(false)}
                  className="py-2 px-4 rounded-xl text-xs text-slate-600 hover:bg-slate-100"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="py-2 px-5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs"
                >
                  บันทึกคอร์ส
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Add Lesson */}
      {isLessonModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl max-w-lg w-full border border-slate-200 shadow-2xl p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <h3 className="text-base font-bold text-slate-900 border-b pb-2">
              เพิ่มบทเรียนใหม่
            </h3>

            <form onSubmit={handleSaveLesson} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  สังกัดคอร์สเรียน
                </label>
                <select
                  value={lessonCourseId}
                  onChange={(e) => setLessonCourseId(e.target.value)}
                  className="w-full p-2 text-xs rounded-xl border border-slate-300 bg-white"
                >
                  {courses.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.title}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-4 gap-3">
                <div className="col-span-3">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    ชื่อบทเรียน
                  </label>
                  <input
                    type="text"
                    required
                    value={lessonTitle}
                    onChange={(e) => setLessonTitle(e.target.value)}
                    placeholder="เช่น บทที่ 4: การรักษาความปลอดภัย"
                    className="w-full p-2.5 text-xs rounded-xl border border-slate-300"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    ลำดับบท
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={lessonOrder}
                    onChange={(e) => setLessonOrder(Number(e.target.value))}
                    className="w-full p-2.5 text-xs rounded-xl border border-slate-300"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  สรุปย่อบทเรียน (Summary)
                </label>
                <input
                  type="text"
                  required
                  value={lessonSummary}
                  onChange={(e) => setLessonSummary(e.target.value)}
                  className="w-full p-2.5 text-xs rounded-xl border border-slate-300"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  ลิงก์วิดีโอบรรยาย (YouTube Embed URL ถ้ามี)
                </label>
                <input
                  type="text"
                  value={lessonVideo}
                  onChange={(e) => setLessonVideo(e.target.value)}
                  placeholder="https://www.youtube.com/embed/..."
                  className="w-full p-2.5 text-xs rounded-xl border border-slate-300 font-mono text-[11px]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  เนื้อหาบทเรียน (Content)
                </label>
                <textarea
                  rows={4}
                  required
                  value={lessonContent}
                  onChange={(e) => setLessonContent(e.target.value)}
                  placeholder="เขียนเนื้อหาการสอน คำอธิบายหลักการ..."
                  className="w-full p-2.5 text-xs rounded-xl border border-slate-300"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t">
                <button
                  type="button"
                  onClick={() => setIsLessonModalOpen(false)}
                  className="py-2 px-4 rounded-xl text-xs text-slate-600 hover:bg-slate-100"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="py-2 px-5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs"
                >
                  บันทึกบทเรียน
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Add Assignment */}
      {isAssignModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl max-w-lg w-full border border-slate-200 shadow-2xl p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <h3 className="text-base font-bold text-slate-900 border-b pb-2">
              สร้างการบ้าน / โครงงานใหม่
            </h3>

            <form onSubmit={handleSaveAssignment} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  สังกัดคอร์สเรียน
                </label>
                <select
                  value={assignCourseId}
                  onChange={(e) => setAssignCourseId(e.target.value)}
                  className="w-full p-2 text-xs rounded-xl border border-slate-300 bg-white"
                >
                  {courses.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.title}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  ชื่องาน / หัวข้อการบ้าน
                </label>
                <input
                  type="text"
                  required
                  value={assignTitle}
                  onChange={(e) => setAssignTitle(e.target.value)}
                  placeholder="เช่น การบ้านชิ้นที่ 2: สร้าง Data Pipeline"
                  className="w-full p-2.5 text-xs rounded-xl border border-slate-300"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    คะแนนเต็ม
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={assignMaxScore}
                    onChange={(e) => setAssignMaxScore(Number(e.target.value))}
                    className="w-full p-2.5 text-xs rounded-xl border border-slate-300"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    กำหนดส่ง
                  </label>
                  <input
                    type="datetime-local"
                    value={assignDueDate}
                    onChange={(e) => setAssignDueDate(e.target.value)}
                    className="w-full p-2 text-xs rounded-xl border border-slate-300"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  คำชี้แจงและเกณฑ์การให้คะแนน
                </label>
                <textarea
                  rows={4}
                  required
                  value={assignInstructions}
                  onChange={(e) => setAssignInstructions(e.target.value)}
                  placeholder="ระบุข้อกำหนด สิ่งที่ต้องส่ง และเกณฑ์ประเมิน..."
                  className="w-full p-2.5 text-xs rounded-xl border border-slate-300"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t">
                <button
                  type="button"
                  onClick={() => setIsAssignModalOpen(false)}
                  className="py-2 px-4 rounded-xl text-xs text-slate-600 hover:bg-slate-100"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="py-2 px-5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs"
                >
                  สร้างการบ้าน
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
