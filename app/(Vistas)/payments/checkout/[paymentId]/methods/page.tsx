import { getOrdenDePagoById } from "@/app/(Logica)/services/ordenes-de-pago.service";
import { notFound } from "next/navigation";
import MethodsView from "./MethodsView";
import { ensurePaymentOwnership } from "@/app/lib/checkout-utils";
import { mapCheckoutItems } from "@/app/lib/checkout-mapping";

export default async function MethodsPage({
  params,
}: {
  params: Promise<{ paymentId: string }>;
}) {
  const { paymentId } = await params;
  const orden = await getOrdenDePagoById(paymentId);

  if (!orden) return notFound();

  await ensurePaymentOwnership(orden);

  const { items, totalShipping } = mapCheckoutItems(orden.orders);

  return (
    <MethodsView
      paymentId={orden.id}
      totalAmount={Number(orden.totalAmount)}
      items={items}
      totalShipping={totalShipping}
    />
  );
}
