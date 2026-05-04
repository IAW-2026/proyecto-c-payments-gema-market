import { NextRequest, NextResponse } from "next/server";
import type { CreateOrdenDePagoRequest } from "@/app/(Logica)/types/payments.types";
import {
  createOrdenDePago,
  getOrdenesDePago,
  updateOrdenDePagoPreference,
} from "@/app/(Logica)/services/ordenes-de-pago.service";
import { createPreference } from "@/app/(Logica)/services/mercadopago-preference.service";

// ─── Fee de la plataforma ───────────────────────────────────────────

const PLATFORM_FEE_RATE = 0.05; // 5% de comisión

/**
 * POST /api/payments/ordenes-de-pago
 * Crea una nueva orden de pago y su preferencia en Mercado Pago.
 * Consumido por: Buyer App.
 */
export async function POST(request: NextRequest) {
  try {
    const body: CreateOrdenDePagoRequest = await request.json();

    // Validación básica del body
    if (!body.buyer_id || !body.orders?.length || !body.currency) {
      return NextResponse.json(
        { error: "Campos requeridos: buyer_id, orders, currency" },
        { status: 400 },
      );
    }

    // Calcular totales
    const orderItems = body.orders.map((o) => ({
      orderId: o.order_id,
      sellerId: o.seller_id,
      productId: o.product_id,
      quantity: o.quantity,
      amount: o.unit_price * o.quantity + (o.quote?.shipping_price ?? 0),
      quoteId: o.quote?.quote_id,
    }));

    const totalAmount = orderItems.reduce((sum, o) => sum + o.amount, 0);
    const fee = Math.round(totalAmount * PLATFORM_FEE_RATE * 100) / 100;

    // 1. Persistir la orden de pago (sin preferencia aún, necesitamos el ID real)
    const orden = await createOrdenDePago({
      buyerId: body.buyer_id,
      orders: orderItems,
      totalAmount,
      fee,
      currency: body.currency,
    });

    // 2. Crear preferencia en Mercado Pago con el ID real de la orden
    const preferenceResult = await createPreference({
      paymentId: orden.id,
      items: orderItems,
      totalAmount,
      currency: body.currency,
    });

    // 3. Vincular la preferencia a la orden
    await updateOrdenDePagoPreference(orden.id, preferenceResult.preferenceId);

    // 4. Responder con el contrato del API
    return NextResponse.json(
      {
        payment_id: orden.id,
        checkout_url: `/payments/checkout/${orden.id}/methods`,
        status: orden.status,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Error al crear orden de pago:", error);
    return NextResponse.json(
      { error: "Error interno al crear la orden de pago." },
      { status: 500 },
    );
  }
}

/**
 * GET /api/payments/ordenes-de-pago
 * Lista las órdenes de pago (uso interno / admin).
 */
export async function GET() {
  try {
    const ordenes = await getOrdenesDePago();

    const items = ordenes.map((o) => ({
      payment_id: o.id,
      buyer_id: o.buyerId,
      orders: o.orders.map((oi) => ({
        order_id: oi.orderId,
        seller_id: oi.sellerId,
        product_id: oi.productId,
        quote_id: oi.quoteId,
        amount: oi.amount,
      })),
      total_amount: o.totalAmount,
      currency: o.currency,
      status: o.status,
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
