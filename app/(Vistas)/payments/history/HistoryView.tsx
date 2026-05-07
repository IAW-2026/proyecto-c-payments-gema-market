"use client";
import { useState } from "react";
import { useClerk } from "@clerk/nextjs";
import { PayShell } from "@/app/(Vistas)/payments/components/PayShell";
import { Card, Icon, Pill, fmtARS } from "@/app/(Vistas)/payments/shared/components";

export interface HistoryTransaction {
  id: string;
  date: string;
  desc: string;
  amount: number;
  method: string;
  status: "ok" | "fail" | "pending";
}

export interface HistoryViewProps {
  transactions: HistoryTransaction[];
}

const FILTERS = ["Todos", "Compras", "Fallidas", "Pendientes"];

const HistoryView = ({ transactions }: HistoryViewProps) => {
  const [activeFilter, setActiveFilter] = useState("Todos");
  const { signOut } = useClerk();

  const filteredTransactions = transactions.filter((t) => {
    if (activeFilter === "Todos") return true;
    if (activeFilter === "Compras") return t.status === "ok"; 
    if (activeFilter === "Fallidas") return t.status === "fail";
    if (activeFilter === "Pendientes") return t.status === "pending";
    return true;
  });

  return (
    <PayShell
      title="Historial de pagos"
      back="/"
      rightSlot={
        <button
          onClick={() => signOut({ redirectUrl: "/sign-in" })}
          className="w-9 h-9 rounded-full bg-bone flex items-center justify-center shrink-0 hover:bg-danger/10 transition-colors"
          title="Cerrar sesión"
        >
          <Icon name="logout" size={16} />
        </button>
      }
    >
      <div className="p-4 min-[600px]:p-5 lgx:p-6">
        <div className="flex gap-2 mb-4 overflow-x-auto no-scrollbar">
          {FILTERS.map((f) => (
            <Pill 
              key={f} 
              active={activeFilter === f}
              onClick={() => setActiveFilter(f)}
            >
              {f}
            </Pill>
          ))}
        </div>
        <Card padding={0}>
          {filteredTransactions.map((t, i) => {
            const isPos = t.amount > 0;
            const failed = t.status === "fail";
            const pending = t.status === "pending";
            const iconBg = failed ? "bg-[#f0d9d1] text-danger" : pending ? "bg-[#f3e4c4] text-warn" : isPos ? "bg-[#dde2c9] text-success" : "bg-bone text-ink-2";
            const amountCls = failed ? "text-ink-3" : pending ? "text-warn" : isPos ? "text-success" : "text-ink";
            return (
              <div key={t.id} className={`p-4 flex items-center gap-3.5 ${i < filteredTransactions.length - 1 ? "border-b border-line" : ""} ${failed ? "opacity-60" : "opacity-100"}`}>
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${iconBg}`}>
                  <Icon name={failed ? "close" : pending ? "clock" : isPos ? "arrowDown" : "arrowUp"} size={16}/>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-[13px] font-medium">{t.desc}</div>
                  <div className="text-[11px] text-ink-3 flex gap-1.5 items-center flex-wrap">
                    <span>{t.date}</span><span>·</span><span>{t.method}</span>
                    {failed && <Pill size="sm" tone="danger">Fallida</Pill>}
                    {pending && <Pill size="sm" tone="warn">Pendiente</Pill>}
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
