import { getCachedOrdenDePagoById } from "@/app/(Logica)/services/ordenes-de-pago.service";
import { notFound, redirect } from "next/navigation";
import PendingView from "./PendingView";
import { mapCheckoutItems } from "@/app/lib/checkout-mapping";
import { isFinalApproved, isFinalFailed, isPendingStatus } from "@/app/lib/payment-status";
import { formatDate } from "@/app/lib/util";

export default async function PendingPage({
  params,
}: {
  params: Promise<{ paymentId: string }>;
}) {
  const { paymentId } = await params;
  const orden = await getCachedOrdenDePagoById(paymentId);

  if (!orden) return notFound();

  const status = orden.status;
  const isPending = isPendingStatus(status);
  const isApproved = isFinalApproved(status);
  const isFailed = isFinalFailed(status);

  if (!isPending) {
    if (isApproved) redirect(`/payments/checkout/${paymentId}/success`);
    if (isFailed) redirect(`/payments/checkout/${paymentId}/failed`);
    redirect(`/payments/checkout/${paymentId}/processing`);
  }

  const { items, totalShipping } = mapCheckoutItems(orden.orders);

  return (
    <PendingView
      paymentId={orden.id}
      totalAmount={Number(orden.totalAmount)}
      date={formatDate(orden.createdAt)}
      transactionId={orden.mpPaymentId ?? "—"}
      statusDetail={orden.mpStatusDetail ?? "—"}
      items={items}
      totalShipping={totalShipping}
    />
  );
}
