import { withErrorHandler } from "@/lib/middleware";
import { authService } from "@/lib/services";
import { jsonNoContent } from "@/lib/utils";

export const dynamic = "force-dynamic";

export const POST = withErrorHandler(async () => {
  await authService.logout();
  return jsonNoContent();
});
