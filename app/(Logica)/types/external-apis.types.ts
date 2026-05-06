/**
 * Contratos de APIs externas (Buyer/Seller/Shipping) consumidas por Payments.
 * Fuente: docs/apis.md
 * Convencion: snake_case.
 */

export type OkResponse = { ok: true };

// ------------------------------
// Seller App 
// ------------------------------

export type ReserveProductRequest = {
  order_id: string;
  buyer_id: string;
  product_id: string;
  quantity: number;
};

export type ReleaseProductReservationRequest = {
  order_id: string;
  product_id: string;
  quantity: number;
};

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

// ------------------------------
// Buyer App 
// ------------------------------

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

export type PaymentRejectedBuyerRequest = {
  payment_id: string;
  orders: Array<{
    order_id: string;
    status: "rejected" | "cancelled";
    reason?: string;
  }>;
};

// ------------------------------
// Shipping App 
// ------------------------------

export type ReserveQuoteRequest = {
  quote_id: string;
  order_id: string;
};

export type ReserveQuoteResponse = {
  ok: true;
  reserved_until: string;
};

export type ReleaseQuoteRequest = {
  quote_id: string;
  order_id: string;
};
