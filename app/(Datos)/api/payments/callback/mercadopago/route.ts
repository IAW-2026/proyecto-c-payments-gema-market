/**
 * Callback de Mercado Pago que redirige a processing.
 */

import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);

  const appUrl = request.nextUrl.origin;

  const paymentId = searchParams.get("external_reference");

  if (!paymentId) {
    return NextResponse.redirect(`${appUrl}/payments`);
  }

  return NextResponse.redirect(
    `${appUrl}/payments/checkout/${paymentId}/processing`,
  );
}
