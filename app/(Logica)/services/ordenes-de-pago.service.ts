/**
 * Servicio de Órdenes de Pago.
 * Encapsula las consultas Prisma para la entidad OrdenDePago.
 */

import prisma from "@/app/lib/prisma";
import { generateUlid } from "@/app/lib/ulid";
import type { OrderItem, PaymentStatus } from "@/app/(Logica)/types/payments.types";
import type { Prisma } from "@prisma/client";
import { calculateFee } from "@/app/lib/util";
import { cacheTag, cacheLife } from "next/cache";

export interface CreateOrdenDePagoParams {
  buyerId: string;
  orders: OrderItem[];
  totalAmount: number;
  fee: number;
  currency: string;
  mpPreferenceId?: string;
}

export interface UpdateOrdenDePagoStatusParams {
  paymentId: string;
  status: PaymentStatus;
  mpPaymentId?: string;
  mpStatusDetail?: string;
  paidAt?: Date;
}

export type OrdenDePago = Omit<Prisma.OrdenDePagoGetPayload<Record<string, never>>, "orders" | "status"> & {
  orders: OrderItem[];
  status: PaymentStatus;
};

export interface OrdenesDePagoPagedResult {
  rows: OrdenDePago[];
  totalCount: number;
}

export type PaymentStatusFilter = "all" | "approved" | "pending" | "failed";

export function statusFilterToPrismaWhere(filter: PaymentStatusFilter): { status?: string | { in: string[] } } {
  switch (filter) {
    case "approved":
      return { status: "approved" };
    case "pending":
      return { status: { in: ["pending", "in_process", "in_mediation"] } };
    case "failed":
      return { status: { in: ["rejected", "cancelled", "refunded", "charged_back"] } };
    case "all":
    default:
      return {};
  }
}

export const FILTER_VALUES: PaymentStatusFilter[] = ["all", "approved", "pending", "failed"];

export function normalizeFilter(raw: string | undefined | null): PaymentStatusFilter {
  if (!raw) return "all";
  const lower = raw.toLowerCase();
  return FILTER_VALUES.includes(lower as PaymentStatusFilter) ? (lower as PaymentStatusFilter) : "all";
}

export interface OrdenesDePagoPageParams {
  skip: number;
  take: number;
}

/**
 * Parsea el campo `orders` de la DB de forma segura.
 * El adapter-pg de Prisma puede devolver campos Json como strings
 * en vez de objetos ya parseados. Este helper maneja ambos casos.
 */
function parseOrders(raw: unknown): OrderItem[] {
  if (typeof raw === "string") {
    try {
      return JSON.parse(raw) as OrderItem[];
    } catch {
      console.error("Error parseando orders JSON string:", raw);
      return [];
    }
  }
  if (Array.isArray(raw)) {
    return raw as OrderItem[];
  }
  console.error("orders tiene un tipo inesperado:", typeof raw, raw);
  return [];
}

/**
 * Crea una nueva orden de pago en la base de datos.
 */
export async function createOrdenDePago(
  params: CreateOrdenDePagoParams,
): Promise<OrdenDePago> {
  const { buyerId, orders, totalAmount, fee, currency, mpPreferenceId } =
    params;

  const row = await prisma.ordenDePago.create({
    data: {
      id: generateUlid("pay"),
      buyerId,
      orders: JSON.parse(JSON.stringify(orders)),
      totalAmount,
      fee,
      currency,
      status: "pending",
      mpPreferenceId: mpPreferenceId ?? null,
    },
  });

  return { ...row, orders: parseOrders(row.orders), status: row.status as PaymentStatus };
}

/**
 * Actualiza el estado de una orden de pago existente.
 */
export async function updateOrdenDePagoStatus(
  params: UpdateOrdenDePagoStatusParams,
): Promise<OrdenDePago> {
  const { paymentId, status, mpPaymentId, mpStatusDetail, paidAt } = params;

  const row = await prisma.ordenDePago.update({
    where: { id: paymentId },
    data: {
      status,
      ...(mpPaymentId != null && { mpPaymentId }),
      ...(mpStatusDetail != null && { mpStatusDetail }),
      ...(paidAt != null && { paidAt }),
    },
  });

  return { ...row, orders: parseOrders(row.orders), status: row.status as PaymentStatus };
}

/**
 * Obtiene todas las órdenes de pago.
 */
export async function getOrdenesDePago(): Promise<OrdenDePago[]> {
  'use cache'
  cacheTag('ordenes-list-admin')
  cacheLife({ stale: 5, revalidate: 15, expire: 60 })
  const rows = await prisma.ordenDePago.findMany({
    orderBy: { createdAt: "desc" },
  });

  return rows.map((r) => ({ ...r, orders: parseOrders(r.orders), status: r.status as PaymentStatus }));
}

