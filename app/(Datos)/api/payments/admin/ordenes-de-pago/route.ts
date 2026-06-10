import { NextRequest, NextResponse } from "next/server";
import { validateApiKey, apiKeyResponse } from "@/app/(Logica)/integrations/api-key";
import { getAdminOrdenesPaged } from "@/app/(Logica)/services/ordenes-de-pago.service";
import type { AdminOrdenesDePagoResponse, PaymentStatus } from "@/app/(Logica)/types/payments.types";

function authCheck(request: NextRequest): NextResponse | null {
  if (!validateApiKey(request)) return apiKeyResponse();
  return null;
}

export async function GET(request: NextRequest) {
  const auth = authCheck(request);
  if (auth) return auth;

  try {
    const { searchParams } = new URL(request.url);

    const page = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10));
    const pageSizeRaw = parseInt(searchParams.get("page_size") ?? "20", 10);
    const pageSize = Math.min(Math.max(1, pageSizeRaw), 100);
    const buyerId = searchParams.get("buyer_id") || undefined;
    const sellerId = searchParams.get("seller_id") || undefined;
    const status = searchParams.get("status") || undefined;
    const rawOrder = searchParams.get("order") || "desc";
    const order = rawOrder === "asc" ? "asc" as const : "desc" as const;
    const sortBy = searchParams.get("sort_by") || "created_at";

    const sortByMap: Record<string, string> = {
      created_at: "createdAt",
      total_amount: "totalAmount",
      status: "status",
    };

    const mappedSortBy = sortByMap[sortBy] ?? "createdAt";

    let dateFrom: Date | undefined;
    let dateTo: Date | undefined;

    const dateFromStr = searchParams.get("date_from");
    const dateToStr = searchParams.get("date_to");

    if (dateFromStr) {
      dateFrom = new Date(dateFromStr);
      if (isNaN(dateFrom.getTime())) {
        return NextResponse.json(
          { error: "Formato invalido para 'date_from'. Use ISO 8601." },
          { status: 400 },
        );
      }
    }

    if (dateToStr) {
      dateTo = new Date(dateToStr);
      if (isNaN(dateTo.getTime())) {
        return NextResponse.json(
          { error: "Formato invalido para 'date_to'. Use ISO 8601." },
          { status: 400 },
        );
      }
    }

    const result = await getAdminOrdenesPaged({
      page,
      pageSize,
      buyerId,
      sellerId,
      status,
      dateFrom,
      dateTo,
      sortBy: mappedSortBy,
      order,
    });

    const response: AdminOrdenesDePagoResponse = {
      items: result.rows.map((r) => ({
        payment_id: r.id,
        buyer_id: r.buyerId,
        orders: r.orders.map((o) => ({
          order_id: o.orderId,
          seller_id: o.sellerId,
          product_id: o.productId,
          quote_id: o.quoteId,
          amount: o.amount,
        })),
        total_amount: r.totalAmount,
        currency: r.currency,
        status: r.status as PaymentStatus,
        created_at: r.createdAt.toISOString(),
        paid_at: r.paidAt?.toISOString() ?? null,
      })),
      page,
      page_size: pageSize,
      total: result.total,
      sort_by: sortBy,
      order: rawOrder === "asc" ? "asc" : "desc",
    };

    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    console.error("Error al obtener ordenes admin:", error);
    return NextResponse.json(
      { error: "Error interno al obtener ordenes de pago." },
      { status: 500 },
    );
  }
}
