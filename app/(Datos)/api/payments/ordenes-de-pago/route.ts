import { NextResponse } from "next/server";

/**
 * POST /api/payments/ordenes-de-pago
 * Crea una nueva orden de pago (consumido por Buyer App).
 * TODO: Implementar lógica de creación con Mercado Pago.
 */
export async function POST() {
  // TODO: Implementar
  return NextResponse.json({ message: "Not implemented" }, { status: 501 });
}

/**
 * GET /api/payments/ordenes-de-pago
 * Lista las órdenes de pago (uso interno / admin).
 * TODO: Implementar paginación y filtros.
 */
export async function GET() {
  // TODO: Implementar
  return NextResponse.json({ message: "Not implemented" }, { status: 501 });
}
