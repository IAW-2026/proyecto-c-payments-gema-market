import { NextRequest, NextResponse } from "next/server";
import { append } from "@/app/(Datos)/mock/storage";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ paymentId: string }> },
) {
  const { paymentId } = await params;

  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: "Bad Request" }, { status: 400 });
  }

  await append("buyer_notifications", {
    payment_id: paymentId,
    event: "pago-rechazado",
    received_at: new Date().toISOString(),
    ...body,
  });

  return NextResponse.json({ ok: true }, { status: 200 });
}
