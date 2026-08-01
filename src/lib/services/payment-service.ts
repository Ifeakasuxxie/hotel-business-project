import type { z } from "zod";

import { NotImplementedError } from "@/lib/errors";
import { createPaymentSchema } from "@/lib/validations";

type CreatePaymentInput = z.infer<typeof createPaymentSchema>;

export const paymentService = {
  async initialize(_input: CreatePaymentInput) {
    // TODO(Phase 4): create PENDING Payment, call provider API
    // (Paystack/Flutterwave/Stripe), return provider checkout reference.
    throw new NotImplementedError("Payment initialization is implemented in Phase 4");
  },

  async verify(_providerReference: string) {
    // TODO(Phase 4): confirm payment with provider, mark SUCCESS, trigger notification.
    throw new NotImplementedError("Payment verification is implemented in Phase 4");
  },

  async refund(_paymentId: string) {
    // TODO(Phase 4): initiate refund and record REFUNDED status.
    throw new NotImplementedError("Refunds are implemented in Phase 4");
  },
};
