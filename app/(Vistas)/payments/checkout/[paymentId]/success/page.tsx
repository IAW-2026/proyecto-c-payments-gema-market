import { getOrdenDePagoById } from "@/app/(Logica)/services/ordenes-de-pago.service";
import { notFound, redirect } from "next/navigation";
import SuccessView from "./SuccessView";
import { mapCheckoutItems } from "@/app/lib/checkout-mapping";
import { isFinalApproved, isFinalFailed } from "@/app/lib/payment-status";
import { formatDate } from "@/app/lib/util";

export default async function SuccessPage({
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

  if (!isApproved) {
    if (isFailed) redirect(`/payments/checkout/${paymentId}/failed`);
    redirect(`/payments/checkout/${paymentId}/processing`);
  }

  const { items, totalShipping } = mapCheckoutItems(orden.orders);

  return (
    <SuccessView
      paymentId={orden.id}
      totalAmount={Number(orden.totalAmount)}
      orderId={orden.orders[0]?.orderId ?? "—"}
      date={formatDate(orden.paidAt)}
      transactionId={orden.mpPaymentId ?? "—"}
      items={items}
      totalShipping={totalShipping}
    />
  );
}
