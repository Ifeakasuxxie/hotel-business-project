import { withErrorHandler } from "@/lib/middleware";
import { roomService } from "@/lib/services";
import { jsonOk } from "@/lib/utils";

export const dynamic = "force-dynamic";

export const GET = withErrorHandler(async () => {
  const result = await roomService.listAvailable({});
  return jsonOk(result);
});
