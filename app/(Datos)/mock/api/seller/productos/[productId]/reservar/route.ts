import { NextRequest, NextResponse } from "next/server";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ productId: string }> },
) {
  const { productId } = await params;

  let body: {
    order_id?: string;
    buyer_id?: string;
    product_id?: string;
    quantity?: number;
  };

  try {
    body = (await request.json()) as typeof body;
  } catch {
    return NextResponse.json({ error: "Bad Request" }, { status: 400 });
  }

  if (!body.order_id || !body.buyer_id || !body.quantity) {
    return NextResponse.json(
      { error: "Campos requeridos: order_id, buyer_id, quantity" },
      { status: 400 },
    );
  }

  console.log("Simulando reserva exitosa en Seller App:", {
    product_id: productId,
    ...body,
  });

  return NextResponse.json({ ok: true }, { status: 200 });
}
