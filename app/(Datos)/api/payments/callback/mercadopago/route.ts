/**
 * Callback de Mercado Pago — GET /api/payments/callback/mercadopago
 *
 * Punto único de retorno para todos los redirects de MP.
 * Lee external_reference y collection_status de los query params
 * y redirige a la vista correcta. El webhook maneja la actualización en BD.
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
  const status =
    searchParams.get("collection_status") ?? searchParams.get("status");

  if (!paymentId) {
    return NextResponse.redirect(`${appUrl}/payments`);
  }

  if (status === "approved") {
    return NextResponse.redirect(
      `${appUrl}/payments/checkout/${paymentId}/success`,
    );
  }

  if (status === "pending" || status === "in_process") {
    return NextResponse.redirect(
      `${appUrl}/payments/checkout/${paymentId}/processing`,
    );
  }

  return NextResponse.redirect(
    `${appUrl}/payments/checkout/${paymentId}/failed`,
  );
}
