import type { z } from "zod";

import { NotImplementedError } from "@/lib/errors";
import { roomQuerySchema } from "@/lib/validations";

type RoomQueryInput = z.infer<typeof roomQuerySchema>;

export const roomService = {
  async listAvailable(_query: RoomQueryInput) {
    // TODO(Phase 4): filter by dates/guests via roomRepository.findAvailable,
    // return RoomListResult (paginated).
    throw new NotImplementedError("Room availability is implemented in Phase 4");
  },

  async getById(_id: string) {
    // TODO(Phase 4): fetch room with type via roomRepository, map to RoomDto.
    throw new NotImplementedError("Room lookup is implemented in Phase 4");
  },
};
