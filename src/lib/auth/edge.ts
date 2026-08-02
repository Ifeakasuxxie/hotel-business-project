import NextAuth from "next-auth";

import { authConfig } from "./config";

// Edge-safe Auth.js instance used only by src/middleware.ts to verify the
// session cookie. It carries no providers/adapter, so the middleware bundle
// stays free of Prisma and bcrypt.
export const { auth } = NextAuth(authConfig);
