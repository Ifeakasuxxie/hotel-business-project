import { withErrorHandler, withValidation } from "@/lib/middleware";
import { bookingService } from "@/lib/services";
import { jsonOk } from "@/lib/utils";
import { updateBookingSchema } from "@/lib/validations";

export const dynamic = "force-dynamic";

export const GET = withErrorHandler(
  async (_request: Request, context: { params: Promise<{ id: string }> }) => {
    const { id } = await context.params;
    const result = await bookingService.getById(id);
    return jsonOk(result);
  },
);

export const PATCH = withErrorHandler(
  withValidation(updateBookingSchema)(
    async (_request, data, context: { params: Promise<{ id: string }> }) => {
      const { id } = await context.params;
      const result = await bookingService.updateStatus(id, data);
      return jsonOk(result);
    },
  ),
);