/**
 * Obtiene el total de órdenes de pago, opcionalmente filtrado.
 */
export async function getOrdenesDePagoTotalCount(
  filter: PaymentStatusFilter = "all",
): Promise<number> {
  'use cache'
  cacheTag(`ordenes-count-${filter}`)
  cacheLife({ stale: 5, revalidate: 15, expire: 60 })
  return prisma.ordenDePago.count({
    where: statusFilterToPrismaWhere(filter),
  });
}

/**
 * Obtiene órdenes de pago paginadas, opcionalmente filtradas.
 */
export async function getOrdenesDePagoPaged(
  params: OrdenesDePagoPageParams,
  filter: PaymentStatusFilter = "all",
): Promise<OrdenDePago[]> {
  'use cache'
  cacheTag('ordenes-list-admin', `ordenes-list-admin-${filter}`)
  cacheLife({ stale: 5, revalidate: 15, expire: 60 })
  const rows = await prisma.ordenDePago.findMany({
    where: statusFilterToPrismaWhere(filter),
    orderBy: { createdAt: "desc" },
    skip: params.skip,
    take: params.take,
  });

  return rows.map((r) => ({ ...r, orders: parseOrders(r.orders), status: r.status as PaymentStatus }));
}

/**
 * Obtiene una orden de pago por su ID (payment_id) — SIN CACHE.
 * Usada por el webhook que necesita el estado actual siempre.
 */
export async function getOrdenDePagoById(
  paymentId: string,
): Promise<OrdenDePago | null> {
  const row = await prisma.ordenDePago.findUnique({
    where: { id: paymentId },
  });

  return row ? { ...row, orders: parseOrders(row.orders), status: row.status as PaymentStatus } : null;
}

/**
 * Versión cacheada de getOrdenDePagoById.
 * Usada por páginas de checkout y layout para evitar consultas repetidas a Prisma.
 */
export async function getCachedOrdenDePagoById(
  paymentId: string,
): Promise<OrdenDePago | null> {
  'use cache'
  cacheTag(`orden-${paymentId}`)
  cacheLife({ stale: 10, revalidate: 30, expire: 60 })
  return getOrdenDePagoById(paymentId);
}

/**
 * Actualiza el mpPreferenceId de una orden de pago existente.
 * Se usa después de crear la orden para vincularla con la preferencia de MP.
 */
export async function updateOrdenDePagoPreference(
  paymentId: string,
  mpPreferenceId: string,
): Promise<OrdenDePago> {
  const row = await prisma.ordenDePago.update({
    where: { id: paymentId },
    data: { mpPreferenceId },
  });

  return { ...row, orders: parseOrders(row.orders), status: row.status as PaymentStatus };
}

/**
 * Obtiene las órdenes de pago de un comprador específico.
 */
export async function getOrdenesDePagoByBuyer(
  buyerId: string,
): Promise<OrdenDePago[]> {
  'use cache'
  cacheTag(`ordenes-list-${buyerId}`)
  cacheLife({ stale: 5, revalidate: 15, expire: 60 })
  const rows = await prisma.ordenDePago.findMany({
    where: { buyerId },
    orderBy: { createdAt: "desc" },
  });

  return rows.map((r) => ({ ...r, orders: parseOrders(r.orders), status: r.status as PaymentStatus }));
}

/**
 * Obtiene el total de órdenes de pago de un comprador, opcionalmente filtrado.
 */
export async function getOrdenesDePagoByBuyerTotalCount(
  buyerId: string,
  filter: PaymentStatusFilter = "all",
): Promise<number> {
  'use cache'
  cacheTag(`ordenes-count-${buyerId}`, `ordenes-count-${buyerId}-${filter}`)
  cacheLife({ stale: 5, revalidate: 15, expire: 60 })
  return prisma.ordenDePago.count({
    where: { ...statusFilterToPrismaWhere(filter), buyerId },
  });
}

/**
 * Obtiene órdenes de pago paginadas de un comprador, opcionalmente filtradas.
 */
export async function getOrdenesDePagoByBuyerPaged(
  buyerId: string,
  params: OrdenesDePagoPageParams,
  filter: PaymentStatusFilter = "all",
): Promise<OrdenDePago[]> {
  'use cache'
  cacheTag(`ordenes-list-${buyerId}`, `ordenes-list-${buyerId}-${filter}`)
  cacheLife({ stale: 5, revalidate: 15, expire: 60 })
  const rows = await prisma.ordenDePago.findMany({
    where: { ...statusFilterToPrismaWhere(filter), buyerId },
    orderBy: { createdAt: "desc" },
    skip: params.skip,
    take: params.take,
  });

  return rows.map((r) => ({ ...r, orders: parseOrders(r.orders), status: r.status as PaymentStatus }));
}

