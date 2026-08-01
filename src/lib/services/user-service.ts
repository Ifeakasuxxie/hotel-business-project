import type { z } from "zod";

import { NotImplementedError } from "@/lib/errors";
import { registerUserSchema, updateUserSchema } from "@/lib/validations";

type CreateUserInput = z.infer<typeof registerUserSchema>;
type UpdateUserInput = z.infer<typeof updateUserSchema>;

export const userService = {
  async create(_input: CreateUserInput) {
    // TODO(Phase 4): admin-only user creation, default GUEST role.
    throw new NotImplementedError("User creation is implemented in Phase 4");
  },

  async getById(_id: string) {
    // TODO(Phase 4): fetch user via userRepository, map to UserProfileDto.
    throw new NotImplementedError("User lookup is implemented in Phase 4");
  },

  async list(_query: { page?: number; pageSize?: number }) {
    // TODO(Phase 4): paginated user list with role filtering.
    throw new NotImplementedError("User listing is implemented in Phase 4");
  },

  async update(_id: string, _input: UpdateUserInput) {
    // TODO(Phase 4): apply sanitized fields via userRepository.update.
    throw new NotImplementedError("User updates are implemented in Phase 4");
  },

  async deactivate(_id: string) {
    // TODO(Phase 4): soft-disable account.
    throw new NotImplementedError("Account management is implemented in Phase 4");
  },
};
