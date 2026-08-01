import type { Prisma } from "@prisma/client";

import { prisma } from "@/lib/prisma";

const bookingInclude = {
  room: { include: { type: true } },
  payment: true,
  coupon: true,
} satisfies Prisma.BookingInclude;

export const bookingRepository = {
  findById(id: string) {
    return prisma.booking.findUnique({ where: { id }, include: bookingInclude });
  },

  findByUser(userId: string) {
    return prisma.booking.findMany({
      where: { userId },
      include: bookingInclude,
      orderBy: { createdAt: "desc" },
    });
  },

  findMany(where: Prisma.BookingWhereInput = {}) {
    return prisma.booking.findMany({
      where,
      include: bookingInclude,
      orderBy: { createdAt: "desc" },
    });
  },

  count(where: Prisma.BookingWhereInput = {}) {
    return prisma.booking.count({ where });
  },

  create(data: Prisma.BookingUncheckedCreateInput) {
    return prisma.booking.create({ data, include: bookingInclude });
  },

  update(id: string, data: Prisma.BookingUncheckedUpdateInput) {
    return prisma.booking.update({ where: { id }, data, include: bookingInclude });
  },
};
