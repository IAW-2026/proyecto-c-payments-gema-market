import {
  getOrdenesDePagoByBuyerPaged,
  getOrdenesDePagoByBuyerTotalCount,
  getOrdenesDePagoPaged,
  getOrdenesDePagoTotalCount,
  normalizeFilter,
  searchOrdenesDePagoPaged,
} from "@/app/(Logica)/services/ordenes-de-pago.service";
import type { OrdenDePago, PaymentStatusFilter } from "@/app/(Logica)/services/ordenes-de-pago.service";
import { formatDate } from "@/app/lib/util";
import { isFinalFailed, isPendingStatus } from "@/app/lib/payment-status";
import { getUsuariosByClerkUserIds } from "@/app/(Logica)/services/usuario-sync.service";
import HistoryList from "./HistoryList";
import type { HistoryTransaction, HistoryTransactionItem } from "./types";
import { redirect } from "next/navigation";

const PAGE_SIZE = 8;

function getRequestedPage(rawPage: string | string[] | undefined): number | null {
  if (!rawPage) return null;
  const value = Array.isArray(rawPage) ? rawPage[0] : rawPage;
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) ? parsed : null;
}

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
    desc: `Pago ${orden.id}`,
    amount: -Number(orden.totalAmount),
    method: "Mercado Pago",
    status: isFailed ? "fail" : isPending ? "pending" : "ok",
    items,
    currency: orden.currency,
    shippingTotal,
    buyerName,
  };
}

export default async function HistoryListServer({
  buyerId,
  isAdmin,
  searchParams,
  onDeleteOrden,
}: {
  buyerId: string | null;
  isAdmin: boolean;
  searchParams: { page?: string; filter?: string; q?: string };
  onDeleteOrden?: (paymentId: string) => Promise<void>;
}) {
  const { page: pageStr, filter: filterRaw, q } = searchParams;
  const safeFilter: PaymentStatusFilter = normalizeFilter(filterRaw);
  const hasSearch = !!q?.trim();
  const requestedPage = getRequestedPage(pageStr);
  const rawPage = requestedPage ?? 1;

  if (hasSearch) {
    const result = await searchOrdenesDePagoPaged({
      buyerId: isAdmin ? undefined : (buyerId ?? undefined),
      q: q!.trim(),
      filter: safeFilter,
      skip: (rawPage - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    });

    const totalCount = result.totalCount;
    const totalPages = totalCount > 0 ? Math.ceil(totalCount / PAGE_SIZE) : 1;
    const safePage = Math.min(Math.max(rawPage, 1), totalPages);

    const buyerNameMap = isAdmin
      ? new Map(
          (await getUsuariosByClerkUserIds(
            Array.from(new Set(result.rows.map((o) => o.buyerId))),
          )).map((u) => [u.clerkUserId, u.fullName ?? u.email ?? u.clerkUserId]),
        )
      : new Map();

    const transactions = result.rows.map((orden) =>
      mapToHistoryTransaction(orden, isAdmin ? buyerNameMap.get(orden.buyerId) : undefined),
    );

    return (
      <HistoryList
        transactions={transactions}
        isAdmin={isAdmin}
        onDeleteOrden={onDeleteOrden}
        currentPage={safePage}
        totalPages={totalPages}
        currentFilter={safeFilter}
        currentSearch={q}
      />
    );
  }

  const totalCount = isAdmin
    ? await getOrdenesDePagoTotalCount(safeFilter)
    : buyerId
      ? await getOrdenesDePagoByBuyerTotalCount(buyerId, safeFilter)
      : 0;

  const totalPages = totalCount > 0 ? Math.ceil(totalCount / PAGE_SIZE) : 1;
  const safePage = Math.min(Math.max(rawPage, 1), totalPages);

  if (requestedPage !== null && totalCount > 0 && requestedPage !== safePage) {
    redirect(`/payments/history?page=${safePage}&filter=${safeFilter}`);
  }

  const ordenes =
    totalCount > 0
      ? isAdmin
        ? await getOrdenesDePagoPaged(
            {
              skip: (safePage - 1) * PAGE_SIZE,
              take: PAGE_SIZE,
            },
            safeFilter,
          )
        : buyerId
          ? await getOrdenesDePagoByBuyerPaged(
              buyerId,
              {
                skip: (safePage - 1) * PAGE_SIZE,
                take: PAGE_SIZE,
              },
              safeFilter,
            )
          : []
      : [];

  const buyerNameMap = isAdmin
    ? new Map(
        (
          await getUsuariosByClerkUserIds(
            Array.from(new Set(ordenes.map((o) => o.buyerId))),
          )
        ).map((u) => [u.clerkUserId, u.fullName ?? u.email ?? u.clerkUserId]),
      )
    : new Map();

  const transactions = ordenes.map((orden) =>
    mapToHistoryTransaction(
      orden,
      isAdmin ? buyerNameMap.get(orden.buyerId) : undefined,
    ),
  );

  return (
    <HistoryList
      transactions={transactions}
      isAdmin={isAdmin}
      onDeleteOrden={onDeleteOrden}
      currentPage={safePage}
      totalPages={totalPages}
      currentFilter={safeFilter}
      currentSearch={q}
    />
  );
}
