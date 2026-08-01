import type { Prisma } from "@prisma/client";

import { prisma } from "@/lib/prisma";

const orderInclude = {
  user: { select: { id: true, name: true } },
  orderItems: { include: { item: true } },
} satisfies Prisma.RestaurantOrderInclude;

export const restaurantRepository = {
  listCategories(where: Prisma.RestaurantCategoryWhereInput = {}) {
    return prisma.restaurantCategory.findMany({
      where,
      orderBy: { sortOrder: "asc" },
    });
  },

  listMenu(where: Prisma.RestaurantItemWhereInput = {}) {
    return prisma.restaurantItem.findMany({
      where,
      include: { category: true },
      orderBy: { name: "asc" },
    });
  },

  findItemById(id: string) {
    return prisma.restaurantItem.findUnique({
      where: { id },
      include: { category: true },
    });
  },

  findOrderById(id: string) {
    return prisma.restaurantOrder.findUnique({
      where: { id },
      include: orderInclude,
    });
  },

  findOrdersByUser(userId: string) {
    return prisma.restaurantOrder.findMany({
      where: { userId },
      include: orderInclude,
      orderBy: { createdAt: "desc" },
    });
  },

  createOrder(data: Prisma.RestaurantOrderUncheckedCreateInput) {
    return prisma.restaurantOrder.create({
      data,
      include: orderInclude,
    });
  },
};
