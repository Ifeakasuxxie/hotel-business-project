import { withErrorHandler } from "@/lib/middleware";
import { authService } from "@/lib/services";
import { jsonOk } from "@/lib/utils";

export const dynamic = "force-dynamic";

export const POST = withErrorHandler(async () => {
  const result = await authService.logout();
  return jsonOk(result, "Signed out");
});
