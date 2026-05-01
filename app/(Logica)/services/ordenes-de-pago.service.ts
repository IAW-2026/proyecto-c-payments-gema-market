/**
 * Servicio de Órdenes de Pago.
 * Encapsula las consultas Prisma para la entidad OrdenDePago.
 * Principio: Single Responsibility — solo maneja persistencia de órdenes de pago.
 */

import prisma from "@/app/lib/prisma";
import type {
  OrdenDePagoDTO,
  OrderItem,
  PaymentStatus,
} from "@/app/(Logica)/types/payments.types";



// ─── Servicio ───────────────────────────────────────────────────────

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
  paymentId: string
): Promise<OrdenDePagoDTO | null> {

  const row = await prisma.ordenDePago.findUnique({
    where: { id: paymentId },
  });

  return row ? mapRowToDTO(row) : null;
}

/**
 * Obtiene las órdenes de pago de un comprador específico.
 */
export async function getOrdenesDePagoByBuyer(
  buyerId: string
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
