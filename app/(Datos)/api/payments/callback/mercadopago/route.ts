/**
 * Callback de Mercado Pago — GET /api/payments/callback/mercadopago
 *
 * Punto único de retorno para todos los redirects de MP.
 * Redirige siempre a processing para que el polling espere la actualización del webhook en BD.
 */

import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  let appUrl = process.env.APP_URL ?? "http://localhost:3000";

  // Normalizar URL: asegurar que tenga protocolo y sin barra final
  if (!appUrl.startsWith("http://") && !appUrl.startsWith("https://")) {
    appUrl = `http://${appUrl}`;
  }
  appUrl = appUrl.replace(/\/$/, ""); // Remover barra final si existe

  const paymentId = searchParams.get("external_reference");

  if (!paymentId) {
    return NextResponse.redirect(`${appUrl}/payments`);
  }

  // Siempre redirigir a processing: el polling consultará el estado real en BD (actualizado por webhook)
  return NextResponse.redirect(
    `${appUrl}/payments/checkout/${paymentId}/processing`,
  );
}
