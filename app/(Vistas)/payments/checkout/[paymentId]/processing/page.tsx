"use client";
import { useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { Icon } from "@/app/(Vistas)/payments/shared/components";

const Processing = () => {
  const router = useRouter();
  const params = useParams();
  const paymentId = params.paymentId as string;

  useEffect(() => {
    // Polling: consultar estado del pago cada 3 segundos
    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/payments/ordenes-de-pago/${paymentId}`);
        if (!res.ok) return;
        const data = await res.json();

        if (data.status === "approved") {
          clearInterval(interval);
          router.push(`/payments/checkout/${paymentId}/success`);
        } else if (data.status === "rejected" || data.status === "cancelled") {
          clearInterval(interval);
          router.push(`/payments/checkout/${paymentId}/failed`);
        }
      } catch {
        // Silenciar errores de red en polling
      }
    }, 3000);

    // Timeout de seguridad: después de 60s, ir a failed
    const timeout = setTimeout(() => {
      clearInterval(interval);
      router.push(`/payments/checkout/${paymentId}/failed`);
    }, 60000);

    return () => {
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
