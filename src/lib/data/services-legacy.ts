export interface Service {
  id: string;
  title: string;
  description: string;
  icon: string;
}

export const guestServices: Service[] = [
  {
    id: "room-service",
    title: "Room Service",
    description: "24-hour in-room dining with a full menu of international and local dishes delivered to your door.",
    icon: "Bell",
  },
  {
    id: "concierge",
    title: "Concierge Desk",
    description: "Our dedicated concierge team is available around the clock to assist with any request or arrangement.",
    icon: "ConciergeBell",
  },
  {
    id: "laundry",
    title: "Laundry & Dry Cleaning",
    description: "Same-day laundry and dry cleaning services to keep you looking your best throughout your stay.",
    icon: "Shirt",
  },
  {
    id: "airport-transfer",
    title: "Airport Transfer",
    description: "Luxury airport pickup and drop-off services in chauffeured vehicles, bookable in advance.",
    icon: "Plane",
  },
];
