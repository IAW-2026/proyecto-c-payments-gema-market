"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { PayShell } from "@/app/(Vistas)/payments/components/PayShell";
import { Card, Button, Icon, fmtARS } from "@/app/(Vistas)/payments/shared/components";

export interface MethodsViewProps {
  paymentId: string;
  totalAmount: number;
  productCount: number;
}

const MethodsView = ({ paymentId, totalAmount, productCount }: MethodsViewProps) => {
  const router = useRouter();

  const [sel, setSel] = useState("mp");
  const methods = [
    { id: "mp", icon: "wallet", title: "Mercado Pago", body: "Saldo + tarjetas guardadas", brand: "#009ee3" },
    { id: "card", icon: "creditCard", title: "Tarjeta nueva", body: "Crédito o débito", brand: "#7f4f24" },
  ];
  return (
    <PayShell title="Elegí cómo pagar" back={null}>
      <div className="p-4 max-[599px]:pb-[104px] min-[600px]:p-5 lgx:p-6 lgx:flex lgx:flex-col lgx:flex-1">
        <div className="grid grid-cols-1 gap-4 lgx:flex lgx:flex-col lgx:flex-1 lgx:gap-[18px]">
          <div>
            <Card padding={20} className="mb-4 bg-bone border-0">
              <div className="text-[11px] font-mono text-ink-3 uppercase">Total a pagar</div>
              <div className="text-[32px] font-bold">{fmtARS(totalAmount)}</div>
              <div className="text-xs text-ink-3 mt-1">{productCount} productos · UniHousing</div>
            </Card>
            <Card padding={14} className="flex gap-2.5 items-center">
              <Icon name="shield" size={20} className="text-success shrink-0"/>
              <div className="text-xs leading-[1.45]">Tu compra está protegida. Si el producto no llega, te devolvemos el dinero.</div>
            </Card>
          </div>
          <div className="lgx:flex lgx:flex-col lgx:flex-1 lgx:min-h-0">
            <div className="flex flex-col gap-2.5">
              {methods.map(m => (
                <Card
                  key={m.id}
                  padding={16}
                  onClick={() => setSel(m.id)}
                  className={`cursor-pointer min-h-[96px] ${sel === m.id ? "!border-forest border-2" : ""}`}
                >
                  <div className="flex items-center gap-3.5">
                    <div
                      className="w-11 h-11 rounded-xl text-white flex items-center justify-center shrink-0"
                      style={{ background: m.brand }}
                    >
                      <Icon name={m.icon} size={20}/>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold">{m.title}</div>
                      <div className="text-xs text-ink-3">{m.body}</div>
                    </div>
                    <div className={`w-[22px] h-[22px] rounded-full border-2 flex items-center justify-center shrink-0 ${sel === m.id ? "border-forest" : "border-line-2"}`}>
                      {sel === m.id && <div className="w-2.5 h-2.5 rounded-full bg-forest"/>}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
            <div className="sticky bottom-0 bg-paper/95 backdrop-blur-[12px] border-t border-line p-4 -mx-4 mt-4 max-[599px]:fixed max-[599px]:left-0 max-[599px]:right-0 max-[599px]:bottom-0 max-[599px]:z-[80] max-[599px]:bg-paper/[.98] max-[599px]:shadow-[0_-10px_28px_rgba(40,30,15,.08)] max-[599px]:mx-0 lgx:!static lgx:!bg-transparent lgx:backdrop-blur-none lgx:!mt-auto lgx:!pt-[18px] lgx:!px-0 lgx:!pb-0 lgx:!mx-0">
              <Button full size="lg" variant="accent" iconRight="arrowRight" onClick={() => router.push(`/payments/checkout/${paymentId}/${sel === "card" ? "card" : "wallet"}`)}>Continuar</Button>
            </div>
          </div>
        </div>
      </div>
    </PayShell>
  );
};
export default MethodsView;
