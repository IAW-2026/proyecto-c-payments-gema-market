import { getRequiredBaseUrl } from "@/app/(Logica)/integrations/env";
import { postJson } from "@/app/(Logica)/integrations/http-json";
import type {
  OkResponse,
  ReleaseQuoteRequest,
  ReserveQuoteRequest,
  ReserveQuoteResponse,
} from "@/app/(Logica)/types/external-apis.types";

function baseUrl(): string {
  return getRequiredBaseUrl("SHIPPING_APP_URL");
}

export async function reserveQuote(
  payload: ReserveQuoteRequest,
): Promise<ReserveQuoteResponse> {
  return postJson({
    baseUrl: baseUrl(),
    path: `/api/shipping/cotizaciones/reservar`,
    body: payload,
  });
}

export async function releaseQuoteReservation(
  payload: ReleaseQuoteRequest,
): Promise<OkResponse> {
  return postJson({
    baseUrl: baseUrl(),
    path: `/api/shipping/cotizaciones/liberar-reserva`,
    body: payload,
  });
}
