import type { z } from "zod";

import { NotImplementedError } from "@/lib/errors";
import {
  createBookingSchema,
  updateBookingSchema,
} from "@/lib/validations";

type CreateBookingInput = z.infer<typeof createBookingSchema>;
type UpdateBookingInput = z.infer<typeof updateBookingSchema>;

export const bookingService = {
  async create(_input: CreateBookingInput) {
    // TODO(Phase 4): verify availability + price via roomRepository,
    // apply coupon, enforce idempotency key, create booking in a transaction.
    throw new NotImplementedError("Booking creation is implemented in Phase 4");
  },

  async getById(_id: string) {
    // TODO(Phase 4): fetch booking with room/payment.
    throw new NotImplementedError("Booking lookup is implemented in Phase 4");
  },

  async listForUser(_userId: string) {
    // TODO(Phase 4): return paginated bookings for the current user.
    throw new NotImplementedError("Booking listing is implemented in Phase 4");
  },

  async updateStatus(_id: string, _input: UpdateBookingInput) {
    // TODO(Phase 4): transition status (confirm/cancel), record cancelledAt.
    throw new NotImplementedError("Booking status transitions are implemented in Phase 4");
  },
};
