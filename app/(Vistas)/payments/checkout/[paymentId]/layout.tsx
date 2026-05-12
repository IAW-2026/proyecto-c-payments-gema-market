import { notFound } from "next/navigation";
import { MercadoPagoProvider } from "@/app/(Vistas)/payments/components/MercadoPagoProvider";
import { getOrdenDePagoById } from "@/app/(Logica)/services/ordenes-de-pago.service";
import { ensurePaymentOwnership } from "@/app/lib/checkout-utils";

/**
 * Layout para el flujo de checkout.
 * Incluye el MercadoPagoProvider para que los Bricks funcionen
 * en todas las sub-rutas del checkout.
 */
export default async function CheckoutLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ paymentId: string }>;
}) {
  const { paymentId } = await params;
  const orden = await getOrdenDePagoById(paymentId);

  if (!orden) return notFound();

  await ensurePaymentOwnership(orden);

  return <MercadoPagoProvider>{children}</MercadoPagoProvider>;
}
