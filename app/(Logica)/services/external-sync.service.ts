/**
 * Orquestacion de side-effects hacia Buyer/Seller/Shipping.
 *
 * - Reservas en creacion de pago
 * - Liberacion en caso de fallo
 * - Notificaciones al aprobar/rechazar
 */

import type { OrderItem, PaymentStatus } from "@/app/(Logica)/types/payments.types";
import type { OrdenDePago } from "@/app/(Logica)/services/ordenes-de-pago.service";
import {
  notifyBuyerPaymentConfirmed,
  notifyBuyerPaymentRejected,
} from "@/app/(Logica)/integrations/buyer.client";
import {
  notifySellerPaymentConfirmed,
  releaseProductReservation,
  reserveProduct,
} from "@/app/(Logica)/integrations/seller.client";
import {
  releaseQuoteReservation,
  reserveQuote,
} from "@/app/(Logica)/integrations/shipping.client";

export type ReservationOrder = Pick<
  OrderItem,
  "orderId" | "productId" | "quantity" | "quoteId" | "amount"
>;

function round2(value: number): number {
  return Math.round(value * 100) / 100;
}

function splitFee(totalFee: number, orders: ReservationOrder[]): number[] {
  if (!orders.length) return [];
  const totalAmount = orders.reduce((s, o) => s + (o.amount ?? 0), 0);
  if (totalAmount <= 0) {
    const base = round2(totalFee / orders.length);
    const fees = orders.map(() => base);
    fees[fees.length - 1] = round2(
      totalFee - fees.slice(0, -1).reduce((s, f) => s + f, 0),
    );
    return fees;
  }

  const fees = orders.map((o, idx) => {
    if (idx === orders.length - 1) return 0;
    return round2((totalFee * (o.amount ?? 0)) / totalAmount);
  });
  fees[fees.length - 1] = round2(totalFee - fees.reduce((s, f) => s + f, 0));
  return fees;
}

export async function reserveExternalResources(params: {
  buyerId: string;
  orders: ReservationOrder[];
}): Promise<void> {
  try {
    for (const o of params.orders) {
      if (o.quoteId) {
        await reserveQuote({ quote_id: o.quoteId, order_id: o.orderId });
      }
      await reserveProduct(o.productId, {
        order_id: o.orderId,
        buyer_id: params.buyerId,
        product_id: o.productId,
        quantity: o.quantity,
      });
    }
  } catch (err) {
    await releaseExternalResources({ orders: params.orders });
    throw err;
  }
}

export async function releaseExternalResources(params: {
  orders: ReservationOrder[];
}): Promise<void> {
  // Best-effort + idempotente: ignorar 404 y cualquier error de red.
  await Promise.all(
    params.orders.map(async (o) => {
      if (o.quoteId) {
        try {
          await releaseQuoteReservation({ quote_id: o.quoteId, order_id: o.orderId });
        } catch {
          // ignore
        }
      }

      try {
        await releaseProductReservation(o.productId, {
          order_id: o.orderId,
          product_id: o.productId,
          quantity: o.quantity,
        });
      } catch {
        // ignore
      }
    }),
  );
}

export async function notifyApproved(params: {
  orden: OrdenDePago;
}): Promise<void> {
  const { orden } = params;
  const paidAtIso = orden.paidAt?.toISOString() ?? new Date().toISOString();
  const mpPaymentId = orden.mpPaymentId ?? "";

  const reservationOrders: ReservationOrder[] = (orden.orders ?? []).map((o) => ({
    orderId: o.orderId,
    productId: o.productId,
    quantity: o.quantity,
    quoteId: o.quoteId,
    amount: o.amount,
  }));

  const feeTotal = Number(orden.fee);
  const fees = splitFee(feeTotal, reservationOrders);

  // Best-effort: no romper el webhook si alguna notificacion falla.
  await Promise.all([
    (async () => {
      try {
        await notifyBuyerPaymentConfirmed(orden.id, {
          payment_id: orden.id,
          orders: reservationOrders.map((o) => ({
            order_id: o.orderId,
            mp_payment_id: mpPaymentId,
            status: "approved",
            amount: round2(o.amount ?? 0),
            currency: orden.currency,
            paid_at: paidAtIso,
          })),
        });
      } catch (e) {
        console.warn("Buyer notify approved failed", e);
      }
    })(),
    (async () => {
      try {
        await notifySellerPaymentConfirmed(orden.id, {
          payment_id: orden.id,
          orders: reservationOrders.map((o, idx) => ({
            order_id: o.orderId,
            product_id: o.productId,
            quote_id: o.quoteId ?? "",
            amount: round2(o.amount ?? 0),
            fee: fees[idx] ?? 0,
            currency: orden.currency,
            paid_at: paidAtIso,
          })),
        });
      } catch (e) {
        console.warn("Seller notify approved failed", e);
      }
    })(),
  ]);
}

export async function notifyRejected(params: {
  orden: OrdenDePago;
}): Promise<void> {
  const { orden } = params;
  const reason = orden.mpStatusDetail ?? undefined;
  const status: PaymentStatus = orden.status;

  const reservationOrders: ReservationOrder[] = (orden.orders ?? []).map((o) => ({
    orderId: o.orderId,
    productId: o.productId,
    quantity: o.quantity,
    quoteId: o.quoteId,
    amount: o.amount,
  }));

  try {
    await notifyBuyerPaymentRejected(orden.id, {
      payment_id: orden.id,
      orders: reservationOrders.map((o) => ({
        order_id: o.orderId,
        status: status === "cancelled" ? "cancelled" : "rejected",
        ...(reason ? { reason } : {}),
      })),
    });
  } catch (e) {
    console.warn("Buyer notify rejected failed", e);
  }

  await releaseExternalResources({ orders: reservationOrders });
}
