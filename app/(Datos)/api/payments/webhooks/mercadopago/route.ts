import { NextRequest, NextResponse } from "next/server";
import { Payment } from "mercadopago";
import mercadoPagoClient from "@/app/lib/mercadopago";
import { updateOrdenDePagoStatus } from "@/app/(Logica)/services/ordenes-de-pago.service";
import { createTransaccion } from "@/app/(Logica)/services/transacciones.service";
import type { PaymentStatus } from "@/app/(Logica)/types/payments.types";

const paymentApi = new Payment(mercadoPagoClient);

/**
 * POST /api/payments/webhooks/mercadopago
 * Recibe notificaciones IPN/Webhook de Mercado Pago.
 */
export async function POST(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const queryTopic = url.searchParams.get("topic") || url.searchParams.get("type");
    const queryId = url.searchParams.get("id") || url.searchParams.get("data.id");

    let body: any = {};
    try {
      const text = await request.text();
      if (text) {
        body = JSON.parse(text);
      }
    } catch (e) {
      // Ignorar error si el body está vacío o no es un JSON válido
    }

    const eventType = body.type || queryTopic;
    const mpPaymentIdRaw = body.data?.id || queryId;

    if (eventType !== "payment" || !mpPaymentIdRaw) {
      return new NextResponse(null, { status: 200 });
    }

    const mpPaymentId = String(mpPaymentIdRaw);

    let mpPayment;
    try {
      mpPayment = await paymentApi.get({ id: mpPaymentId });
    } catch (apiError: any) {
      return new NextResponse(null, { status: 200 });
    }

    if (!mpPayment || !mpPayment.external_reference) {
      return new NextResponse(null, { status: 200 });
    }

    const paymentId = mpPayment.external_reference;

    const statusMap: Record<string, PaymentStatus> = {
      approved: "approved",
      in_process: "in_process",
      rejected: "rejected",
      pending: "pending",
      cancelled: "cancelled",
      refunded: "refunded",
      charged_back: "charged_back",
      in_mediation: "in_mediation",
    };

    const internalStatus: PaymentStatus =
      statusMap[mpPayment.status ?? ""] ?? "pending";

    await updateOrdenDePagoStatus({
      paymentId,
      status: internalStatus,
      mpPaymentId,
      mpStatusDetail: mpPayment.status_detail ?? undefined,
      paidAt: internalStatus === "approved" ? new Date() : undefined,
    });

    const payloadToSave = Object.keys(body).length > 0
      ? body
      : { queryParams: Object.fromEntries(url.searchParams) };

    await createTransaccion({
      paymentId,
      eventType: body.action ?? eventType,
      payloadJson: payloadToSave,
    });

    return new NextResponse(null, { status: 200 });
  } catch (error) {
    return new NextResponse(null, { status: 200 });
  }
}
