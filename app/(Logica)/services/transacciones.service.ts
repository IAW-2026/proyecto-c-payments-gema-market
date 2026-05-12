/**
 * Servicio de Transacciones.
 * Encapsula las consultas Prisma para la entidad Transaccion (eventos de Mercado Pago).
 */

import prisma from "@/app/lib/prisma";
import { generateUlid } from "@/app/lib/ulid";
import type { Prisma } from "@prisma/client";

export interface CreateTransaccionParams {
  paymentId: string;
  eventType: string;
  payloadJson: Record<string, unknown>;
}

export type Transaccion = Prisma.TransaccionGetPayload<Record<string, never>>;

/**
 * Crea una nueva transaccion (evento de Mercado Pago) en la base de datos.
 */
export async function createTransaccion(
  params: CreateTransaccionParams,
): Promise<void> {
  await prisma.transaccion.create({
    data: {
      id: generateUlid("txn"),
      paymentId: params.paymentId,
      eventType: params.eventType,
      payloadJson: params.payloadJson as Prisma.InputJsonValue,
    },
  });
}

/**
 * Obtiene todas las transacciones asociadas a una orden de pago.
 */
export async function getTransaccionesByPaymentId(
  paymentId: string,
): Promise<Transaccion[]> {
  return prisma.transaccion.findMany({
    where: { paymentId },
    orderBy: { receivedAt: "desc" },
  });
}
