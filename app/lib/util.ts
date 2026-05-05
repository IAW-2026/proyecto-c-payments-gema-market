/**
 * Utilidades compartidas del proyecto.
 * Formato, mapeos de negocio y cálculos de configuración.
 */

// ─── Formato ────────────────────────────────────────────────────────

const MONTHS = [
  "ene", "feb", "mar", "abr", "may", "jun",
  "jul", "ago", "sep", "oct", "nov", "dic",
];

/** Formatea una fecha a "DD mes · HH:MM" en español */
export function formatDate(date: Date | null | undefined): string {
  if (!date) return "—";
  const d = new Date(date);
  const day = d.getDate();
  const month = MONTHS[d.getMonth()];
  const hours = d.getHours().toString().padStart(2, "0");
  const mins = d.getMinutes().toString().padStart(2, "0");
  return `${day} ${month} · ${hours}:${mins}`;
}

/** Mapea el código de rechazo de MP a un texto legible */
export function mapRejectReason(detail: string | null | undefined): string {
  const reasons: Record<string, string> = {
    cc_rejected_insufficient_amount: "Fondos insuficientes",
    cc_rejected_bad_filled_security_code: "Datos de pago incorrectos",
    cc_rejected_bad_filled_date: "Datos de pago incorrectos",
    cc_rejected_bad_filled_other: "Datos de pago incorrectos",
    cc_rejected_call_for_authorize: "No autorizado por el emisor",
    cc_rejected_high_risk: "Rechazado por seguridad",
  };
  return reasons[detail ?? ""] ?? "No autorizado por el emisor";
}

// ─── Cálculos ───────────────────────────────────────────────────────

/** Calcula la fee de plataforma basada en PLATFORM_FEE_RATE (default 0.05) */
export function calculateFee(totalAmount: number): number {
  const rate = Number(process.env.PLATFORM_FEE_RATE) || 0.05;
  return Math.round(totalAmount * rate * 100) / 100;
}
