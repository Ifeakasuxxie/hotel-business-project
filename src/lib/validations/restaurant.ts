import { OrderType } from "@prisma/client";
import { z } from "zod";

export const menuQuerySchema = z.object({
  categoryId: z.string().uuid().optional(),
  isAvailable: z.coerce.boolean().optional(),
  isFeatured: z.coerce.boolean().optional(),
});

export const orderItemSchema = z.object({
  itemId: z.string().uuid(),
  quantity: z.number().int().positive().max(50),
  notes: z.string().max(500).optional(),
});

export const createRestaurantOrderSchema = z.object({
  items: z.array(orderItemSchema).min(1).max(50),
  type: z.nativeEnum(OrderType).optional(),
  tableNumber: z.string().max(20).optional(),
  notes: z.string().max(500).optional(),
});

export const createRestaurantItemSchema = z.object({
  categoryId: z.string().uuid(),
  name: z.string().min(2).max(120),
  description: z.string().max(1000).optional(),
  price: z.number().int().nonnegative(),
  image: z.string().url().optional(),
  isAvailable: z.boolean().optional(),
  isFeatured: z.boolean().optional(),
  allergens: z.array(z.string()).optional(),
  ingredients: z.array(z.string()).optional(),
});
