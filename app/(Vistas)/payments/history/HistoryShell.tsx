"use client";

import type { ReactNode } from "react";
import { useClerk } from "@clerk/nextjs";
import { PayShell } from "@/app/(Vistas)/payments/components/PayShell";
import { Icon, Pill, useToast } from "@/app/(Vistas)/payments/shared/components";

export interface HistoryShellProps {
  children: ReactNode;
  displayName?: string;
  isAdmin?: boolean;
}

const HistoryShell = ({ children, displayName, isAdmin = false }: HistoryShellProps) => {
  const { signOut } = useClerk();
  const { ToastHost } = useToast();

  return (
    <PayShell
      title={
        <div className="flex items-center gap-2">
          <span>Historial de pagos</span>
          {displayName && (
            <Pill size="sm" tone={isAdmin ? "warn" : "sage"}>
              {displayName}
            </Pill>
          )}
        </div>
      }
      back="/"
      rightSlot={
        <button
          onClick={() => signOut({ redirectUrl: "/sign-in" })}
          className="w-9 h-9 rounded-full bg-bone flex items-center justify-center shrink-0 hover:bg-danger/10 transition-colors"
          title="Cerrar sesion"
          aria-label="Cerrar sesion"
        >
          <Icon name="logout" size={16} />
        </button>
      }
    >
      {children}
      <ToastHost />
    </PayShell>
  );
};

export default HistoryShell;
