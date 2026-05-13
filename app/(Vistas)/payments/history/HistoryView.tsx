"use client";
import { useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useClerk } from "@clerk/nextjs";
import { PayShell } from "@/app/(Vistas)/payments/components/PayShell";
import { Card, Icon, Pill, Button, fmtARS, useToast } from "@/app/(Vistas)/payments/shared/components";
import { mapCheckoutItems } from "@/app/lib/checkout-mapping";

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
  buyerName?: string;
}

export interface HistoryViewProps {
  transactions: HistoryTransaction[];
  isAdmin?: boolean;
  displayName?: string;
  onDeleteOrden?: (paymentId: string) => Promise<void>;
  currentPage?: number;
  totalPages?: number;
  pageSize?: number;
  currentFilter?: string;
}

interface TriggerOrder {
  order_id: string;
  product_name: string;
  quantity: number;
  unit_price: number;
  quote?: {
    shipping_price?: number;
  };
}

interface TriggerInfo {
  buyerName?: string;
  orders: TriggerOrder[];
  total: number;
  checkoutUrl?: string;
}

const FILTERS: { label: string; value: string }[] = [
  { label: "Todos", value: "all" },
  { label: "Compras", value: "approved" },
  { label: "Fallidas", value: "failed" },
  { label: "Pendientes", value: "pending" },
];

/**
 * Historial interactivo de transacciones y acciones admin.
 */
