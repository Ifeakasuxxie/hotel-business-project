import { EventType } from "@prisma/client";
import { z } from "zod";

const timePattern = /^([01]\d|2[0-3]):[0-5]\d$/;

export const tableReservationSchema = z.object({
  guests: z.number().int().positive().max(50),
  reservationTime: z.coerce.date(),
  durationMinutes: z.number().int().positive().max(480).optional(),
  tableNumber: z.string().max(20).optional(),
  specialRequests: z.string().max(1000).optional(),
});

export const poolReservationSchema = z
  .object({
    slotStart: z.coerce.date(),
    slotEnd: z.coerce.date(),
    guests: z.number().int().positive().max(50),
    specialRequests: z.string().max(1000).optional(),
  })
  .refine((value) => value.slotStart < value.slotEnd, {
    message: "slotStart must be earlier than slotEnd",
  });

export const eventReservationSchema = z.object({
  eventType: z.nativeEnum(EventType),
  eventDate: z.coerce.date(),
  startTime: z.string().regex(timePattern, "startTime must use HH:mm format"),
  endTime: z.string().regex(timePattern, "endTime must use HH:mm format"),
  guestCount: z.number().int().positive().max(2000),
  budget: z.number().int().nonnegative().optional(),
  requirements: z.record(z.string(), z.unknown()).optional(),
});
