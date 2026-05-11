/**
 * Servicio de Preferencias de Mercado Pago.
 *
 * Encapsula la creación de preferencias en MP para el Wallet Brick.
 */

import { Preference } from "mercadopago";
import mercadoPagoClient from "@/app/lib/mercadopago";
import type { OrderItem } from "@/app/(Logica)/types/payments.types";

// ─── Tipos ──────────────────────────────────────────────────────────

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

// ─── Servicio ───────────────────────────────────────────────────────

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

  // Mapear los items de la orden al formato de MP
  const mpItems: {
    id: string;
    title: string;
    description?: string;
    quantity: number;
    unit_price: number;
    currency_id: string;
  }[] = [];

  for (const item of items) {
    const unitPrice = item.unitPrice ?? (item.quantity > 0 ? item.amount / item.quantity : 0);
    mpItems.push({
      id: item.orderId,
      title: `${item.productName} x${item.quantity}`,
      description: item.productName,
      quantity: item.quantity,
      unit_price: unitPrice,
      currency_id: currency,
    });

    const shippingPrice = item.amount - unitPrice * item.quantity;
    if (shippingPrice > 0) {
      mpItems.push({
        id: `${item.orderId}_shipping`,
        title: "Envío",
        quantity: 1,
        unit_price: shippingPrice,
        currency_id: currency,
      });
    }
  }

  const productSummary = items.map((i) => `${i.quantity}x ${i.productName}`).join(", ");

  // Normalizar APP_URL
  let appUrl = process.env.APP_URL || "http://localhost:3000";
  appUrl = appUrl.replace(/\/$/, ""); // Quitar barra final si la tiene
  if (!appUrl.startsWith("http://") && !appUrl.startsWith("https://")) {
    // Si no tiene protocolo, asumir https salvo que sea localhost
    appUrl = appUrl.includes("localhost") ? `http://${appUrl}` : `https://${appUrl}`;
  }

  const result = await preference.create({
    body: {
      purpose: "wallet_purchase",
      items: mpItems,
      external_reference: paymentId,

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
