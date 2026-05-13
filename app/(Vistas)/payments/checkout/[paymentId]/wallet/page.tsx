import { getCachedOrdenDePagoById } from "@/app/(Logica)/services/ordenes-de-pago.service";
import { notFound } from "next/navigation";
import WalletBrickView from "./WalletBrickView";
import { mapCheckoutItems } from "@/app/lib/checkout-mapping";

export default async function WalletPage({
  params,
}: {
  params: Promise<{ paymentId: string }>;
}) {
  const { paymentId } = await params;
  const orden = await getCachedOrdenDePagoById(paymentId);

  if (!orden) return notFound();

  const { items, totalShipping } = mapCheckoutItems(orden.orders);

  return (
    <WalletBrickView
      paymentId={orden.id}
      totalAmount={Number(orden.totalAmount)}
      preferenceId={orden.mpPreferenceId ?? ""}
      items={items}
      totalShipping={totalShipping}
    />
  );
}
