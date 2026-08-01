export interface ServiceItem {
  id: string;
  title: string;
  description: string;
  icon: string;
  category: "accommodation" | "dining" | "bar" | "pool" | "recreation" | "guest-services";
  href?: string;
}

export const services: ServiceItem[] = [
  {
    id: "deluxe-room",
    title: "Deluxe Room",
    description: "Elegantly appointed room with premium comfort and modern amenities for a relaxing stay.",
    icon: "Bed",
    category: "accommodation",
    href: "/rooms/deluxe-room",
  },
  {
    id: "executive-suite",
    title: "Executive Suite",
    description: "Spacious suite with a separate living area, premium furnishings, and exclusive amenities.",
    icon: "Hotel",
    category: "accommodation",
    href: "/rooms/executive-suite",
  },
  {
    id: "penthouse-suite",
    title: "Penthouse Suite",
    description: "The pinnacle of luxury living with panoramic views and dedicated butler service.",
    icon: "Building2",
    category: "accommodation",
    href: "/rooms/penthouse-suite",
  },
  {
    id: "fine-dining",
    title: "Fine Dining Restaurant",
    description: "Exquisite cuisine crafted from locally sourced ingredients, served in an elegant open-kitchen setting.",
    icon: "Utensils",
    category: "dining",
  },
  {
    id: "terrace-dining",
    title: "Terrace Dining",
    description: "Al fresco dining under the stars with panoramic views, perfect for romantic evenings.",
    icon: "Sun",
    category: "dining",
  },
  {
    id: "breakfast-service",
    title: "Breakfast Service",
    description: "A lavish breakfast buffet featuring continental favorites and local specialties, served daily.",
    icon: "Coffee",
    category: "dining",
  },
  {
    id: "bar-lounge",
    title: "Bar & Lounge",
    description: "Handcrafted cocktails, premium spirits, and a curated wine list in a sophisticated lounge atmosphere.",
    icon: "GlassWater",
    category: "bar",
  },
  {
    id: "swimming-pool",
    title: "Swimming Pool",
    description: "Temperature-controlled outdoor pool with loungers, towel service, and poolside refreshments.",
    icon: "Waves",
    category: "pool",
  },
  {
    id: "spa-wellness",
    title: "Spa & Wellness",
    description: "Rejuvenate with traditional and modern spa treatments, steam rooms, and massage therapy.",
    icon: "Sparkles",
    category: "recreation",
  },
  {
    id: "fitness-center",
    title: "Fitness Center",
    description: "Fully equipped gym with modern cardio and strength-training equipment, open 24 hours.",
    icon: "Dumbbell",
    category: "recreation",
  },
  {
    id: "snooker",
    title: "Snooker & Billiards",
    description: "Tournament-grade snooker tables in an air-conditioned lounge with professional-grade equipment.",
    icon: "Dices",
    category: "recreation",
  },
  {
    id: "table-tennis",
    title: "Table Tennis",
    description: "Indoor table tennis facilities available for casual matches and friendly competitions.",
    icon: "CircleDot",
    category: "recreation",
  },
  {
    id: "board-games",
    title: "Board Games Lounge",
    description: "A curated selection of classic and modern board games in a comfortable lounge setting.",
    icon: "Gamepad2",
    category: "recreation",
  },
  {
    id: "outdoor-activities",
    title: "Outdoor Activities",
    description: "Organized outdoor activities including guided walks, cycling tours, and garden exploration.",
    icon: "Trees",
    category: "recreation",
  },
  {
    id: "room-service",
    title: "Room Service",
    description: "24-hour in-room dining with a full menu of international and local dishes delivered to your door.",
    icon: "Bell",
    category: "guest-services",
  },
  {
    id: "concierge",
    title: "Concierge Desk",
    description: "Our dedicated concierge team is available around the clock to assist with any request or arrangement.",
    icon: "ConciergeBell",
    category: "guest-services",
  },
  {
    id: "laundry",
    title: "Laundry & Dry Cleaning",
    description: "Same-day laundry and dry cleaning services to keep you looking your best throughout your stay.",
    icon: "Shirt",
    category: "guest-services",
  },
  {
    id: "airport-transfer",
    title: "Airport Transfer",
    description: "Luxury airport pickup and drop-off services in chauffeured vehicles, bookable in advance.",
    icon: "Plane",
    category: "guest-services",
  },
  {
    id: "wi-fi",
    title: "Free High-Speed Wi-Fi",
    description: "Complimentary high-speed wireless internet throughout the property.",
    icon: "Wifi",
    category: "guest-services",
  },
  {
    id: "parking",
    title: "Secure Parking",
    description: "Valet and self-parking options available with 24-hour security surveillance.",
    icon: "Car",
    category: "guest-services",
  },
];

export const serviceCategories = [
  { id: "accommodation", label: "Accommodation", description: "Luxury rooms and suites designed for comfort" },
  { id: "dining", label: "Restaurant", description: "Exceptional dining experiences from breakfast to dinner" },
  { id: "bar", label: "Bar", description: "Handcrafted cocktails and premium spirits" },
  { id: "pool", label: "Pool", description: "Temperature-controlled outdoor swimming" },
  { id: "recreation", label: "Recreation", description: "Spa, fitness, games, and outdoor activities" },
  { id: "guest-services", label: "Guest Services", description: "Concierge, room service, and practical amenities" },
] as const;

export function getServicesByCategory(category: string) {
  return services.filter((s) => s.category === category);
}
