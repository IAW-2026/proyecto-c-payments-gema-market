const ROWS = 8;

const SkeletonBlock = ({ w, h, r }: { w: string | number; h: number; r: number }) => (
  <div
    className="animate-shimmer bg-gradient-to-r from-bone via-cream to-bone bg-[length:200%_100%]"
    style={{ width: w, height: h, borderRadius: r }}
  />
);

const HistorySkeleton = () => (
  <div className="p-4 min-[600px]:p-5 lgx:p-6">
    <div className="flex gap-2 mb-4 overflow-x-auto no-scrollbar">
      {["Todos", "Compras", "Fallidas", "Pendientes"].map((label) => (
        <div key={label} className="shrink-0">
          <SkeletonBlock w={86} h={28} r={999} />
        </div>
      ))}
    </div>
    <div className="bg-paper border border-line rounded-r3 max-w-full">
      {Array.from({ length: ROWS }).map((_, idx) => (
        <div key={idx} className={idx < ROWS - 1 ? "border-b border-line" : ""}>
          <div className="p-4 flex items-center gap-3.5">
            <SkeletonBlock w={40} h={40} r={12} />
            <div className="flex-1 min-w-0 pr-2">
              <SkeletonBlock w="60%" h={12} r={6} />
              <div className="mt-2 flex gap-2 items-center">
                <SkeletonBlock w={68} h={10} r={6} />
                <SkeletonBlock w={54} h={10} r={6} />
                <SkeletonBlock w={84} h={10} r={6} />
              </div>
            </div>
            <SkeletonBlock w={72} h={16} r={8} />
            <SkeletonBlock w={18} h={18} r={6} />
          </div>
        </div>
      ))}
    </div>
    <div className="mt-4 flex items-center justify-between">
      <SkeletonBlock w={96} h={30} r={999} />
      <SkeletonBlock w={120} h={12} r={6} />
      <SkeletonBlock w={96} h={30} r={999} />
    </div>
  </div>
);

export default HistorySkeleton;
