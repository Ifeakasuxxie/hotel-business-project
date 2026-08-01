import type { z } from "zod";

import { NotImplementedError } from "@/lib/errors";
import {
  changePasswordSchema,
  loginSchema,
  registerUserSchema,
} from "@/lib/validations";

type RegisterInput = z.infer<typeof registerUserSchema>;
type LoginInput = z.infer<typeof loginSchema>;
type ChangePasswordInput = z.infer<typeof changePasswordSchema>;

export const authService = {
  async register(_input: RegisterInput) {
    // TODO(Phase 4): hash password (argon2/bcrypt), assign default GUEST role,
    // send email verification, return safe user + session.
    throw new NotImplementedError("Registration is implemented in Phase 4");
  },

  async login(_input: LoginInput) {
    // TODO(Phase 4): verify credentials, issue session/JWT.
    throw new NotImplementedError("Login is implemented in Phase 4");
  },

  async logout() {
    // TODO(Phase 4): invalidate session.
    throw new NotImplementedError("Logout is implemented in Phase 4");
  },

  async getCurrentUser() {
    // TODO(Phase 4): resolve authenticated user from session.
    throw new NotImplementedError("Session handling is implemented in Phase 4");
  },

  async changePassword(_input: ChangePasswordInput) {
    // TODO(Phase 4): verify current password and rotate hash.
    throw new NotImplementedError("Password management is implemented in Phase 4");
  },
};
