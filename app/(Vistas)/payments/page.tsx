import { redirect } from "next/navigation";

/**
 * Redirige al historial de pagos.
 */
export default async function Home() {
  redirect("/payments/history");
}
