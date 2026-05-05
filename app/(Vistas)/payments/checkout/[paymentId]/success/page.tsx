import { getOrdenDePagoById } from "@/app/(Logica)/services/ordenes-de-pago.service";
import { notFound } from "next/navigation";
import SuccessView from "./SuccessView";
import { formatDate } from "@/app/lib/util";

export default async function SuccessPage({
  params,
}: {
  params: Promise<{ paymentId: string }>;
}) {
  const { paymentId } = await params;
  const orden = await getOrdenDePagoById(paymentId);

  if (!orden) return notFound();

  return (
    <SuccessView
      paymentId={orden.id}
      totalAmount={Number(orden.totalAmount)}
      orderId={orden.orders[0]?.orderId ?? "—"}
      date={formatDate(orden.paidAt)}
      transactionId={orden.mpPaymentId ?? "—"}
    />
  );
}
