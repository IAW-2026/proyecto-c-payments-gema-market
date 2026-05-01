import { getOrdenDePagoById } from "@/app/(Logica)/services/ordenes-de-pago.service";
import WalletView from "./WalletView";

export default async function WalletPage() {
  const orden = await getOrdenDePagoById("pay_mock_001");

  return (
    <WalletView totalAmount={orden?.totalAmount ?? 0} />
  );
}
