/**
 * Utilidades compartidas del proyecto.
 * Formato, mapeos de negocio y cálculos de configuración.
 */

const MONTHS = [
  "ene", "feb", "mar", "abr", "may", "jun",
  "jul", "ago", "sep", "oct", "nov", "dic",
];

/**
 * Formatea una fecha como "DD mes · HH:MM" en español.
 */
export function formatDate(date: Date | null | undefined): string {
  if (!date) return "—";
  const d = new Date(date);
  const day = d.getDate();
  const month = MONTHS[d.getMonth()];
  const hours = d.getHours().toString().padStart(2, "0");
  const mins = d.getMinutes().toString().padStart(2, "0");
  return `${day} ${month} · ${hours}:${mins}`;
}

/**
 * Mapea un codigo de rechazo de MP a un texto legible.
 */
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

/**
  * Redondea un numero a dos decimales.
 */
export function round2(value: number): number {
  return Math.round(value * 100) / 100;
}

/**
 * Calcula la fee de plataforma segun PLATFORM_FEE_RATE (default 0.05).
 */
export function calculateFee(totalAmount: number): number {
  const rate = Number(process.env.PLATFORM_FEE_RATE) || 0.05;
  return round2(totalAmount * rate);
}

/**
  * Distribuye una comision total de forma proporcional entre items.
 */
export function splitFee(totalFee: number, items: { amount?: number }[]): number[] {
  if (!items.length) return [];

  const totalAmount = items.reduce((s, o) => s + (o.amount ?? 0), 0);

  if (totalAmount <= 0) {
    const base = round2(totalFee / items.length);
    const fees = items.map(() => base);
    fees[fees.length - 1] = round2(
      totalFee - fees.slice(0, -1).reduce((s, f) => s + f, 0),
    );
    return fees;
  }

  const fees = items.map((o, idx) => {
    if (idx === items.length - 1) return 0;
    return round2((totalFee * (o.amount ?? 0)) / totalAmount);
  });

  fees[fees.length - 1] = round2(totalFee - fees.reduce((s, f) => s + f, 0));
  return fees;
}
