"use client";
import { useRouter } from "next/navigation";
import { Icon } from "@/app/(Vistas)/payments/shared/components";
const PayShell = ({ children, title, back }: any) => {
  const router = useRouter();
  
  return (
    <div className="min-h-screen bg-cream flex flex-col items-center pb-10 max-[599px]:pb-0 min-[600px]:p-6 lgx:p-8">
      <div className="w-full max-w-[480px] flex-1 bg-paper shadow-sh-3 flex flex-col min-h-screen min-[600px]:max-w-[760px] min-[600px]:min-h-[calc(100vh-48px)] min-[600px]:border min-[600px]:border-line min-[600px]:rounded-r3 min-[600px]:overflow-hidden lgx:max-w-[860px] lgx:min-h-[calc(100vh-64px)] lgx:rounded-[24px]">
        <div className="bg-paper border-b border-line px-4 py-3.5 sticky top-0 z-30 flex items-center gap-3 lgx:px-6 lgx:py-[18px]">
          {back && (
            <button onClick={() => window.history.length > 1 ? router.back() : router.push(back)} className="w-9 h-9 rounded-full bg-bone flex items-center justify-center shrink-0">
              <Icon name="arrowLeft" size={16}/>
            </button>
          )}
          <div className="text-sm font-semibold flex-1">{title}</div>
          <p className="text-[11px] text-ink-3 font-mono shrink-0">UniHousing</p>
        </div>
        <div className="flex-1 flex flex-col">{children}</div>
      </div>
    </div>
  );
};
export { PayShell };
