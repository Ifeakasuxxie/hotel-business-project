import { ValidationError } from "@/lib/errors";
import { withErrorHandler, withValidation } from "@/lib/middleware";
import { reviewService } from "@/lib/services";
import { jsonCreated, jsonOk } from "@/lib/utils";
import { createReviewSchema } from "@/lib/validations";

export const dynamic = "force-dynamic";

export const GET = withErrorHandler(async (request: Request) => {
  const url = new URL(request.url);
  const roomId = url.searchParams.get("roomId");

  if (!roomId) {
    throw new ValidationError("roomId query parameter is required");
  }

  const result = await reviewService.listApprovedForRoom(roomId);
  return jsonOk(result);
});

export const POST = withErrorHandler(
  withValidation(createReviewSchema)(async (_request, data) => {
    const result = await reviewService.create(data);
    return jsonCreated(result, "Review submitted");
  }),
);
