import { withErrorHandler, withValidation } from "@/lib/middleware";
import { reservationService } from "@/lib/services";
import { jsonCreated } from "@/lib/utils";
import { eventReservationSchema } from "@/lib/validations";

export const dynamic = "force-dynamic";

export const POST = withErrorHandler(
  withValidation(eventReservationSchema)(async (_request, data) => {
    const result = await reservationService.createEvent(data);
    return jsonCreated(result, "Event reservation created");
  }),
);
