import { withErrorHandler, withValidation } from "@/lib/middleware";
import { paymentService } from "@/lib/services";
import { jsonCreated } from "@/lib/utils";
import { createPaymentSchema } from "@/lib/validations";

export const dynamic = "force-dynamic";

export const POST = withErrorHandler(
  withValidation(createPaymentSchema)(async (_request, data) => {
    const result = await paymentService.initialize(data);
    return jsonCreated(result, "Payment initialized");
  }),
);
