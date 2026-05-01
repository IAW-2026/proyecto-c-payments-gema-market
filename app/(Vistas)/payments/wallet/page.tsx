import { getOrdenesDePago } from "@/app/(Logica)/services/ordenes-de-pago.service";
import WalletView from "./WalletView";

export default async function WalletPage() {
  const ordenes = await getOrdenesDePago();
  const orden = ordenes.find((o) => o.status === "pending") || ordenes[0];

  return (
    <WalletView totalAmount={orden?.totalAmount ?? 0} />
  );
}
