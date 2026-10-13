import React, { useState, useEffect, useRef } from 'react';
import {
  MessageCircle,
  X,
  Minus,
  Maximize2,
  Send,
  Smile,
  ThumbsUp,
  Users,
  Shield,
  GraduationCap,
  Sparkles,
  Phone,
  Video,
  Info,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { db, handleFirestoreError, OperationType } from '../../lib/firebase';
import {
  collection,
  addDoc,
  query,
  where,
  orderBy,
  limit,
  onSnapshot,
} from 'firebase/firestore';
import type { Discussion, Reply } from '../../types';

interface FacebookMessengerProps {
  isOpen: boolean;
  onClose: () => void;
  activeContactName?: string;
  onOpenAuth: () => void;
}

export const FacebookMessenger: React.FC<FacebookMessengerProps> = ({
  isOpen,
  onClose,
  activeContactName,
  onOpenAuth,
}) => {
  const { user, profile, role } = useAuth();
  const [minimized, setMinimized] = useState(false);
  const [activeTab, setActiveTab] = useState<'group' | 'direct'>('group');
  const [messages, setMessages] = useState<Discussion[]>([]);
  const [inputText, setInputText] = useState('');
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Real-time listener for live classroom chat stream
  useEffect(() => {
    if (!isOpen) return;

    const q = query(
      collection(db, 'discussions'),
      orderBy('createdAt', 'desc'),
      limit(40)
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const list: Discussion[] = [];
        snapshot.forEach((doc) => {
          list.push({ id: doc.id, ...doc.data() } as Discussion);
        });
        // Sort chronologically ascending for chat view
        list.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
        setMessages(list);
      },
      (error) => {
        handleFirestoreError(error, OperationType.LIST, 'discussions');
      }
    );

    return () => unsubscribe();
  }, [isOpen]);

  useEffect(() => {
    if (!minimized && isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, minimized, isOpen]);

  if (!isOpen) return null;

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputText).trim();
    if (!text) return;

    if (!user) {
      onOpenAuth();
      return;
    }

    setSending(true);
    try {
      await addDoc(collection(db, 'discussions'), {
        courseId: 'general',
        courseTitle: 'ห้องแชตสด LearnSpace',
        title: text.slice(0, 40),
        content: text,
        authorId: user.uid,
        authorName: profile?.displayName || user.email?.split('@')[0] || 'ผู้ใช้งาน',
        authorRole: role || 'student',
        replyCount: 0,
        isSolved: false,
        isPinned: false,
        createdAt: new Date().toISOString(),
      });
      setInputText('');
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, 'discussions');
    } finally {
      setSending(false);
    }
  };

  const handleSendThumbsUp = () => {
    handleSendMessage('👍');
  };

  const contactTitle = activeContactName || 'กลุ่มรวมแชตสด LearnSpace';

  return (
    <aside
      aria-label="Messenger Chat Window"
      className="fixed bottom-0 right-4 sm:right-6 z-50 flex flex-col font-sans select-none drop-shadow-2xl"
    >
      {/* Minimized Bubble State */}
      {minimized ? (
        <button
          onClick={() => setMinimized(false)}
          className="flex items-center gap-2.5 bg-white border border-slate-200 shadow-xl rounded-t-2xl px-4 py-2.5 text-slate-800 hover:bg-slate-50 transition-colors"
        >
          <div className="relative">
            <div className="w-8 h-8 rounded-full bg-[#1877F2] text-white flex items-center justify-center font-bold text-xs">
              <MessageCircle className="w-4 h-4" />
            </div>
            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-white" />
          </div>
          <span className="text-xs font-bold text-slate-800 truncate max-w-[140px]">
            {contactTitle}
          </span>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onClose();
            }}
            className="p-1 hover:bg-slate-200 rounded-full text-slate-400 hover:text-slate-600"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </button>
      ) : (
        /* Full Expanded Messenger Window */
        <div className="w-80 sm:w-96 h-[460px] bg-white rounded-t-2xl border border-slate-200/90 shadow-2xl flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-3 duration-200">
          {/* Facebook Messenger Header */}
          <div className="bg-white border-b border-slate-200 px-3.5 py-2.5 flex items-center justify-between shadow-xs">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="relative shrink-0">
                <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-[#1877F2] to-sky-400 text-white flex items-center justify-center font-bold text-sm shadow-xs">
                  {contactTitle.charAt(0)}
                </div>
                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-white ring-1 ring-emerald-400" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <h3 className="text-xs sm:text-sm font-bold text-slate-900 truncate">
                    {contactTitle}
                  </h3>
                </div>
                <p className="text-[10px] text-emerald-600 font-medium flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  ออนไลน์ · Realtime Firebase
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-1 text-slate-500">
              <button
                onClick={() => setMinimized(true)}
                className="p-1.5 hover:bg-slate-100 rounded-full text-slate-500 hover:text-slate-800 transition-colors"
                title="ย่อขนาด"
              >
                <Minus className="w-4 h-4" />
              </button>
              <button
                onClick={onClose}
                className="p-1.5 hover:bg-slate-100 rounded-full text-slate-500 hover:text-rose-600 transition-colors"
                title="ปิดหน้าต่าง"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Quick Notice */}
          <div className="px-3 py-1.5 bg-[#F0F2F5] text-[11px] text-slate-600 flex items-center justify-between border-b border-slate-200">
            <span className="truncate">แชตรวมสมาชิกและเพื่อนร่วมชั้นเรียน</span>
            <span className="text-[10px] text-[#1877F2] font-semibold shrink-0 ml-1">LearnSpace Chat</span>
          </div>

          {/* Messages Area */}
          <div className="flex-1 p-3.5 overflow-y-auto space-y-3 bg-white text-xs">
            {messages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-4 text-slate-400">
                <div className="w-12 h-12 rounded-full bg-[#F0F2F5] flex items-center justify-center text-[#1877F2] mb-2">
                  <MessageCircle className="w-6 h-6" />
                </div>
                <p className="text-xs font-semibold text-slate-700">เริ่มการสนทนาแรกในห้องแชต</p>
                <p className="text-[11px] text-slate-400 mt-0.5">ส่งคำถาม ทักทายเพื่อน หรือแชร์สิ่งที่กำลังเรียนรู้ได้เลย</p>
              </div>
            ) : (
              messages.map((msg) => {
                const isMe = user && msg.authorId === user.uid;
                return (
                  <div
                    key={msg.id}
                    className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                  >
                    {!isMe && (
                      <div className="flex items-center gap-1 mb-0.5 px-1">
                        <span className="text-[10px] font-semibold text-slate-600">
                          {msg.authorName}
                        </span>
                        {msg.authorRole === 'teacher' && (
                          <span className="text-[9px] bg-amber-100 text-amber-800 px-1 py-0.2 rounded font-medium">
                            ผู้สอน
                          </span>
                        )}
                        {msg.authorRole === 'admin' && (
                          <span className="text-[9px] bg-purple-100 text-purple-800 px-1 py-0.2 rounded font-medium">
                            แอดมิน
                          </span>
                        )}
                      </div>
                    )}

                    <div className="flex items-end gap-1.5 max-w-[85%]">
                      {!isMe && (
                        <div className="w-6 h-6 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center text-[10px] font-bold shrink-0 mb-0.5">
                          {msg.authorName.charAt(0)}
                        </div>
                      )}

                      <div
                        className={`px-3 py-2 rounded-2xl break-words leading-relaxed ${
                          isMe
                            ? 'bg-[#1877F2] text-white rounded-br-xs'
                            : 'bg-[#F0F2F5] text-slate-900 rounded-bl-xs'
                        }`}
                      >
                        {msg.content}
                      </div>
                    </div>

                    <span className="text-[9px] text-slate-400 mt-0.5 px-1">
                      {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                );
              })
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Facebook Chat Input Bar */}
          <div className="p-2.5 bg-white border-t border-slate-200">
            {user ? (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSendMessage();
                }}
                className="flex items-center gap-1.5"
              >
                <div className="flex-1 relative flex items-center">
                  <input
                    type="text"
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    placeholder="พิมพ์ข้อความ..."
                    className="w-full bg-[#F0F2F5] hover:bg-[#E4E6EB] focus:bg-white text-slate-900 text-xs rounded-full pl-3.5 pr-8 py-2 border border-transparent focus:border-slate-300 focus:outline-none transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setInputText((prev) => prev + ' 😊 ')}
                    className="absolute right-2 text-slate-400 hover:text-amber-500"
                    title="ใส่อิโมจิ"
                  >
                    <Smile className="w-4 h-4" />
                  </button>
                </div>

                {inputText.trim() ? (
                  <button
                    type="submit"
                    disabled={sending}
                    className="p-2 rounded-full bg-[#1877F2] hover:bg-[#166FE5] text-white disabled:opacity-50 transition-colors shadow-xs"
                    title="ส่งข้อความ"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleSendThumbsUp}
                    className="p-2 rounded-full text-[#1877F2] hover:bg-[#F0F2F5] transition-colors"
                    title="ส่งสติกเกอร์ถูกใจ"
                  >
                    <ThumbsUp className="w-5 h-5 fill-[#1877F2]" />
                  </button>
                )}
              </form>
            ) : (
              <div className="text-center py-1">
                <button
                  onClick={onOpenAuth}
                  className="text-xs font-semibold text-[#1877F2] hover:underline"
                >
                  เข้าสู่ระบบเพื่อร่วมสนทนาในห้องแชต
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </aside>
  );
};
