import { currentUser } from "@clerk/nextjs/server";
import {
  deleteOrderById,
  getOrdenesDePago,
  getOrdenesDePagoByBuyer,
} from "@/app/(Logica)/services/ordenes-de-pago.service";
import type { OrdenDePago } from "@/app/(Logica)/services/ordenes-de-pago.service";
import HistoryView from "./HistoryView";
import type { HistoryTransaction, HistoryTransactionItem } from "./HistoryView";
import { formatDate } from "@/app/lib/util";
import {
  getUsuarioByClerkUserId,
  getUsuariosByIds,
} from "@/app/(Logica)/services/usuario-sync.service";


async function deleteOrdenDePagoAction(paymentId: string) {
  "use server";
  await deleteOrderById(paymentId);
}

function mapToHistoryTransaction(
  orden: OrdenDePago,
  buyerName?: string,
): HistoryTransaction {
  const isFailed = orden.status === "rejected" || orden.status === "cancelled";
  const isPending = orden.status === "pending" || orden.status === "in_process" || orden.status === "in_mediation";

  const items: HistoryTransactionItem[] = (orden.orders ?? []).map((o) => {
    const up = o.unitPrice ?? 0;
    const sp = up > 0 ? o.amount - up * o.quantity : 0;
    return {
      productId: o.productId,
      productName: o.productName || "Producto",
      quantity: o.quantity,
      unitPrice: up,
      shippingPrice: sp,
    };
  });

  const shippingTotal = items.reduce((sum, i) => sum + i.shippingPrice, 0);

  return {
    id: orden.mpPaymentId ?? orden.id,
    paymentId: orden.id,
    date: formatDate(orden.paidAt ?? orden.createdAt),
    desc: `Pedido ${orden.orders[0]?.orderId ?? ""}`,
    amount: -Number(orden.totalAmount),
    method: "Mercado Pago",
    status: isFailed ? "fail" : isPending ? "pending" : "ok",
    items,
    currency: orden.currency,
    shippingTotal,
    buyerName,
  };
}

export default async function HistoryPage() {
  const user = await currentUser();
  const role = user?.publicMetadata?.role;
  const isAdmin = role === "admin";

  const usuario = user?.id ? await getUsuarioByClerkUserId(user.id) : null;
  const buyerId = usuario?.id ?? null;
  const displayName =
    user?.fullName ?? user?.primaryEmailAddress?.emailAddress ?? "";

  const ordenes = isAdmin
    ? await getOrdenesDePago()
    : buyerId
      ? await getOrdenesDePagoByBuyer(buyerId)
      : [];

  const buyerNameMap = isAdmin
    ? new Map(
        (
          await getUsuariosByIds(
            Array.from(new Set(ordenes.map((o) => o.buyerId))),
          )
        ).map((u) => [u.id, u.fullName ?? u.email ?? u.clerkUserId]),
      )
    : new Map();

  const transactions = ordenes.map((orden) =>
    mapToHistoryTransaction(
      orden,
      isAdmin ? buyerNameMap.get(orden.buyerId) : undefined,
    ),
  );

  return (
    <HistoryView
      transactions={transactions}
      isAdmin={isAdmin}
      displayName={isAdmin ? "Admin" : displayName}
      onDeleteOrden={deleteOrdenDePagoAction}
    />
  );
}
