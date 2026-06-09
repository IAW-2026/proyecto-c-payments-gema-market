import "server-only";

import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { isFinalApproved, isFinalFailed, isPendingStatus } from "@/app/lib/payment-status";
import { isAdminPaymentsUser } from "@/app/lib/auth-utils";

export { isFinalApproved, isFinalFailed, isPendingStatus };

/**
 * Verifica que el usuario actual sea duenio de la orden o admin.
 * Compara contra el user.id de Clerk (clerkUserId) en vez del ID interno,
 * porque buyerId se persiste con el Clerk ID que envía Buyer App.
 */
export async function ensurePaymentOwnership(
  orden: { buyerId: string },
  redirectTo = "/payments/history?page=1",
) {
  const user = await currentUser();
  if (isAdminPaymentsUser(user)) return;

  if (!user?.id || orden.buyerId !== user.id) {
    redirect(redirectTo);
  }
}
