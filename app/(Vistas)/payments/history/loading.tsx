import HistoryShell from "./HistoryShell";
import HistorySkeleton from "./HistorySkeleton";

export default function Loading() {
  return (
    <HistoryShell>
      <HistorySkeleton />
    </HistoryShell>
  );
}
