import { getCachedOrdenDePagoById } from "@/app/(Logica)/services/ordenes-de-pago.service";
import { notFound } from "next/navigation";
import MethodsView from "./MethodsView";
import { mapCheckoutItems } from "@/app/lib/checkout-mapping";

export default async function MethodsPage({
  params,
}: {
  params: Promise<{ paymentId: string }>;
}) {
  const { paymentId } = await params;
  const orden = await getCachedOrdenDePagoById(paymentId);

  if (!orden) return notFound();

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
