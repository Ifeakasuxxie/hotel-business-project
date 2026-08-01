import { PaymentProvider, PaymentStatus } from "@prisma/client";
import { z } from "zod";

export const createPaymentSchema = z.object({
  bookingId: z.string().uuid(),
  provider: z.nativeEnum(PaymentProvider),
});

export const paymentQuerySchema = z.object({
  bookingId: z.string().uuid().optional(),
  status: z.nativeEnum(PaymentStatus).optional(),
});
