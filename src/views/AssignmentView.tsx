import React, { useState } from 'react';
import {
  FileCheck2,
  Clock,
  UploadCloud,
  CheckCircle,
  AlertCircle,
  FileText,
  User,
  ArrowLeft,
  Award,
  Send,
  MessageSquare,
  ShieldCheck,
} from 'lucide-react';
import type { Assignment, Submission, Course } from '../types';
import { useAuth } from '../context/AuthContext';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import {
  collection,
  doc,
  setDoc,
  updateDoc,
  serverTimestamp,
} from 'firebase/firestore';

interface AssignmentViewProps {
  assignments: Assignment[];
  submissions: Submission[];
  courses: Course[];
  selectedAssignmentId?: string | null;
  onNavigate: (view: string, payload?: any) => void;
  onOpenAuth: () => void;
}

export const AssignmentView: React.FC<AssignmentViewProps> = ({
  assignments,
  submissions,
  courses,
  selectedAssignmentId = null,
  onNavigate,
  onOpenAuth,
}) => {
  const { user, profile, isTeacher, isAdmin } = useAuth();
  const [activeAssignmentId, setActiveAssignmentId] = useState<string | null>(
    selectedAssignmentId || (assignments.length > 0 ? assignments[0].id : null)
  );

  // Submission Form State
  const [submissionText, setSubmissionText] = useState('');
  const [fileName, setFileName] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Teacher Grading Modal State
  const [gradingSubmission, setGradingSubmission] = useState<Submission | null>(null);
  const [gradeScore, setGradeScore] = useState<number>(0);
  const [gradeFeedback, setGradeFeedback] = useState<string>('');
  const [savingGrade, setSavingGrade] = useState(false);

  const currentAssignment = assignments.find((a) => a.id === activeAssignmentId);
  const currentCourse = currentAssignment
    ? courses.find((c) => c.id === currentAssignment.courseId)
    : null;

  // Find user's existing submission for this assignment
  const mySubmission = user && currentAssignment
    ? submissions.find(
        (s) => s.assignmentId === currentAssignment.id && s.studentId === user.uid
      )
    : null;

  // Submissions for this assignment (visible to teachers/admins)
  const assignmentSubmissions = currentAssignment
    ? submissions.filter((s) => s.assignmentId === currentAssignment.id)
    : [];

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 15 * 1024 * 1024) {
      setMessage({ type: 'error', text: 'ขนาดไฟล์เกิน 15MB กรุณาเลือกไฟล์ที่เล็กลง' });
      return;
    }
    setFileName(file.name);
    setMessage(null);
  };

  const handleSubmitAssignment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      onOpenAuth();
      return;
    }
    if (!currentAssignment) return;

    if (!submissionText.trim() && !fileName) {
      setMessage({ type: 'error', text: 'กรุณากรอกข้อความประกอบงานหรือแนบไฟล์' });
      return;
    }

    setSubmitting(true);
    setMessage(null);

    const submissionId = mySubmission ? mySubmission.id : `sub_${currentAssignment.id}_${user.uid}`;

    try {
      const submissionData: Partial<Submission> = {
        id: submissionId,
        assignmentId: currentAssignment.id,
        assignmentTitle: currentAssignment.title,
        courseId: currentAssignment.courseId,
        studentId: user.uid,
        studentName: profile?.displayName || user.email?.split('@')[0] || 'นักเรียน',
        content: submissionText.trim(),
        fileName: fileName || mySubmission?.fileName || '',
        fileUrl: fileName ? `#uploaded-${encodeURIComponent(fileName)}` : '',
        status: 'submitted',
        submittedAt: new Date().toISOString(),
      };

      await setDoc(doc(db, 'submissions', submissionId), submissionData, { merge: true });
      setMessage({ type: 'success', text: 'ส่งงานเรียบร้อยแล้ว รอการตรวจประเมินจากผู้สอน' });
    } catch (err: any) {
      console.error('Submit error:', err);
      setMessage({ type: 'error', text: 'เกิดข้อผิดพลาดในการส่งงาน: ' + (err.message || '') });
    } finally {
      setSubmitting(false);
    }
  };

  const handleSaveGrade = async () => {
    if (!gradingSubmission) return;
    setSavingGrade(true);
    try {
      const subRef = doc(db, 'submissions', gradingSubmission.id);
      await updateDoc(subRef, {
        score: Number(gradeScore),
        feedback: gradeFeedback.trim(),
        status: 'graded',
        gradedBy: user?.uid,
        gradedAt: new Date().toISOString(),
      });
      setGradingSubmission(null);
    } catch (err) {
      console.error('Grading error:', err);
    } finally {
      setSavingGrade(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* Page Title */}
      <div className="border-b border-slate-200 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            ศูนย์กิจกรรมและการส่งงาน (Assignments & Projects)
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            ส่งงานโครงงาน ติดตามสถานะการประเมิน และดูข้อเสนอแนะจากอาจารย์ผู้สอน
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: List of Assignments */}
        <div className="lg:col-span-4 space-y-3">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500 uppercase tracking-wider px-1">
            <span>รายการงานทั้งหมด ({assignments.length})</span>
          </div>

          <div className="space-y-2">
            {assignments.map((assignment) => {
              const active = assignment.id === activeAssignmentId;
              const sub = user
                ? submissions.find(
                    (s) => s.assignmentId === assignment.id && s.studentId === user.uid
                  )
                : null;

              return (
                <div
                  key={assignment.id}
                  onClick={() => {
                    setActiveAssignmentId(assignment.id);
                    setMessage(null);
                  }}
                  className={`p-4 rounded-xl border cursor-pointer transition-all ${
                    active
                      ? 'bg-[#e8f0fe] text-[#1967d2] border-[#1967d2] shadow-xs'
                      : 'bg-white text-slate-800 border-slate-200 hover:border-blue-400'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="text-xs sm:text-sm font-bold line-clamp-2">
                      {assignment.title}
                    </h3>
                  </div>

                  <div className="mt-3 flex items-center justify-between text-[11px] opacity-80">
                    <span>คะแนนเต็ม {assignment.maxScore}</span>
                    {sub ? (
                      <span
                        className={`font-semibold px-2 py-0.5 rounded text-[10px] ${
                          sub.status === 'graded'
                            ? 'bg-emerald-500 text-white'
                            : 'bg-blue-600 text-white'
                        }`}
                      >
                        {sub.status === 'graded' ? `ตรวจแล้ว (${sub.score}/${assignment.maxScore})` : 'ส่งแล้วรอตรวจ'}
                      </span>
                    ) : (
                      <span className="text-rose-500 font-medium">ยังไม่ส่ง</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Selected Assignment Details & Submission Area */}
        <div className="lg:col-span-8 space-y-6">
          {currentAssignment ? (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
              
              {/* Header */}
              <div className="p-6 sm:p-8 bg-gradient-to-r from-blue-700 to-indigo-700 text-white border-b border-blue-800">
                <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-blue-100 mb-2">
                  <span>วิชา: {currentCourse?.title || 'วิชาทั่วไป'}</span>
                  <span className="font-semibold text-amber-300">คะแนนเต็ม {currentAssignment.maxScore} คะแนน</span>
                </div>
                <h2 className="text-xl sm:text-2xl font-bold tracking-tight">
                  {currentAssignment.title}
                </h2>
                <div className="mt-4 flex flex-wrap items-center gap-4 text-xs text-blue-100">
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-4 h-4 text-amber-300" />
                    <span>กำหนดส่ง: {new Date(currentAssignment.dueDate).toLocaleString('th-TH')}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span>สถานะรับงาน: {currentAssignment.allowLate ? 'ส่งล่าช้าได้' : 'ปิดรับตรงเวลา'}</span>
                  </div>
                </div>
              </div>

              {/* Instructions Prompt */}
              <div className="p-6 sm:p-8 border-b border-slate-100">
                <h3 className="text-sm font-bold text-slate-900 mb-2">
                  คำชี้แจงและเกณฑ์การประเมิน
                </h3>
                <div className="text-xs sm:text-sm text-slate-700 whitespace-pre-line leading-relaxed bg-slate-50 p-4 rounded-xl border border-slate-200">
                  {currentAssignment.instructions}
                </div>
              </div>

              {/* Status & Review by Teacher (if student already submitted) */}
              {mySubmission && (
                <div className="p-6 sm:p-8 border-b border-slate-100 bg-slate-50/50">
                  <h3 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
                    <Award className="w-4 h-4 text-amber-600" />
                    <span>ผลการส่งงานและการประเมิน</span>
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="p-4 rounded-xl bg-white border border-slate-200">
                      <p className="text-xs text-slate-500">สถานะงานปัจจุบัน</p>
                      <p className="text-sm font-bold text-slate-900 mt-1 capitalize">
                        {mySubmission.status === 'graded' ? (
                          <span className="text-emerald-700">ตรวจประเมินแล้ว</span>
                        ) : (
                          <span className="text-amber-700">ส่งแล้ว รออาจารย์ตรวจ</span>
                        )}
                      </p>
                      {mySubmission.submittedAt && (
                        <p className="text-[11px] text-slate-400 mt-1">
                          ส่งเมื่อ {new Date(mySubmission.submittedAt).toLocaleString('th-TH')}
                        </p>
                      )}
                    </div>

                    <div className="p-4 rounded-xl bg-white border border-slate-200">
                      <p className="text-xs text-slate-500">คะแนนที่ได้รับ</p>
                      <p className="text-lg font-bold text-slate-900 mt-0.5">
                        {mySubmission.score !== null && mySubmission.score !== undefined ? (
                          <span className="text-emerald-600 font-mono">
                            {mySubmission.score} / {currentAssignment.maxScore}
                          </span>
                        ) : (
                          <span className="text-slate-400 text-sm font-normal">รอผลคะแนน</span>
                        )}
                      </p>
                    </div>
                  </div>

                  {mySubmission.feedback && (
                    <div className="mt-4 p-4 rounded-xl bg-amber-50/80 border border-amber-200 text-xs text-amber-950">
                      <p className="font-bold mb-1">ข้อเสนอแนะจากผู้ตรวจ:</p>
                      <p className="leading-relaxed">{mySubmission.feedback}</p>
                    </div>
                  )}

                  {mySubmission.fileName && (
                    <div className="mt-3 flex items-center gap-2 text-xs text-slate-600">
                      <FileText className="w-4 h-4 text-slate-400" />
                      <span>ไฟล์ที่ส่ง: <strong className="text-slate-800">{mySubmission.fileName}</strong></span>
                    </div>
                  )}
                </div>
              )}

              {/* Student Submission Form */}
              <div className="p-6 sm:p-8">
                <h3 className="text-sm font-bold text-slate-900 mb-4">
                  {mySubmission ? 'ส่งงานใหม่ / อัปเดตงาน' : 'แบบฟอร์มส่งงาน'}
                </h3>

                {message && (
                  <div
                    className={`mb-4 p-3 rounded-xl text-xs flex items-center gap-2 ${
                      message.type === 'success'
                        ? 'bg-emerald-50 border border-emerald-200 text-emerald-800'
                        : 'bg-rose-50 border border-rose-200 text-rose-800'
                    }`}
                  >
                    {message.type === 'success' ? (
                      <CheckCircle className="w-4 h-4 shrink-0" />
                    ) : (
                      <AlertCircle className="w-4 h-4 shrink-0" />
                    )}
                    <span>{message.text}</span>
                  </div>
                )}

                <form onSubmit={handleSubmitAssignment} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      ข้อความอธิบายประกอบงาน หรือสรุปสาระสำคัญ
                    </label>
                    <textarea
                      rows={4}
                      value={submissionText}
                      onChange={(e) => setSubmissionText(e.target.value)}
                      placeholder="เขียนสรุปแนวทางคำตอบ ลิงก์ GitHub หรือข้อค้นพบจากการทำโจทย์..."
                      className="w-full p-3 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                    />
                  </div>

                  {/* File Attachment */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      แนบไฟล์ผลงาน (PDF, DOCX, ZIP, PNG ขนาดไม่เกิน 15MB)
                    </label>
                    <div className="border-2 border-dashed border-slate-300 hover:border-amber-500 rounded-xl p-4 text-center cursor-pointer relative bg-slate-50/50 transition-colors">
                      <input
                        type="file"
                        onChange={handleFileChange}
                        accept=".pdf,.doc,.docx,.zip,.png,.jpg,.jpeg,.ipynb"
                        className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                      />
                      <UploadCloud className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                      <p className="text-xs font-semibold text-slate-700">
                        {fileName ? (
                          <span className="text-amber-700 font-bold">เลือกไฟล์แล้ว: {fileName}</span>
                        ) : (
                          'คลิกเพื่อเลือกไฟล์ หรือลากไฟล์มาวางที่นี่'
                        )}
                      </p>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        รองรับไฟล์ PDF, ZIP, เอกสาร และรูปภาพ
                      </p>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={submitting}
                    className="py-3 px-6 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl text-xs sm:text-sm flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
                  >
                    <Send className="w-4 h-4" />
                    <span>{submitting ? 'กำลังส่งงาน...' : mySubmission ? 'ยืนยันการส่งงานใหม่' : 'ส่งงาน'}</span>
                  </button>
                </form>
              </div>

              {/* Teacher / Admin Evaluation List Section */}
              {(isTeacher || isAdmin) && (
                <div className="p-6 sm:p-8 bg-amber-50/40 border-t border-amber-200/60">
                  <div className="flex items-center gap-2 text-slate-900 font-bold text-sm mb-4">
                    <ShieldCheck className="w-5 h-5 text-amber-600" />
                    <span>มุมมองผู้ตรวจ: รายการงานที่นักเรียนส่ง ({assignmentSubmissions.length} รายการ)</span>
                  </div>

                  {assignmentSubmissions.length > 0 ? (
                    <div className="space-y-3">
                      {assignmentSubmissions.map((sub) => (
                        <div
                          key={sub.id}
                          className="p-4 rounded-xl bg-white border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                        >
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="text-xs font-bold text-slate-900">{sub.studentName}</p>
                              <span
                                className={`text-[10px] px-2 py-0.5 rounded font-medium ${
                                  sub.status === 'graded'
                                    ? 'bg-emerald-100 text-emerald-800'
                                    : 'bg-amber-100 text-amber-800'
                                }`}
                              >
                                {sub.status === 'graded' ? 'ตรวจแล้ว' : 'รอตรวจ'}
                              </span>
                            </div>
                            <p className="text-xs text-slate-600 mt-1 line-clamp-1">{sub.content}</p>
                            {sub.fileName && (
                              <p className="text-[11px] text-slate-400 mt-0.5">
                                ไฟล์แนบ: {sub.fileName}
                              </p>
                            )}
                          </div>

                          <div className="flex items-center gap-3 shrink-0">
                            {sub.score !== null && sub.score !== undefined && (
                              <span className="text-xs font-bold text-slate-800 font-mono">
                                {sub.score} / {currentAssignment.maxScore}
                              </span>
                            )}
                            <button
                              onClick={() => {
                                setGradingSubmission(sub);
                                setGradeScore(sub.score || 0);
                                setGradeFeedback(sub.feedback || '');
                              }}
                              className="py-1.5 px-3 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition-colors"
                            >
                              ตรวจและให้คะแนน
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-slate-500">ยังไม่มีนักเรียนส่งงานในชิ้นนี้</p>
                  )}
                </div>
              )}

            </div>
          ) : (
            <div className="p-8 text-center bg-white rounded-2xl border border-slate-200">
              <p className="text-sm text-slate-500">เลือกรายการงานทางด้านซ้ายเพื่อดูรายละเอียด</p>
            </div>
          )}
        </div>

      </div>

      {/* Teacher Grading Modal */}
      {gradingSubmission && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl max-w-lg w-full border border-slate-200 shadow-2xl overflow-hidden p-6 space-y-4">
            <h3 className="text-base font-bold text-slate-900 border-b pb-2">
              ประเมินและให้คะแนนงาน: {gradingSubmission.studentName}
            </h3>

            <div className="p-3 rounded-xl bg-slate-50 text-xs text-slate-700 max-h-40 overflow-y-auto">
              <p className="font-semibold text-slate-800 mb-1">เนื้อหาที่นักเรียนส่ง:</p>
              <p className="whitespace-pre-line">{gradingSubmission.content || '(ไม่มีข้อความ)'}</p>
              {gradingSubmission.fileName && (
                <p className="mt-2 text-amber-700 font-semibold">
                  ไฟล์แนบ: {gradingSubmission.fileName}
                </p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                คะแนนที่ได้ (เต็ม {currentAssignment?.maxScore || 100})
              </label>
              <input
                type="number"
                min={0}
                max={currentAssignment?.maxScore || 100}
                value={gradeScore}
                onChange={(e) => setGradeScore(Number(e.target.value))}
                className="w-full p-2.5 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                ข้อเสนอแนะและคำติชม (Feedback)
              </label>
              <textarea
                rows={3}
                value={gradeFeedback}
                onChange={(e) => setGradeFeedback(e.target.value)}
                placeholder="เขียนคำชี้แนะเพื่อการพัฒนาผลงาน..."
                className="w-full p-2.5 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t">
              <button
                type="button"
                onClick={() => setGradingSubmission(null)}
                className="py-2 px-4 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
              >
                ยกเลิก
              </button>
              <button
                type="button"
                disabled={savingGrade}
                onClick={handleSaveGrade}
                className="py-2 px-5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs shadow-sm transition-colors"
              >
                {savingGrade ? 'กำลังบันทึก...' : 'บันทึกคะแนนและคำติชม'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
