/**
 * Helpers de configuración para integraciones HTTP.
 */

export function getRequiredBaseUrl(envKey: string, fallback?: string): string {
  const raw = process.env[envKey] ?? fallback;
  if (!raw) {
    throw new Error(`Missing env var: ${envKey}`);
  }

  // Normalizar: asegurar protocolo y sin barra final.
  let url = raw;
  if (!url.startsWith("http://") && !url.startsWith("https://")) {
    url = `https://${url}`;
  }
  return url.replace(/\/$/, "");
}
