import { getOrdenDePagoById } from "@/app/(Logica)/services/ordenes-de-pago.service";
import { currentUser } from "@clerk/nextjs/server";
import { notFound, redirect } from "next/navigation";
import MethodsView from "./MethodsView";
import { getUsuarioByClerkUserId } from "@/app/(Logica)/services/usuario-sync.service";

export default async function MethodsPage({
  params,
}: {
  params: Promise<{ paymentId: string }>;
}) {
  const { paymentId } = await params;
  const orden = await getOrdenDePagoById(paymentId);

  if (!orden) return notFound();

  const user = await currentUser();
  const isAdmin = user?.publicMetadata?.role === "admin";
  const usuario = user?.id ? await getUsuarioByClerkUserId(user.id) : null;
  const buyerId = usuario?.id ?? null;

  if (!isAdmin && (!buyerId || orden.buyerId !== buyerId)) {
    redirect("/payments/history");
  }

  const upFallback = (up: number | undefined, qty: number, amt: number) =>
    up ?? (qty > 0 ? amt / qty : 0);

  const items = orden.orders.map((o) => {
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

  return (
    <MethodsView
      paymentId={orden.id}
      totalAmount={Number(orden.totalAmount)}
      items={items}
      totalShipping={totalShipping}
    />
  );
}
