import { getOrdenesDePago } from "@/app/(Logica)/services/ordenes-de-pago.service";
import type { OrdenDePago } from "@/app/(Logica)/services/ordenes-de-pago.service";
import HistoryView from "./HistoryView";
import type { HistoryTransaction } from "./HistoryView";
import { formatDate } from "@/app/lib/util";

function mapToHistoryTransaction(orden: OrdenDePago): HistoryTransaction {
  const isFailed = orden.status === "rejected" || orden.status === "cancelled";
  const isPending = orden.status === "pending" || orden.status === "in_process" || orden.status === "in_mediation";

  return {
    id: orden.mpPaymentId ?? orden.id,
    paymentId: orden.id,
    date: formatDate(orden.paidAt ?? orden.createdAt),
    desc: `Pedido ${orden.orders[0]?.orderId ?? ""}`,
    amount: -Number(orden.totalAmount),
    method: "Mercado Pago",
    status: isFailed ? "fail" : isPending ? "pending" : "ok",
  };
}

export default async function HistoryPage() {
  const ordenes = await getOrdenesDePago();

  const transactions = ordenes.map(mapToHistoryTransaction);

  return <HistoryView transactions={transactions} />;
}