/**
 * Elimina una orden de pago por su ID (borrado físico).
 */
export async function deleteOrderById(paymentId: string) {
  const row = await prisma.ordenDePago.delete({
    where: { id: paymentId },
  });

  return { id: row.id, buyerId: row.buyerId };
}

/**
 * Obtiene las deudas de la plataforma con un vendedor específico.
 * Solo considera órdenes con estado "approved".
 */
export async function getDebtsBySeller(sellerId: string, startDate?: Date) {
  'use cache'
  cacheTag(`debts-${sellerId}`)
  cacheLife({ stale: 30, revalidate: 120, expire: 300 })
  const rows = await prisma.ordenDePago.findMany({
    where: {
      status: "approved",
      ...(startDate && {
        createdAt: {
          gte: startDate,
        },
      }),
    },
    orderBy: { createdAt: "desc" },
  });

  const sellerDebts = [];
  let totalDebt = 0;

  for (const row of rows) {
    const orders = parseOrders(row.orders);
    const sellerItems = orders.filter((o) => o.sellerId === sellerId);

    for (const item of sellerItems) {
      const itemAmount = item.amount;
      const itemFee = calculateFee(itemAmount);
      const netAmount = itemAmount - itemFee;

      sellerDebts.push({
        paymentId: row.id,
        orderId: item.orderId,
        productId: item.productId,
        amount: itemAmount,
        fee: itemFee,
        netAmount: netAmount,
        currency: row.currency,
        date: row.createdAt,
      });

      totalDebt += netAmount;
    }
  }

  return {
    sellerId,
    totalDebt: Math.round(totalDebt * 100) / 100,
    items: sellerDebts,
  };
}

/* ------------------------------------------------------------------ */
/*  Admin: paginated query with filters and JSONB raw SQL             */
/* ------------------------------------------------------------------ */

export interface AdminOrdenesQueryParams {
  page: number;
  pageSize: number;
  buyerId?: string;
  sellerId?: string;
  status?: string;
  dateFrom?: Date;
  dateTo?: Date;
  sortBy: string;
  order: "asc" | "desc";
}

export interface AdminOrdenRow {
  id: string;
  buyerId: string;
  orders: OrderItem[];
  totalAmount: number;
  currency: string;
  status: string;
  createdAt: Date;
  paidAt: Date | null;
}

