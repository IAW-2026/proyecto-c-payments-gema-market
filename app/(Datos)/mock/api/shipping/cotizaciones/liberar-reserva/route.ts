import { NextRequest, NextResponse } from "next/server";
import { load, save } from "@/app/(Datos)/mock/storage";

type Quote = {
  quote_id: string;
  status?: "available" | "reserved";
  reserved_for_order_id?: string | null;
  reserved_until?: string | null;
};

export async function POST(request: NextRequest) {
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

  const quotes = await load<Quote>("quotes");
  const idx = quotes.findIndex((q) => q.quote_id === body.quote_id);
  if (idx === -1) {
    return NextResponse.json(
      { error: `NOT FOUND quote_id=${body.quote_id}` },
      { status: 404 },
    );
  }

  const quote = quotes[idx];
  if (quote.reserved_for_order_id !== body.order_id) {
    return NextResponse.json(
      {
        error: `NOT FOUND no hay reserva activa quote_id=${body.quote_id} order_id=${body.order_id}`,
      },
      { status: 404 },
    );
  }

  quotes[idx] = {
    ...quote,
    status: "available",
    reserved_for_order_id: null,
    reserved_until: null,
  };
  await save("quotes", quotes);

  return NextResponse.json({ ok: true }, { status: 200 });
}
