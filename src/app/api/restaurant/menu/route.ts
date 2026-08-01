import { withErrorHandler } from "@/lib/middleware";
import { restaurantService } from "@/lib/services";
import { jsonOk } from "@/lib/utils";

export const dynamic = "force-dynamic";

export const GET = withErrorHandler(async () => {
  const result = await restaurantService.listMenu({});
  return jsonOk(result);
});
