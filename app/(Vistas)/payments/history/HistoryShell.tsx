"use client";

import { useState } from "react";
import type { ReactNode } from "react";
import { useClerk } from "@clerk/nextjs";
import { PayShell } from "@/app/(Vistas)/payments/components/PayShell";
import { Button, Card, Icon, Pill, fmtARS, useToast } from "@/app/(Vistas)/payments/shared/components";
import { mapCheckoutItems } from "@/app/lib/checkout-mapping";

export interface HistoryShellProps {
  children: ReactNode;
  displayName?: string;
  isAdmin?: boolean;
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

const HistoryShell = ({ children, displayName, isAdmin = false }: HistoryShellProps) => {
  const [triggerInfo, setTriggerInfo] = useState<TriggerInfo | null>(null);
  const [triggerLoading, setTriggerLoading] = useState(false);
  const { signOut } = useClerk();
  const { push, ToastHost } = useToast();

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
          title="Cerrar sesion"
          aria-label="Cerrar sesion"
        >
          <Icon name="logout" size={16} />
        </button>
      }
    >
      {children}
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
          <div className="w-full max-w-[420px]" onClick={(e) => e.stopPropagation()}>
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
                    onClick={() => {
                      window.location.href = triggerInfo.checkoutUrl!;
                    }}
                  >
                    Ir al checkout
                  </Button>
                )}
              </div>
            </Card>
          </div>
        </div>
      )}
    </PayShell>
  );
};

export default HistoryShell;
