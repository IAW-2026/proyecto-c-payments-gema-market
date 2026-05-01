import { NextRequest, NextResponse } from "next/server";

/**
 * POST /api/payments/disputas/:disputeId/resolver
 * Permite a un administrador resolver una disputa (consumido por Control Plane).
 * TODO: Implementar lógica de resolución.
 */
export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ disputeId: string }> }
) {
  const { disputeId } = await params;
  // TODO: Implementar
  return NextResponse.json({ message: "Not implemented", disputeId }, { status: 501 });
}
