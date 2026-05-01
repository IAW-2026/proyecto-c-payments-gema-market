import { getOrdenDePagoById } from "@/app/(Logica)/services/ordenes-de-pago.service";
import FailedView from "./FailedView";

/** Mapea el código de rechazo de MP a un texto legible */
function mapRejectReason(detail: string | null | undefined): string {
  const reasons: Record<string, string> = {
    cc_rejected_insufficient_amount: "Fondos insuficientes",
    cc_rejected_bad_filled_security_code: "Código de seguridad incorrecto",
    cc_rejected_bad_filled_date: "Fecha de vencimiento incorrecta",
    cc_rejected_bad_filled_other: "Datos de tarjeta incorrectos",
    cc_rejected_call_for_authorize: "No autorizado por el emisor",
    cc_rejected_high_risk: "Rechazado por seguridad",
  };
  return reasons[detail ?? ""] ?? "No autorizado por el emisor";
}

export default async function FailedPage() {
  // En el flujo real, se usaría la orden con status "rejected"
  const orden = await getOrdenDePagoById("pay_mock_005");

  return (
    <FailedView
      totalAmount={orden?.totalAmount ?? 0}
      orderId={orden?.orders[0]?.orderId ?? "—"}
      paymentMethod="Visa •••• 3704"
      reason={mapRejectReason(orden?.mpStatusDetail)}
      attemptId={orden?.mpPaymentId ?? "—"}
    />
  );
}
