import type { z } from "zod";

import { requireAuth } from "@/lib/auth/session";
import { updateProfileSchema } from "@/lib/validations";

import { userService } from "./user-service";

type UpdateProfileInput = z.infer<typeof updateProfileSchema>;

export const profileService = {
  async getProfile() {
    const sessionUser = await requireAuth();
    return userService.getById(sessionUser.id);
  },

  async updateProfile(input: UpdateProfileInput) {
    const sessionUser = await requireAuth();
    return userService.update(sessionUser.id, input);
  },
};
