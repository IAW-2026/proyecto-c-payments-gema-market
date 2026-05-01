import { getOrdenesDePago } from "@/app/(Logica)/services/ordenes-de-pago.service";
import CardView from "./CardView";

export default async function CardPage() {
  const ordenes = await getOrdenesDePago();
  const orden = ordenes.find((o) => o.status === "pending") || ordenes[0];

  return (
    <CardView totalAmount={orden?.totalAmount ?? 0} />
  );
}
