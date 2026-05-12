import type { PaymentStatus } from "@/app/(Logica)/types/payments.types";

/**
 * Indica si el estado es aprobado final.
 */
export function isFinalApproved(status: PaymentStatus): boolean {
  return status === "approved";
}

/**
 * Indica si el estado es un fallo final.
 */
export function isFinalFailed(status: PaymentStatus): boolean {
  return (
    status === "rejected" ||
    status === "cancelled" ||
    status === "refunded" ||
    status === "charged_back"
  );
}

/**
 * Indica si el estado esta pendiente de definicion final.
 */
export function isPendingStatus(status: PaymentStatus): boolean {
  return (
    status === "pending" ||
    status === "in_process" ||
    status === "in_mediation"
  );
}
