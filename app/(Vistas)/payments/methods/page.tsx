import { getOrdenDePagoById } from "@/app/(Logica)/services/ordenes-de-pago.service";
import MethodsView from "./MethodsView";

export default async function MethodsPage() {
  const orden = await getOrdenDePagoById("pay_mock_001");

  return (
    <MethodsView
      totalAmount={orden?.totalAmount ?? 0}
      productCount={orden?.orders.length ?? 0}
    />
  );
}
