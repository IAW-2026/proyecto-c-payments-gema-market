import { MercadoPagoProvider } from "@/app/(Vistas)/payments/components/MercadoPagoProvider";

/**
 * Layout para el flujo de checkout.
 * Incluye el MercadoPagoProvider para que los Bricks funcionen
 * en todas las sub-rutas del checkout.
 */
export default function CheckoutLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <MercadoPagoProvider>{children}</MercadoPagoProvider>;
}
