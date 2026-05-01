"use client";
import { PayShell } from "@/app/(Vistas)/payments/components/PayShell";
import { Card, Icon, Pill, fmtARS } from "@/app/(Vistas)/payments/shared/components";

export interface HistoryTransaction {
  id: string;
  date: string;
  desc: string;
  amount: number;
  method: string;
  status: "ok" | "refund" | "fail";
}

export interface HistoryViewProps {
  transactions: HistoryTransaction[];
}

const HistoryView = ({ transactions }: HistoryViewProps) => {
  return (
    <PayShell title="Historial de pagos" back="/payments/methods">
      <div className="p-4 min-[600px]:p-5 lgx:p-6">
        <div className="flex gap-2 mb-4 overflow-x-auto no-scrollbar">
          {["Todos", "Compras", "Devoluciones", "Este mes"].map((f, i) => <Pill key={f} active={i === 0}>{f}</Pill>)}
        </div>
        <Card padding={0}>
          {transactions.map((t, i) => {
            const isPos = t.amount > 0;
            const failed = t.status === "fail";
            const iconBg = isPos ? "bg-[#dde2c9] text-success" : failed ? "bg-[#f0d9d1] text-danger" : "bg-bone text-ink-2";
            const amountCls = isPos ? "text-success" : failed ? "text-ink-3" : "text-ink";
            return (
              <div key={t.id} className={`p-4 flex items-center gap-3.5 ${i < transactions.length - 1 ? "border-b border-line" : ""} ${failed ? "opacity-60" : "opacity-100"}`}>
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${iconBg}`}>
                  <Icon name={isPos ? "arrowDown" : failed ? "close" : "arrowUp"} size={16}/>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-[13px] font-medium">{t.desc}</div>
                  <div className="text-[11px] text-ink-3 flex gap-1.5 items-center flex-wrap">
                    <span>{t.date}</span><span>·</span><span>{t.method}</span>
                    {failed && <Pill size="sm" tone="danger">Fallida</Pill>}
                  </div>
                </div>
                <div className={`font-bold text-sm ${amountCls}`}>
                  {isPos ? "+" : ""}{fmtARS(Math.abs(t.amount))}
                </div>
              </div>
            );
          })}
        </Card>
      </div>
    </PayShell>
  );
};
export default HistoryView;
