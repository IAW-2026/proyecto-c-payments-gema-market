import { NextRequest, NextResponse } from "next/server";
import { validateApiKey } from "@/app/(Logica)/integrations/api-key";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ paymentId: string }> },
) {
  const { paymentId } = await params;

  if (!validateApiKey(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: "Bad Request" }, { status: 400 });
  }

  console.log("Notificación recibida en Buyer App (pago rechazado):", {
    payment_id: paymentId,
    event: "pago-rechazado",
    received_at: new Date().toISOString(),
    ...body,
  });

  return NextResponse.json({ ok: true }, { status: 200 });
}