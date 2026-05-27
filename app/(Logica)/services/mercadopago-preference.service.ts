/**
 * Servicio de Preferencias de Mercado Pago.
 *
 * Encapsula la creación de preferencias en MP para el Wallet Brick.
 */

import { Preference } from "mercadopago";
import mercadoPagoClient from "@/app/lib/mercadopago";
import type { OrderItem } from "@/app/(Logica)/types/payments.types";
import { round2 } from "@/app/lib/util";

export interface CreatePreferenceParams {
  paymentId: string;
  items: OrderItem[];
  totalAmount: number;
  currency: string;
}

export interface PreferenceResult {
  preferenceId: string;
  initPoint: string;
}

const preference = new Preference(mercadoPagoClient);

/**
 * Crea una preferencia de Mercado Pago para el Wallet Brick.
 * @param params - Datos de la orden de pago.
 * @returns ID de preferencia e init_point.
 */
export async function createPreference(
  params: CreatePreferenceParams,
): Promise<PreferenceResult> {
  const { paymentId, items, currency } = params;

  let appUrl = process.env.APP_URL || "http://localhost:3000";
  appUrl = appUrl.replace(/\/$/, "");
  if (!appUrl.startsWith("http://") && !appUrl.startsWith("https://")) {
    appUrl = appUrl.includes("localhost") ? `http://${appUrl}` : `https://${appUrl}`;
  }

  const brandImageUrl = `${appUrl}/favicon.ico`;

  const mpItems: {
    id: string;
    title: string;
    description?: string;
    picture_url?: string;
    quantity: number;
    unit_price: number;
    currency_id: string;
  }[] = [];

  let shippingCost = 0;

  for (const item of items) {
    const unitPrice = item.unitPrice ?? (item.quantity > 0 ? item.amount / item.quantity : 0);
    const itemShipping = round2(item.amount - unitPrice * item.quantity);

    shippingCost = round2(shippingCost + Math.max(itemShipping, 0));

    mpItems.push({
      id: item.orderId,
      title: `UniHousing · ${item.productName || "Producto"}`,
      description: `Cantidad: ${item.quantity}`,
      picture_url: brandImageUrl,
      quantity: item.quantity,
      unit_price: unitPrice,
      currency_id: currency,
    });
  }

  const result = await preference.create({
    body: {
      purpose: "wallet_purchase",
      items: mpItems,
      external_reference: paymentId,
      ...(shippingCost > 0
        ? {
            shipments: {
              cost: shippingCost,
              mode: "not_specified",
            },
          }
        : {}),

      back_urls: {
        success: `${appUrl}/api/payments/callback/mercadopago`,
        failure: `${appUrl}/api/payments/callback/mercadopago`,
        pending: `${appUrl}/api/payments/callback/mercadopago`,
      },
      statement_descriptor:"Unihousing",
      notification_url: `${appUrl}/api/payments/webhooks/mercadopago`,
      auto_return: "approved",
      metadata: {
        payment_id: paymentId,
      },
    },
  });

  if (!result.id || !result.init_point) {
    throw new Error("No se pudo crear la preferencia en Mercado Pago.");
  }

  return {
    preferenceId: result.id,
    initPoint: result.init_point,
  };
}
