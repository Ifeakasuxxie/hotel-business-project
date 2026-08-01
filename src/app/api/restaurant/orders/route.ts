import { withErrorHandler, withValidation } from "@/lib/middleware";
import { restaurantService } from "@/lib/services";
import { jsonCreated, jsonOk } from "@/lib/utils";
import { createRestaurantOrderSchema } from "@/lib/validations";

export const dynamic = "force-dynamic";

export const GET = withErrorHandler(async () => {
  const result = await restaurantService.listOrders("");
  return jsonOk(result);
});

export const POST = withErrorHandler(
  withValidation(createRestaurantOrderSchema)(async (_request, data) => {
    const result = await restaurantService.createOrder(data);
    return jsonCreated(result, "Order created");
  }),
);
