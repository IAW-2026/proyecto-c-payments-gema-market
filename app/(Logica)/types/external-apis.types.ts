/**
 * Contratos de APIs externas (Buyer/Seller/Shipping) consumidas por Payments.
 * Fuente: docs/apis.md
 * Convencion: snake_case.
 */

export type OkResponse = { ok: true };

/**
 * Payload de reserva de producto en Seller.
 */
export type ReserveProductRequest = {
  order_id: string;
  buyer_id: string;
  buyer_name: string;
  product_id: string;
  quantity: number;
};

/**
 * Payload para liberar reserva de producto en Seller.
 */
export type ReleaseProductReservationRequest = {
  order_id: string;
  product_id: string;
  quantity: number;
};

/**
 * Payload para confirmar pago en Seller.
 */
export type PaymentConfirmedSellerRequest = {
  payment_id: string;
  orders: Array<{
    order_id: string;
    product_id: string;
    quote_id: string;
    amount: number;
    fee: number;
    currency: string;
    paid_at: string;
  }>;
};

/**
 * Payload para confirmar pago en Buyer.
 */
export type PaymentConfirmedBuyerRequest = {
  payment_id: string;
  orders: Array<{
    order_id: string;
    mp_payment_id: string;
    status: "approved";
    amount: number;
    currency: string;
    paid_at: string;
  }>;
};

/**
 * Payload para rechazo/cancelacion en Buyer.
 */
export type PaymentRejectedBuyerRequest = {
  payment_id: string;
  orders: Array<{
    order_id: string;
    status: "rejected" | "cancelled";
    reason?: string;
  }>;
};

/**
 * Payload de reserva de cotizacion en Shipping.
 */
export type ReserveQuoteRequest = {
  quote_id: string;
  order_id: string;
};

/**
 * Respuesta de reserva de cotizacion en Shipping.
 */
export type ReserveQuoteResponse = {
  ok: true;
  reserved_until: string;
};

/**
 * Payload para liberar reserva de cotizacion en Shipping.
 */
export type ReleaseQuoteRequest = {
  quote_id: string;
  order_id: string;
};
