/**
 * Servicio de Transacciones.
 * Encapsula las consultas Prisma para la entidad Transaccion (eventos de Mercado Pago).
 * Principio: Single Responsibility — solo maneja persistencia de transacciones/eventos.
 */

import prisma from "@/app/lib/prisma";
import type { TransaccionDTO } from "@/app/(Logica)/types/payments.types";

const USE_MOCKS = process.env.USE_MOCKS === "true";

// ─── Mock data ──────────────────────────────────────────────────────

const MOCK_TRANSACCIONES: TransaccionDTO[] = [
  {
    id: "txn_mock_001",
    paymentId: "pay_mock_001",
    eventType: "payment.created",
    payloadJson: { action: "payment.created", data: { id: "1234567890" } },
    receivedAt: new Date("2026-04-24T21:42:00Z"),
  },
  {
    id: "txn_mock_002",
    paymentId: "pay_mock_001",
    eventType: "payment.updated",
    payloadJson: { action: "payment.updated", data: { id: "1234567890" }, status: "approved" },
    receivedAt: new Date("2026-04-24T21:42:30Z"),
  },
];

// ─── Servicio ───────────────────────────────────────────────────────

/**
 * Obtiene todas las transacciones asociadas a una orden de pago.
 */
export async function getTransaccionesByPaymentId(
  paymentId: string
): Promise<TransaccionDTO[]> {
  if (USE_MOCKS) {
    return MOCK_TRANSACCIONES.filter((t) => t.paymentId === paymentId);
  }

  const rows = await prisma.transaccion.findMany({
    where: { paymentId },
    orderBy: { receivedAt: "desc" },
  });

  return rows.map(mapRowToDTO);
}

// ─── Mapper ─────────────────────────────────────────────────────────

function mapRowToDTO(row: {
  id: string;
  paymentId: string;
  eventType: string;
  payloadJson: unknown;
  receivedAt: Date;
}): TransaccionDTO {
  return {
    id: row.id,
    paymentId: row.paymentId,
    eventType: row.eventType,
    payloadJson: row.payloadJson as Record<string, unknown>,
    receivedAt: row.receivedAt,
  };
}
