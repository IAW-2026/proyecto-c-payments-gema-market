import type { OrderItem } from "@/app/(Logica)/types/payments.types";

export interface CheckoutItem {
  productName: string;
  quantity: number;
  unitPrice: number;
  shippingPrice: number;
}

export function mapCheckoutItems(orders: OrderItem[]): {
  items: CheckoutItem[];
  totalShipping: number;
} {
  const upFallback = (up: number | undefined, qty: number, amt: number) =>
    up ?? (qty > 0 ? amt / qty : 0);

  const items = orders.map((o) => {
    const up = upFallback(o.unitPrice, o.quantity, o.amount);
    const sp = up > 0 ? o.amount - up * o.quantity : 0;
    return {
      productName: o.productName || "Producto",
      quantity: o.quantity,
      unitPrice: up,
      shippingPrice: sp,
    };
  });

  const totalShipping = items.reduce((sum, i) => sum + i.shippingPrice, 0);

  return { items, totalShipping };
}
