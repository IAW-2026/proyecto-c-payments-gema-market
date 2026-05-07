import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { inter, jetBrainsMono } from "@/app/(Datos)/fonts";
import "@/app/(Datos)/globals.css";
import { syncCurrentUser } from "@/app/(Logica)/services/usuario-sync.service";

export const metadata: Metadata = {
  title: "UniHousing — Pagos",
  description: "Plataforma de pagos de UniHousing para la comunidad universitaria.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  await syncCurrentUser();

  return (
    <ClerkProvider
      signInUrl="/sign-in"
      signUpUrl="/sign-up"
    >
      <html
        lang="en"
        className={`${inter.variable} ${jetBrainsMono.variable} h-full antialiased`}
      >
        <body className="min-h-full flex flex-col">{children}</body>
      </html>
    </ClerkProvider>
  );
}
