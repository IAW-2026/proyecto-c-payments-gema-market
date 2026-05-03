"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { CardPayment } from "@mercadopago/sdk-react";
import { PayShell } from "@/app/(Vistas)/payments/components/PayShell";
import { Card, Icon, fmtARS } from "@/app/(Vistas)/payments/shared/components";

export interface CardBrickViewProps {
  paymentId: string;
  totalAmount: number;
}

/**
 * CardBrickView — Integra el CardPayment Brick de Mercado Pago.
 *
 * Elementos eliminados respecto al mock original:
 * - Formulario custom de tarjeta (número, nombre, vencimiento, CVC) →
 *   El CardPayment Brick renderiza su propio formulario PCI-compliant.
 * - Preview 3D de la tarjeta (front/back con flip) →
 *   No es posible con el Brick; MP tokeniza internamente.
 * - Botón custom "Pagar $X" →
 *   El Brick tiene su propio botón de submit integrado.
 *
 * Se conserva:
 * - El PayShell (header con back button)
 * - Resumen del total a pagar con el estilo del sistema
 * - Colores y tipografía del design system
 */
const CardBrickView = ({ paymentId, totalAmount }: CardBrickViewProps) => {
  const router = useRouter();
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleSubmit = async (formData: any) => {
    setProcessing(true);
    setError(null);

    try {
      const response = await fetch("/api/payments/process-card-payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          payment_id: paymentId,
          form_data: formData,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error ?? "Error al procesar el pago");
      }

      // Redirigir según resultado
      if (result.status === "approved") {
        router.push(`/payments/checkout/${paymentId}/success`);
      } else if (result.status === "rejected") {
        router.push(`/payments/checkout/${paymentId}/failed`);
      } else {
        router.push(`/payments/checkout/${paymentId}/processing`);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error inesperado");
      setProcessing(false);
    }
  };

  return (
    <PayShell title="Tarjeta de crédito o débito" back={`/payments/checkout/${paymentId}/methods`}>
      <div className="p-4 max-[599px]:pb-6 min-[600px]:p-5 lgx:p-6 lgx:flex lgx:flex-col lgx:flex-1">
        <div className="grid grid-cols-1 gap-4 lgx:flex lgx:flex-col lgx:flex-1 lgx:gap-[18px]">
          <div>
            <Card padding={18} className="mb-4">
              <div className="text-[11px] font-mono text-ink-3 uppercase mb-1">Total</div>
              <div className="text-[26px] font-bold">{fmtARS(totalAmount)}</div>
              <div className="text-xs text-ink-3 mt-1">Pago seguro procesado por Mercado Pago.</div>
            </Card>

            {error && (
              <Card padding={14} className="flex gap-2.5 items-center mb-4 !border-danger/30">
                <Icon name="alert" size={18} className="text-danger shrink-0"/>
                <div className="text-xs text-danger">{error}</div>
              </Card>
            )}

            {processing && (
              <Card padding={14} className="flex gap-2.5 items-center mb-4">
                <div className="w-5 h-5 rounded-full border-2 border-bone border-t-cocoa animate-spin shrink-0"/>
                <div className="text-xs text-ink-3">Procesando tu pago, no cierres esta ventana...</div>
              </Card>
            )}
          </div>

          <div className="lgx:flex lgx:flex-col lgx:flex-1 lgx:min-h-0">
            {/* CardPayment Brick de Mercado Pago */}
            <CardPayment
              initialization={{ amount: totalAmount }}
              onSubmit={handleSubmit}
            />
          </div>
        </div>
      </div>
    </PayShell>
  );
};
export default CardBrickView;
