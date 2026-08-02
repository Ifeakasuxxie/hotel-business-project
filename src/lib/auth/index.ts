import { PrismaAdapter } from "@auth/prisma-adapter";
import NextAuth from "next-auth";

import { prisma } from "@/lib/prisma";
import { authConfig } from "./config";
import { credentialsProvider } from "./credentials";

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [credentialsProvider],
  adapter: PrismaAdapter(prisma),
});

export type { SessionUser } from "./session";
export {
  authenticated,
  currentUser,
  requireAuth,
  requireSelfOrAdmin,
} from "./session";

export type { AuthRole } from "./roles";
export {
  isAdmin,
  isCustomer,
  isStaff,
  isStaffOrAdmin,
  requireAdmin,
  requireCustomer,
  requireRole,
  requireStaff,
} from "./roles";
