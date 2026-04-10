export const ADMIN_EMAILS = [
  "naota1988@gmail.com",
  "gatocannaturarural@gmail.com",
] as const;

export function isAdmin(email?: string | null): boolean {
  if (!email) return false;
  return ADMIN_EMAILS.includes(email.trim().toLowerCase() as (typeof ADMIN_EMAILS)[number]);
}
