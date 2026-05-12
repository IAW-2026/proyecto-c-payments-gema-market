import { NextRequest, NextResponse } from "next/server";
import type {
  CreateOrdenDePagoRequest,
  CreateOrdenDePagoResponse,
  GetOrdenDePagoResponse,
} from "@/app/(Logica)/types/payments.types";
import {
  createOrdenDePago,
  getOrdenesDePago,
  updateOrdenDePagoPreference,
} from "@/app/(Logica)/services/ordenes-de-pago.service";
import { createPreference } from "@/app/(Logica)/services/mercadopago-preference.service";
import { calculateFee } from "@/app/lib/util";
import {
  releaseExternalResources,
  reserveExternalResources,
} from "@/app/(Logica)/services/external-sync.service";
import { validateApiKey, apiKeyResponse } from "@/app/(Logica)/integrations/api-key";

function authCheck(request: NextRequest): NextResponse | null {
  if (!validateApiKey(request)) return apiKeyResponse();
  return null;
}

/**
 * POST /api/payments/ordenes-de-pago
 * Crea una nueva orden de pago y su preferencia en Mercado Pago.
 */
export async function POST(request: NextRequest) {
  const auth = authCheck(request);
  if (auth) return auth;
  let reservationOrders: Array<{
    orderId: string;
    productId: string;
    quantity: number;
    quoteId?: string;
    amount: number;
  }> = [];

  try {
    const body: CreateOrdenDePagoRequest = await request.json();

    if (!body.buyer_id || !body.orders?.length || !body.currency) {
      return NextResponse.json(
        { error: "Campos requeridos: buyer_id, orders, currency" },
        { status: 400 },
      );
    }

    const orderItems = body.orders.map((o) => ({
      orderId: o.order_id,
      sellerId: o.seller_id,
      productId: o.product_id,
      productName: o.product_name,
      unitPrice: o.unit_price,
      quantity: o.quantity,
      amount: o.unit_price * o.quantity + (o.quote?.shipping_price ?? 0),
      quoteId: o.quote?.quote_id,
    }));

    reservationOrders = orderItems.map((o) => ({
      orderId: o.orderId,
      productId: o.productId,
      quantity: o.quantity,
      quoteId: o.quoteId,
      amount: o.amount,
    }));

    const totalAmount = orderItems.reduce((sum, o) => sum + o.amount, 0);
    const fee = calculateFee(totalAmount);

    try {
      await reserveExternalResources({
        buyerId: body.buyer_id,
        buyerName: body.buyer_name,
        orders: reservationOrders,
      });
    } catch (e: unknown) {
      console.error("Error reservando recursos externos:", e);

      const isHttpError =
        typeof e === "object" &&
        e != null &&
        "status" in e &&
        "body" in e &&
        typeof (e as { status?: unknown }).status === "number";

      if (isHttpError) {
        const err = e as { status: number; body?: unknown; message?: string };
        const payload =
          typeof err.body === "object" && err.body != null
            ? err.body
            : { error: err.message ?? "Error reservando recursos externos." };
        return NextResponse.json(payload, { status: err.status });
      }

      return NextResponse.json(
        { 
          error: "Error reservando recursos externos.",
          details: e instanceof Error ? e.message : String(e)
        },
        { status: 500 },
      );
    }

    const orden = await createOrdenDePago({
      buyerId: body.buyer_id,
      orders: orderItems,
      totalAmount,
      fee,
      currency: body.currency,
    });

    const preferenceResult = await createPreference({
      paymentId: orden.id,
      items: orderItems,
      totalAmount,
      currency: body.currency,
    });

    await updateOrdenDePagoPreference(orden.id, preferenceResult.preferenceId);

    const response: CreateOrdenDePagoResponse = {
      payment_id: orden.id,
      checkout_url: `/payments/checkout/${orden.id}/methods`,
      status: orden.status,
    };

    return NextResponse.json(response, { status: 201 });
  } catch (error) {
    console.error("Error al crear orden de pago:", error);

    if (reservationOrders.length) {
      try {
        await releaseExternalResources({ orders: reservationOrders });
      } catch {}
    }

    return NextResponse.json(
      { error: "Error interno al crear la orden de pago." },
      { status: 500 },
    );
  }
}

/**
 * Lista las ordenes de pago (uso interno/admin).
 */
export async function GET(request: NextRequest) {
  const auth = authCheck(request);
  if (auth) return auth;
  try {
    const ordenes = await getOrdenesDePago();

    const items: GetOrdenDePagoResponse[] = ordenes.map((o) => ({
      payment_id: o.id,
      buyer_id: o.buyerId,
      orders: o.orders.map((oi) => ({
        order_id: oi.orderId,
        seller_id: oi.sellerId,
        product_id: oi.productId,
        product_name: oi.productName,
        quantity: oi.quantity,
        quote_id: oi.quoteId,
        amount: oi.amount,
      })),
      total_amount: Number(o.totalAmount),
      currency: o.currency,
      status: o.status,
      mp_payment_id: o.mpPaymentId,
      mp_status_detail: o.mpStatusDetail,
      created_at: o.createdAt.toISOString(),
      paid_at: o.paidAt?.toISOString() ?? null,
    }));

    return NextResponse.json({ items }, { status: 200 });
  } catch (error) {
    console.error("Error al listar órdenes de pago:", error);
    return NextResponse.json(
      { error: "Error interno al listar las órdenes de pago." },
      { status: 500 },
    );
  }
}
