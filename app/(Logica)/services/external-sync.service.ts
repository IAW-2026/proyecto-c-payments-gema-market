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
import { round2, splitFee } from "@/app/lib/util";

export type ReservationOrder = Pick<
  OrderItem,
  "orderId" | "productId" | "quantity" | "quoteId" | "amount"
>;


export async function reserveExternalResources(params: {
  buyerId: string;
  buyerName?: string;
  orders: ReservationOrder[];
}): Promise<void> {
  try {
    await Promise.all(
      params.orders.flatMap((o) => {
        const promises = [];
        if (o.quoteId) {
          promises.push(reserveQuote({ quote_id: o.quoteId, order_id: o.orderId }));
        }
        promises.push(
          reserveProduct(o.productId, {
            order_id: o.orderId,
            buyer_id: params.buyerId,
            buyer_name: params.buyerName ?? "",
            product_id: o.productId,
            quantity: o.quantity,
          })
        );
        return promises;
      })
    );
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
    params.orders.flatMap((o) => {
      const promises = [];
      if (o.quoteId) {
        promises.push(
          releaseQuoteReservation({ quote_id: o.quoteId, order_id: o.orderId }).catch(() => {})
        );
      }
      promises.push(
        releaseProductReservation(o.productId, {
          order_id: o.orderId,
          product_id: o.productId,
          quantity: o.quantity,
        }).catch(() => {})
      );
      return promises;
    })
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

  await Promise.all([
    notifyBuyerPaymentRejected(orden.id, {
      payment_id: orden.id,
      orders: reservationOrders.map((o) => ({
        order_id: o.orderId,
        status: status === "cancelled" ? "cancelled" : "rejected",
        ...(reason ? { reason } : {}),
      })),
    }).catch((e) => console.warn("Buyer notify rejected failed", e)),
    releaseExternalResources({ orders: reservationOrders })
  ]);
}
