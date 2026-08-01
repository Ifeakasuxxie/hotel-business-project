export interface ExperienceStory {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  image: string;
}

export const experienceStories: ExperienceStory[] = [
  {
    id: "morning-ritual",
    title: "Morning Rituals",
    subtitle: "Start your day the Kings way",
    description:
      "Wake to the aroma of freshly brewed coffee and the gentle Lagos sunrise. Whether you prefer a quiet terrace breakfast or an invigorating lap in the pool, every morning at The Kings Hotel is yours to design.",
    image: "https://images.unsplash.com/photo-1590490360182-c33d57733427?w=800&q=80",
  },
  {
    id: "culinary-journey",
    title: "A Culinary Journey",
    subtitle: "Flavours that tell a story",
    description:
      "From the sizzle of our open kitchen to the clink of glasses at sunset, dining here is never just a meal. Each dish is crafted with care, blending local heritage with international flair.",
    image: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800&q=80",
  },
  {
    id: "sunset-wind-down",
    title: "Sunsets & Slow Evenings",
    subtitle: "Where the day finds its rhythm",
    description:
      "As golden hour paints the sky, find your spot — a poolside lounger, a bar stool with a view, or the quiet of your suite. The evenings here are made for unwinding, one slow moment at a time.",
    image: "https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800&q=80",
  },
];
