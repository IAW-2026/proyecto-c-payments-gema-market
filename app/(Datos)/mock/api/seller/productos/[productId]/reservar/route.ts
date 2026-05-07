import { NextRequest, NextResponse } from "next/server";
import { findByField, load, save } from "@/app/(Datos)/mock/storage";

type Product = {
  product_id: string;
  status?: string;
  stock?: number;
};

type ProductReservation = {
  order_id: string;
  buyer_id: string;
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

  const product = await findByField<Product>("products", "product_id", productId);
  if (!product) {
    return NextResponse.json(
      { error: `NOT FOUND product_id=${productId}` },
      { status: 404 },
    );
  }

  const status = product.status ?? "active";
  const stock = product.stock ?? 1;
  if (status !== "active" || stock <= 0) {
    return NextResponse.json(
      { error: `CONFLICT product_id=${productId} status=${status}` },
      { status: 409 },
    );
  }

  const reservations = await load<ProductReservation>("product_reservations");
  const existingSame = reservations.find(
    (r) => r.order_id === body.order_id && r.product_id === productId && (r.active ?? true),
  );
  if (existingSame) {
    return NextResponse.json(
      { error: `CONFLICT ya existe una reserva activa order_id=${body.order_id}` },
      { status: 409 },
    );
  }

  const other = reservations.find(
    (r) => r.product_id === productId && (r.active ?? true),
  );
  if (other) {
    return NextResponse.json(
      { error: `CONFLICT el producto ${productId} ya esta reservado` },
      { status: 409 },
    );
  }

  reservations.push({
    order_id: body.order_id,
    buyer_id: body.buyer_id,
    product_id: productId,
    quantity: body.quantity,
    active: true,
    reserved_at: new Date().toISOString(),
  });
  await save("product_reservations", reservations);

  return NextResponse.json({ ok: true }, { status: 200 });
}