const HistoryView = ({
  transactions,
  isAdmin = false,
  displayName,
  onDeleteOrden,
  currentPage = 1,
  totalPages = 1,
  currentFilter = "all",
}: HistoryViewProps) => {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmingId, setConfirmingId] = useState<string | null>(null);
  const [triggerInfo, setTriggerInfo] = useState<TriggerInfo | null>(null);
  const [triggerLoading, setTriggerLoading] = useState(false);
  const { signOut } = useClerk();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { push, ToastHost } = useToast();
  const hasPagination = useMemo(() => totalPages > 1, [totalPages]);
  const showEmpty = transactions.length === 0;

  const goToPage = (page: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", String(page));
    router.replace(`${pathname}?${params.toString()}`);
  };

  const goToFilter = (filter: string) => {
    const params = new URLSearchParams();
    if (filter !== "all") params.set("filter", filter);
    router.replace(`${pathname}?${params.toString()}`);
  };

  /**
   * Elimina una orden y refresca la vista.
   */
  const handleDelete = async (paymentId: string) => {
    if (deletingId) return;
    setDeletingId(paymentId);
    try {
      if (!onDeleteOrden) throw new Error("delete_unavailable");
      await onDeleteOrden(paymentId);
      push("Orden eliminada correctamente", "success");
      router.refresh();
    } catch {
      push("No se pudo eliminar. Intenta nuevamente.", "danger");
    } finally {
      setDeletingId(null);
      setConfirmingId(null);
    }
  };

  /**
   * Dispara el trigger de compra aleatoria.
   */
  const handleTrigger = async () => {
    if (triggerLoading) return;
    setTriggerLoading(true);
    try {
      const res = await fetch("/api/payments/trigger");
      if (!res.ok) throw new Error("trigger_failed");
      const data = await res.json();
      const orders: TriggerOrder[] = data?.simulated_payload?.orders ?? [];
      const normalizedOrders = orders.map((o) => ({
        orderId: "seed",
        sellerId: "seed",
        productId: "seed",
        productName: o.product_name,
        unitPrice: o.unit_price,
        quantity: o.quantity,
        amount:
          Number(o.unit_price ?? 0) * Number(o.quantity ?? 0) +
          Number(o.quote?.shipping_price ?? 0),
        quoteId: o.quote?.shipping_price ? "seed" : undefined,
      }));
      const { items, totalShipping } = mapCheckoutItems(normalizedOrders);
      const total =
        items.reduce((sum, i) => sum + i.unitPrice * i.quantity, 0) +
        totalShipping;
      setTriggerInfo({
        buyerName: data?.buyer_name,
        orders,
        total,
        checkoutUrl: data?.checkout_url,
      });
    } catch {
      push("No se pudo disparar el trigger", "danger");
    } finally {
      setTriggerLoading(false);
    }
  };

  return (
    <PayShell
      title={
        <div className="flex items-center gap-2">
          <span>Historial de pagos</span>
          {displayName && (
            <Pill size="sm" tone={isAdmin ? "warn" : "sage"}>
              {displayName}
            </Pill>
          )}
        </div>
      }
      back="/"
      rightSlot={
        <button
          onClick={() => signOut({ redirectUrl: "/sign-in" })}
          className="w-9 h-9 rounded-full bg-bone flex items-center justify-center shrink-0 hover:bg-danger/10 transition-colors"
          title="Cerrar sesión"
          aria-label="Cerrar sesión"
        >
          <Icon name="logout" size={16} />
        </button>
      }
    >
      <div className="p-4 min-[600px]:p-5 lgx:p-6">
        <div className="flex gap-2 mb-4 overflow-x-auto no-scrollbar">
          {FILTERS.map((f) => (
            <Pill 
              key={f.value} 
              active={currentFilter === f.value}
              onClick={() => goToFilter(f.value)}
            >
              {f.label}
            </Pill>
          ))}
        </div>
        <Card padding={0}>
          {transactions.map((t, i) => {
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
              <div key={t.id} className={i < transactions.length - 1 ? "border-b border-line" : ""}>
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
                      {isAdmin && t.buyerName && (
                        <>
                          <span>·</span><span>{t.buyerName}</span>
                        </>
                      )}
                      {failed && <Pill size="sm" tone="danger">Fallida</Pill>}
                      {pending && <Pill size="sm" tone="warn">Pendiente</Pill>}
                    </div>
                  </div>
                  <div className={`font-bold text-sm shrink-0 text-right ${amountCls}`}>
                    {isPos ? "+" : ""}{fmtARS(Math.abs(t.amount))}
                  </div>
                  {isAdmin && (
                    <button
                      type="button"
                      className="w-8 h-8 rounded-lg bg-bone flex items-center justify-center shrink-0 hover:bg-danger/10 transition-colors"
                      title="Eliminar orden"
                      onClick={async (e: React.MouseEvent) => {
                        e.stopPropagation();
                        if (deletingId) return;
                        setConfirmingId(t.paymentId);
                      }}
                      disabled={deletingId === t.paymentId}
                    >
                      <Icon name="trash" size={14} />
                    </button>
                  )}
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
        {hasPagination && !showEmpty && (
          <div className="mt-4 flex items-center justify-between">
            <Button
              size="sm"
              variant="soft"
              className="gap-2"
              onClick={() => goToPage(currentPage - 1)}
              disabled={currentPage <= 1}
            >
              <Icon name="chevronLeft" size={14} />
              Anterior
            </Button>
            <div className="text-[12px] text-ink-3">
              Pagina {currentPage} de {totalPages}
            </div>
            <Button
              size="sm"
              variant="soft"
              className="gap-2"
              onClick={() => goToPage(currentPage + 1)}
              disabled={currentPage >= totalPages}
            >
              Siguiente
              <Icon name="chevronRight" size={14} />
            </Button>
          </div>
        )}
      </div>
      <ToastHost />
      {isAdmin && (
        <div className="fixed bottom-5 right-5 z-[9997]">
          <Button
            size="sm"
            className="shadow-sh-3"
            onClick={handleTrigger}
            disabled={triggerLoading}
          >
            {triggerLoading ? "Disparando..." : "Disparar trigger"}
          </Button>
        </div>
      )}
      {isAdmin && triggerInfo && (
        <div
          className="fixed inset-0 z-[9998] bg-ink/40 backdrop-blur-[2px] flex items-center justify-center px-4"
          onClick={() => setTriggerInfo(null)}
        >
          <div
            className="w-full max-w-[420px]"
            onClick={(e) => e.stopPropagation()}
          >
            <Card className="p-4">
              <div className="text-sm font-semibold mb-1">Trigger ejecutado</div>
              <div className="text-[12px] text-ink-3">
                Comprador: {triggerInfo.buyerName ?? "-"}
              </div>
              <div className="mt-3 space-y-1.5">
                {triggerInfo.orders.map((o, idx) => (
                  <div
                    key={`${o.order_id}-${idx}`}
                    className="flex items-center justify-between text-[12px] text-ink"
                  >
                    <span className="truncate pr-2">
                      {o.quantity}x {o.product_name}
                    </span>
                    <span className="text-ink-2">
                      {fmtARS(
                        Number(o.unit_price ?? 0) * Number(o.quantity ?? 0) +
                          Number(o.quote?.shipping_price ?? 0),
                      )}
                    </span>
                  </div>
                ))}
              </div>
              <div className="mt-3 pt-3 border-t border-line/50 flex items-center justify-between text-[12px] font-semibold text-ink-2">
                <span>Total</span>
                <span>{fmtARS(triggerInfo.total)}</span>
              </div>
              {triggerInfo.checkoutUrl && (
                <div className="mt-2 text-[12px] text-ink-3 break-all">
                  {triggerInfo.checkoutUrl}
                </div>
              )}
              <div className="mt-4 flex gap-2">
                <Button
                  size="sm"
                  variant="soft"
                  className="flex-1 justify-center"
                  onClick={() => setTriggerInfo(null)}
                >
                  Cerrar
                </Button>
                {triggerInfo.checkoutUrl && (
                  <Button
                    size="sm"
                    className="flex-1 justify-center"
                    onClick={() => router.push(triggerInfo.checkoutUrl!)}
                  >
                    Ir al checkout
                  </Button>
                )}
              </div>
            </Card>
          </div>
        </div>
      )}
      {isAdmin && confirmingId && (
        <div
          className="fixed inset-0 z-[9998] bg-ink/40 backdrop-blur-[2px] flex items-center justify-center px-4"
          onClick={() => setConfirmingId(null)}
        >
          <div
            className="w-full max-w-[360px]"
            onClick={(e) => e.stopPropagation()}
          >
            <Card className="p-4">
              <div className="text-sm font-semibold mb-1">Eliminar orden</div>
              <div className="text-[12px] text-ink-3">
                Esta accion elimina la orden de pago de forma permanente.
              </div>
              <div className="mt-4 flex gap-2">
                <Button
                  size="sm"
                  variant="soft"
                  className="flex-1 justify-center"
                  onClick={() => setConfirmingId(null)}
                >
                  Cancelar
                </Button>
                <Button
                  size="sm"
                  className="flex-1 justify-center bg-danger text-paper hover:bg-danger/90"
                  onClick={() => handleDelete(confirmingId)}
                >
                  Eliminar
                </Button>
              </div>
            </Card>
          </div>
        </div>
      )}
    </PayShell>
  );
};
export default HistoryView;
