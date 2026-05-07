import { NextRequest, NextResponse } from "next/server";
import { load, save } from "@/app/(Datos)/mock/storage";

type Quote = {
  quote_id: string;
  status?: "available" | "reserved";
  reserved_for_order_id?: string | null;
  valid_until?: string | null;
  reserved_until?: string | null;
};

function parseIso(value: string | null | undefined): Date | null {
  if (!value) return null;
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? null : d;
}

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
  const validUntil = parseIso(quote.valid_until);
  if (validUntil && validUntil < new Date()) {
    return NextResponse.json(
      { error: `GONE quote_id=${body.quote_id}` },
      { status: 410 },
    );
  }

  if (
    quote.status === "reserved" &&
    quote.reserved_for_order_id &&
    quote.reserved_for_order_id !== body.order_id
  ) {
    return NextResponse.json(
      { error: `CONFLICT quote_id=${body.quote_id} ya reservada` },
      { status: 409 },
    );
  }

  const reservedUntil = new Date(Date.now() + 30 * 60 * 1000).toISOString();
  quotes[idx] = {
    ...quote,
    status: "reserved",
    reserved_for_order_id: body.order_id,
    reserved_until: reservedUntil,
  };
  await save("quotes", quotes);

  return NextResponse.json(
    { ok: true, reserved_until: reservedUntil },
    { status: 200 },
  );
}
