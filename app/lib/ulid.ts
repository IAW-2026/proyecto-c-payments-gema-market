import { ulid } from "ulid";

/**
 * Genera un ULID único. Opcionalmente puede incluir un prefijo.
 * Si se incluye un prefijo, se separará del ULID por un guión bajo.
 *
 * @param prefix - (Opcional) Prefijo a agregar al ULID.
 * @returns El ULID generado (con el prefijo si fue proporcionado).
 */
export function generateUlid(prefix?: string): string {
  const newUlid = ulid();
  if (prefix) {
    return `${prefix}_${newUlid}`;
  }
  return newUlid;
}
