"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useClerk } from "@clerk/nextjs";
import { PayShell } from "@/app/(Vistas)/payments/components/PayShell";
import { Card, Icon, Pill, Button, fmtARS } from "@/app/(Vistas)/payments/shared/components";

export interface HistoryTransactionItem {
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  shippingPrice: number;
}

export interface HistoryTransaction {
  id: string;
  paymentId: string;
  date: string;
  desc: string;
  amount: number;
  method: string;
  status: "ok" | "fail" | "pending";
  items: HistoryTransactionItem[];
  currency: string;
  shippingTotal: number;
}

export interface HistoryViewProps {
  transactions: HistoryTransaction[];
}

const FILTERS = ["Todos", "Compras", "Fallidas", "Pendientes"];

const HistoryView = ({ transactions }: HistoryViewProps) => {
  const [activeFilter, setActiveFilter] = useState("Todos");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const { signOut } = useClerk();
  const router = useRouter();

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
            const isExpanded = expandedId === t.id;
            const totalItems = t.items.length;
            const summary = totalItems === 1
              ? `${t.items[0].quantity}x ${t.items[0].productName}`
              : `${totalItems} productos`;
            return (
              <div key={t.id} className={i < filteredTransactions.length - 1 ? "border-b border-line" : ""}>
                <div
                  className={`p-4 flex items-center gap-3.5 ${failed ? "opacity-60" : "opacity-100"} cursor-pointer`}
                  onClick={() => setExpandedId(isExpanded ? null : t.id)}
                >
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${iconBg}`}>
                    <Icon name={failed ? "close" : pending ? "clock" : isPos ? "arrowDown" : "arrowUp"} size={16}/>
                  </div>
                  <div className="flex-1 min-w-0 pr-2">
                    <div className="text-[13px] font-medium truncate" title={t.desc}>{t.desc}</div>
                    <div className="text-[11px] text-ink-3 flex gap-1.5 items-center flex-wrap">
                      <span>{t.date}</span><span>·</span><span>{t.method}</span>
                      <span>·</span><span>{summary}</span>
                      {failed && <Pill size="sm" tone="danger">Fallida</Pill>}
                      {pending && <Pill size="sm" tone="warn">Pendiente</Pill>}
                    </div>
                  </div>
                  <div className={`font-bold text-sm shrink-0 text-right ${amountCls}`}>
                    {isPos ? "+" : ""}{fmtARS(Math.abs(t.amount))}
                  </div>
                  <Icon
                    name="chevronDown"
                    size={14}
                    className={`shrink-0 transition-transform ${isExpanded ? "rotate-180" : ""}`}
                  />
                </div>
                {isExpanded && (
                  <div className="px-4 pb-4 pt-3 bg-bone/30 border-t border-line">
                    <div className="text-[11px] font-semibold text-ink-3 mb-3 uppercase tracking-wider">Detalle de la orden</div>
                    <div className="space-y-2">
                      {t.items.map((item, j) => (
                        <div key={j}>
                          <div className="flex justify-between items-center bg-white p-2.5 rounded-lg shadow-sm border border-line/50 gap-2">
                            <span className="text-[13px] text-ink font-medium flex items-center gap-2 min-w-0 flex-1">
                              <span className="bg-bone text-ink-2 px-1.5 py-0.5 rounded text-[11px] font-bold shrink-0">{item.quantity}x</span>
                              <span className="truncate" title={item.productName}>{item.productName}</span>
                            </span>
                            <span className="text-[13px] text-ink font-bold shrink-0">
                              {fmtARS(item.unitPrice * item.quantity)}
                            </span>
                          </div>
                          {item.shippingPrice > 0 && (
                            <div className="flex justify-between items-center py-1 px-2">
                              <span className="text-[12px] text-ink-3">Envío</span>
                              <span className="text-[12px] text-ink-3">{fmtARS(item.shippingPrice)}</span>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                    {t.shippingTotal > 0 && (
                      <div className="flex justify-between items-center pt-2 mt-2 border-t border-line/50 text-[12px] font-semibold text-ink-3">
                        <span>Total envío</span>
                        <span>{fmtARS(t.shippingTotal)}</span>
                      </div>
                    )}
                    {pending && (
                      <div className="mt-4">
                        <Button
                          size="md"
                          className="w-full justify-center"
                          onClick={(e: React.MouseEvent) => {
                            e.stopPropagation();
                            router.push(`/payments/checkout/${t.paymentId}/methods`);
                          }}
                        >
                          Completar pago
                        </Button>
                      </div>
                    )}
                  </div>
                )}
                {pending && !isExpanded && (
                  <div className="px-4 pb-4">
                    <Button
                      size="sm"
                      variant="soft"
                      className="w-full justify-center"
                      onClick={(e: React.MouseEvent) => {
                        e.stopPropagation();
                        router.push(`/payments/checkout/${t.paymentId}/methods`);
                      }}
                    >
                      Ir a pagar
                    </Button>
                  </div>
                )}
              </div>
            );
          })}
        </Card>
      </div>
    </PayShell>
  );
};
export default HistoryView;
