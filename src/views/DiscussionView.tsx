import React, { useState } from 'react';
import {
  MessagesSquare,
  Search,
  PlusCircle,
  Pin,
  CheckCircle,
  MessageCircle,
  User,
  Clock,
  ArrowLeft,
  Send,
  Trash2,
  Award,
  AlertCircle,
  Hash,
  Shield,
  Smile,
} from 'lucide-react';
import type { Discussion, Reply, Course } from '../types';
import { useAuth } from '../context/AuthContext';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import {
  collection,
  doc,
  addDoc,
  deleteDoc,
  updateDoc,
  increment,
} from 'firebase/firestore';
import { ConfirmationModal } from '../components/common/ConfirmationModal';

interface DiscussionViewProps {
  discussions: Discussion[];
  replies: Reply[];
  courses: Course[];
  initialCourseFilter?: string | null;
  selectedTopicId?: string | null;
  onNavigate: (view: string, payload?: any) => void;
  onOpenAuth: () => void;
}

export const DiscussionView: React.FC<DiscussionViewProps> = ({
  discussions,
  replies,
  courses,
  initialCourseFilter = null,
  selectedTopicId = null,
  onNavigate,
  onOpenAuth,
}) => {
  const { user, profile, role, isAdmin, isTeacher } = useAuth();
  
  // Tabs: Live Room Stream vs Structured Q&A Topics
  const [activeChannel, setActiveChannel] = useState<string>('general');
  const [activeTopicId, setActiveTopicId] = useState<string | null>(selectedTopicId);
  const [search, setSearch] = useState('');

  // Live Chat input state
  const [chatMessage, setChatMessage] = useState('');
  const [sendingChat, setSendingChat] = useState(false);
  const [chatError, setChatError] = useState<string | null>(null);

  // New Q&A Topic Modal
  const [isNewTopicModalOpen, setIsNewTopicModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [newCourseId, setNewCourseId] = useState<string>('');
  const [submittingTopic, setSubmittingTopic] = useState(false);

  // New Reply state
  const [replyText, setReplyText] = useState('');
  const [submittingReply, setSubmittingReply] = useState(false);

  // Confirmation Delete Modal
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [targetDeleteId, setTargetDeleteId] = useState<string | null>(null);

  const channels = [
    { id: 'general', name: 'ห้องสนทนาทั่วไป', desc: 'พูดคุยแลกเปลี่ยนเรื่องการเรียนทั่วไป' },
    { id: 'course-web-dev', name: 'กลุ่มเว็บและ Full-Stack', desc: 'ปรึกษาโค้ด React, API และฐานข้อมูล' },
    { id: 'course-data-ai', name: 'กลุ่มวิทยาศาสตร์ข้อมูล & AI', desc: 'แลกเปลี่ยนโมเดล Machine Learning และ Data' },
    { id: 'course-applied-math', name: 'กลุ่มคณิตศาสตร์เชิงคำนวณ', desc: 'ทฤษฎีเรขาคณิตและเมทริกซ์' },
  ];

  // Filter messages for current channel
  const channelMessages = discussions.filter((d) => {
    if (activeChannel === 'general') {
      return !d.courseId || d.courseId === 'general';
    }
    return d.courseId === activeChannel;
  });

  const activeTopic = discussions.find((d) => d.id === activeTopicId);
  const topicReplies = replies.filter((r) => r.topicId === activeTopicId);

  // Live Chat Send Message (Separated from Google Sheets - Pure Firestore Realtime)
  const handleSendChatMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      onOpenAuth();
      return;
    }

    const trimmed = chatMessage.trim();
    if (!trimmed) {
      setChatError('ข้อความต้องไม่ว่างเปล่า');
      return;
    }
    if (trimmed.length > 1000) {
      setChatError('ข้อความต้องไม่เกิน 1,000 ตัวอักษร');
      return;
    }

    setSendingChat(true);
    setChatError(null);

    try {
      const selectedCh = channels.find((c) => c.id === activeChannel);
      const messageDoc = {
        title: trimmed.length > 50 ? trimmed.substring(0, 50) + '...' : trimmed,
        content: trimmed,
        courseId: activeChannel === 'general' ? null : activeChannel,
        courseTitle: selectedCh?.name || 'สนทนาทั่วไป',
        lessonId: null,
        // Anti-spoofing: enforced strictly from authenticated user state
        authorId: user.uid,
        authorName: profile?.displayName || user.email?.split('@')[0] || 'สมาชิก',
        authorRole: role,
        replyCount: 0,
        isSolved: false,
        isPinned: false,
        createdAt: new Date().toISOString(),
      };

      await addDoc(collection(db, 'discussions'), messageDoc);
      setChatMessage('');
    } catch (err: any) {
      console.error('Send message error:', err);
      setChatError('ไม่สามารถส่งข้อความได้: ' + (err.message || 'กรุณาลองใหม่'));
    } finally {
      setSendingChat(false);
    }
  };

  const handleCreateTopic = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      onOpenAuth();
      return;
    }
    if (!newTitle.trim() || !newContent.trim()) return;

    setSubmittingTopic(true);
    try {
      const selectedCourse = courses.find((c) => c.id === newCourseId);

      const topicData = {
        title: newTitle.trim(),
        content: newContent.trim(),
        courseId: newCourseId ? newCourseId : null,
        courseTitle: selectedCourse ? selectedCourse.title : 'ชุมชนทั่วไป',
        lessonId: null,
        authorId: user.uid,
        authorName: profile?.displayName || user.email?.split('@')[0] || 'สมาชิก',
        authorRole: role,
        replyCount: 0,
        isSolved: false,
        isPinned: false,
        createdAt: new Date().toISOString(),
      };

      const docRef = await addDoc(collection(db, 'discussions'), topicData);
      setIsNewTopicModalOpen(false);
      setNewTitle('');
      setNewContent('');
      setNewCourseId('');
      setActiveTopicId(docRef.id);
    } catch (err) {
      console.error('Create topic error:', err);
    } finally {
      setSubmittingTopic(false);
    }
  };

  const handleCreateReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      onOpenAuth();
      return;
    }
    if (!activeTopicId || !replyText.trim()) return;

    setSubmittingReply(true);
    try {
      const replyData = {
        topicId: activeTopicId,
        authorId: user.uid,
        authorName: profile?.displayName || user.email?.split('@')[0] || 'สมาชิก',
        authorRole: role,
        content: replyText.trim(),
        isAcceptedAnswer: false,
        createdAt: new Date().toISOString(),
      };

      await addDoc(collection(db, 'replies'), replyData);
      await updateDoc(doc(db, 'discussions', activeTopicId), {
        replyCount: increment(1),
      });

      setReplyText('');
    } catch (err) {
      console.error('Create reply error:', err);
    } finally {
      setSubmittingReply(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!targetDeleteId) return;
    try {
      await deleteDoc(doc(db, 'discussions', targetDeleteId));
      if (activeTopicId === targetDeleteId) {
        setActiveTopicId(null);
      }
    } catch (err) {
      console.error('Delete error:', err);
    } finally {
      setDeleteModalOpen(false);
      setTargetDeleteId(null);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      {/* Header */}
      <div className="border-b border-slate-200 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-amber-600 uppercase tracking-wider mb-1">
            <MessagesSquare className="w-4 h-4 text-amber-500" />
            <span>ระบบสนทนาและกระดานวิชาการแบบ Realtime (Cloud Firestore Engine)</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            พื้นที่แลกเปลี่ยนเรียนรู้ (LearnSpace Community)
          </h1>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              if (!user) onOpenAuth();
              else setIsNewTopicModalOpen(true);
            }}
            className="py-2.5 px-4 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs flex items-center gap-2 shadow-xs transition-colors"
          >
            <PlusCircle className="w-4 h-4" />
            <span>ตั้งกระทู้ถาม-ตอบใหม่</span>
          </button>
        </div>
      </div>

      {activeTopic ? (
        /* ─────────────────────────────────────────────────────────────
            THREAD DETAIL VIEW
        ───────────────────────────────────────────────────────────── */
        <div className="space-y-6 max-w-4xl mx-auto">
          <button
            onClick={() => setActiveTopicId(null)}
            className="inline-flex items-center gap-2 text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>กลับสู่ห้องสนทนา</span>
          </button>

          <div className="p-6 sm:p-8 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
                  <span className="bg-slate-100 text-slate-700 font-semibold px-2.5 py-0.5 rounded">
                    {activeTopic.courseTitle || 'ทั่วไป'}
                  </span>
                  <span>·</span>
                  <span>โพสต์โดย {activeTopic.authorName}</span>
                  <span className="text-[10px] uppercase font-bold text-amber-700">
                    ({activeTopic.authorRole})
                  </span>
                  <span>·</span>
                  <span>{new Date(activeTopic.createdAt).toLocaleString('th-TH')}</span>
                </div>
                <h2 className="text-xl font-bold text-slate-900">{activeTopic.title}</h2>
              </div>

              {(user?.uid === activeTopic.authorId || isTeacher || isAdmin) && (
                <button
                  onClick={() => {
                    setTargetDeleteId(activeTopic.id);
                    setDeleteModalOpen(true);
                  }}
                  className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                  title="ลบกระทู้"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>

            <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-line pt-2">
              {activeTopic.content}
            </p>
          </div>

          {/* Replies */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              คำตอบและการสนทนา ({topicReplies.length})
            </h3>
            {topicReplies.map((r) => (
              <div
                key={r.id}
                className={`p-4 rounded-xl border ${
                  r.isAcceptedAnswer
                    ? 'bg-emerald-50/60 border-emerald-300'
                    : 'bg-white border-slate-200 shadow-xs'
                }`}
              >
                <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
                  <div className="flex items-center gap-2">
                    <strong className="text-slate-900">{r.authorName}</strong>
                    <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-100 text-slate-600 uppercase">
                      {r.authorRole}
                    </span>
                    <span>· {new Date(r.createdAt).toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                </div>
                <p className="text-xs sm:text-sm text-slate-700 whitespace-pre-line">{r.content}</p>
              </div>
            ))}
          </div>

          {/* Write Reply */}
          <form onSubmit={handleCreateReply} className="bg-white p-4 rounded-xl border border-slate-200 flex gap-2">
            <input
              type="text"
              required
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              placeholder="เขียนคำตอบในกระทู้นี้..."
              className="flex-1 p-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
            />
            <button
              type="submit"
              disabled={submittingReply}
              className="py-2 px-4 bg-slate-900 text-white rounded-lg text-xs font-bold hover:bg-slate-800 disabled:opacity-50"
            >
              ส่งคำตอบ
            </button>
          </form>
        </div>
      ) : (
        /* ─────────────────────────────────────────────────────────────
            REALTIME ROOM CHAT & FORUM VIEW
        ───────────────────────────────────────────────────────────── */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* Left: Channels List */}
          <div className="lg:col-span-4 bg-white rounded-2xl border border-slate-200 shadow-xs p-4 space-y-2">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider px-2 mb-3">
              ห้องสนทนาแยกตามสาขาวิชา
            </p>
            {channels.map((ch) => {
              const active = activeChannel === ch.id;
              return (
                <button
                  key={ch.id}
                  onClick={() => setActiveChannel(ch.id)}
                  className={`w-full text-left p-3 rounded-xl transition-all ${
                    active
                      ? 'bg-slate-900 text-white font-bold shadow-xs'
                      : 'hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Hash className={`w-4 h-4 ${active ? 'text-amber-400' : 'text-slate-400'}`} />
                    <span className="text-xs sm:text-sm">{ch.name}</span>
                  </div>
                  <p className={`text-[11px] mt-1 line-clamp-1 ${active ? 'text-slate-300' : 'text-slate-400'}`}>
                    {ch.desc}
                  </p>
                </button>
              );
            })}
          </div>

          {/* Right: Realtime Message Stream Area */}
          <div className="lg:col-span-8 bg-white rounded-2xl border border-slate-200 shadow-xs flex flex-col h-[650px] overflow-hidden">
            
            {/* Channel Top Bar */}
            <div className="p-4 border-b border-slate-200 bg-slate-50/80 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Hash className="w-5 h-5 text-amber-600" />
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    {channels.find((c) => c.id === activeChannel)?.name}
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    อัปเดตแบบเรียลไทม์ข้ามอุปกรณ์ผ่าน Cloud Firestore (แยกจาก Google Sheets โดยสิ้นเชิง)
                  </p>
                </div>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-semibold">
                ● สด (Realtime)
              </span>
            </div>

            {/* Messages Feed */}
            <div className="flex-1 p-5 overflow-y-auto space-y-4">
              {channelMessages.length > 0 ? (
                channelMessages.map((msg) => {
                  const isMe = user?.uid === msg.authorId;
                  return (
                    <div
                      key={msg.id}
                      className="group flex items-start justify-between gap-3 p-3.5 rounded-xl hover:bg-slate-50/80 transition-colors border border-transparent hover:border-slate-100"
                    >
                      <div className="flex items-start gap-3">
                        <div
                          className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 ${
                            msg.authorRole === 'teacher'
                              ? 'bg-amber-500 text-slate-950'
                              : msg.authorRole === 'admin'
                              ? 'bg-slate-900 text-white'
                              : 'bg-slate-200 text-slate-700'
                          }`}
                        >
                          {msg.authorName.charAt(0)}
                        </div>
                        <div>
                          <div className="flex items-center gap-2 text-xs">
                            <span className="font-bold text-slate-900">{msg.authorName}</span>
                            <span
                              className={`text-[9px] px-1.5 py-0.2 rounded font-semibold uppercase ${
                                msg.authorRole === 'teacher'
                                  ? 'bg-amber-100 text-amber-900'
                                  : msg.authorRole === 'admin'
                                  ? 'bg-slate-900 text-white'
                                  : 'bg-slate-100 text-slate-600'
                              }`}
                            >
                              {msg.authorRole}
                            </span>
                            <span className="text-[10px] text-slate-400">
                              {new Date(msg.createdAt).toLocaleTimeString('th-TH', {
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </span>
                          </div>

                          <p className="text-xs sm:text-sm text-slate-800 mt-1 leading-relaxed whitespace-pre-line">
                            {msg.content}
                          </p>
                        </div>
                      </div>

                      {/* Moderate / Delete (if author or teacher/admin) */}
                      {(isMe || isTeacher || isAdmin) && (
                        <button
                          onClick={() => {
                            setTargetDeleteId(msg.id);
                            setDeleteModalOpen(true);
                          }}
                          className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-rose-600 transition-opacity"
                          title="ลบข้อความ"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  );
                })
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-center p-8 text-slate-400">
                  <MessagesSquare className="w-10 h-10 mb-2 opacity-40" />
                  <p className="text-xs font-semibold text-slate-600">ยังไม่มีข้อความในห้องนี้</p>
                  <p className="text-[11px] mt-0.5">พิมพ์ข้อความด้านล่างเพื่อเริ่มการสนทนาแลกเปลี่ยน</p>
                </div>
              )}
            </div>

            {/* Error banner if validation fails */}
            {chatError && (
              <div className="px-4 py-2 bg-rose-50 text-rose-700 text-xs flex items-center gap-2 border-t border-rose-200">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                <span>{chatError}</span>
              </div>
            )}

            {/* Chat Input Bar */}
            <form onSubmit={handleSendChatMessage} className="p-3 border-t border-slate-200 bg-slate-50 flex items-center gap-2">
              <input
                type="text"
                value={chatMessage}
                maxLength={1000}
                onChange={(e) => {
                  setChatMessage(e.target.value);
                  setChatError(null);
                }}
                placeholder={user ? "ส่งข้อความแลกเปลี่ยนในห้องนี้ (กด Enter เพื่อส่ง)..." : "กรุณาเข้าสู่ระบบเพื่อร่วมสนทนา"}
                disabled={!user || sendingChat}
                className="flex-1 py-2 px-3.5 text-xs rounded-xl border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
              />
              <button
                type="submit"
                disabled={!user || sendingChat || !chatMessage.trim()}
                className="p-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-colors disabled:opacity-40"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>

          </div>

        </div>
      )}

      {/* Confirmation Modal for Deletion */}
      <ConfirmationModal
        isOpen={deleteModalOpen}
        title="ยืนยันการลบข้อความ"
        message="คุณแน่ใจหรือไม่ว่าต้องการลบข้อความนี้ออกจากกระดานสนทนา? ข้อความที่ถูกลบจะไม่สามารถกู้คืนได้"
        confirmLabel="ยืนยันลบ"
        cancelLabel="ยกเลิก"
        isDestructive={true}
        onConfirm={handleConfirmDelete}
        onCancel={() => {
          setDeleteModalOpen(false);
          setTargetDeleteId(null);
        }}
      />

      {/* New Topic Modal */}
      {isNewTopicModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl max-w-lg w-full border border-slate-200 shadow-2xl p-6 space-y-4">
            <h3 className="text-base font-bold text-slate-900 border-b pb-2">
              ตั้งกระทู้ถาม-ตอบใหม่
            </h3>

            <form onSubmit={handleCreateTopic} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  เลือกหมวดหมู่ห้องสนทนา
                </label>
                <select
                  value={newCourseId}
                  onChange={(e) => setNewCourseId(e.target.value)}
                  className="w-full p-2.5 text-xs rounded-xl border border-slate-300 bg-white"
                >
                  <option value="">ห้องสนทนาทั่วไป</option>
                  {courses.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.title}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  หัวข้อกระทู้
                </label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="เช่น สงสัยการใช้งาน useEffect ในบทเรียนที่ 2..."
                  className="w-full p-2.5 text-xs rounded-xl border border-slate-300"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  เนื้อหาคำถามโดยละเอียด
                </label>
                <textarea
                  rows={4}
                  required
                  value={newContent}
                  onChange={(e) => setNewContent(e.target.value)}
                  placeholder="อธิบายข้อสงสัยหรือโค้ดที่ต้องการคำแนะนำ..."
                  className="w-full p-2.5 text-xs rounded-xl border border-slate-300"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t">
                <button
                  type="button"
                  onClick={() => setIsNewTopicModalOpen(false)}
                  className="py-2 px-4 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  disabled={submittingTopic}
                  className="py-2 px-5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs"
                >
                  {submittingTopic ? 'กำลังเผยแพร่...' : 'เผยแพร่กระทู้'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
