import { getOrdenDePagoById } from "@/app/(Logica)/services/ordenes-de-pago.service";
import { notFound } from "next/navigation";
import FailedView from "./FailedView";

/** Mapea el código de rechazo de MP a un texto legible */
function mapRejectReason(detail: string | null | undefined): string {
  const reasons: Record<string, string> = {
    cc_rejected_insufficient_amount: "Fondos insuficientes",
    cc_rejected_bad_filled_security_code: "Datos de pago incorrectos",
    cc_rejected_bad_filled_date: "Datos de pago incorrectos",
    cc_rejected_bad_filled_other: "Datos de pago incorrectos",
    cc_rejected_call_for_authorize: "No autorizado por el emisor",
    cc_rejected_high_risk: "Rechazado por seguridad",
  };
  return reasons[detail ?? ""] ?? "No autorizado por el emisor";
}

export default async function FailedPage({
  params,
}: {
  params: Promise<{ paymentId: string }>;
}) {
  const { paymentId } = await params;
  const orden = await getOrdenDePagoById(paymentId);

  if (!orden) return notFound();

  return (
    <FailedView
      paymentId={orden.id}
      totalAmount={orden.totalAmount}
      orderId={orden.orders[0]?.orderId ?? "—"}
      reason={mapRejectReason(orden.mpStatusDetail)}
      attemptId={orden.mpPaymentId ?? "—"}
    />
  );
}
