import { NextRequest, NextResponse } from "next/server";
import { validateApiKey } from "@/app/(Logica)/integrations/api-key";

/**
 * Mock: reserva cotizacion en Shipping.
 */
export async function POST(request: NextRequest) {
  if (!validateApiKey(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: { quote_id?: string; order_id?: string };
  try {
    body = (await request.json()) as typeof body;
  } catch {
    return NextResponse.json({ error: "Bad Request" }, { status: 400 });
  }

  if (!body.quote_id || !body.order_id) {
    return NextResponse.json(
      { error: "Campos requeridos: quote_id, order_id" },
      { status: 400 },
    );
  }

  const reservedUntil = new Date(Date.now() + 30 * 60 * 1000).toISOString();
  console.log("Simulando reserva exitosa en Shipping App:", {
    ...body,
    reserved_until: reservedUntil,
  });

  return NextResponse.json(
    { ok: true, reserved_until: reservedUntil },
    { status: 200 },
  );
}
