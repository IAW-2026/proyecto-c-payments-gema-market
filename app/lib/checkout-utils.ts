import "server-only";

import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { getUsuarioByClerkUserId } from "@/app/(Logica)/services/usuario-sync.service";
import { isFinalApproved, isFinalFailed, isPendingStatus } from "@/app/lib/payment-status";
import { isAdminPaymentsUser } from "@/app/lib/auth-utils";

export { isFinalApproved, isFinalFailed, isPendingStatus };

/**
 * Verifica que el usuario actual sea duenio de la orden o admin.
 */
export async function ensurePaymentOwnership(
  orden: { buyerId: string },
  redirectTo = "/payments/history?page=1",
) {
  const user = await currentUser();
  if (isAdminPaymentsUser(user)) return;

  const usuario = user?.id ? await getUsuarioByClerkUserId(user.id) : null;
  const buyerId = usuario?.id ?? null;

  if (!buyerId || orden.buyerId !== buyerId) {
    redirect(redirectTo);
  }
}
