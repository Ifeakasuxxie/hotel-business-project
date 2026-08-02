import { SectionHeader } from "@/components/common/section-header";
import { experienceStories } from "@/lib/data";
import Image from "next/image";
import Link from "next/link";
import { Sparkles, Utensils, Dices, Bell, ArrowRight } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "The Experience",
  description:
    "Every corner of The Kings Hotel holds a moment worth savoring — explore our amenities, dining, recreation, and guest services.",
  alternates: {
    canonical: "/experience",
  },
};

const exploreLinks = [
  {
    href: "/experience/amenities",
    title: "Amenities",
    description: "Hotel facilities & everyday comforts",
    icon: Sparkles,
  },
  {
    href: "/experience/dining",
    title: "Dining",
    description: "Restaurant, bar & terrace experiences",
    icon: Utensils,
  },
  {
    href: "/experience/recreation",
    title: "Recreation",
    description: "Snooker, games & outdoor activities",
    icon: Dices,
  },
  {
    href: "/experience/services",
    title: "Guest Services",
    description: "Concierge, laundry & practical services",
    icon: Bell,
  },
];

export default function ExperiencePage() {
  return (
    <div className="py-24 space-y-24">
      <div className="container-page">
        <SectionHeader
          tag="The Experience"
          title="More Than a Stay"
          description="Every corner of The Kings Hotel holds a moment worth savoring. Here is what it feels like to be our guest."
        />
      </div>
      <div className="container-page">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {exploreLinks.map(({ href, title, description, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className="group rounded-lg bg-card border border-border p-6 transition-all duration-300 hover:shadow-card-hover hover:-translate-y-1"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gold/10 text-gold mb-4 transition-colors group-hover:bg-gold/20">
                <Icon className="h-6 w-6" />
              </div>
              <h3 className="heading-serif text-lg text-foreground mb-1.5">{title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed mb-4">{description}</p>
              <span className="inline-flex items-center gap-1 text-sm font-medium text-gold">
                Explore <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </span>
            </Link>
          ))}
        </div>
      </div>
      {experienceStories.map((story, index) => (
        <section
          key={story.id}
          className={`container-page ${index % 2 === 1 ? "bg-cream/30 py-24 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8" : ""}`}
        >
          <div
            className={`grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center ${
              index % 2 === 1 ? "lg:direction-rtl" : ""
            }`}
          >
            <div className={`space-y-6 ${index % 2 === 1 ? "lg:order-2" : ""}`}>
              <span className="section-tag">{story.subtitle}</span>
              <h2 className="heading-serif text-3xl sm:text-4xl lg:text-5xl text-foreground">
                {story.title}
              </h2>
              <p className="text-muted-foreground leading-relaxed text-base sm:text-lg">
                {story.description}
              </p>
            </div>
            <div className={`relative h-[350px] sm:h-[450px] rounded-lg overflow-hidden shadow-soft ${index % 2 === 1 ? "lg:order-1" : ""}`}>
              <Image
                src={story.image}
                alt={story.title}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 50vw"
              />
            </div>
          </div>
        </section>
      ))}
    </div>
  );
}
