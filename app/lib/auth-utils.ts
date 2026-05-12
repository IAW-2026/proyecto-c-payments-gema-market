export function isAdminPaymentsRole(role: unknown): boolean {
  return role === "admin_payments";
}

export function isAdminPaymentsUser(
  user?: { publicMetadata?: { role?: unknown } } | null,
): boolean {
  return isAdminPaymentsRole(user?.publicMetadata?.role);
}
