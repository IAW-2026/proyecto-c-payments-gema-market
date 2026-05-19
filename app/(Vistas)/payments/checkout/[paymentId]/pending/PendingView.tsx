"use client";
import { useRouter } from "next/navigation";
import { PayShell } from "@/app/(Vistas)/payments/components/PayShell";
import { Card, Button, Icon, fmtARS } from "@/app/(Vistas)/payments/shared/components";

export interface PendingItem {
  productName: string;
  quantity: number;
  unitPrice: number;
  shippingPrice: number;
}

export interface PendingViewProps {
  paymentId: string;
  totalAmount: number;
  date: string;
  transactionId: string;
  statusDetail: string;
  items: PendingItem[];
  totalShipping: number;
}

const PendingView = ({
  paymentId, totalAmount, date, transactionId, statusDetail, items, totalShipping,
}: PendingViewProps) => {
  const router = useRouter();
  const details = [
    { l: "ID-pago", v: paymentId, mono: true },
    { l: "Fecha", v: date },
    { l: "ID transacción", v: transactionId, mono: true },
    { l: "Detalle", v: statusDetail },
  ];

  return (
    <PayShell title="Pago pendiente" back={null}>
      <div className="px-4 py-8 max-[599px]:pb-[104px] min-[600px]:p-5 lgx:p-6 lgx:flex lgx:flex-col lgx:flex-1">
        <div className="grid grid-cols-1 gap-4 lgx:flex lgx:flex-col lgx:flex-1 lgx:gap-[18px]">
          <div>
            <div className="text-center mb-7">
              <div className="w-[88px] h-[88px] mx-auto mb-[18px] rounded-full bg-[#f3e4c4] text-warn flex items-center justify-center shadow-[0_8px_32px_-8px_rgba(180,140,60,.5)]">
                <Icon name="clock" size={42} />
              </div>
              <h2 className="m-0 mb-1.5 text-2xl font-semibold">Esperando confirmación</h2>
              <p className="m-0 text-ink-3">Mercado Pago está procesando el pago.</p>
            </div>
            <Card padding={16} className="flex items-center gap-3 mb-3.5">
              <div className="w-10 h-10 rounded-[10px] bg-[#f3e4c4] text-warn flex items-center justify-center shrink-0">
                <Icon name="clock" size={18} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-[13px] font-medium">El pago está en revisión</div>
                <div className="text-[11px] text-ink-3">No te preocupes, no se hizo ningún cargo sin confirmar.</div>
              </div>
            </Card>
            <Card padding={16} className="mb-3.5">
              <div className="text-[11px] font-semibold text-ink-3 mb-3 uppercase tracking-wider">Resumen del pedido</div>
              <div className="space-y-1">
                {items.map((item, i) => (
                  <div key={i} className="flex justify-between text-[13px]">
                    <span className="text-ink truncate pr-2">{item.quantity}x {item.productName}</span>
                    <span className="text-ink font-medium shrink-0">{fmtARS(item.unitPrice * item.quantity)}</span>
                  </div>
                ))}
                {totalShipping > 0 && (
                  <div className="flex justify-between text-[12px] text-ink-3 pt-1 mt-1 border-t border-line/50">
                    <span>Envío</span>
                    <span>{fmtARS(totalShipping)}</span>
                  </div>
                )}
              </div>
            </Card>
          </div>
          <div className="lgx:flex lgx:flex-col lgx:flex-1 lgx:min-h-0">
            <Card padding={20} className="mb-3.5">
              <div className="text-[11px] font-mono text-ink-3 uppercase mb-1">Importe</div>
              <div className="text-[28px] font-bold mb-4">{fmtARS(totalAmount)}</div>
              <div className="flex flex-col gap-2.5 pt-3.5 border-t border-line text-[13px]">
                {details.map((r) => (
                  <div key={r.l} className="flex justify-between gap-3">
                    <span className="text-ink-3">{r.l}</span>
                    <span className={`font-medium text-right [overflow-wrap:anywhere] ${r.mono ? "font-mono text-xs" : "text-[13px]"}`}>{r.v}</span>
                  </div>
                ))}
              </div>
            </Card>
            <div className="sticky bottom-0 bg-paper/95 backdrop-blur-[12px] border-t border-line p-4 -mx-4 mt-auto flex gap-2.5 max-[599px]:fixed max-[599px]:left-0 max-[599px]:right-0 max-[599px]:bottom-0 max-[599px]:z-[80] max-[599px]:bg-paper/[.98] max-[599px]:shadow-[0_-10px_28px_rgba(40,30,15,.08)] max-[599px]:mx-0 max-[420px]:flex-col lgx:!static lgx:!bg-transparent lgx:backdrop-blur-none lgx:!pt-[18px] lgx:!px-0 lgx:!pb-0 lgx:!mx-0">
              <Button variant="secondary" full icon="arrowLeft" onClick={() => router.push("/payments/history")}>Volver al historial</Button>
            </div>
          </div>
        </div>
      </div>
    </PayShell>
  );
};
export default PendingView;
