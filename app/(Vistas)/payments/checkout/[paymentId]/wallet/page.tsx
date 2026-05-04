import { getOrdenDePagoById } from "@/app/(Logica)/services/ordenes-de-pago.service";
import { notFound } from "next/navigation";
import WalletBrickView from "./WalletBrickView";

export default async function WalletPage({
  params,
}: {
  params: Promise<{ paymentId: string }>;
}) {
  const { paymentId } = await params;
  const orden = await getOrdenDePagoById(paymentId);

  if (!orden) return notFound();

  return (
    <WalletBrickView
      paymentId={orden.id}
      totalAmount={orden.totalAmount}
      preferenceId={orden.mpPreferenceId ?? ""}
    />
  );
}
