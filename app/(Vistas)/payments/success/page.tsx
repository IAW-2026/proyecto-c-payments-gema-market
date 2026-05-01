import { getOrdenesDePago } from "@/app/(Logica)/services/ordenes-de-pago.service";
import SuccessView from "./SuccessView";

/** Formatea una fecha a "DD mes · HH:MM" en español */
function formatDate(date: Date | null | undefined): string {
  if (!date) return "—";
  const months = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"];
  const d = new Date(date);
  const day = d.getDate();
  const month = months[d.getMonth()];
  const hours = d.getHours().toString().padStart(2, "0");
  const mins = d.getMinutes().toString().padStart(2, "0");
  return `${day} ${month} · ${hours}:${mins}`;
}

export default async function SuccessPage() {
  const ordenes = await getOrdenesDePago();
  const orden = ordenes.find((o) => o.status === "approved") || ordenes[0];

  return (
    <SuccessView
      totalAmount={orden?.totalAmount ?? 0}
      orderId={orden?.orders[0]?.orderId ?? "—"}
      paymentMethod="Visa •••• 3704"
      date={formatDate(orden?.paidAt)}
      transactionId={orden?.mpPaymentId ?? "—"}
    />
  );
}
