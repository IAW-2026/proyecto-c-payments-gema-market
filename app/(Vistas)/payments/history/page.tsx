import { currentUser } from "@clerk/nextjs/server";
import { revalidateTag } from "next/cache";
import { deleteOrderById } from "@/app/(Logica)/services/ordenes-de-pago.service";
import { getUsuarioByClerkUserId } from "@/app/(Logica)/services/usuario-sync.service";
import { isAdminPaymentsUser } from "@/app/lib/auth-utils";
import HistoryShell from "./HistoryShell";
import HistoryListServer from "./HistoryList.server";
import HistorySkeleton from "./HistorySkeleton";
import { Suspense } from "react";




/**
 * Accion server para eliminar una orden.
 */
async function deleteOrdenDePagoAction(paymentId: string) {
  "use server";
  const result = await deleteOrderById(paymentId);
  revalidateTag(`orden-${paymentId}`, 'max')
  revalidateTag(`ordenes-buyer-${result.buyerId}`, 'max')
  revalidateTag(`ordenes-count-${result.buyerId}`, 'max')
  revalidateTag('ordenes-admin', 'max')
  revalidateTag('ordenes-list-admin', 'max')
  revalidateTag('ordenes-count-all', 'max')
}


/**
 * Pagina de historial de pagos.
 */
export default async function HistoryPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; filter?: string }>;
}) {
  const resolvedParams = await searchParams;
  const user = await currentUser();
  const isAdmin = isAdminPaymentsUser(user);

  const usuario = user?.id ? await getUsuarioByClerkUserId(user.id) : null;
  const buyerId = usuario?.id ?? null;
  const displayName =
    user?.fullName ?? user?.primaryEmailAddress?.emailAddress ?? "";
  return (
    <HistoryShell displayName={isAdmin ? "Admin" : displayName} isAdmin={isAdmin}>
      <Suspense fallback={<HistorySkeleton />}>
        <HistoryListServer
          buyerId={buyerId}
          isAdmin={isAdmin}
          searchParams={resolvedParams}
          onDeleteOrden={deleteOrdenDePagoAction}
        />
      </Suspense>
    </HistoryShell>
  );
}
