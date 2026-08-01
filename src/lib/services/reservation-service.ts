import type { z } from "zod";

import { NotImplementedError } from "@/lib/errors";
import {
  eventReservationSchema,
  poolReservationSchema,
  tableReservationSchema,
} from "@/lib/validations";

type TableInput = z.infer<typeof tableReservationSchema>;
type PoolInput = z.infer<typeof poolReservationSchema>;
type EventInput = z.infer<typeof eventReservationSchema>;

export const reservationService = {
  async createTable(_input: TableInput) {
    // TODO(Phase 4): check table slot conflicts, create TableReservation.
    throw new NotImplementedError("Table reservations are implemented in Phase 4");
  },

  async createPool(_input: PoolInput) {
    // TODO(Phase 4): check pool slot availability, create PoolReservation.
    throw new NotImplementedError("Pool reservations are implemented in Phase 4");
  },

  async createEvent(_input: EventInput) {
    // TODO(Phase 4): create EventReservation with requirements payload.
    throw new NotImplementedError("Event reservations are implemented in Phase 4");
  },
};
