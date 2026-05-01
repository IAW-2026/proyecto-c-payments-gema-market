import { getOrdenesDePago } from "@/app/(Logica)/services/ordenes-de-pago.service";
import HistoryView from "./HistoryView";
import type { HistoryTransaction } from "./HistoryView";
import type { OrdenDePagoDTO } from "@/app/(Logica)/types/payments.types";

/** Formatea una fecha a "DD mes · HH:MM" en español */
function formatDate(date: Date): string {
  const months = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"];
  const d = new Date(date);
  return `${d.getDate()} ${months[d.getMonth()]} · ${d.getHours().toString().padStart(2, "0")}:${d.getMinutes().toString().padStart(2, "0")}`;
}

function mapToHistoryTransaction(orden: OrdenDePagoDTO): HistoryTransaction {
  const isFailed = orden.status === "rejected" || orden.status === "cancelled";
  const isPending = orden.status === "pending" || orden.status === "in_process" || orden.status === "in_mediation";

  return {
    id: orden.mpPaymentId ?? orden.id,
    date: formatDate(orden.paidAt ?? orden.createdAt),
    desc: `Pedido ${orden.orders[0]?.orderId ?? ""}`,
    amount: -orden.totalAmount,
    method: "Visa •••• 3704",
    status: isFailed ? "fail" : isPending ? "pending" : "ok",
  };
}

export default async function HistoryPage() {
  const ordenes = await getOrdenesDePago();

  const transactions = ordenes.map(mapToHistoryTransaction);

  return <HistoryView transactions={transactions} />;
}
