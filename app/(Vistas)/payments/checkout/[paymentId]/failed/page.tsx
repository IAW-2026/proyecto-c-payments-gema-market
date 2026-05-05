import { getOrdenDePagoById } from "@/app/(Logica)/services/ordenes-de-pago.service";
import { notFound } from "next/navigation";
import FailedView from "./FailedView";
import { mapRejectReason } from "@/app/lib/util";

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
      totalAmount={Number(orden.totalAmount)}
      orderId={orden.orders[0]?.orderId ?? "—"}
      reason={mapRejectReason(orden.mpStatusDetail)}
      attemptId={orden.mpPaymentId ?? "—"}
    />
  );
}
