/**
 * Normaliza y valida URLs base para integraciones.
 */
export function getRequiredBaseUrl(envKey: string, fallback?: string): string {
  const raw = process.env[envKey] ?? fallback;
  if (!raw) {
    throw new Error(`Missing env var: ${envKey}`);
  }

  let url = raw;
  if (!url.startsWith("http://") && !url.startsWith("https://")) {
    url = `https://${url}`;
  }
  return url.replace(/\/$/, "");
}
