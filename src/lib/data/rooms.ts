export interface RoomFeature {
  name: string;
}

export interface Room {
  id: string;
  slug: string;
  title: string;
  description: string;
  longDescription: string;
  price: number;
  currency: string;
  capacity: string;
  bed: string;
  size: string;
  features: string[];
  images: string[];
}

export const rooms: Room[] = [
  {
    id: "deluxe-room",
    slug: "deluxe-room",
    title: "Deluxe Room",
    description: "Elegantly appointed room with premium comfort and modern amenities for a relaxing stay.",
    longDescription:
      "Our Deluxe Room offers a refined retreat with thoughtful details. The room features a plush king-sized bed, a marble ensuite bathroom with rainfall shower, and a dedicated workspace. Large windows flood the space with natural light and offer serene garden or city views.",
    price: 65000,
    currency: "NGN",
    capacity: "2 Guests",
    bed: "King-Size Bed",
    size: "35 m²",
    features: ["King-Size Bed", "Ensuite Bathroom", "Smart TV", "Free Wi-Fi", "Mini Bar", "Work Desk"],
    images: ["/images/room-deluxe.jpg"],
  },
  {
    id: "executive-suite",
    slug: "executive-suite",
    title: "Executive Suite",
    description: "Spacious suite with a separate living area, premium furnishings, and exclusive amenities.",
    longDescription:
      "The Executive Suite is designed for the discerning traveler who values space and sophistication. It features a separate living lounge, a bedroom with a super king bed, and a lavish bathroom with a deep soaking tub. Complimentary breakfast and exclusive lounge access are included.",
    price: 120000,
    currency: "NGN",
    capacity: "2 Guests",
    bed: "Super King-Size Bed",
    size: "55 m²",
    features: ["Separate Living Area", "Super King Bed", "Deep Soaking Tub", "Breakfast Included", "Lounge Access", "Balcony"],
    images: ["/images/room-executive.jpg"],
  },
  {
    id: "penthouse-suite",
    slug: "penthouse-suite",
    title: "Penthouse Suite",
    description: "The pinnacle of luxury living with panoramic views, a private terrace, and dedicated butler service.",
    longDescription:
      "Perched on the top floor, the Penthouse Suite offers an unmatched level of luxury. Enjoy panoramic skyline views from your private terrace, unwind in the jacuzzi, and indulge in the dedicated butler service. The suite features a master bedroom, a grand living room, a dining area, and a state-of-the-art kitchenette.",
    price: 350000,
    currency: "NGN",
    capacity: "4 Guests",
    bed: "Emperor-Size Bed",
    size: "95 m²",
    features: ["Panoramic Views", "Private Terrace", "Jacuzzi", "Butler Service", "Dining Area", "Kitchenette"],
    images: ["/images/room-penthouse.jpg"],
  },
];

export function getRooms(): Room[] {
  return rooms;
}

export function getRoomBySlug(slug: string): Room | undefined {
  return rooms.find((r) => r.slug === slug);
}

export function getFeaturedRooms(): Room[] {
  return rooms.slice(0, 3);
}

export function getLuxuryRooms(): Room[] {
  return rooms.filter((r) => r.price >= 100000);
}

export interface RoomTypeSummary {
  id: string;
  slug: string;
  title: string;
  bed: string;
  size: string;
  capacity: string;
  price: number;
  currency: string;
}

export function getRoomTypes(): RoomTypeSummary[] {
  return rooms.map(({ id, slug, title, bed, size, capacity, price, currency }) => ({
    id,
    slug,
    title,
    bed,
    size,
    capacity,
    price,
    currency,
  }));
}
