import { NextRequest, NextResponse } from "next/server";
import { validateApiKey } from "@/app/(Logica)/integrations/api-key";

/**
 * Mock: libera reserva de cotizacion en Shipping.
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

  console.log("Simulando liberación exitosa en Shipping App:", {
    ...body,
  });

  return NextResponse.json({ ok: true }, { status: 200 });
}
