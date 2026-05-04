/**
 * Servicio de Órdenes de Pago.
 * Encapsula las consultas Prisma para la entidad OrdenDePago.
 * Principio: Single Responsibility — solo maneja persistencia de órdenes de pago.
 */

import prisma from "@/app/lib/prisma";
import { generateUlid } from "@/app/lib/ulid";
import type {
  OrdenDePagoDTO,
  OrderItem,
  PaymentStatus,
} from "@/app/(Logica)/types/payments.types";

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

// ─── Servicio ───────────────────────────────────────────────────────

/**
 * Crea una nueva orden de pago en la base de datos.
 */
export async function createOrdenDePago(
  params: CreateOrdenDePagoParams,
): Promise<OrdenDePagoDTO> {
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

  return mapRowToDTO(row);
}

/**
 * Actualiza el estado de una orden de pago existente.
 */
export async function updateOrdenDePagoStatus(
  params: UpdateOrdenDePagoStatusParams,
): Promise<OrdenDePagoDTO> {
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

  return mapRowToDTO(row);
}

/**
 * Obtiene todas las órdenes de pago.
 */
export async function getOrdenesDePago(): Promise<OrdenDePagoDTO[]> {
  const rows = await prisma.ordenDePago.findMany({
    orderBy: { createdAt: "desc" },
  });

  return rows.map(mapRowToDTO);
}

/**
 * Obtiene una orden de pago por su ID (payment_id).
 */
export async function getOrdenDePagoById(
  paymentId: string,
): Promise<OrdenDePagoDTO | null> {
  const row = await prisma.ordenDePago.findUnique({
    where: { id: paymentId },
  });

  return row ? mapRowToDTO(row) : null;
}

/**
 * Actualiza el mpPreferenceId de una orden de pago existente.
 * Se usa después de crear la orden para vincularla con la preferencia de MP.
 */
export async function updateOrdenDePagoPreference(
  paymentId: string,
  mpPreferenceId: string,
): Promise<OrdenDePagoDTO> {
  const row = await prisma.ordenDePago.update({
    where: { id: paymentId },
    data: { mpPreferenceId },
  });

  return mapRowToDTO(row);
}

/**
 * Obtiene las órdenes de pago de un comprador específico.
 */
export async function getOrdenesDePagoByBuyer(
  buyerId: string,
): Promise<OrdenDePagoDTO[]> {
  const rows = await prisma.ordenDePago.findMany({
    where: { buyerId },
    orderBy: { createdAt: "desc" },
  });

  return rows.map(mapRowToDTO);
}

// ─── Mapper ─────────────────────────────────────────────────────────

function mapRowToDTO(row: {
  id: string;
  buyerId: string;
  orders: unknown;
  totalAmount: unknown;
  fee: unknown;
  currency: string;
  status: string;
  mpPreferenceId: string | null;
  mpPaymentId: string | null;
  mpStatusDetail: string | null;
  createdAt: Date;
  paidAt: Date | null;
}): OrdenDePagoDTO {
  return {
    id: row.id,
    buyerId: row.buyerId,
    orders: row.orders as OrderItem[],
    totalAmount: Number(row.totalAmount),
    fee: Number(row.fee),
    currency: row.currency,
    status: row.status as PaymentStatus,
    mpPreferenceId: row.mpPreferenceId,
    mpPaymentId: row.mpPaymentId,
    mpStatusDetail: row.mpStatusDetail,
    createdAt: row.createdAt,
    paidAt: row.paidAt,
  };
}
