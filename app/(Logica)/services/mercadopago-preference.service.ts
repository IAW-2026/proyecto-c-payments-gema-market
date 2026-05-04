/**
 * Servicio de Preferencias de Mercado Pago.
 *
 * Encapsula la creación de preferencias en MP para el Wallet Brick.
 * Single Responsibility: solo interactúa con la API de preferencias de MP.
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
  const mpItems = items.map((item) => ({
    id: item.orderId,
    title: `Orden ${item.orderId}`,
    quantity: item.quantity,
    unit_price: item.amount / item.quantity,
    currency_id: currency,
  }));

  const result = await preference.create({
    body: {
      purpose: "wallet_purchase",
      items: mpItems,
      external_reference: paymentId,
      back_urls: {
        success: `${process.env.APP_URL}/api/payments/callback/mercadopago`,
        failure: `${process.env.APP_URL}/api/payments/callback/mercadopago`,
        pending: `${process.env.APP_URL}/api/payments/callback/mercadopago`,
      },
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
