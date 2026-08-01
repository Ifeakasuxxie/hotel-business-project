import type {
  Booking,
  Payment,
  RestaurantItem,
  Review,
  Room,
  RoomType,
  User,
} from "@prisma/client";

import type { Paginated } from "./pagination";

export type UserDto = Pick<User, "id" | "name" | "email" | "roleId" | "isActive">;
export type UserProfileDto = Pick<
  User,
  "id" | "name" | "email" | "phone" | "image" | "emailVerified"
>;

export type RoomTypeDto = Pick<
  RoomType,
  "id" | "name" | "slug" | "basePrice" | "currency" | "capacity" | "features" | "images"
>;

export type RoomDto = Pick<
  Room,
  "id" | "roomNumber" | "floor" | "status" | "notes"
> & {
  type: RoomTypeDto;
};

export type BookingDto = Pick<
  Booking,
  | "id"
  | "userId"
  | "roomId"
  | "checkIn"
  | "checkOut"
  | "guests"
  | "status"
  | "source"
  | "totalAmount"
  | "currency"
>;

export type PaymentDto = Pick<
  Payment,
  "id" | "bookingId" | "amount" | "currency" | "status" | "provider" | "providerReference" | "paidAt"
>;

export type ReviewDto = Pick<
  Review,
  "id" | "userId" | "roomId" | "rating" | "title" | "comment" | "status"
>;

export type MenuItemDto = Pick<
  RestaurantItem,
  "id" | "categoryId" | "name" | "slug" | "description" | "price" | "currency" | "image" | "isAvailable"
>;

export type UserListResult = Paginated<UserDto>;
export type RoomListResult = Paginated<RoomDto>;
export type BookingListResult = Paginated<BookingDto>;
export type MenuListResult = Paginated<MenuItemDto>;
