import type { UserRole } from "@prisma/client";

import { prisma } from "@/lib/prisma";

export const roleRepository = {
  findByName(name: UserRole) {
    return prisma.role.findUnique({ where: { name } });
  },

  findById(id: string) {
    return prisma.role.findUnique({ where: { id } });
  },
};
