import type { Metadata } from "next";
import { inter, jetBrainsMono } from "@/app/(Datos)/fonts";
import "@/app/(Datos)/globals.css";


export const metadata: Metadata = {
  title: "UniHousing — Pagos",
  description: "Plataforma de pagos de UniHousing para la comunidad universitaria.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${jetBrainsMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
