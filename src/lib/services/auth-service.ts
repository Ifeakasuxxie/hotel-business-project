import type { UserRole } from "@prisma/client";
import { compare, hash } from "bcryptjs";
import type { z } from "zod";

import { signOut } from "@/lib/auth";
import { requireAuth } from "@/lib/auth/session";
import { ConflictError, NotFoundError, UnauthorizedError } from "@/lib/errors";
import { roleRepository, userRepository } from "@/lib/repositories";
import type { AuthUserDto } from "@/lib/types";
import {
  changePasswordSchema,
  loginSchema,
  registerUserSchema,
} from "@/lib/validations";

type RegisterInput = z.infer<typeof registerUserSchema>;
type LoginInput = z.infer<typeof loginSchema>;
type ChangePasswordInput = z.infer<typeof changePasswordSchema>;

const DEFAULT_ROLE: UserRole = "CUSTOMER";

interface AuthUserRow {
  id: string;
  firstName: string;
  lastName: string;
  name: string;
  email: string;
  image: string | null;
}

function toAuthUserDto(user: AuthUserRow, role: string): AuthUserDto {
  return {
    id: user.id,
    firstName: user.firstName,
    lastName: user.lastName,
    name: user.name,
    email: user.email,
    image: user.image,
    role,
  };
}

export const authService = {
  async register(input: RegisterInput) {
    const existing = await userRepository.findByEmail(input.email);
    if (existing) {
      throw new ConflictError("An account with this email already exists");
    }

    const role = await roleRepository.findByName(DEFAULT_ROLE);
    if (!role) {
      throw new NotFoundError("Default role is not configured");
    }

    const passwordHash = await hash(input.password, 10);

    const user = await userRepository.create({
      firstName: input.firstName,
      lastName: input.lastName,
      name: `${input.firstName} ${input.lastName}`,
      email: input.email,
      phone: input.phone ?? null,
      passwordHash,
      roleId: role.id,
    });

    return toAuthUserDto(user, role.name);
  },

  async login(input: LoginInput) {
    const user = await userRepository.findByEmailWithRole(input.email);
    if (!user || !user.isActive) {
      throw new UnauthorizedError("Invalid email or password");
    }

    const valid = await compare(input.password, user.passwordHash);
    if (!valid) {
      throw new UnauthorizedError("Invalid email or password");
    }

    return toAuthUserDto(user, user.role.name);
  },

  async logout() {
    await signOut({ redirect: false });
  },

  async getCurrentUser() {
    const sessionUser = await requireAuth();
    const user = await userRepository.findByIdWithRole(sessionUser.id);
    if (!user || !user.isActive) {
      throw new UnauthorizedError();
    }
    return toAuthUserDto(user, user.role.name);
  },

  async changePassword(input: ChangePasswordInput) {
    const sessionUser = await requireAuth();
    const user = await userRepository.findById(sessionUser.id);
    if (!user) {
      throw new NotFoundError("User not found");
    }

    const valid = await compare(input.currentPassword, user.passwordHash);
    if (!valid) {
      throw new UnauthorizedError("Current password is incorrect");
    }

    const passwordHash = await hash(input.newPassword, 10);
    await userRepository.update(user.id, { passwordHash });
  },
};
