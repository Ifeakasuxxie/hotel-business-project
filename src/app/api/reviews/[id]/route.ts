import { withErrorHandler, withValidation } from "@/lib/middleware";
import { reviewService } from "@/lib/services";
import { jsonOk } from "@/lib/utils";
import { moderateReviewSchema } from "@/lib/validations";

export const dynamic = "force-dynamic";

export const PATCH = withErrorHandler(
  withValidation(moderateReviewSchema)(
    async (_request, data, context: { params: Promise<{ id: string }> }) => {
      const { id } = await context.params;
      const result = await reviewService.moderate(id, data.status);
      return jsonOk(result);
    },
  ),
);
