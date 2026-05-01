import { NextResponse } from "next/server";

/**
 * POST /api/payments/disputas
 * Permite a un usuario abrir un reclamo oficial (consumido por Buyer App).
 * TODO: Implementar lógica de creación de disputa.
 */
export async function POST() {
  // TODO: Implementar
  return NextResponse.json({ message: "Not implemented" }, { status: 501 });
}
