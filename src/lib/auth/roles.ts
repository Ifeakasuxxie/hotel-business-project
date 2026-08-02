import { UserRole } from "@prisma/client";

import { ForbiddenError } from "@/lib/errors";
import { requireAuth, type SessionUser } from "./session";

export const ROLES = {
  CUSTOMER: UserRole.CUSTOMER,
  STAFF: UserRole.STAFF,
  MANAGER: UserRole.MANAGER,
  CONCIERGE: UserRole.CONCIERGE,
  ADMIN: UserRole.ADMIN,
} as const;

export type AuthRole = (typeof ROLES)[keyof typeof ROLES];

const staffRoles: ReadonlySet<AuthRole> = new Set([
  UserRole.STAFF,
  UserRole.MANAGER,
  UserRole.CONCIERGE,
  UserRole.ADMIN,
]);

const adminRoles: ReadonlySet<AuthRole> = new Set([
  UserRole.ADMIN,
  UserRole.MANAGER,
]);

export function isAdmin(role?: string | null): boolean {
  return role ? adminRoles.has(role as AuthRole) : false;
}

export function isStaff(role?: string | null): boolean {
  return role ? staffRoles.has(role as AuthRole) : false;
}

export function isCustomer(role?: string | null): boolean {
  return role === UserRole.CUSTOMER;
}

export function isStaffOrAdmin(role?: string | null): boolean {
  return isStaff(role) || isAdmin(role);
}

export async function requireRole(...roles: AuthRole[]): Promise<SessionUser> {
  const user = await requireAuth();
  if (!user.role || !roles.includes(user.role as AuthRole)) {
    throw new ForbiddenError(`Access requires role: ${roles.join(", ")}`);
  }
  return user;
}

export async function requireAdmin(): Promise<SessionUser> {
  return requireRole(UserRole.ADMIN, UserRole.MANAGER);
}

export async function requireStaff(): Promise<SessionUser> {
  const user = await requireAuth();
  if (!isStaff(user.role)) {
    throw new ForbiddenError("Access requires a staff role");
  }
  return user;
}

export async function requireCustomer(): Promise<SessionUser> {
  return requireRole(UserRole.CUSTOMER);
}
