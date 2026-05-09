import { NextRequest, NextResponse } from "next/server";
import { validateApiKey } from "@/app/(Logica)/integrations/api-key";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ productId: string }> },
) {
  const { productId } = await params;

  if (!validateApiKey(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: {
    order_id?: string;
    product_id?: string;
    quantity?: number;
  };

  try {
    body = (await request.json()) as typeof body;
  } catch {
    return NextResponse.json({ error: "Bad Request" }, { status: 400 });
  }

  if (!body.order_id) {
    return NextResponse.json(
      { error: "Campos requeridos: order_id" },
      { status: 400 },
    );
  }

  console.log("Simulando liberación exitosa en Seller App:", {
    product_id: productId,
    ...body,
  });

  return NextResponse.json({ ok: true }, { status: 200 });
}