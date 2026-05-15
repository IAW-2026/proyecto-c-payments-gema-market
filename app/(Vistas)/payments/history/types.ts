export interface HistoryTransactionItem {
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  shippingPrice: number;
}

export interface HistoryTransaction {
  id: string;
  paymentId: string;
  date: string;
  desc: string;
  amount: number;
  method: string;
  status: "ok" | "fail" | "pending";
  items: HistoryTransactionItem[];
  currency: string;
  shippingTotal: number;
  buyerName?: string;
}
