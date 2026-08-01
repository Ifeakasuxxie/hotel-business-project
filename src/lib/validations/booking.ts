import { BookingSource, BookingStatus } from "@prisma/client";
import { z } from "zod";

export const createBookingSchema = z
  .object({
    roomId: z.string().uuid(),
    couponCode: z.string().max(50).optional(),
    checkIn: z.coerce.date(),
    checkOut: z.coerce.date(),
    guests: z.number().int().positive().max(20),
    source: z.nativeEnum(BookingSource).optional(),
    specialRequests: z.string().max(1000).optional(),
    idempotencyKey: z.string().max(128).optional(),
  })
  .refine((value) => value.checkIn < value.checkOut, {
    message: "checkIn must be earlier than checkOut",
  });

export const updateBookingSchema = z.object({
  status: z.nativeEnum(BookingStatus).optional(),
  specialRequests: z.string().max(1000).optional(),
});

export const bookingQuerySchema = z.object({
  status: z.nativeEnum(BookingStatus).optional(),
  userId: z.string().uuid().optional(),
  from: z.coerce.date().optional(),
  to: z.coerce.date().optional(),
});
