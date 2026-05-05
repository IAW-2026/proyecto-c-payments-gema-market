/**
 * Servicio de Transacciones.
 * Encapsula las consultas Prisma para la entidad Transaccion (eventos de Mercado Pago).
 */

import prisma from "@/app/lib/prisma";
import type { TransaccionDTO } from "@/app/(Logica)/types/payments.types";

// ─── Servicio ───────────────────────────────────────────────────────

/**
 * Obtiene todas las transacciones asociadas a una orden de pago.
 */
export async function getTransaccionesByPaymentId(
  paymentId: string,
): Promise<TransaccionDTO[]> {
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
