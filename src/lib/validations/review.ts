import { ReviewStatus } from "@prisma/client";
import { z } from "zod";

export const createReviewSchema = z.object({
  roomId: z.string().uuid(),
  rating: z.number().int().min(1).max(5),
  title: z.string().max(120).optional(),
  comment: z.string().max(2000).optional(),
});

export const moderateReviewSchema = z.object({
  status: z.enum([ReviewStatus.APPROVED, ReviewStatus.REJECTED]),
});
