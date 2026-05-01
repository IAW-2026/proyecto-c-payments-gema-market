/**
 * Servicio de Disputas.
 * Encapsula las consultas Prisma para la entidad Disputa.
 * Principio: Single Responsibility — solo maneja persistencia de disputas.
 */

import prisma from "@/app/lib/prisma";
import type { DisputaDTO, DisputeStatus } from "@/app/(Logica)/types/payments.types";

const USE_MOCKS = process.env.USE_MOCKS === "true";

// ─── Mock data ──────────────────────────────────────────────────────

const MOCK_DISPUTAS: DisputaDTO[] = [
  {
    id: "dsp_mock_001",
    orderId: "OR-2841",
    paymentId: "pay_mock_001",
    openedBy: "usr_mock_lucia",
    reason: "product_not_as_described",
    description: "El producto llegó dañado.",
    notes: null,
    status: "open",
    resolvedAt: null,
  },
];

// ─── Servicio ───────────────────────────────────────────────────────

/**
 * Obtiene todas las disputas.
 */
export async function getDisputas(): Promise<DisputaDTO[]> {
  if (USE_MOCKS) return MOCK_DISPUTAS;

  const rows = await prisma.disputa.findMany({
    orderBy: { orderId: "desc" },
  });

  return rows.map(mapRowToDTO);
}

/**
 * Obtiene una disputa por su ID.
 */
export async function getDisputaById(
  disputeId: string
): Promise<DisputaDTO | null> {
  if (USE_MOCKS) {
    return MOCK_DISPUTAS.find((d) => d.id === disputeId) ?? null;
  }

  const row = await prisma.disputa.findUnique({
    where: { id: disputeId },
  });

  return row ? mapRowToDTO(row) : null;
}

/**
 * Obtiene las disputas asociadas a una orden de pago.
 */
export async function getDisputasByPaymentId(
  paymentId: string
): Promise<DisputaDTO[]> {
  if (USE_MOCKS) {
    return MOCK_DISPUTAS.filter((d) => d.paymentId === paymentId);
  }

  const rows = await prisma.disputa.findMany({
    where: { paymentId },
  });

  return rows.map(mapRowToDTO);
}

// ─── Mapper ─────────────────────────────────────────────────────────

function mapRowToDTO(row: {
  id: string;
  orderId: string;
  paymentId: string;
  openedBy: string;
  reason: string;
  description: string | null;
  notes: string | null;
  status: string;
  resolvedAt: Date | null;
}): DisputaDTO {
  return {
    id: row.id,
    orderId: row.orderId,
    paymentId: row.paymentId,
    openedBy: row.openedBy,
    reason: row.reason,
    description: row.description,
    notes: row.notes,
    status: row.status as DisputeStatus,
    resolvedAt: row.resolvedAt,
  };
}
