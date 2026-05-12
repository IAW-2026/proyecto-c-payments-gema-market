/**
 * Verifica si el rol corresponde a admin de pagos.
 */
export function isAdminPaymentsRole(role: unknown): boolean {
  return role === "admin_payments";
}

/**
 * Verifica si el usuario tiene rol admin de pagos.
 */
export function isAdminPaymentsUser(
  user?: { publicMetadata?: { role?: unknown } } | null,
): boolean {
  return isAdminPaymentsRole(user?.publicMetadata?.role);
}
