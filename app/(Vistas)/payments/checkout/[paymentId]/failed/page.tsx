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

  const upFallback = (up: number | undefined, qty: number, amt: number) =>
    up ?? (qty > 0 ? amt / qty : 0);

  const items = orden.orders.map((o) => {
    const up = upFallback(o.unitPrice, o.quantity, o.amount);
    const sp = up > 0 ? o.amount - up * o.quantity : 0;
    return { productName: o.productName ?? o.productId, quantity: o.quantity, unitPrice: up, shippingPrice: sp };
  });
  const totalShipping = items.reduce((sum, i) => sum + i.shippingPrice, 0);

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
