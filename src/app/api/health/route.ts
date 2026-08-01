import { withErrorHandler } from "@/lib/middleware";
import { jsonOk } from "@/lib/utils";

export const dynamic = "force-dynamic";

export const GET = withErrorHandler(async () => {
  return jsonOk({
    status: "ok",
    timestamp: new Date().toISOString(),
  });
});
