"use client";

import { useRouter } from "next/navigation";
import { PayShell } from "@/app/(Vistas)/payments/components/PayShell";
import {
  Card,
  Button,
  Icon,
  fmtARS,
} from "@/app/(Vistas)/payments/shared/components";

export interface MethodsViewProps {
  paymentId: string;
  totalAmount: number;
  productCount: number;
}

const MethodsView = ({
  paymentId,
  totalAmount,
  productCount,
}: MethodsViewProps) => {
  const router = useRouter();

  return (
    <PayShell title="Elegí cómo pagar" back="/payments/history">
      <div className="p-4 max-[599px]:pb-[104px] min-[600px]:p-5 lgx:p-6 lgx:flex lgx:flex-col lgx:flex-1">
        <div className="grid grid-cols-1 gap-4 lgx:flex lgx:flex-col lgx:flex-1 lgx:gap-[18px]">
          <div>
            <Card
              padding={20}
              className="mb-4 text-white border-0 bg-gradient-to-br from-[#009ee3] to-[#00b1ea]"
            >
              <div className="text-[11px] opacity-80 mb-1.5 font-mono">
                TOTAL A PAGAR
              </div>
              <div className="text-[32px] font-bold">{fmtARS(totalAmount)}</div>
              <div className="text-xs opacity-80 mt-1.5">
                {productCount} productos · UniHousing
              </div>
            </Card>
            <Card padding={14} className="flex gap-2.5 items-center">
              <Icon name="shield" size={20} className="text-success shrink-0" />
              <div className="text-xs leading-[1.45]">
                Tu compra está protegida. Si el producto no llega, te devolvemos
                el dinero.
              </div>
            </Card>
          </div>
          <div className="lgx:flex lgx:flex-col lgx:flex-1 lgx:min-h-0">
            <div className="flex flex-col gap-2.5">
              <Card
                padding={16}
                className="min-h-[96px] border-2 border-forest"
              >
                <div className="flex items-center gap-3.5">
                  <div
                    className="w-11 h-11 rounded-xl text-white flex items-center justify-center shrink-0"
                    style={{ background: "#009ee3" }}
                  >
                    <Icon name="wallet" size={20} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold">Mercado Pago</div>
                    <div className="text-xs text-ink-3">
                      Saldo y métodos guardados
                    </div>
                  </div>
                  <div className="w-[22px] h-[22px] rounded-full border-2 border-forest flex items-center justify-center shrink-0">
                    <div className="w-2.5 h-2.5 rounded-full bg-forest" />
                  </div>
                </div>
              </Card>
            </div>
            <div className="sticky bottom-0 bg-paper/95 backdrop-blur-[12px] border-t border-line p-4 -mx-4 mt-4 max-[599px]:fixed max-[599px]:left-0 max-[599px]:right-0 max-[599px]:bottom-0 max-[599px]:z-[80] max-[599px]:bg-paper/[.98] max-[599px]:shadow-[0_-10px_28px_rgba(40,30,15,.08)] max-[599px]:mx-0 lgx:!static lgx:!bg-transparent lgx:backdrop-blur-none lgx:!mt-auto lgx:!pt-[18px] lgx:!px-0 lgx:!pb-0 lgx:!mx-0">
              <Button
                full
                size="lg"
                variant="accent"
                iconRight="arrowRight"
                onClick={() =>
                  router.push(`/payments/checkout/${paymentId}/wallet`)
                }
              >
                Continuar
              </Button>
            </div>
          </div>
        </div>
      </div>
    </PayShell>
  );
};
export default MethodsView;
