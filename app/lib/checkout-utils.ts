import "server-only";

import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { getUsuarioByClerkUserId } from "@/app/(Logica)/services/usuario-sync.service";
import { isFinalApproved, isFinalFailed, isPendingStatus } from "@/app/lib/payment-status";
import { isAdminPaymentsUser } from "@/app/lib/auth-utils";

export { isFinalApproved, isFinalFailed, isPendingStatus };

export async function ensurePaymentOwnership(
  orden: { buyerId: string },
  redirectTo = "/payments/history",
) {
  const user = await currentUser();
  if (isAdminPaymentsUser(user)) return;

  const usuario = user?.id ? await getUsuarioByClerkUserId(user.id) : null;
  const buyerId = usuario?.id ?? null;

  if (!buyerId || orden.buyerId !== buyerId) {
    redirect(redirectTo);
  }
}
