import { withErrorHandler } from "@/lib/middleware";
import { reviewService } from "@/lib/services";
import { jsonOk } from "@/lib/utils";

export const dynamic = "force-dynamic";

export const PATCH = withErrorHandler(
  async (_request: Request, context: { params: Promise<{ id: string }> }) => {
    const { id } = await context.params;
    const result = await reviewService.moderate(id, "APPROVED");
    return jsonOk(result);
  },
);
