"use client";
import { SignUp } from "@clerk/nextjs";
import { Logo } from "@/app/(Vistas)/payments/shared/components";

export default function SignUpPage() {
  return (
    <div className="min-h-screen bg-cream flex items-center justify-center p-6">
      <div className="w-full max-w-[460px]">
        <div className="text-center mb-6">
          <div className="flex justify-center mb-3">
            <Logo size={32} color="#414833" />
          </div>
          <h1 className="text-xl font-semibold text-ink">
            Creá tu cuenta
          </h1>
          <p className="text-sm text-ink-3 mt-1">
            Registrate en la plataforma de pagos de UniHousing
          </p>
        </div>
        <SignUp
          fallbackRedirectUrl="/payments/history"
          signInFallbackRedirectUrl="/payments/history"
          signInUrl="/sign-in"
        />
      </div>
    </div>
  );
}
