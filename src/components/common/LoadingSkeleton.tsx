import React from 'react';

export const CourseCardSkeleton: React.FC = () => {
  return (
    <div className="rounded-2xl bg-white border border-slate-200 overflow-hidden shadow-xs animate-pulse flex flex-col">
      <div className="aspect-[4/3] bg-slate-200" />
      <div className="p-5 space-y-3 flex-1 flex flex-col justify-between">
        <div className="space-y-2">
          <div className="h-4 bg-slate-200 rounded-md w-3/4" />
          <div className="h-3 bg-slate-100 rounded-md w-full" />
          <div className="h-3 bg-slate-100 rounded-md w-2/3" />
        </div>
        <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
          <div className="h-3 bg-slate-200 rounded-md w-1/3" />
          <div className="h-3 bg-slate-200 rounded-md w-1/4" />
        </div>
      </div>
    </div>
  );
};

export const DashboardSkeleton: React.FC = () => {
  return (
    <div className="space-y-8 animate-pulse max-w-7xl mx-auto px-4 py-8">
      <div className="h-36 bg-slate-800/80 rounded-3xl" />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-24 bg-white border border-slate-200 rounded-2xl p-4" />
        ))}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <CourseCardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
};
