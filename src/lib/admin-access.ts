import type { AdminUserRole } from '@/types/content';

const ADMIN_USER_ROLES = new Set<AdminUserRole>([
  'super_admin',
  'admin',
  'editor',
  'moderator',
]);

export function normalizeAdminRole(value: unknown): AdminUserRole | null {
  return typeof value === 'string' && ADMIN_USER_ROLES.has(value as AdminUserRole)
    ? (value as AdminUserRole)
    : null;
}

export function resolveAdminRole({
  databaseRole,
  environmentWhitelisted,
}: {
  databaseRole: AdminUserRole | null;
  environmentWhitelisted: boolean;
}): AdminUserRole | null {
  if (databaseRole) return databaseRole;
  return environmentWhitelisted ? 'super_admin' : null;
}

export function canManageAdminUsers(role: AdminUserRole): boolean {
  return role === 'super_admin';
}

export function canAccessAdminPortal(
  role: AdminUserRole | null,
  hasLocalSession: boolean
): boolean {
  return Boolean(role) || hasLocalSession;
}
