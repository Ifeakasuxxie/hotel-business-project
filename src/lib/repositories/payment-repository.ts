import type { Prisma } from "@prisma/client";

import { prisma } from "@/lib/prisma";

const paymentInclude = {
  booking: true,
} satisfies Prisma.PaymentInclude;

export const paymentRepository = {
  findById(id: string) {
    return prisma.payment.findUnique({ where: { id }, include: paymentInclude });
  },

  findByBookingId(bookingId: string) {
    return prisma.payment.findUnique({
      where: { bookingId },
      include: paymentInclude,
    });
  },

  findByProviderReference(providerReference: string) {
    return prisma.payment.findUnique({
      where: { providerReference },
      include: paymentInclude,
    });
  },

  create(data: Prisma.PaymentUncheckedCreateInput) {
    return prisma.payment.create({ data, include: paymentInclude });
  },

  update(id: string, data: Prisma.PaymentUncheckedUpdateInput) {
    return prisma.payment.update({ where: { id }, data, include: paymentInclude });
  },
};
