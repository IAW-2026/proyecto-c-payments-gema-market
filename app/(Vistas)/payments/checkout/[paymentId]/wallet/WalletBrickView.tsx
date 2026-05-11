"use client";
import { Wallet } from "@mercadopago/sdk-react";
import { PayShell } from "@/app/(Vistas)/payments/components/PayShell";
import { Card, Icon, fmtARS } from "@/app/(Vistas)/payments/shared/components";

export interface WalletItem {
  productName: string;
  quantity: number;
  unitPrice: number;
  shippingPrice: number;
}

export interface WalletBrickViewProps {
  paymentId: string;
  totalAmount: number;
  preferenceId: string;
  items: WalletItem[];
  totalShipping: number;
}

const WalletBrickView = ({ paymentId, totalAmount, preferenceId, items, totalShipping }: WalletBrickViewProps) => {
  return (
    <PayShell title="Mercado Pago" back={`/payments/checkout/${paymentId}/methods`}>
      <div className="p-4 max-[599px]:pb-[104px] min-[600px]:p-5 lgx:p-6 lgx:flex lgx:flex-col lgx:flex-1">
        <div className="grid grid-cols-1 gap-4 lgx:flex lgx:flex-col lgx:flex-1 lgx:gap-[18px]">
          <div>
            <Card padding={22} className="mb-4 text-white border-0 bg-gradient-to-br from-[#009ee3] to-[#00b1ea]">
              <div className="text-[11px] opacity-80 mb-1.5 font-mono">TOTAL A PAGAR</div>
              <div className="text-[32px] font-bold">{fmtARS(totalAmount)}</div>
              <div className="text-xs opacity-80 mt-1.5">Pago seguro con Mercado Pago</div>
            </Card>

            <Card padding={16} className="mb-4">
              <div className="text-[11px] font-semibold text-ink-3 mb-3 uppercase tracking-wider">Resumen</div>
              <div className="space-y-1">
                {items.map((item, i) => (
                  <div key={i} className="flex justify-between text-[13px]">
                    <span className="text-ink truncate pr-2">
                      {item.quantity}x {item.productName}
                    </span>
                    <span className="text-ink font-medium shrink-0">{fmtARS(item.unitPrice * item.quantity)}</span>
                  </div>
                ))}
                {totalShipping > 0 && (
                  <div className="flex justify-between text-[12px] text-ink-3 pt-1 mt-1 border-t border-line/50">
                    <span>Envío</span>
                    <span>{fmtARS(totalShipping)}</span>
                  </div>
                )}
              </div>
            </Card>

            <Card padding={14} className="flex gap-2.5 items-center mb-4">
              <Icon name="shield" size={20} className="text-success shrink-0"/>
              <div className="text-xs leading-[1.45]">
                Serás redirigido a Mercado Pago para completar el pago de forma segura.
              </div>
            </Card>
          </div>

          <div className="lgx:flex lgx:flex-col lgx:flex-1 lgx:min-h-0">
            <div className="mb-4">
              {preferenceId ? (
                <Wallet
                  initialization={{ preferenceId }}
                />
              ) : (
                <Card padding={20} className="text-center">
                  <Icon name="alert" size={24} className="text-warn mx-auto mb-2"/>
                  <div className="text-sm text-ink-3">
                    No se pudo cargar el método de pago. Intentá nuevamente.
                  </div>
                </Card>
              )}
            </div>
          </div>
        </div>
      </div>
    </PayShell>
  );
};
export default WalletBrickView;
