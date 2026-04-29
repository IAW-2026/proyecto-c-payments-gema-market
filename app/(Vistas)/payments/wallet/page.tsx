"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { PayShell } from "../components/PayShell";
import { Card, Button, Icon, Field, Input, Pill, fmtARS } from "../shared/components";
const Wallet = () => {
  const router = useRouter();

  return (
    <PayShell title="Mercado Pago" back="/payments/methods">
      <div className="p-4 max-[599px]:pb-[104px] min-[600px]:p-5 lgx:p-6 lgx:flex lgx:flex-col lgx:flex-1">
        <div className="grid grid-cols-1 gap-4 lgx:flex lgx:flex-col lgx:flex-1 lgx:gap-[18px]">
          <div>
            <Card padding={22} className="mb-4 text-white border-0 bg-gradient-to-br from-[#009ee3] to-[#00b1ea]">
              <div className="text-[11px] opacity-80 mb-1.5 font-mono">SALDO DISPONIBLE</div>
              <div className="text-[32px] font-bold">$ 47.250</div>
              <div className="text-xs opacity-80 mt-1.5">Lucía Méndez · @luciamz</div>
            </Card>
            <Card padding={16} className="bg-bone border-0">
              <div className="text-xs mb-2 font-medium">Pagar con</div>
              <div className="flex flex-col gap-1.5 text-[13px]">
                <label className="flex items-center gap-2"><input type="radio" name="src" defaultChecked className="[accent-color:#7f4f24]"/> Saldo Mercado Pago</label>
                <label className="flex items-center gap-2"><input type="radio" name="src" className="[accent-color:#7f4f24]"/> Visa 3704</label>
              </div>
            </Card>
          </div>
          <div className="lgx:flex lgx:flex-col lgx:flex-1 lgx:min-h-0">
            <div className="text-[11px] font-mono text-ink-3 uppercase mb-2 pl-1">Tus tarjetas</div>
            <div className="flex flex-col gap-2.5 mb-4">
              {[
                { brand: "Visa", last: "3704", color: "#582f0e", sel: true },
                { brand: "Mastercard", last: "8821", color: "#414833", sel: false },
              ].map((c, i) => (
                <Card key={i} padding={14} className={c.sel ? "!border-forest border-2" : ""}>
                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-7 rounded-md text-white flex items-center justify-center text-[9px] font-bold font-mono shrink-0"
                      style={{ background: c.color }}
                    >{c.brand.slice(0,4).toUpperCase()}</div>
                    <div className="flex-1 min-w-0">
                      <div className="text-[13px] font-medium">{c.brand} •••• {c.last}</div>
                      <div className="text-[11px] text-ink-3">Vence 11/26</div>
                    </div>
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${c.sel ? "border-forest" : "border-line-2"}`}>
                      {c.sel && <div className="w-2 h-2 rounded-full bg-forest"/>}
                    </div>
                  </div>
                </Card>
              ))}
              <button className="p-3.5 border-2 border-dashed border-line-2 rounded-2xl bg-transparent flex items-center justify-center gap-2 text-ink-3 font-medium">
                <Icon name="plus" size={16}/> Agregar tarjeta
              </button>
            </div>
            <div className="sticky bottom-0 bg-paper/95 backdrop-blur-[12px] border-t border-line p-4 -mx-4 mt-auto max-[599px]:fixed max-[599px]:left-0 max-[599px]:right-0 max-[599px]:bottom-0 max-[599px]:z-[80] max-[599px]:bg-paper/[.98] max-[599px]:shadow-[0_-10px_28px_rgba(40,30,15,.08)] max-[599px]:mx-0 lgx:!static lgx:!bg-transparent lgx:backdrop-blur-none lgx:!pt-[18px] lgx:!px-0 lgx:!pb-0 lgx:!mx-0">
              <Button full size="lg" variant="accent" onClick={() => router.push("/payments/processing")}>Pagar $ 160.300</Button>
            </div>
          </div>
        </div>
      </div>
    </PayShell>
  );
};
export default Wallet;
