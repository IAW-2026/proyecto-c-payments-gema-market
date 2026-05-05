import { getOrdenDePagoById } from "@/app/(Logica)/services/ordenes-de-pago.service";
import { notFound } from "next/navigation";
import MethodsView from "./MethodsView";

export default async function MethodsPage({
  params,
}: {
  params: Promise<{ paymentId: string }>;
}) {
  const { paymentId } = await params;
  const orden = await getOrdenDePagoById(paymentId);

  if (!orden) return notFound();

  return (
    <MethodsView
      paymentId={orden.id}
      totalAmount={Number(orden.totalAmount)}
      productCount={orden.orders.length}
    />
  );
}
