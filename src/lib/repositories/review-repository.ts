import type { Prisma } from "@prisma/client";

import { prisma } from "@/lib/prisma";

const reviewInclude = {
  user: { select: { id: true, name: true, image: true } },
  room: true,
} satisfies Prisma.ReviewInclude;

export const reviewRepository = {
  findById(id: string) {
    return prisma.review.findUnique({ where: { id }, include: reviewInclude });
  },

  findApprovedByRoom(roomId: string) {
    return prisma.review.findMany({
      where: { roomId, status: "APPROVED" },
      include: reviewInclude,
      orderBy: { createdAt: "desc" },
    });
  },

  findMany(where: Prisma.ReviewWhereInput = {}) {
    return prisma.review.findMany({
      where,
      include: reviewInclude,
      orderBy: { createdAt: "desc" },
    });
  },

  count(where: Prisma.ReviewWhereInput = {}) {
    return prisma.review.count({ where });
  },

  create(data: Prisma.ReviewUncheckedCreateInput) {
    return prisma.review.create({ data, include: reviewInclude });
  },

  update(id: string, data: Prisma.ReviewUncheckedUpdateInput) {
    return prisma.review.update({ where: { id }, data, include: reviewInclude });
  },

  delete(id: string) {
    return prisma.review.delete({ where: { id } });
  },
};
