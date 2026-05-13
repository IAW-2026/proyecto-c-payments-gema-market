/**
 * Servicio de Órdenes de Pago.
 * Encapsula las consultas Prisma para la entidad OrdenDePago.
 */

import prisma from "@/app/lib/prisma";
import { generateUlid } from "@/app/lib/ulid";
import type { OrderItem, PaymentStatus } from "@/app/(Logica)/types/payments.types";
import type { Prisma } from "@prisma/client";
import { calculateFee } from "@/app/lib/util";

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
  const rows = await prisma.ordenDePago.findMany({
    orderBy: { createdAt: "desc" },
  });

  return rows.map((r) => ({ ...r, orders: parseOrders(r.orders), status: r.status as PaymentStatus }));
}

/**
 * Obtiene el total de órdenes de pago.
 */
export async function getOrdenesDePagoTotalCount(): Promise<number> {
  return prisma.ordenDePago.count();
}

/**
 * Obtiene órdenes de pago paginadas.
 */
export async function getOrdenesDePagoPaged(
  params: OrdenesDePagoPageParams,
): Promise<OrdenDePago[]> {
  const rows = await prisma.ordenDePago.findMany({
    orderBy: { createdAt: "desc" },
    skip: params.skip,
    take: params.take,
  });

  return rows.map((r) => ({ ...r, orders: parseOrders(r.orders), status: r.status as PaymentStatus }));
}

/**
 * Obtiene una orden de pago por su ID (payment_id).
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
  const rows = await prisma.ordenDePago.findMany({
    where: { buyerId },
    orderBy: { createdAt: "desc" },
  });

  return rows.map((r) => ({ ...r, orders: parseOrders(r.orders), status: r.status as PaymentStatus }));
}

/**
 * Obtiene el total de órdenes de pago de un comprador.
 */
export async function getOrdenesDePagoByBuyerTotalCount(
  buyerId: string,
): Promise<number> {
  return prisma.ordenDePago.count({
    where: { buyerId },
  });
}

/**
 * Obtiene órdenes de pago paginadas de un comprador.
 */
export async function getOrdenesDePagoByBuyerPaged(
  buyerId: string,
  params: OrdenesDePagoPageParams,
): Promise<OrdenDePago[]> {
  const rows = await prisma.ordenDePago.findMany({
    where: { buyerId },
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

  return { id: row.id };
}

/**
 * Obtiene las deudas de la plataforma con un vendedor específico.
 * Solo considera órdenes con estado "approved".
 */
export async function getDebtsBySeller(sellerId: string, startDate?: Date) {
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
