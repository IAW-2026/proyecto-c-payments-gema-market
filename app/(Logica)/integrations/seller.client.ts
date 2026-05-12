import { getRequiredBaseUrl } from "@/app/(Logica)/integrations/env";
import { postJson } from "@/app/(Logica)/integrations/http-json";
import type {
  OkResponse,
  PaymentConfirmedSellerRequest,
  ReleaseProductReservationRequest,
  ReserveProductRequest,
} from "@/app/(Logica)/types/external-apis.types";

function baseUrl(): string {
  return getRequiredBaseUrl("SELLER_APP_URL");
}

/**
 * Reserva un producto en Seller.
 */
export async function reserveProduct(
  productId: string,
  payload: ReserveProductRequest,
): Promise<OkResponse> {
  return postJson({
    baseUrl: baseUrl(),
    path: `/api/seller/productos/${productId}/reservar`,
    body: payload,
  });
}

/**
 * Libera una reserva de producto en Seller.
 */
export async function releaseProductReservation(
  productId: string,
  payload: ReleaseProductReservationRequest,
): Promise<OkResponse> {
  return postJson({
    baseUrl: baseUrl(),
    path: `/api/seller/productos/${productId}/liberar-reserva`,
    body: payload,
  });
}

/**
 * Notifica a Seller un pago aprobado.
 */
export async function notifySellerPaymentConfirmed(
  paymentId: string,
  payload: PaymentConfirmedSellerRequest,
): Promise<OkResponse> {
  return postJson({
    baseUrl: baseUrl(),
    path: `/api/seller/pagos/${paymentId}/confirmado`,
    body: payload,
  });
}
