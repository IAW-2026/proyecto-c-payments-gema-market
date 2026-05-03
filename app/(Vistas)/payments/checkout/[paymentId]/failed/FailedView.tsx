"use client";
import { useRouter } from "next/navigation";
import { PayShell } from "@/app/(Vistas)/payments/components/PayShell";
import { Card, Button, Icon, fmtARS } from "@/app/(Vistas)/payments/shared/components";

export interface FailedViewProps {
  paymentId: string;
  totalAmount: number;
  orderId: string;
  reason: string;
  attemptId: string;
}

/**
 * Eliminado respecto al mock: "paymentMethod" hardcodeado como "Visa •••• 3704".
 * Ahora se muestra solo el motivo de rechazo real de MP.
 */
const FailedView = ({ paymentId, totalAmount, orderId, reason, attemptId }: FailedViewProps) => {
  const router = useRouter();
  const details = [
    { l: "Pedido", v: orderId },
    { l: "Motivo", v: reason },
    { l: "ID intento", v: attemptId, mono: true },
  ];

  return (
    <PayShell title="Pago rechazado" back={`/payments/checkout/${paymentId}/methods`}>
      <div className="px-4 py-8 max-[599px]:pb-[104px] min-[600px]:p-5 lgx:p-6 lgx:flex lgx:flex-col lgx:flex-1">
        <div className="grid grid-cols-1 gap-4 lgx:flex lgx:flex-col lgx:flex-1 lgx:gap-[18px]">
          <div>
            <div className="text-center mb-7">
              <div className="w-[88px] h-[88px] mx-auto mb-[18px] rounded-full bg-danger text-white flex items-center justify-center shadow-[0_8px_32px_-8px_rgba(154,58,31,.5)]">
                <Icon name="close" size={42}/>
              </div>
              <h2 className="m-0 mb-1.5 text-2xl font-semibold">No pudimos procesar el pago</h2>
              <p className="m-0 text-ink-3">Revisá los datos de la tarjeta o elegí otro método disponible.</p>
            </div>
            <Card padding={16} className="flex items-center gap-3 mb-3.5">
              <div className="w-10 h-10 rounded-[10px] bg-[#f0d9d1] text-danger flex items-center justify-center shrink-0">
                <Icon name="alert" size={18}/>
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-[13px] font-semibold">La operación fue rechazada</div>
                <div className="text-[11px] text-ink-3">No se hizo ningún cargo en tu cuenta.</div>
              </div>
            </Card>
          </div>
          <div className="lgx:flex lgx:flex-col lgx:flex-1 lgx:min-h-0">
            <Card padding={20} className="mb-3.5">
              <div className="text-[11px] font-mono text-ink-3 uppercase mb-1">Importe</div>
              <div className="text-[28px] font-bold mb-4">{fmtARS(totalAmount)}</div>
              <div className="flex flex-col gap-2.5 pt-3.5 border-t border-line text-[13px]">
                {details.map(r => (
                  <div key={r.l} className="flex justify-between gap-3">
                    <span className="text-ink-3">{r.l}</span>
                    <span className={`font-medium text-right [overflow-wrap:anywhere] ${r.mono ? "font-mono text-xs" : "text-[13px]"}`}>{r.v}</span>
                  </div>
                ))}
              </div>
            </Card>
            <div className="sticky bottom-0 bg-paper/95 backdrop-blur-[12px] border-t border-line p-4 -mx-4 mt-auto flex gap-2.5 max-[599px]:fixed max-[599px]:left-0 max-[599px]:right-0 max-[599px]:bottom-0 max-[599px]:z-[80] max-[599px]:bg-paper/[.98] max-[599px]:shadow-[0_-10px_28px_rgba(40,30,15,.08)] max-[599px]:mx-0 max-[420px]:flex-col lgx:!static lgx:!bg-transparent lgx:backdrop-blur-none lgx:!pt-[18px] lgx:!px-0 lgx:!pb-0 lgx:!mx-0">
              <Button variant="secondary" full onClick={() => router.push(`/payments/checkout/${paymentId}/methods`)}>Cambiar método</Button>
              <Button variant="accent" full iconRight="arrowRight" onClick={() => router.push(`/payments/checkout/${paymentId}/card`)}>Reintentar</Button>
            </div>
          </div>
        </div>
      </div>
    </PayShell>
  );
};
export default FailedView;
