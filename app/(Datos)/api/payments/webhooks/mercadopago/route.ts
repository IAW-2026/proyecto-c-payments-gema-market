import { NextRequest, NextResponse } from "next/server";
import { Payment } from "mercadopago";
import { revalidateTag } from "next/cache";
import mercadoPagoClient from "@/app/lib/mercadopago";
import prisma from "@/app/lib/prisma";
import {
  getOrdenDePagoById,
  parseOrders,
  updateOrdenDePagoStatus,
} from "@/app/(Logica)/services/ordenes-de-pago.service";
import { createTransaccion } from "@/app/(Logica)/services/transacciones.service";
import type { PaymentStatus } from "@/app/(Logica)/types/payments.types";
import {
  notifyApproved,
  notifyRejected,
} from "@/app/(Logica)/services/external-sync.service";

const paymentApi = new Payment(mercadoPagoClient);

/**
 * Recibe notificaciones de Mercado Pago y actualiza la orden.
 */
export async function POST(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const queryTopic = url.searchParams.get("topic") || url.searchParams.get("type");
    const queryId = url.searchParams.get("id") || url.searchParams.get("data.id");

    let body: Record<string, unknown> = {};
    try {
      const text = await request.text();
      if (text) {
        body = JSON.parse(text);
      }
    } catch {}

    const eventType =
      (typeof body.type === "string" ? body.type : null) || queryTopic;
    const mpPaymentIdRaw =
      (typeof body.data === "object" && body.data != null && "id" in body.data
        ? (body.data as { id?: unknown }).id
        : null) || queryId;

    if (eventType !== "payment" || !mpPaymentIdRaw) {
      return new NextResponse(null, { status: 200 });
    }

    const mpPaymentId = String(mpPaymentIdRaw);

    let mpPayment;
    try {
      mpPayment = await paymentApi.get({ id: mpPaymentId });
    } catch {
      return new NextResponse(null, { status: 200 });
    }

    if (!mpPayment || !mpPayment.external_reference) {
      return new NextResponse(null, { status: 200 });
    }

    const paymentId = mpPayment.external_reference;

    const prevOrden = await getOrdenDePagoById(paymentId);
    const prevStatus = prevOrden?.status;

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

    const payloadToSave =
      Object.keys(body).length > 0
        ? body
        : { queryParams: Object.fromEntries(url.searchParams) };

    const action = typeof body.action === "string" ? body.action : undefined;

    // Atomic update with optimistic lock on status — prevents duplicate notifications
    let updatedOrden;
    try {
      const row = await prisma.ordenDePago.update({
        where: {
          id: paymentId,
          status: prevStatus ?? undefined,
        },
        data: {
          status: internalStatus,
          ...(mpPaymentId != null && { mpPaymentId }),
          ...(mpPayment.status_detail != null && { mpStatusDetail: mpPayment.status_detail }),
          ...(internalStatus === "approved" && { paidAt: new Date() }),
        },
      });
      updatedOrden = {
        ...row,
        orders: parseOrders(row.orders),
        status: row.status as PaymentStatus,
      };
    } catch (e) {
      if ((e as { code?: string })?.code === "P2025") {
        // Another webhook already handled this status transition
        await createTransaccion({
          paymentId,
          eventType: action ?? eventType ?? "payment",
          payloadJson: payloadToSave,
        });
        return new NextResponse(null, { status: 200 });
      }
      throw e;
    }

    await createTransaccion({
      paymentId,
      eventType: action ?? eventType ?? "payment",
      payloadJson: payloadToSave,
    });

    if (prevStatus !== internalStatus) {
      if (internalStatus === "approved") {
        await notifyApproved({ orden: updatedOrden });
      }

      if (internalStatus === "rejected" || internalStatus === "cancelled") {
        await notifyRejected({ orden: updatedOrden });
      }
    }

    revalidateTag(`orden-${paymentId}`, 'max')
    revalidateTag(`ordenes-buyer-${updatedOrden.buyerId}`, 'max')
    revalidateTag(`ordenes-count-${updatedOrden.buyerId}`, 'max')
    revalidateTag('ordenes-admin', 'max')
    revalidateTag('ordenes-list-admin', 'max')
    revalidateTag('ordenes-count-all', 'max')
    for (const item of updatedOrden.orders) {
      revalidateTag(`debts-${item.sellerId}`, 'max')
    }

    return new NextResponse(null, { status: 200 });
  } catch {
    return new NextResponse(null, { status: 200 });
  }
}
