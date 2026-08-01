import { withErrorHandler } from "@/lib/middleware";
import { authService } from "@/lib/services";
import { jsonOk } from "@/lib/utils";

export const dynamic = "force-dynamic";

export const GET = withErrorHandler(async () => {
  const result = await authService.getCurrentUser();
  return jsonOk(result);
});
