import { NextRequest, NextResponse } from "next/server";

/**
 * GET /api/payments/ordenes-de-pago/:paymentId
 * Consulta el estado actual de una orden de pago (consumido por Buyer, Seller, Control Plane).
 * TODO: Implementar consulta real con el servicio.
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ paymentId: string }> }
) {
  const { paymentId } = await params;
  // TODO: Implementar
  return NextResponse.json({ message: "Not implemented", paymentId }, { status: 501 });
}
