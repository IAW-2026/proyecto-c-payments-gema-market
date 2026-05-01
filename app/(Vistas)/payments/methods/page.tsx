import { getOrdenesDePago } from "@/app/(Logica)/services/ordenes-de-pago.service";
import MethodsView from "./MethodsView";

export default async function MethodsPage() {
  const ordenes = await getOrdenesDePago();
  const orden = ordenes.find((o) => o.status === "pending") || ordenes[0];

  return (
    <MethodsView
      totalAmount={orden?.totalAmount ?? 0}
      productCount={orden?.orders.length ?? 0}
    />
  );
}
