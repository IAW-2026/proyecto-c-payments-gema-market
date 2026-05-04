import { NextRequest, NextResponse } from "next/server";
import { processCardPayment } from "@/app/(Logica)/services/mercadopago-payment.service";
import {
  getOrdenDePagoById,
  updateOrdenDePagoStatus,
} from "@/app/(Logica)/services/ordenes-de-pago.service";
import type { PaymentStatus } from "@/app/(Logica)/types/payments.types";

/**
 * POST /api/payments/process-card-payment
 * Endpoint interno para el CardPayment Brick.
 *
 * Recibe el formData del Brick (token, payment_method, etc.) más el payment_id.
 * Procesa el pago en MP y actualiza la orden en BD.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { payment_id, form_data } = body;

    // Validación
    if (!payment_id || !form_data?.token) {
      return NextResponse.json(
        { error: "Campos requeridos: payment_id, form_data (con token)" },
        { status: 400 }
      );
    }

    // Verificar que la orden existe y está pendiente
    const orden = await getOrdenDePagoById(payment_id);
    if (!orden) {
      return NextResponse.json(
        { error: "Orden de pago no encontrada." },
        { status: 404 }
      );
    }
    if (orden.status !== "pending") {
      return NextResponse.json(
        { error: `La orden ya tiene estado: ${orden.status}` },
        { status: 409 }
      );
    }

    // Procesar pago en Mercado Pago
    const mpResult = await processCardPayment(form_data, payment_id);

    // Mapear status de MP a PaymentStatus interno
    const statusMap: Record<string, PaymentStatus> = {
      approved: "approved",
      in_process: "in_process",
      rejected: "rejected",
      pending: "pending",
      cancelled: "cancelled",
    };

    const internalStatus: PaymentStatus =
      statusMap[mpResult.status] ?? "pending";

    // Actualizar la orden en BD
    const updatedOrden = await updateOrdenDePagoStatus({
      paymentId: payment_id,
      status: internalStatus,
      mpPaymentId: mpResult.mpPaymentId,
      mpStatusDetail: mpResult.statusDetail,
      paidAt: internalStatus === "approved" ? new Date() : undefined,
    });

    return NextResponse.json(
      {
        payment_id: updatedOrden.id,
        status: updatedOrden.status,
        mp_payment_id: mpResult.mpPaymentId,
        mp_status_detail: mpResult.statusDetail,
      },
      { status: 200 }
    );
  } catch (error: unknown) {
    console.error("Error al procesar pago con tarjeta:", error);

    // Extraer mensaje de error de MP si está disponible
    const mpError = error as { message?: string; cause?: unknown };
    const errorMessage =
      mpError?.message ?? "Error interno al procesar el pago.";

    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}
