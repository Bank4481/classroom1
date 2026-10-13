import React, { useState, useEffect } from 'react';
import { X, ChevronLeft, ChevronRight, Heart, ThumbsUp, Sparkles, User } from 'lucide-react';

export interface StoryItem {
  id: string;
  authorName: string;
  authorRole: string;
  authorAvatar?: string;
  title: string;
  description: string;
  image: string;
  createdAt: string;
  tag: string;
}

interface StoryViewerModalProps {
  stories: StoryItem[];
  initialIndex: number;
  isOpen: boolean;
  onClose: () => void;
}

export const StoryViewerModal: React.FC<StoryViewerModalProps> = ({
  stories,
  initialIndex,
  isOpen,
  onClose,
}) => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [liked, setLiked] = useState(false);

  useEffect(() => {
    setCurrentIndex(initialIndex);
    setLiked(false);
  }, [initialIndex, isOpen]);

  if (!isOpen || stories.length === 0) return null;

  const currentStory = stories[currentIndex] || stories[0];

  const handleNext = () => {
    if (currentIndex < stories.length - 1) {
      setCurrentIndex((i) => i + 1);
      setLiked(false);
    } else {
      onClose();
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex((i) => i - 1);
      setLiked(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center backdrop-blur-md select-none animate-in fade-in duration-200">
      {/* Top Controls */}
      <div className="absolute top-4 right-4 z-50 flex items-center gap-2">
        <button
          onClick={onClose}
          className="p-2.5 rounded-full bg-white/20 hover:bg-white/30 text-white transition-colors"
          title="ปิดสตอรี่"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Prev Navigation Button */}
      {currentIndex > 0 && (
        <button
          onClick={handlePrev}
          className="hidden sm:flex absolute left-6 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/20 hover:bg-white/30 text-white transition-colors"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
      )}

      {/* Next Navigation Button */}
      {currentIndex < stories.length - 1 && (
        <button
          onClick={handleNext}
          className="hidden sm:flex absolute right-6 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/20 hover:bg-white/30 text-white transition-colors"
        >
          <ChevronRight className="w-6 h-6" />
        </button>
      )}

      {/* Story Phone / Card Frame */}
      <div className="relative w-full max-w-md h-[90vh] max-h-[750px] bg-slate-900 rounded-3xl overflow-hidden shadow-2xl flex flex-col justify-between border border-white/10">
        {/* Story Background Image */}
        <img
          src={currentStory.image}
          alt={currentStory.title}
          className="absolute inset-0 w-full h-full object-cover opacity-85"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-black/60" />

        {/* Top Story Header & Progress Bar */}
        <div className="relative z-10 p-4 space-y-3">
          {/* Segmented Progress Indicators */}
          <div className="flex gap-1.5 w-full">
            {stories.map((s, idx) => (
              <div
                key={s.id}
                className="h-1 flex-1 rounded-full bg-white/30 overflow-hidden"
              >
                <div
                  className={`h-full bg-white transition-all duration-300 ${
                    idx < currentIndex
                      ? 'w-full'
                      : idx === currentIndex
                      ? 'w-full animate-pulse'
                      : 'w-0'
                  }`}
                />
              </div>
            ))}
          </div>

          {/* Author Row */}
          <div className="flex items-center justify-between text-white">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-full border-2 border-[#1877F2] p-0.5 bg-black/40">
                <div className="w-full h-full rounded-full bg-gradient-to-tr from-[#1877F2] to-sky-400 flex items-center justify-center font-bold text-xs text-white">
                  {currentStory.authorName.charAt(0)}
                </div>
              </div>
              <div>
                <p className="text-xs font-bold leading-tight flex items-center gap-1.5">
                  {currentStory.authorName}
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-white/20 font-medium">
                    {currentStory.tag}
                  </span>
                </p>
                <p className="text-[10px] text-white/70">{currentStory.createdAt}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Story Content & Quick Reactions */}
        <div className="relative z-10 p-5 space-y-4">
          <div className="bg-black/40 backdrop-blur-md p-4 rounded-2xl border border-white/10 space-y-1.5">
            <h3 className="text-base font-bold text-white leading-snug">
              {currentStory.title}
            </h3>
            <p className="text-xs text-white/90 leading-relaxed font-light">
              {currentStory.description}
            </p>
          </div>

          {/* Interaction Bar */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setLiked(!liked)}
              className={`flex-1 py-2.5 px-4 rounded-full flex items-center justify-center gap-2 text-xs font-bold transition-all ${
                liked
                  ? 'bg-[#1877F2] text-white'
                  : 'bg-white/20 hover:bg-white/30 text-white'
              }`}
            >
              <ThumbsUp className={`w-4 h-4 ${liked ? 'fill-white' : ''}`} />
              <span>{liked ? 'ถูกใจแล้ว!' : 'กดถูกใจสตอรี่'}</span>
            </button>
            <button
              onClick={handleNext}
              className="py-2.5 px-5 rounded-full bg-white text-slate-950 font-bold text-xs hover:bg-slate-100 transition-colors"
            >
              {currentIndex < stories.length - 1 ? 'ถัดไป' : 'เสร็จสิ้น'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
