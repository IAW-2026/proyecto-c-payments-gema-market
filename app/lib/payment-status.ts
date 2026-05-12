import type { PaymentStatus } from "@/app/(Logica)/types/payments.types";

export function isFinalApproved(status: PaymentStatus): boolean {
  return status === "approved";
}

export function isFinalFailed(status: PaymentStatus): boolean {
  return (
    status === "rejected" ||
    status === "cancelled" ||
    status === "refunded" ||
    status === "charged_back"
  );
}

export function isPendingStatus(status: PaymentStatus): boolean {
  return (
    status === "pending" ||
    status === "in_process" ||
    status === "in_mediation"
  );
}
