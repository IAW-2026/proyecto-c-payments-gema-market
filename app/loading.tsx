import React from "react";

export default function Loading() {
  return (
    <div className="min-h-screen bg-cream flex flex-col items-center pb-10 min-[600px]:p-6 lgx:p-8">
      <div className="w-full max-w-[480px] flex-1 bg-paper shadow-sh-3 flex flex-col min-h-screen min-[600px]:max-w-[760px] min-[600px]:min-h-[calc(100vh-48px)] min-[600px]:border min-[600px]:border-line min-[600px]:rounded-r3 lgx:max-w-[860px]">
        <div className="bg-paper border-b border-line px-4 py-3.5 sticky top-0 z-30 flex items-center gap-3 lgx:px-6 lgx:py-[18px]">
          <div className="w-9 h-9 rounded-full bg-bone animate-pulse" />
          <div className="h-4 w-32 bg-bone rounded animate-pulse" />
        </div>
        <div className="p-4 space-y-4">
          <div className="h-32 bg-bone rounded-2xl animate-pulse w-full" />
          <div className="h-48 bg-bone rounded-2xl animate-pulse w-full" />
          <div className="h-12 bg-bone rounded-full animate-pulse w-full mt-auto" />
        </div>
      </div>
    </div>
  );
}
