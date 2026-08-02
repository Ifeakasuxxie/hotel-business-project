import type { Session } from "next-auth";

import { UnauthorizedError } from "@/lib/errors";
import { auth } from "./index";

export interface SessionUser {
  id: string;
  email: string;
  name: string;
  image?: string | null;
  role?: string;
}

function getSession(): Promise<Session | null> {
  return auth() as Promise<Session | null>;
}

function toSessionUser(session: Session | null): SessionUser | null {
  const user = session?.user;
  if (!user) return null;

  return {
    id: user.id,
    email: user.email ?? "",
    name: user.name ?? "",
    image: user.image,
    role: user.role,
  };
}

export async function authenticated(): Promise<boolean> {
  const session = await getSession();
  return Boolean(session?.user);
}

export async function currentUser(): Promise<SessionUser | null> {
  const session = await getSession();
  return toSessionUser(session);
}

export async function requireAuth(): Promise<SessionUser> {
  const user = await currentUser();
  if (!user) {
    throw new UnauthorizedError();
  }
  return user;
}

export async function requireSelfOrAdmin(userId: string): Promise<SessionUser> {
  const user = await requireAuth();
  if (user.id !== userId && user.role !== "ADMIN" && user.role !== "MANAGER") {
    throw new UnauthorizedError("You can only access your own account");
  }
  return user;
}
