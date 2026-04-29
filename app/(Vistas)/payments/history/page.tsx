"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { PayShell } from "../components/PayShell";
import { Card, Button, Icon, Field, Input, Pill, fmtARS } from "../shared/components";
const History = () => {
  const router = useRouter();
  const txs = [
    { id: "MP-7821-9384", date: "24 abr · 18:42", desc: "Pedido OR-2841", amount: -160300, method: "Visa •••• 3704", status: "ok" },
    { id: "MP-7745-2210", date: "18 abr · 11:15", desc: "Pedido OR-2832", amount: -42600, method: "Saldo MP", status: "ok" },
    { id: "MP-7689-1102", date: "12 abr · 16:30", desc: "Devolución OR-2820", amount: 28400, method: "Visa •••• 3704", status: "refund" },
    { id: "MP-7612-8843", date: "5 abr · 09:20", desc: "Pedido OR-2814", amount: -97500, method: "Mastercard •••• 8821", status: "ok" },
    { id: "MP-7544-3321", date: "29 mar · 20:11", desc: "Pedido OR-2801", amount: -55200, method: "Saldo MP", status: "fail" },
  ];
  return (
    <PayShell title="Historial de pagos" back="/payments/methods">
      <div className="p-4 min-[600px]:p-5 lgx:p-6">
        <div className="flex gap-2 mb-4 overflow-x-auto no-scrollbar">
          {["Todos", "Compras", "Devoluciones", "Este mes"].map((f, i) => <Pill key={f} active={i === 0}>{f}</Pill>)}
        </div>
        <Card padding={0}>
          {txs.map((t, i) => {
            const isPos = t.amount > 0;
            const failed = t.status === "fail";
            const iconBg = isPos ? "bg-[#dde2c9] text-success" : failed ? "bg-[#f0d9d1] text-danger" : "bg-bone text-ink-2";
            const amountCls = isPos ? "text-success" : failed ? "text-ink-3" : "text-ink";
            return (
              <div key={t.id} className={`p-4 flex items-center gap-3.5 ${i < txs.length - 1 ? "border-b border-line" : ""} ${failed ? "opacity-60" : "opacity-100"}`}>
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
export default History;
