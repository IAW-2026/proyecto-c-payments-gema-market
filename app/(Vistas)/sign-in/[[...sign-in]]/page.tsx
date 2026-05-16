"use client";
import { SignIn } from "@clerk/nextjs";
import { Logo } from "@/app/(Vistas)/payments/shared/components";

/**
 * Pantalla de inicio de sesion con Clerk.
 */
export default function SignInPage() {
  return (
    <div className="min-h-screen bg-cream flex items-center justify-center p-6">
      <div className="w-full max-w-[460px]">
        <div className="text-center mb-6">
          <div className="flex justify-center mb-3">
            <Logo size={32} color="#414833" />
          </div>
          <h1 className="text-xl font-semibold text-ink">
            Iniciá sesión
          </h1>
          <p className="text-sm text-ink-3 mt-1">
            Ingresá a la plataforma de pagos de UniHousing
          </p>
        </div>
        <div className="flex justify-center">
          <SignIn
            fallbackRedirectUrl="/payments/history?page=1"
            appearance={{
              elements: {
                header: "hidden",
                card: "pt-8",
              },
            }}
          />
        </div>
      </div>
    </div>
  );
}
