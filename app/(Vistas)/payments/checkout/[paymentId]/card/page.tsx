import { getOrdenDePagoById } from "@/app/(Logica)/services/ordenes-de-pago.service";
import { notFound } from "next/navigation";
import CardBrickView from "./CardBrickView";

export default async function CardPage({
  params,
}: {
  params: Promise<{ paymentId: string }>;
}) {
  const { paymentId } = await params;
  const orden = await getOrdenDePagoById(paymentId);

  if (!orden) return notFound();

  return (
    <CardBrickView
      paymentId={orden.id}
      totalAmount={orden.totalAmount}
    />
  );
}
