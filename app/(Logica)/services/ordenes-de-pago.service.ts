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

const USE_MOCKS = process.env.USE_MOCKS === "true";

// ─── Mock data (fallback) ───────────────────────────────────────────

const MOCK_ORDENES: OrdenDePagoDTO[] = [
  {
    id: "pay_mock_001",
    buyerId: "usr_mock_lucia",
    orders: [
      { orderId: "OR-2841", sellerId: "s2", productId: "p2", quoteId: "qte_001", amount: 89000, quantity: 1 },
      { orderId: "OR-2841", sellerId: "s2", productId: "p6", quoteId: "qte_002", amount: 67000, quantity: 1 },
      { orderId: "OR-2841", sellerId: "s5", productId: "p11", quoteId: "qte_003", amount: 4300, quantity: 1 },
    ],
    totalAmount: 160300,
    fee: 4809,
    currency: "ARS",
    status: "approved",
    mpPreferenceId: "MP-PREF-mock-001",
    mpPaymentId: "MP-7821-9384",
    mpStatusDetail: "accredited",
    createdAt: new Date("2026-04-24T21:42:00Z"),
    paidAt: new Date("2026-04-24T21:42:30Z"),
  },
  {
    id: "pay_mock_002",
    buyerId: "usr_mock_lucia",
    orders: [{ orderId: "OR-2832", sellerId: "s4", productId: "p4", quoteId: "qte_004", amount: 42600, quantity: 1 }],
    totalAmount: 42600,
    fee: 1278,
    currency: "ARS",
    status: "approved",
    mpPreferenceId: "MP-PREF-mock-002",
    mpPaymentId: "MP-7745-2210",
    mpStatusDetail: "accredited",
    createdAt: new Date("2026-04-18T14:15:00Z"),
    paidAt: new Date("2026-04-18T14:15:20Z"),
  },
  {
    id: "pay_mock_003",
    buyerId: "usr_mock_lucia",
    orders: [{ orderId: "OR-2820", sellerId: "s3", productId: "p3", quoteId: "qte_005", amount: 28400, quantity: 1 }],
    totalAmount: 28400,
    fee: 852,
    currency: "ARS",
    status: "refunded",
    mpPreferenceId: "MP-PREF-mock-003",
    mpPaymentId: "MP-7689-1102",
    mpStatusDetail: "refunded",
    createdAt: new Date("2026-04-12T19:30:00Z"),
    paidAt: new Date("2026-04-12T19:30:15Z"),
  },
  {
    id: "pay_mock_004",
    buyerId: "usr_mock_lucia",
    orders: [{ orderId: "OR-2814", sellerId: "s2", productId: "p10", quoteId: "qte_006", amount: 97500, quantity: 1 }],
    totalAmount: 97500,
    fee: 2925,
    currency: "ARS",
    status: "approved",
    mpPreferenceId: "MP-PREF-mock-004",
    mpPaymentId: "MP-7612-8843",
    mpStatusDetail: "accredited",
    createdAt: new Date("2026-04-05T12:20:00Z"),
    paidAt: new Date("2026-04-05T12:20:18Z"),
  },
  {
    id: "pay_mock_005",
    buyerId: "usr_mock_lucia",
    orders: [{ orderId: "OR-2801", sellerId: "s5", productId: "p5", quoteId: "qte_007", amount: 55200, quantity: 1 }],
    totalAmount: 55200,
    fee: 1656,
    currency: "ARS",
    status: "rejected",
    mpPreferenceId: "MP-PREF-mock-005",
    mpPaymentId: "MP-7544-3321",
    mpStatusDetail: "cc_rejected_insufficient_amount",
    createdAt: new Date("2026-03-29T23:11:00Z"),
    paidAt: null,
  },
];

// ─── Servicio ───────────────────────────────────────────────────────

/**
 * Obtiene todas las órdenes de pago.
 * En modo mock devuelve el array de órdenes de ejemplo.
 */
export async function getOrdenesDePago(): Promise<OrdenDePagoDTO[]> {
  if (USE_MOCKS) return MOCK_ORDENES;

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
  if (USE_MOCKS) {
    return MOCK_ORDENES.find((o) => o.id === paymentId) ?? MOCK_ORDENES[0];
  }

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
  if (USE_MOCKS) {
    return MOCK_ORDENES.filter((o) => o.buyerId === buyerId);
  }

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
