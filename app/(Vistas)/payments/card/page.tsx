"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { PayShell } from "../components/PayShell";
import { Card, Button, Icon, Field, Input, Pill, fmtARS } from "../shared/components";
const CardForm = () => {
  const router = useRouter();

  const [num, setNum] = useState("4509 9535 6623 3704");
  const [name, setName] = useState("LUCIA MENDEZ");
  const [exp, setExp] = useState("11/26");
  const [cvc, setCvc] = useState("");
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const maskedCvc = cvc ? "•".repeat(Math.min(cvc.length, 4)) : "•••";
  const showBack = focusedField === "cvc";
  return (
    <PayShell title="Tarjeta de crédito" back="/payments/methods">
      <div className="p-4 max-[599px]:pb-[104px] min-[600px]:p-5 lgx:p-6 lgx:flex lgx:flex-col lgx:flex-1">
        <div className="grid grid-cols-1 gap-4 lgx:flex lgx:flex-col lgx:flex-1 lgx:gap-[18px]">
          <div className="lgx:static">
            <div className="persp-1200 mb-5">
              <div
                className={`relative preserve-3d transition-transform duration-[550ms] ease-[cubic-bezier(.2,.8,.2,1)] aspect-[1.586/1] rounded-[20px] text-paper shadow-sh-3 lgx:max-w-[320px] lgx:mx-auto ${showBack ? "[transform:rotateY(180deg)]" : "[transform:rotateY(0deg)]"}`}
              >
                {/* Front face */}
                <div className="absolute inset-0 backface-hidden bg-card-front rounded-[20px] p-[22px] flex flex-col justify-between overflow-hidden">
                  <div className="absolute -top-10 -right-10 w-[180px] h-[180px] rounded-full bg-white/[.06]"/>
                  <div className="absolute -bottom-[60px] -left-5 w-[220px] h-[220px] rounded-full bg-white/[.04]"/>
                  <div className="flex justify-between items-center relative">
                    <div className="w-[38px] h-7 rounded-[5px] bg-card-chip"/>
                    <div className="font-mono text-[11px] opacity-70">VISA</div>
                  </div>
                  <div className="relative">
                    <div className="font-mono text-lg mb-3.5 [overflow-wrap:anywhere]">{num}</div>
                    <div className="flex justify-between gap-4 text-[11px] opacity-85">
                      <div>
                        <div className="opacity-60 mb-0.5 font-mono">TITULAR</div>
                        <div className="font-medium font-mono">{name}</div>
                      </div>
                      <div>
                        <div className="opacity-60 mb-0.5 font-mono">VENCE</div>
                        <div className="font-medium font-mono">{exp}</div>
                      </div>
                    </div>
                  </div>
                </div>
                {/* Back face */}
                <div className="absolute inset-0 backface-hidden bg-card-back rounded-[20px] py-[22px] px-0 overflow-hidden [transform:rotateY(180deg)]">
                  <div className="h-[42px] bg-ink/90 mt-2.5"/>
                  <div className="px-[22px] pt-[22px]">
                    <div className="text-[10px] font-mono opacity-70 mb-1.5">CÓDIGO DE SEGURIDAD</div>
                    <div className="grid grid-cols-[minmax(0,1fr)_74px] gap-2 items-center">
                      <div className="h-[34px] rounded-md bg-paper/90 bg-cvc-stripes"/>
                      <div className="h-[34px] rounded-md bg-paper text-ink flex items-center justify-center font-mono font-bold tracking-[0.12em]">{maskedCvc}</div>
                    </div>
                    <div className="text-[11px] opacity-75 mt-3 leading-[1.4]">Ingresá los 3 o 4 números del dorso de tu tarjeta.</div>
                  </div>
                </div>
              </div>
            </div>
            <Card padding={18} className="mt-4">
              <div className="text-[11px] font-mono text-ink-3 uppercase mb-1">Total</div>
              <div className="text-[26px] font-bold">$ 160.300</div>
              <div className="text-xs text-ink-3 mt-1">Pago seguro procesado por Mercado Pago.</div>
            </Card>
          </div>
          <div className="lgx:flex lgx:flex-col lgx:flex-1 lgx:min-h-0">
            <div className="flex flex-col gap-3">
              <Field label="Número de tarjeta"><Input icon="creditCard" value={num} onFocus={() => setFocusedField("num")} onChange={(e: any) => setNum(e.target.value)}/></Field>
              <Field label="Nombre como figura"><Input value={name} onFocus={() => setFocusedField("name")} onChange={(e: any) => setName(e.target.value.toUpperCase())}/></Field>
              <div className="grid grid-cols-2 gap-2.5 max-[420px]:grid-cols-1">
                <Field label="Vencimiento"><Input value={exp} onFocus={() => setFocusedField("exp")} onChange={(e: any) => setExp(e.target.value)} placeholder="MM/AA"/></Field>
                <Field label="CVC"><Input value={cvc} onChange={(e: any) => setCvc(e.target.value.replace(/\D/g, "").slice(0, 4))} onFocus={() => setFocusedField("cvc")} onBlur={() => setFocusedField(null)} placeholder="..." type="password" inputMode="numeric" maxLength="4"/></Field>
              </div>
            </div>
            <div className="sticky bottom-0 bg-paper/95 backdrop-blur-[12px] border-t border-line p-4 max-[599px]:fixed max-[599px]:left-0 max-[599px]:right-0 max-[599px]:bottom-0 max-[599px]:z-[80] max-[599px]:bg-paper/[.98] max-[599px]:shadow-[0_-10px_28px_rgba(40,30,15,.08)] lgx:!static lgx:!bg-transparent lgx:backdrop-blur-none lgx:!mt-auto lgx:!pt-[18px] lgx:!px-0 lgx:!pb-0">
              <Button full size="lg" variant="accent" onClick={() => router.push("/payments/processing")}>Pagar $ 160.300</Button>
            </div>
          </div>
        </div>
      </div>
    </PayShell>
  );
};
export default CardForm;
