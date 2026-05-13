import { currentUser } from "@clerk/nextjs/server";
import {
  deleteOrderById,
  getOrdenesDePagoByBuyerPaged,
  getOrdenesDePagoByBuyerTotalCount,
  getOrdenesDePagoPaged,
  getOrdenesDePagoTotalCount,
} from "@/app/(Logica)/services/ordenes-de-pago.service";
import type { OrdenDePago } from "@/app/(Logica)/services/ordenes-de-pago.service";
import HistoryView from "./HistoryView";
import type { HistoryTransaction, HistoryTransactionItem } from "./HistoryView";
import { formatDate } from "@/app/lib/util";
import { isFinalFailed, isPendingStatus } from "@/app/lib/payment-status";
import {
  getUsuarioByClerkUserId,
  getUsuariosByIds,
} from "@/app/(Logica)/services/usuario-sync.service";
import { isAdminPaymentsUser } from "@/app/lib/auth-utils";
import { redirect } from "next/navigation";

/**
 * Accion server para eliminar una orden.
 */
async function deleteOrdenDePagoAction(paymentId: string) {
  "use server";
  await deleteOrderById(paymentId);
}

/**
 * Mapea una orden a la forma de historial de UI.
 */
function mapToHistoryTransaction(
  orden: OrdenDePago,
  buyerName?: string,
): HistoryTransaction {
  const isFailed = isFinalFailed(orden.status);
  const isPending = isPendingStatus(orden.status);

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

const PAGE_SIZE = 8;

function parsePage(rawPage: string | string[] | undefined): number {
  if (!rawPage) return 1;
  const value = Array.isArray(rawPage) ? rawPage[0] : rawPage;
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) ? parsed : 1;
}

/**
 * Pagina de historial de pagos.
 */
export default async function HistoryPage({
  searchParams,
}: {
  searchParams?: { page?: string };
}) {
  const user = await currentUser();
  const isAdmin = isAdminPaymentsUser(user);

  const usuario = user?.id ? await getUsuarioByClerkUserId(user.id) : null;
  const buyerId = usuario?.id ?? null;
  const displayName =
    user?.fullName ?? user?.primaryEmailAddress?.emailAddress ?? "";

  const requestedPage = parsePage(searchParams?.page);
  const totalCount = isAdmin
    ? await getOrdenesDePagoTotalCount()
    : buyerId
      ? await getOrdenesDePagoByBuyerTotalCount(buyerId)
      : 0;

  const totalPages = totalCount > 0 ? Math.ceil(totalCount / PAGE_SIZE) : 1;
  const safePage = Math.min(Math.max(requestedPage, 1), totalPages);

  if (totalCount > 0 && requestedPage !== safePage) {
    redirect(`/payments/history?page=${safePage}`);
  }

  const ordenes = totalCount > 0
    ? isAdmin
      ? await getOrdenesDePagoPaged({
          skip: (safePage - 1) * PAGE_SIZE,
          take: PAGE_SIZE,
        })
      : buyerId
        ? await getOrdenesDePagoByBuyerPaged(buyerId, {
            skip: (safePage - 1) * PAGE_SIZE,
            take: PAGE_SIZE,
          })
        : []
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
      currentPage={safePage}
      totalPages={totalPages}
      pageSize={PAGE_SIZE}
    />
  );
}
