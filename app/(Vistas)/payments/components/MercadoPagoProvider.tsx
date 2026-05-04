"use client";

import { initMercadoPago } from "@mercadopago/sdk-react";
import { useEffect, useState } from "react";

/**
 * Provider que inicializa el SDK de Mercado Pago en el cliente.
 * Debe envolver a todos los componentes que usen Bricks.
 */
export function MercadoPagoProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const publicKey = process.env.NEXT_PUBLIC_MP_PUBLIC_KEY;
    if (publicKey) {
      initMercadoPago(publicKey, { locale: "es-AR" });
      setReady(true);
    } else {
      console.error("NEXT_PUBLIC_MP_PUBLIC_KEY no está configurada.");
    }
  }, []);

  if (!ready) return null;

  return <>{children}</>;
}
