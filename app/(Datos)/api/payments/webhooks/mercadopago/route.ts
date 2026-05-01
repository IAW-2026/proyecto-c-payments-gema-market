import { NextResponse } from "next/server";

/**
 * POST /api/payments/webhooks/mercadopago
 * Recibe notificaciones IPN/Webhook de Mercado Pago.
 * Valida firma con X-Signature de MP y actualiza el estado interno.
 * TODO: Implementar validación de firma y procesamiento de eventos.
 */
export async function POST() {
  // TODO: Implementar
  return NextResponse.json({ message: "Not implemented" }, { status: 501 });
}
