"use client";

import { initMercadoPago } from "@mercadopago/sdk-react";
import { useEffect } from "react";

const publicKey = process.env.NEXT_PUBLIC_MP_PUBLIC_KEY;

/**
 * Inicializa el SDK de Mercado Pago para componentes Brick.
 */
export function MercadoPagoProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  useEffect(() => {
    if (!publicKey) {
      console.error("NEXT_PUBLIC_MP_PUBLIC_KEY no está configurada.");
      return;
    }

    initMercadoPago(publicKey, { locale: "es-AR" });
  }, []);

  if (!publicKey) return null;

  return <>{children}</>;
}
