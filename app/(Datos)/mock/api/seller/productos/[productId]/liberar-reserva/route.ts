import { NextRequest, NextResponse } from "next/server";
import { load, save } from "@/app/(Datos)/mock/storage";

type ProductReservation = {
  order_id: string;
  product_id: string;
  quantity: number;
  active?: boolean;
  reserved_at?: string;
  released_at?: string;
};

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ productId: string }> },
) {
  const { productId } = await params;

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

  const reservations = await load<ProductReservation>("product_reservations");
  const idx = reservations.findIndex(
    (r) => r.order_id === body.order_id && r.product_id === productId && (r.active ?? true),
  );
  if (idx === -1) {
    return NextResponse.json(
      { error: `NOT FOUND no hay reserva activa order_id=${body.order_id} product_id=${productId}` },
      { status: 404 },
    );
  }

  reservations[idx] = {
    ...reservations[idx],
    active: false,
    released_at: new Date().toISOString(),
  };
  await save("product_reservations", reservations);

  return NextResponse.json({ ok: true }, { status: 200 });
}
