import { withErrorHandler, withValidation } from "@/lib/middleware";
import { reservationService } from "@/lib/services";
import { jsonCreated } from "@/lib/utils";
import { tableReservationSchema } from "@/lib/validations";

export const dynamic = "force-dynamic";

export const POST = withErrorHandler(
  withValidation(tableReservationSchema)(async (_request, data) => {
    const result = await reservationService.createTable(data);
    return jsonCreated(result, "Table reservation created");
  }),
);
