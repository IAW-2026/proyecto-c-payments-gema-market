/**
 * Servicio de Órdenes de Pago.
 * Encapsula las consultas Prisma para la entidad OrdenDePago.
 */

import prisma from "@/app/lib/prisma";
import { generateUlid } from "@/app/lib/ulid";
import type { OrderItem, PaymentStatus } from "@/app/(Logica)/types/payments.types";
import type { Prisma } from "@prisma/client";

// ─── Tipos de entrada ───────────────────────────────────────────────

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

// ─── Tipo de salida ─────────────────────────────────────────────────

export type OrdenDePago = Omit<Prisma.OrdenDePagoGetPayload<Record<string, never>>, "orders" | "status"> & {
  orders: OrderItem[];
  status: PaymentStatus;
};

// ─── Servicio ───────────────────────────────────────────────────────

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

  return { ...row, orders: row.orders as unknown as OrderItem[], status: row.status as PaymentStatus };
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

  return { ...row, orders: row.orders as unknown as OrderItem[], status: row.status as PaymentStatus };
}

/**
 * Obtiene todas las órdenes de pago.
 */
export async function getOrdenesDePago(): Promise<OrdenDePago[]> {
  const rows = await prisma.ordenDePago.findMany({
    orderBy: { createdAt: "desc" },
  });

  return rows.map((r) => ({ ...r, orders: r.orders as unknown as OrderItem[], status: r.status as PaymentStatus }));
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

  return row ? { ...row, orders: row.orders as unknown as OrderItem[], status: row.status as PaymentStatus } : null;
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

  return { ...row, orders: row.orders as unknown as OrderItem[], status: row.status as PaymentStatus };
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

  return rows.map((r) => ({ ...r, orders: r.orders as unknown as OrderItem[], status: r.status as PaymentStatus }));
}
