import { NextRequest, NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import {
  deleteOrdenDePago,
  getOrdenDePagoById,
} from "@/app/(Logica)/services/ordenes-de-pago.service";
import type { GetOrdenDePagoResponse } from "@/app/(Logica)/types/payments.types";
import { validateApiKey, apiKeyResponse } from "@/app/(Logica)/integrations/api-key";

function authCheck(request: NextRequest): NextResponse | null {
  if (!validateApiKey(request)) return apiKeyResponse();
  return null;
}

/**
 * GET /api/payments/ordenes-de-pago/:paymentId
 * Consulta el estado actual de una orden de pago (consumido por Buyer, Seller, Control Plane).
 *
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ paymentId: string }> },
) {
  const auth = authCheck(request);
  if (auth) return auth;
  const { paymentId } = await params;

  try {
    const ordenDePago = await getOrdenDePagoById(paymentId);

    if (!ordenDePago) {
      return NextResponse.json(
        { error: "Orden de pago no encontrada." },
        { status: 404 },
      );
    }

    const response: GetOrdenDePagoResponse = {
      payment_id: ordenDePago.id,
      buyer_id: ordenDePago.buyerId,
      orders: ordenDePago.orders.map((o) => ({
        order_id: o.orderId,
        seller_id: o.sellerId,
        product_id: o.productId,
        product_name: o.productName,
        quantity: o.quantity,
        quote_id: o.quoteId,
        amount: o.amount,
      })),
      total_amount: Number(ordenDePago.totalAmount),
      currency: ordenDePago.currency,
      status: ordenDePago.status,
      mp_payment_id: ordenDePago.mpPaymentId,
      mp_status_detail: ordenDePago.mpStatusDetail,
      created_at: ordenDePago.createdAt.toISOString(),
      paid_at: ordenDePago.paidAt?.toISOString() ?? null,
    };

    return NextResponse.json(response, { status: 200 });
  } catch {
    return NextResponse.json(
      { error: "Error al obtener la orden de pago." },
      { status: 500 },
    );
  }
}

/**
 * DELETE /api/payments/ordenes-de-pago/:paymentId
 * Elimina una orden de pago (solo admin).
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ paymentId: string }> },
) {
  const auth = authCheck(request);
  if (auth) return auth;
  const { paymentId } = await params;

  try {
    const user = await currentUser();
    const role = user?.publicMetadata?.role;

    if (role !== "admin") {
      return NextResponse.json(
        { error: "No autorizado para eliminar ordenes de pago." },
        { status: 403 },
      );
    }

    await deleteOrdenDePago(paymentId);

    return NextResponse.json({ deleted: true, payment_id: paymentId }, { status: 200 });
  } catch {
    return NextResponse.json(
      { error: "Error al eliminar la orden de pago." },
      { status: 500 },
    );
  }
}
