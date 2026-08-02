import type { Prisma } from "@prisma/client";

import { prisma } from "@/lib/prisma";

export const userRepository = {
  findById(id: string) {
    return prisma.user.findUnique({ where: { id } });
  },

  findByIdWithRole(id: string) {
    return prisma.user.findUnique({
      where: { id },
      include: { role: true },
    });
  },

  findByEmail(email: string) {
    return prisma.user.findUnique({ where: { email } });
  },

  findByEmailWithRole(email: string) {
    return prisma.user.findUnique({
      where: { email },
      include: { role: true },
    });
  },

  create(data: Prisma.UserUncheckedCreateInput) {
    return prisma.user.create({ data });
  },

  update(id: string, data: Prisma.UserUncheckedUpdateInput) {
    return prisma.user.update({ where: { id }, data });
  },

  delete(id: string) {
    return prisma.user.delete({ where: { id } });
  },

  count(where: Prisma.UserWhereInput = {}) {
    return prisma.user.count({ where });
  },

  findMany(where: Prisma.UserWhereInput = {}) {
    return prisma.user.findMany({
      where,
      orderBy: { createdAt: "desc" },
    });
  },

  findManyPaginated(
    where: Prisma.UserWhereInput = {},
    { skip, take }: { skip: number; take: number },
  ) {
    return prisma.user.findMany({
      where,
      include: { role: true },
      orderBy: { createdAt: "desc" },
      skip,
      take,
    });
  },
};
