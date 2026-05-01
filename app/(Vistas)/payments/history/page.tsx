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

/** Convierte una OrdenDePagoDTO a una transacción de historial para la vista */
function mapToHistoryTransaction(orden: OrdenDePagoDTO): HistoryTransaction {
  const isRefund = orden.status === "refunded";
  const isFailed = orden.status === "rejected" || orden.status === "cancelled";

  return {
    id: orden.mpPaymentId ?? orden.id,
    date: formatDate(orden.paidAt ?? orden.createdAt),
    desc: isRefund
      ? `Devolución ${orden.orders[0]?.orderId ?? ""}`
      : `Pedido ${orden.orders[0]?.orderId ?? ""}`,
    amount: isRefund ? orden.totalAmount : -orden.totalAmount,
    method: "Visa •••• 3704", // Hardcodeado — fuente: Mercado Pago
    status: isRefund ? "refund" : isFailed ? "fail" : "ok",
  };
}

export default async function HistoryPage() {
  const ordenes = await getOrdenesDePago();

  const transactions = ordenes.map(mapToHistoryTransaction);

  return <HistoryView transactions={transactions} />;
}
