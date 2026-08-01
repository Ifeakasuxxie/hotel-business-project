import type { z } from "zod";

import { NotImplementedError } from "@/lib/errors";
import { createReviewSchema } from "@/lib/validations";

type CreateReviewInput = z.infer<typeof createReviewSchema>;

export const reviewService = {
  async create(_input: CreateReviewInput) {
    // TODO(Phase 4): ensure user booked the room, submit review as PENDING,
    // prevent duplicates via the (roomId, userId) unique constraint.
    throw new NotImplementedError("Review submission is implemented in Phase 4");
  },

  async listApprovedForRoom(_roomId: string) {
    // TODO(Phase 4): return APPROVED reviews with user info.
    throw new NotImplementedError("Review listing is implemented in Phase 4");
  },

  async moderate(_reviewId: string, _status: "APPROVED" | "REJECTED") {
    // TODO(Phase 4): admin moderation.
    throw new NotImplementedError("Review moderation is implemented in Phase 4");
  },
};
