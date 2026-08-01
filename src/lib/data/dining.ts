export interface DiningOption {
  id: string;
  title: string;
  description: string;
  icon: string;
  type: "restaurant" | "bar" | "lounge" | "cafe";
  href: string;
}

export const diningOptions: DiningOption[] = [
  {
    id: "restaurant",
    title: "Fine Dining Restaurant",
    description: "Exquisite cuisine crafted from locally sourced ingredients, served in an elegant setting with an open kitchen.",
    icon: "Utensils",
    type: "restaurant",
    href: "/experience/dining",
  },
  {
    id: "bar",
    title: "Bar & Lounge",
    description: "Handcrafted cocktails, premium spirits, and a carefully curated wine list in a sophisticated lounge atmosphere.",
    icon: "GlassWater",
    type: "bar",
    href: "/experience/dining",
  },
  {
    id: "terrace",
    title: "Terrace Dining",
    description: "Al fresco dining under the stars with panoramic views, perfect for romantic evenings and social gatherings.",
    icon: "Sun",
    type: "restaurant",
    href: "/experience/dining",
  },
  {
    id: "breakfast",
    title: "Breakfast Service",
    description: "A lavish breakfast buffet featuring both continental favorites and local specialties, served daily.",
    icon: "Coffee",
    type: "cafe",
    href: "/experience/dining",
  },
];
