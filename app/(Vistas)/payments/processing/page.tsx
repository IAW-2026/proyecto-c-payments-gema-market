"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { PayShell } from "../components/PayShell";
import { Card, Button, Icon, Field, Input, Pill, fmtARS } from "../shared/components";
const Processing = () => {
  const router = useRouter();

  useEffect(() => {
    const t = setTimeout(() => router.push("/payments/success"), 2200);
    return () => clearTimeout(t);
  }, []);
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
