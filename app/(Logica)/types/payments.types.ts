/**
 * Tipos compartidos para la Payments App.
 * Alineados con el schema de Prisma y los contratos de API (docs/apis.md).
 * Convencion: snake_case en JSON de API, camelCase en codigo TS interno.
 *
 * Nota: OrdenDePago y Transaccion usan los tipos inferidos de Prisma directamente.
 * Solo se definen aqui tipos que no existen en el schema (enums de dominio,
 * estructuras JSONB, requests/responses de API).
 */

// ─── Enums ──────────────────────────────────────────────────────────

export type PaymentStatus =
  | "pending"
  | "in_process"
  | "approved"
  | "rejected"
  | "cancelled"
  | "refunded"
  | "charged_back"
  | "in_mediation";


// ─── Entidades de dominio ───────────────────────────────────────────

/** Detalle de cada orden individual dentro de una orden de pago agrupada */
export interface OrderItem {
  orderId: string;
  sellerId: string;
  productId: string;
  quoteId?: string;
  amount: number;
  quantity: number;
}


// ─── Request bodies (API entrante) ─────────────────────────────────

/** Body para POST /api/payments/ordenes-de-pago */
export interface CreateOrdenDePagoRequest {
  buyer_id: string;
  orders: {
    order_id: string;
    seller_id: string;
    product_id: string;
    quantity: number;
    unit_price: number;
    quote?: {
      quote_id: string;
      shipping_price: number;
    };
  }[];
  currency: string;
  return_url: string;
}



// ─── Response shapes (API saliente) ─────────────────────────────────

/** Respuesta al crear una orden de pago */
export interface CreateOrdenDePagoResponse {
  payment_id: string;
  checkout_url: string;
  status: PaymentStatus;
}

/** Respuesta al consultar una orden de pago */
export interface GetOrdenDePagoResponse {
  payment_id: string;
  buyer_id: string;
  orders: {
    order_id: string;
    seller_id: string;
    product_id: string;
    quote_id?: string;
    amount: number;
  }[];
  total_amount: number;
  currency: string;
  status: PaymentStatus;
  mp_payment_id?: string | null;
  mp_status_detail?: string | null;
  created_at: string;
  paid_at?: string | null;
}
