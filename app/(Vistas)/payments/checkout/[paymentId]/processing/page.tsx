"use client";
import { useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { Icon } from "@/app/(Vistas)/payments/shared/components";
import { getApiKeyHash } from "@/app/(Logica)/integrations/api-key";
const Processing = () => {
  const router = useRouter();
  const params = useParams();
  const paymentId = params.paymentId as string;

  useEffect(() => {
    let isMounted = true;

    
    // Esperar 2.5s antes de la primera verificación para dar tiempo al webhook
    const initialCheck = setTimeout(() => {
      if (isMounted) checkStatus();
    }, 2500);
    
    // Polling cada 5 segundos (menos agresivo)
    const interval = setInterval(() => {
      if (isMounted) checkStatus();
    }, 5000);
    
    const checkStatus = async () => {
      try {
        const apiKey = await getApiKeyHash();
        const res = await fetch(`/api/payments/ordenes-de-pago/${paymentId}`, {
          headers: {
            "x-api-key-hash": apiKey,
          },
        });
        if (!res.ok || !isMounted) return;
        const data = await res.json();

        if (data.status === "approved") {
          router.push(`/payments/checkout/${paymentId}/success`);
        } else if (data.status === "rejected" || data.status === "cancelled") {
          router.push(`/payments/checkout/${paymentId}/failed`);
        }
      } catch {
        // Silenciar errores de red en polling
      }
    };
    
    // Timeout de seguridad: después de 60s, ir a failed
    const timeout = setTimeout(() => {
      if (isMounted) router.push(`/payments/checkout/${paymentId}/failed`);
    }, 60000);

    return () => {
      isMounted = false;
      clearTimeout(initialCheck);
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, [paymentId, router]);

  return (
    <div className="min-h-screen bg-cream flex items-center justify-center p-6">
      <div className="text-center w-full max-w-[560px] bg-paper border border-line rounded-3xl px-7 py-11 shadow-sh-2">
        <div className="w-[88px] h-[88px] mx-auto mb-6 rounded-full border-4 border-bone border-t-cocoa animate-spin360"/>
        <h2 className="m-0 mb-2 text-[22px] font-semibold tracking-[-0.02em]">Procesando tu pago</h2>
        <p className="m-0 text-ink-3 text-sm">No cierres esta pantalla.</p>
        <div className="mt-6 inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-bone rounded-full text-[11px] font-mono text-ink-3">
          <Icon name="lock" size={11}/> CONEXIÓN SEGURA
        </div>
      </div>
    </div>
  );
};
export default Processing;
