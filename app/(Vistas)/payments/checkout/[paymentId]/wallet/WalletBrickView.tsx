"use client";
import { Wallet } from "@mercadopago/sdk-react";
import { PayShell } from "@/app/(Vistas)/payments/components/PayShell";
import { Card, Icon, fmtARS } from "@/app/(Vistas)/payments/shared/components";

export interface WalletBrickViewProps {
  paymentId: string;
  totalAmount: number;
  preferenceId: string;
}

/**
 * WalletBrickView — Integra el Wallet Brick de Mercado Pago.
 * El Wallet Brick renderiza el botón oficial de MP que redirige al checkout de MP.
 */
const WalletBrickView = ({ paymentId, totalAmount, preferenceId }: WalletBrickViewProps) => {
  return (
    <PayShell title="Mercado Pago" back={`/payments/checkout/${paymentId}/methods`}>
      <div className="p-4 max-[599px]:pb-[104px] min-[600px]:p-5 lgx:p-6 lgx:flex lgx:flex-col lgx:flex-1">
        <div className="grid grid-cols-1 gap-4 lgx:flex lgx:flex-col lgx:flex-1 lgx:gap-[18px]">
          <div>
            {/* Resumen del pago */}
            <Card padding={22} className="mb-4 text-white border-0 bg-gradient-to-br from-[#009ee3] to-[#00b1ea]">
              <div className="text-[11px] opacity-80 mb-1.5 font-mono">TOTAL A PAGAR</div>
              <div className="text-[32px] font-bold">{fmtARS(totalAmount)}</div>
              <div className="text-xs opacity-80 mt-1.5">Pago seguro con Mercado Pago</div>
            </Card>

            <Card padding={14} className="flex gap-2.5 items-center mb-4">
              <Icon name="shield" size={20} className="text-success shrink-0"/>
              <div className="text-xs leading-[1.45]">
                Serás redirigido a Mercado Pago para completar el pago de forma segura.
              </div>
            </Card>
          </div>

          <div className="lgx:flex lgx:flex-col lgx:flex-1 lgx:min-h-0">
            {/* Wallet Brick de Mercado Pago */}
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
