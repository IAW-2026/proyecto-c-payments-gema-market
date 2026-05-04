"use client";
import { useRouter } from "next/navigation";
import { PayShell } from "@/app/(Vistas)/payments/components/PayShell";
import { Card, Button, Icon, fmtARS } from "@/app/(Vistas)/payments/shared/components";

export interface SuccessViewProps {
  paymentId: string;
  totalAmount: number;
  orderId: string;
  date: string;
  transactionId: string;
}

/**
 * Eliminado respecto al mock: "paymentMethod" hardcodeado como "Visa •••• 3704".
 * Ahora el método de pago es gestionado internamente por MP y se muestra el ID de transacción real.
 */
const SuccessView = ({ paymentId, totalAmount, orderId, date, transactionId }: SuccessViewProps) => {
  const router = useRouter();
  const details = [
    { l: "Pedido", v: orderId },
    { l: "Fecha", v: date },
    { l: "ID transacción", v: transactionId, mono: true },
  ];

  return (
    <PayShell title="Pago confirmado" back={null}>
      <div className="px-4 py-8 max-[599px]:pb-[104px] min-[600px]:p-5 lgx:p-6 lgx:flex lgx:flex-col lgx:flex-1">
        <div className="grid grid-cols-1 gap-4 lgx:flex lgx:flex-col lgx:flex-1 lgx:gap-[18px]">
          <div>
            <div className="text-center mb-7">
              <div className="w-[88px] h-[88px] mx-auto mb-[18px] rounded-full bg-success text-white flex items-center justify-center shadow-[0_8px_32px_-8px_rgba(64,117,67,.5)]">
                <Icon name="check" size={42}/>
              </div>
              <h2 className="m-0 mb-1.5 text-2xl font-semibold">¡Listo!</h2>
              <p className="m-0 text-ink-3">Tu pago se procesó correctamente.</p>
            </div>
            <Card padding={16} className="flex items-center gap-3 mb-3.5">
              <div className="w-10 h-10 rounded-[10px] bg-bone text-cocoa flex items-center justify-center shrink-0">
                <Icon name="truck" size={18}/>
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-[13px] font-medium">Tu pedido empieza a prepararse</div>
                <div className="text-[11px] text-ink-3">Te notificaremos cuando esté en camino</div>
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
              <Button variant="accent" full iconRight="arrowRight" onClick={() => router.push("/payments/history")}>Ver historial</Button>
            </div>
          </div>
        </div>
      </div>
    </PayShell>
  );
};
export default SuccessView;
