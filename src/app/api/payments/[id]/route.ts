import { withErrorHandler } from "@/lib/middleware";
import { paymentService } from "@/lib/services";
import { jsonOk } from "@/lib/utils";

export const dynamic = "force-dynamic";

export const GET = withErrorHandler(
  async (_request: Request, context: { params: Promise<{ id: string }> }) => {
    const { id } = await context.params;
    const result = await paymentService.verify(id);
    return jsonOk(result);
  },
);
