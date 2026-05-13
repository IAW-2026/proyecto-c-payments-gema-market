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
