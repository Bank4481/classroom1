import React, { useState } from 'react';
import {
  HelpCircle,
  CheckCircle,
  XCircle,
  ArrowLeft,
  ArrowRight,
  RotateCcw,
  Award,
  AlertCircle,
  Check,
} from 'lucide-react';
import type { Quiz, Course, QuizAttempt } from '../types';
import { useAuth } from '../context/AuthContext';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

interface QuizViewProps {
  quiz: Quiz;
  course?: Course;
  onNavigate: (view: string, payload?: any) => void;
  onOpenAuth: () => void;
}

export const QuizView: React.FC<QuizViewProps> = ({
  quiz,
  course,
  onNavigate,
  onOpenAuth,
}) => {
  const { user, profile } = useAuth();
  const [selectedAnswers, setSelectedAnswers] = useState<{ [qId: string]: number }>({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [scoreResult, setScoreResult] = useState<{
    score: number;
    total: number;
    percentage: number;
    passed: boolean;
  } | null>(null);
  const [saving, setSaving] = useState(false);

  const handleSelectOption = (questionId: string, optionIndex: number) => {
    if (isSubmitted) return;
    setSelectedAnswers((prev) => ({
      ...prev,
      [questionId]: optionIndex,
    }));
  };

  const handleSubmitQuiz = async () => {
    if (!user) {
      onOpenAuth();
      return;
    }

    let calculatedScore = 0;
    const totalQuestions = quiz.questions.length;

    quiz.questions.forEach((q) => {
      if (selectedAnswers[q.id] === q.correctOptionIndex) {
        calculatedScore += 1;
      }
    });

    const percentage = Math.round((calculatedScore / totalQuestions) * 100);
    const passed = percentage >= quiz.passingScore;

    const result = {
      score: calculatedScore,
      total: totalQuestions,
      percentage,
      passed,
    };

    setScoreResult(result);
    setIsSubmitted(true);
    setSaving(true);

    // Save attempt to Firestore
    try {
      const attemptData = {
        quizId: quiz.id,
        courseId: quiz.courseId,
        userId: user.uid,
        userName: profile?.displayName || user.email?.split('@')[0] || 'ผู้เรียน',
        score: calculatedScore,
        totalScore: totalQuestions,
        percentage,
        passed,
        answers: Object.entries(selectedAnswers).map(([questionId, selectedIndex]) => ({
          questionId,
          selectedIndex,
        })),
        submittedAt: new Date().toISOString(),
      };

      await addDoc(collection(db, 'quiz_attempts'), attemptData);
    } catch (err) {
      console.error('Failed to save quiz attempt:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleResetQuiz = () => {
    setSelectedAnswers({});
    setIsSubmitted(false);
    setScoreResult(null);
  };

  const allAnswered = quiz.questions.every((q) => selectedAnswers[q.id] !== undefined);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* Back button */}
      <button
        onClick={() => {
          if (course) {
            onNavigate('course-detail', { courseId: course.id });
          } else {
            onNavigate('courses');
          }
        }}
        className="inline-flex items-center gap-2 text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>กลับสู่หน้ารายวิชา</span>
      </button>

      {/* Quiz Header Banner */}
      <div className="p-6 sm:p-8 rounded-2xl bg-slate-900 text-white shadow-xl border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-amber-400 mb-1">
            <HelpCircle className="w-4 h-4" />
            <span>แบบทดสอบวัดผลสัมฤทธิ์ทางการเรียน</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            {quiz.title}
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            จำนวน {quiz.questions.length} ข้อ · เกณฑ์การผ่าน {quiz.passingScore}%
          </p>
        </div>

        {course && (
          <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700 text-xs text-slate-300 shrink-0">
            <span className="text-slate-400">วิชา:</span> {course.title}
          </div>
        )}
      </div>

      {/* Result Card (When submitted) */}
      {isSubmitted && scoreResult && (
        <div
          className={`p-6 sm:p-8 rounded-2xl border shadow-md animate-in fade-in duration-300 ${
            scoreResult.passed
              ? 'bg-emerald-50/80 border-emerald-300 text-emerald-950'
              : 'bg-amber-50/80 border-amber-300 text-amber-950'
          }`}
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div
                className={`w-14 h-14 rounded-2xl flex items-center justify-center font-bold text-xl ${
                  scoreResult.passed
                    ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/30'
                    : 'bg-amber-600 text-white shadow-lg shadow-amber-600/30'
                }`}
              >
                {scoreResult.passed ? <Award className="w-8 h-8" /> : <AlertCircle className="w-8 h-8" />}
              </div>
              <div>
                <h3 className="text-lg font-bold">
                  {scoreResult.passed ? 'ยินดีด้วย! คุณผ่านเกณฑ์การทดสอบ' : 'ยังไม่ผ่านเกณฑ์การทดสอบ'}
                </h3>
                <p className="text-xs opacity-90 mt-0.5">
                  คุณได้คะแนน {scoreResult.score} จาก {scoreResult.total} ข้อ ({scoreResult.percentage}%) · เกณฑ์ผ่าน {quiz.passingScore}%
                </p>
                {saving && (
                  <p className="text-[11px] text-slate-500 mt-1 font-medium">
                    กำลังบันทึกคะแนนลงในฐานข้อมูล Firestore...
                  </p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleResetQuiz}
                className="py-2 px-4 rounded-xl bg-white border border-slate-300 hover:bg-slate-50 text-slate-800 text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-colors"
              >
                <RotateCcw className="w-4 h-4" />
                <span>ทำแบบทดสอบอีกครั้ง</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Questions List */}
      <div className="space-y-6">
        {quiz.questions.map((question, qIdx) => {
          const userSelected = selectedAnswers[question.id];
          const isCorrect = userSelected === question.correctOptionIndex;

          return (
            <div
              key={question.id}
              className={`p-6 sm:p-8 rounded-2xl bg-white border transition-all ${
                isSubmitted
                  ? isCorrect
                    ? 'border-emerald-300 shadow-sm'
                    : 'border-rose-300 shadow-sm'
                  : 'border-slate-200 shadow-sm'
              }`}
            >
              {/* Question Prompt */}
              <div className="flex items-start justify-between gap-4 mb-5">
                <div className="flex items-start gap-3">
                  <span className="w-7 h-7 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center font-bold text-xs text-slate-700 shrink-0 font-mono">
                    {qIdx + 1}
                  </span>
                  <h3 className="text-base font-bold text-slate-900 leading-snug">
                    {question.prompt}
                  </h3>
                </div>

                {isSubmitted && (
                  <span
                    className={`text-xs font-bold px-2.5 py-1 rounded-md shrink-0 flex items-center gap-1 ${
                      isCorrect
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-rose-100 text-rose-800'
                    }`}
                  >
                    {isCorrect ? (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        <span>ถูกต้อง (+1)</span>
                      </>
                    ) : (
                      <>
                        <XCircle className="w-3.5 h-3.5" />
                        <span>ไม่ถูกต้อง</span>
                      </>
                    )}
                  </span>
                )}
              </div>

              {/* Options */}
              <div className="space-y-2.5">
                {question.options.map((optionText, optIdx) => {
                  const isSelected = userSelected === optIdx;
                  const isTheCorrectOne = question.correctOptionIndex === optIdx;

                  let optionStyle =
                    'border-slate-200 bg-slate-50/50 hover:bg-slate-100 text-slate-700';

                  if (isSubmitted) {
                    if (isTheCorrectOne) {
                      optionStyle =
                        'border-emerald-500 bg-emerald-50 text-emerald-950 font-semibold ring-1 ring-emerald-500';
                    } else if (isSelected && !isTheCorrectOne) {
                      optionStyle =
                        'border-rose-400 bg-rose-50 text-rose-950 ring-1 ring-rose-400';
                    } else {
                      optionStyle = 'border-slate-100 text-slate-400 bg-white opacity-60';
                    }
                  } else if (isSelected) {
                    optionStyle =
                      'border-amber-500 bg-amber-50 text-amber-950 font-semibold ring-1 ring-amber-500';
                  }

                  return (
                    <button
                      key={optIdx}
                      type="button"
                      disabled={isSubmitted}
                      onClick={() => handleSelectOption(question.id, optIdx)}
                      className={`w-full p-3.5 rounded-xl border text-left text-xs sm:text-sm flex items-center justify-between gap-3 transition-colors ${optionStyle}`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="w-6 h-6 rounded-md bg-white border border-slate-200 flex items-center justify-center font-bold text-xs shrink-0 font-mono">
                          {String.fromCharCode(65 + optIdx)}
                        </span>
                        <span>{optionText}</span>
                      </div>
                      {isSelected && !isSubmitted && (
                        <div className="w-2.5 h-2.5 rounded-full bg-amber-500 shrink-0" />
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Detailed Explanation upon submission */}
              {isSubmitted && (
                <div className="mt-4 p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 space-y-1">
                  <p className="font-bold text-slate-900">เฉลยและคำอธิบาย:</p>
                  <p className="text-slate-600 leading-relaxed">{question.explanation}</p>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Bottom Submit Action */}
      {!isSubmitted && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <p className="text-xs text-slate-500">
              ตอบแล้ว {Object.keys(selectedAnswers).length} จาก {quiz.questions.length} ข้อ
            </p>
            {!allAnswered && (
              <p className="text-[11px] text-amber-700 font-medium">
                * แนะนำให้ตอบครบทุกข้อก่อนกดส่งแบบทดสอบ
              </p>
            )}
          </div>

          <button
            onClick={handleSubmitQuiz}
            className="w-full sm:w-auto py-3 px-8 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-sm transition-colors shadow-md"
          >
            ส่งคำตอบและตรวจผลคะแนน
          </button>
        </div>
      )}

    </div>
  );
};
