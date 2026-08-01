export interface Amenity {
  id: string;
  title: string;
  description: string;
  icon: string;
}

export const amenities: Amenity[] = [
  {
    id: "swimming-pool",
    title: "Swimming Pool",
    description: "Temperature-controlled outdoor pool with loungers, towel service, and poolside refreshments.",
    icon: "Waves",
  },
  {
    id: "spa-wellness",
    title: "Spa & Wellness",
    description: "Rejuvenate with traditional and modern spa treatments, steam rooms, and massage therapy.",
    icon: "Sparkles",
  },
  {
    id: "fitness-center",
    title: "Fitness Center",
    description: "Fully equipped gym with modern cardio and strength-training equipment, open 24 hours.",
    icon: "Dumbbell",
  },
  {
    id: "wi-fi",
    title: "Free High-Speed Wi-Fi",
    description: "Stay connected with complimentary high-speed wireless internet throughout the property.",
    icon: "Wifi",
  },
  {
    id: "parking",
    title: "Secure Parking",
    description: "Valet and self-parking options available with 24-hour security surveillance.",
    icon: "Car",
  },
  {
    id: "conference",
    title: "Event & Conference",
    description: "Versatile event spaces equipped for business meetings, weddings, and private gatherings.",
    icon: "Building2",
  },
];
