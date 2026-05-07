import { getRequiredBaseUrl } from "@/app/(Logica)/integrations/env";
import { postJson } from "@/app/(Logica)/integrations/http-json";
import type {
  OkResponse,
  PaymentConfirmedBuyerRequest,
  PaymentRejectedBuyerRequest,
} from "@/app/(Logica)/types/external-apis.types";

function baseUrl(): string {
  return getRequiredBaseUrl("BUYER_APP_URL");
}

export async function notifyBuyerPaymentConfirmed(
  paymentId: string,
  payload: PaymentConfirmedBuyerRequest,
): Promise<OkResponse> {
  return postJson({
    baseUrl: baseUrl(),
    path: `/api/buyer/pagos/${paymentId}/confirmado`,
    body: payload,
  });
}

export async function notifyBuyerPaymentRejected(
  paymentId: string,
  payload: PaymentRejectedBuyerRequest,
): Promise<OkResponse> {
  return postJson({
    baseUrl: baseUrl(),
    path: `/api/buyer/pagos/${paymentId}/rechazado`,
    body: payload,
  });
}
