/**
 * Servicio de Pagos con Tarjeta — Mercado Pago.
 *
 * Encapsula la creación de pagos mediante el SDK backend de MP.
 * Recibe el formData del CardPayment Brick (token, payment_method, etc.).
 * Single Responsibility: solo procesa pagos con tarjeta vía MP.
 */

import { Payment } from "mercadopago";
import mercadoPagoClient from "@/app/lib/mercadopago";

// ─── Tipos ──────────────────────────────────────────────────────────

export interface CardPaymentResult {
  mpPaymentId: string;
  status: string;
  statusDetail: string;
}

// ─── Servicio ───────────────────────────────────────────────────────

const payment = new Payment(mercadoPagoClient);

/**
 * Procesa un pago con tarjeta en Mercado Pago.
 *
 * El CardPayment Brick envía un formData con la estructura:
 * { token, issuer_id, payment_method_id, transaction_amount,
 *   installments, payer: { email, identification? } }
 *
 * @param formData - Datos del CardPayment Brick (any por flexibilidad del Brick).
 * @param paymentId - ID interno de la orden de pago (external_reference).
 * @returns Resultado del pago de MP.
 */
export async function processCardPayment(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  formData: any,
  paymentId: string
): Promise<CardPaymentResult> {
  // Construir el body del pago con los campos que envía el Brick
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const paymentBody: any = {
    token: formData.token,
    payment_method_id: formData.payment_method_id,
    transaction_amount: Number(formData.transaction_amount),
    installments: Number(formData.installments),
    payer: {
      email: formData.payer?.email,
    },
    external_reference: paymentId,
    description: `Pago UniHousing - ${paymentId}`,
  };

  // Agregar issuer_id solo si viene (no todos los métodos lo requieren)
  if (formData.issuer_id) {
    paymentBody.issuer_id = Number(formData.issuer_id);
  }

  // Agregar identification solo si viene completa
  if (formData.payer?.identification?.number) {
    paymentBody.payer.identification = {
      type: formData.payer.identification.type,
      number: formData.payer.identification.number,
    };
  }

  console.log("[MP Card Payment] Enviando a MP:", JSON.stringify(paymentBody, null, 2));

  
  paymentBody.statement_descriptor = "UNIHOUSING";

  try {
  const result = await payment.create({
    body: paymentBody,
    requestOptions: {
      idempotencyKey: `card-${paymentId}-${Date.now()}`,
    },
  });

  console.log("[MP Card Payment] Respuesta de MP:", {
    id: result.id,
    status: result.status,
    status_detail: result.status_detail,
  });

  return {
    mpPaymentId: String(result.id ?? ""),
    status: result.status ?? "unknown",
    statusDetail: result.status_detail ?? "",
  };
  } catch (err: unknown) {
    console.error("=== ERROR COMPLETO DE MERCADO PAGO ===");
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const mpErr = err as any;
    console.error("Message:", mpErr?.message);
    console.error("Status:", mpErr?.status);
    console.error("Cause:", JSON.stringify(mpErr?.cause, null, 2));
    console.error("======================================");
    throw err;
  }
}
