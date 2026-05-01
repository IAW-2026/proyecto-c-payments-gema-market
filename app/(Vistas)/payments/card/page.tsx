import { getOrdenDePagoById } from "@/app/(Logica)/services/ordenes-de-pago.service";
import CardView from "./CardView";

export default async function CardPage() {
  const orden = await getOrdenDePagoById("pay_mock_001");

  return (
    <CardView totalAmount={orden?.totalAmount ?? 0} />
  );
}
