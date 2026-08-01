import type { z } from "zod";

import { NotImplementedError } from "@/lib/errors";
import {
  createRestaurantItemSchema,
  createRestaurantOrderSchema,
  menuQuerySchema,
} from "@/lib/validations";

type MenuQueryInput = z.infer<typeof menuQuerySchema>;
type CreateOrderInput = z.infer<typeof createRestaurantOrderSchema>;
type CreateItemInput = z.infer<typeof createRestaurantItemSchema>;

export const restaurantService = {
  async listMenu(_query: MenuQueryInput) {
    // TODO(Phase 4): filter menu by category/availability, return MenuListResult.
    throw new NotImplementedError("Menu listing is implemented in Phase 4");
  },

  async createOrder(_input: CreateOrderInput) {
    // TODO(Phase 4): price line items from RestaurantItem, create order +
    // order items in a transaction.
    throw new NotImplementedError("Order creation is implemented in Phase 4");
  },

  async getOrder(_id: string) {
    // TODO(Phase 4): fetch order with items.
    throw new NotImplementedError("Order lookup is implemented in Phase 4");
  },

  async listOrders(_userId: string) {
    // TODO(Phase 4): return paginated orders for the current user.
    throw new NotImplementedError("Order listing is implemented in Phase 4");
  },

  async getItem(_id: string) {
    // TODO(Phase 4): fetch a single menu item by id.
    throw new NotImplementedError("Menu item lookup is implemented in Phase 4");
  },

  async createItem(_input: CreateItemInput) {
    // TODO(Phase 4): admin-only menu item creation.
    throw new NotImplementedError("Menu management is implemented in Phase 4");
  },
};
