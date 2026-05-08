/**
 * Callback de Mercado Pago — GET /api/payments/callback/mercadopago
 *
 * Punto único de retorno para todos los redirects de MP.
 * Redirige siempre a processing para que el polling espere la actualización del webhook en BD.
 */

import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  
  // Usar el origen de la request actual (ej: https://app.vercel.app o https://*.ngrok-free.dev)
  // Esto evita problemas si la variable de entorno estaba mal configurada o faltaba
  const appUrl = request.nextUrl.origin;

  const paymentId = searchParams.get("external_reference");

  if (!paymentId) {
    return NextResponse.redirect(`${appUrl}/payments`);
  }

  // Siempre redirigir a processing: el polling consultará el estado real en BD (actualizado por webhook)
  return NextResponse.redirect(
    `${appUrl}/payments/checkout/${paymentId}/processing`,
  );
}
