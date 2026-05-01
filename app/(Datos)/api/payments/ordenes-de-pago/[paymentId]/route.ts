import { NextRequest, NextResponse } from "next/server";
import { getOrdenDePagoById } from "@/app/(Logica)/services/ordenes-de-pago.service";

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
  try {
  const ordenDePago = await getOrdenDePagoById(paymentId);

    return NextResponse.json(ordenDePago, { status: 200 });
  } catch (error) {
    return NextResponse.json({ message: "Error al obtener la orden de pago" }, { status: 500 });
  }
}
