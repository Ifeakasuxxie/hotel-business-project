import { withErrorHandler, withValidation } from "@/lib/middleware";
import { reservationService } from "@/lib/services";
import { jsonCreated } from "@/lib/utils";
import { poolReservationSchema } from "@/lib/validations";

export const dynamic = "force-dynamic";

export const POST = withErrorHandler(
  withValidation(poolReservationSchema)(async (_request, data) => {
    const result = await reservationService.createPool(data);
    return jsonCreated(result, "Pool reservation created");
  }),
);
