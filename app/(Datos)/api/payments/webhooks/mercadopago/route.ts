import { NextRequest, NextResponse } from "next/server";
import { Payment } from "mercadopago";
import mercadoPagoClient from "@/app/lib/mercadopago";
import { updateOrdenDePagoStatus } from "@/app/(Logica)/services/ordenes-de-pago.service";
import prisma from "@/app/lib/prisma";
import { generateUlid } from "@/app/lib/ulid";
import type { PaymentStatus } from "@/app/(Logica)/types/payments.types";

const paymentApi = new Payment(mercadoPagoClient);

/**
 * POST /api/payments/webhooks/mercadopago
 * Recibe notificaciones IPN/Webhook de Mercado Pago.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Solo procesar notificaciones de tipo "payment"
    if (body.type !== "payment" || !body.data?.id) {
      return NextResponse.json({ received: true }, { status: 200 });
    }

    const mpPaymentId = String(body.data.id);

    // Consultar el estado real del pago en Mercado Pago
    const mpPayment = await paymentApi.get({ id: mpPaymentId });

    if (!mpPayment || !mpPayment.external_reference) {
      console.warn("Webhook: pago sin external_reference:", mpPaymentId);
      return NextResponse.json({ received: true }, { status: 200 });
    }

    const paymentId = mpPayment.external_reference;

    // Mapear status de MP a status interno
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

    // Actualizar la orden de pago en BD
    await updateOrdenDePagoStatus({
      paymentId,
      status: internalStatus,
      mpPaymentId,
      mpStatusDetail: mpPayment.status_detail ?? undefined,
      paidAt: internalStatus === "approved" ? new Date() : undefined,
    });

    // Registrar la transacción (evento)
    await prisma.transaccion.create({
      data: {
        id: generateUlid("txn"),
        paymentId,
        eventType: body.action ?? body.type,
        payloadJson: body,
      },
    });

    return NextResponse.json({ received: true }, { status: 200 });
  } catch (error) {
    console.error("Error procesando webhook de MP:", error);
    // MP espera un 200 aunque haya error, para no reintentar
    return NextResponse.json({ received: true }, { status: 200 });
  }
}
