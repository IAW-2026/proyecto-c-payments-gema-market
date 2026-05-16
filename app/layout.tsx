import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { inter, jetBrainsMono } from "@/app/(Datos)/fonts";
import "@/app/(Datos)/globals.css";
import { SyncUser } from "@/app/sync-user";

export const metadata: Metadata = {
  title: "UniHousing — Pagos",
  description: "Plataforma de pagos de UniHousing para la comunidad universitaria.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider
      signInUrl="/sign-in"
    >
      <SyncUser />
      <html
        lang="en"
        className={`${inter.variable} ${jetBrainsMono.variable} h-full antialiased`}
      >
        <body className="min-h-full flex flex-col">
          <main className="flex-1 flex flex-col">{children}</main>
        </body>
      </html>
    </ClerkProvider>
  );
}