export async function getAdminOrdenesPaged(
  params: AdminOrdenesQueryParams,
): Promise<{ rows: AdminOrdenRow[]; total: number }> {
  const conditions: string[] = [];
  const queryParams: unknown[] = [];
  let paramIndex = 1;

  function addCondition(sql: string, ...vals: unknown[]) {
    conditions.push(sql);
    for (const v of vals) {
      queryParams.push(v);
      paramIndex++;
    }
  }

  if (params.buyerId) {
    addCondition(`"buyer_id" = ${paramIndex}`, params.buyerId);
  }

  if (params.status) {
    const rawStatus = params.status.trim().toLowerCase();
    if (rawStatus === "pending") {
      addCondition(
        `"status" IN ($${paramIndex}, $${paramIndex + 1}, $${paramIndex + 2})`,
        "pending",
        "in_process",
        "in_mediation",
      );
    } else if (rawStatus === "failed") {
      addCondition(
        `"status" IN ($${paramIndex}, $${paramIndex + 1}, $${paramIndex + 2}, $${paramIndex + 3})`,
        "rejected",
        "cancelled",
        "refunded",
        "charged_back",
      );
    } else {
      addCondition(`"status" = $${paramIndex}`, rawStatus);
    }
  }

  if (params.dateFrom) {
    addCondition(      `"created_at" >= ${paramIndex}`, params.dateFrom);
  }
  if (params.dateTo) {
    addCondition(`"created_at" <= ${paramIndex}`, params.dateTo);
  }

  if (params.sellerId) {
    addCondition(
      `EXISTS (SELECT 1 FROM jsonb_array_elements("orders") AS elem WHERE elem->>'sellerId' = $${paramIndex})`,
      params.sellerId,
    );
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

  const sortColumnMap: Record<string, string> = {
    createdAt: "created_at",
    totalAmount: "total_amount",
    status: "status",
  };
  const sortColumn = sortColumnMap[params.sortBy] ?? "created_at";
  const sortDir = params.order === "asc" ? "ASC" : "DESC";

  const offset = (params.page - 1) * params.pageSize;

  const countSql = `SELECT COUNT(*)::int AS total FROM "orden_de_pago" ${whereClause}`;
  const dataSql = `SELECT id, "buyer_id", "orders", "total_amount", currency, status, "created_at", "paid_at" FROM "orden_de_pago" ${whereClause} ORDER BY "${sortColumn}" ${sortDir} LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
  queryParams.push(params.pageSize, offset);

  const [countResult]: Array<{ total: number }> = await prisma.$queryRawUnsafe(
    countSql,
    ...queryParams.slice(0, -2),
  );

  const dataRows: Array<{
    id: string;
    buyer_id: string;
    orders: unknown;
    total_amount: number;
    currency: string;
    status: string;
    created_at: Date;
    paid_at: Date | null;
  }> = await prisma.$queryRawUnsafe(dataSql, ...queryParams);

  const rows = dataRows.map((r) => ({
    id: r.id,
    buyerId: r.buyer_id,
    orders: parseOrders(r.orders),
    totalAmount: Number(r.total_amount),
    currency: r.currency,
    status: r.status,
    createdAt: r.created_at,
    paidAt: r.paid_at,
  }));

  return { rows, total: countResult.total };
}

/* ------------------------------------------------------------------ */
/*  History search: raw SQL for JSONB product name lookup             */
/* ------------------------------------------------------------------ */

export interface SearchOrdenesParams {
  buyerId?: string;
  q?: string;
  filter: PaymentStatusFilter;
  skip: number;
  take: number;
}

export async function searchOrdenesDePagoPaged(
  params: SearchOrdenesParams,
): Promise<{ rows: OrdenDePago[]; totalCount: number }> {
  const conditions: string[] = [];
  const queryParams: unknown[] = [];
  let paramIndex = 1;

  function addCondition(sql: string, ...vals: unknown[]) {
    conditions.push(sql);
    for (const v of vals) {
      queryParams.push(v);
      paramIndex++;
    }
  }

  if (params.buyerId) {
    addCondition(`"buyer_id" = $${paramIndex}`, params.buyerId);
  }

  if (params.filter !== "all") {
    const pw = statusFilterToPrismaWhere(params.filter);
    const statusVal = pw.status;
    if (typeof statusVal === "string") {
      addCondition(`"status" = $${paramIndex}`, statusVal);
    } else if (statusVal && "in" in statusVal) {
      const statuses = statusVal.in as string[];
      const placeholders = statuses.map((_, i) => `$${paramIndex + i}`).join(", ");
      addCondition(`"status" IN (${placeholders})`, ...statuses);
    }
  }

  if (params.q?.trim()) {
    const term = `%${params.q.trim()}%`;
    addCondition(
      `EXISTS (SELECT 1 FROM jsonb_array_elements("orders") AS elem WHERE elem->>'productName' ILIKE $${paramIndex})`,
      term,
    );
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";
  const offset = params.skip;

  const countSql = `SELECT COUNT(*)::int AS total FROM "orden_de_pago" ${whereClause}`;
  const dataSql = `SELECT id, "buyer_id", "orders", "total_amount", fee, currency, status, "created_at", "paid_at", "mp_preference_id", "mp_payment_id", "mp_status_detail" FROM "orden_de_pago" ${whereClause} ORDER BY "created_at" DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
  queryParams.push(params.take, offset);

  const [countResult]: Array<{ total: number }> = await prisma.$queryRawUnsafe(countSql, ...queryParams.slice(0, -2));
  const dataRows: Array<{
    id: string; buyer_id: string; orders: unknown; total_amount: number; fee: number;
    currency: string; status: string; created_at: Date; paid_at: Date | null;
    mp_preference_id: string | null; mp_payment_id: string | null; mp_status_detail: string | null;
  }> = await prisma.$queryRawUnsafe(dataSql, ...queryParams);

  const rows: OrdenDePago[] = dataRows.map((r) => ({
    id: r.id,
    buyerId: r.buyer_id,
    totalAmount: Number(r.total_amount) as unknown as OrdenDePago["totalAmount"],
    fee: Number(r.fee) as unknown as OrdenDePago["fee"],
    currency: r.currency,
    status: r.status as PaymentStatus,
    createdAt: r.created_at,
    paidAt: r.paid_at,
    orders: parseOrders(r.orders),
    mpPreferenceId: r.mp_preference_id,
    mpPaymentId: r.mp_payment_id,
    mpStatusDetail: r.mp_status_detail,
  }));

  return { rows, totalCount: countResult.total };
}
