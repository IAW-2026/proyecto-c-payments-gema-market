import { getOrdenDePagoById } from "@/app/(Logica)/services/ordenes-de-pago.service";
import { notFound, redirect } from "next/navigation";
import FailedView from "./FailedView";
import { mapCheckoutItems } from "@/app/lib/checkout-mapping";
import { isFinalApproved, isFinalFailed } from "@/app/lib/payment-status";
import { mapRejectReason } from "@/app/lib/util";

export default async function FailedPage({
  params,
}: {
  params: Promise<{ paymentId: string }>;
}) {
  const { paymentId } = await params;
  const orden = await getOrdenDePagoById(paymentId);

  if (!orden) return notFound();

  const status = orden.status;
  const isApproved = isFinalApproved(status);
  const isFailed = isFinalFailed(status);

  if (!isFailed) {
    if (isApproved) redirect(`/payments/checkout/${paymentId}/success`);
    redirect(`/payments/checkout/${paymentId}/processing`);
  }

  const { items, totalShipping } = mapCheckoutItems(orden.orders);

  return (
    <FailedView
      paymentId={orden.id}
      totalAmount={Number(orden.totalAmount)}
      orderId={orden.orders[0]?.orderId ?? "—"}
      reason={mapRejectReason(orden.mpStatusDetail)}
      attemptId={orden.mpPaymentId ?? "—"}
      items={items}
      totalShipping={totalShipping}
    />
  );
}
