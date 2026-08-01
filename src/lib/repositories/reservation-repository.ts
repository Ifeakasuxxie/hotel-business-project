import type { Prisma } from "@prisma/client";

import { prisma } from "@/lib/prisma";

export const reservationRepository = {
  createTable(data: Prisma.TableReservationUncheckedCreateInput) {
    return prisma.tableReservation.create({ data });
  },

  createPool(data: Prisma.PoolReservationUncheckedCreateInput) {
    return prisma.poolReservation.create({ data });
  },

  createEvent(data: Prisma.EventReservationUncheckedCreateInput) {
    return prisma.eventReservation.create({ data });
  },

  findTableByUser(userId: string) {
    return prisma.tableReservation.findMany({
      where: { userId },
      orderBy: { reservationTime: "desc" },
    });
  },

  findPoolByUser(userId: string) {
    return prisma.poolReservation.findMany({
      where: { userId },
      orderBy: { slotStart: "desc" },
    });
  },

  findEventByUser(userId: string) {
    return prisma.eventReservation.findMany({
      where: { userId },
      orderBy: { eventDate: "desc" },
    });
  },
};
