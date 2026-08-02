import type { UserRole } from "@prisma/client";
import { hash } from "bcryptjs";
import type { z } from "zod";

import { ConflictError, NotFoundError } from "@/lib/errors";
import { roleRepository, userRepository } from "@/lib/repositories";
import type { Paginated, UserDto, UserProfileDto } from "@/lib/types";
import {
  createUserSchema,
  paginationSchema,
  updateUserSchema,
} from "@/lib/validations";

type CreateUserInput = z.infer<typeof createUserSchema>;
type UpdateUserInput = z.infer<typeof updateUserSchema>;
type ListQuery = z.infer<typeof paginationSchema>;

interface UserRow {
  id: string;
  firstName: string;
  lastName: string;
  name: string;
  email: string;
  phone: string | null;
  roleId: string;
  isActive: boolean;
  image?: string | null;
  emailVerified?: boolean;
}

function toUserDto(user: UserRow, role?: string): UserDto {
  return {
    id: user.id,
    firstName: user.firstName,
    lastName: user.lastName,
    name: user.name,
    email: user.email,
    phone: user.phone,
    roleId: user.roleId,
    isActive: user.isActive,
    role,
  };
}

function toProfileDto(user: UserRow, role?: string): UserProfileDto {
  return {
    id: user.id,
    firstName: user.firstName,
    lastName: user.lastName,
    name: user.name,
    email: user.email,
    phone: user.phone ?? null,
    image: user.image ?? null,
    emailVerified: user.emailVerified ?? false,
    role,
  };
}

export const userService = {
  async create(input: CreateUserInput) {
    const existing = await userRepository.findByEmail(input.email);
    if (existing) {
      throw new ConflictError("A user with this email already exists");
    }

    const roleName: UserRole = input.role ?? "CUSTOMER";
    const role = await roleRepository.findByName(roleName);
    if (!role) {
      throw new NotFoundError(`Role ${roleName} is not configured`);
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

    return toUserDto(user, role.name);
  },

  async getById(id: string) {
    const user = await userRepository.findByIdWithRole(id);
    if (!user) {
      throw new NotFoundError("User not found");
    }
    return toProfileDto(user, user.role.name);
  },

  async list(query: ListQuery) {
    const page = query.page ?? 1;
    const pageSize = query.pageSize ?? 20;

    const [total, users] = await Promise.all([
      userRepository.count(),
      userRepository.findManyPaginated(
        {},
        { skip: (page - 1) * pageSize, take: pageSize },
      ),
    ]);

    const items = users.map((user) => toUserDto(user, user.role.name));
    return {
      items,
      total,
      page,
      pageSize,
      totalPages: Math.max(1, Math.ceil(total / pageSize)),
    } satisfies Paginated<UserDto>;
  },

  async update(id: string, input: UpdateUserInput) {
    const user = await userRepository.findById(id);
    if (!user) {
      throw new NotFoundError("User not found");
    }

    const name =
      input.name ??
      `${input.firstName ?? user.firstName} ${input.lastName ?? user.lastName}`;

    const updated = await userRepository.update(id, {
      firstName: input.firstName,
      lastName: input.lastName,
      name,
      phone: input.phone === undefined ? undefined : input.phone,
      image: input.image === undefined ? undefined : input.image,
      isActive: input.isActive,
    });

    const role = await roleRepository.findById(updated.roleId);
    return toProfileDto(updated, role?.name);
  },

  async deactivate(id: string) {
    const user = await userRepository.findById(id);
    if (!user) {
      throw new NotFoundError("User not found");
    }
    await userRepository.update(id, { isActive: false });
  },
};
