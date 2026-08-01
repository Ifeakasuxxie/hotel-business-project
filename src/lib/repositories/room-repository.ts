import type { Prisma } from "@prisma/client";

import { prisma } from "@/lib/prisma";

const roomInclude = {
  type: true,
} satisfies Prisma.RoomInclude;

export const roomRepository = {
  findById(id: string) {
    return prisma.room.findUnique({ where: { id }, include: roomInclude });
  },

  findByNumber(roomNumber: string) {
    return prisma.room.findUnique({
      where: { roomNumber },
      include: roomInclude,
    });
  },

  findMany(where: Prisma.RoomWhereInput = {}) {
    return prisma.room.findMany({
      where,
      include: roomInclude,
      orderBy: { roomNumber: "asc" },
    });
  },

  findAvailable(_checkIn: Date, _checkOut: Date) {
    // TODO(Phase 4): add overlap-aware availability query against Bookings.
    return prisma.room.findMany({
      where: { status: "AVAILABLE" },
      include: roomInclude,
      orderBy: { roomNumber: "asc" },
    });
  },

  count(where: Prisma.RoomWhereInput = {}) {
    return prisma.room.count({ where });
  },

  create(data: Prisma.RoomUncheckedCreateInput) {
    return prisma.room.create({ data, include: roomInclude });
  },

  update(id: string, data: Prisma.RoomUncheckedUpdateInput) {
    return prisma.room.update({ where: { id }, data, include: roomInclude });
  },
};
