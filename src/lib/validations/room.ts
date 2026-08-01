import { RoomStatus } from "@prisma/client";
import { z } from "zod";

export const roomQuerySchema = z.object({
  status: z.nativeEnum(RoomStatus).optional(),
  typeId: z.string().uuid().optional(),
  checkIn: z.coerce.date().optional(),
  checkOut: z.coerce.date().optional(),
  guests: z.coerce.number().int().positive().optional(),
});

export const createRoomSchema = z.object({
  roomNumber: z.string().min(1).max(20),
  typeId: z.string().uuid(),
  floor: z.number().int().min(0).optional(),
  status: z.nativeEnum(RoomStatus).optional(),
  notes: z.string().max(500).optional(),
});
