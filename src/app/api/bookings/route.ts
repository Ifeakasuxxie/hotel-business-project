import { withErrorHandler, withValidation } from "@/lib/middleware";
import { bookingService } from "@/lib/services";
import { jsonCreated, jsonOk } from "@/lib/utils";
import { createBookingSchema } from "@/lib/validations";

export const dynamic = "force-dynamic";

export const GET = withErrorHandler(async () => {
  const result = await bookingService.listForUser("");
  return jsonOk(result);
});

export const POST = withErrorHandler(
  withValidation(createBookingSchema)(async (_request, data) => {
    const result = await bookingService.create(data);
    return jsonCreated(result, "Booking created");
  }),
);
