import { SectionHeader } from "@/components/common/section-header";
import { Utensils, GlassWater, Sun, Coffee } from "lucide-react";
import { diningOptions } from "@/lib/data";
import type { Metadata } from "next";

const iconMap: Record<string, React.ReactNode> = {
  Utensils: <Utensils className="h-6 w-6" />,
  GlassWater: <GlassWater className="h-6 w-6" />,
  Sun: <Sun className="h-6 w-6" />,
  Coffee: <Coffee className="h-6 w-6" />,
};

export const metadata: Metadata = {
  title: "Dining",
  description:
    "Restaurant, bar, and terrace dining experiences at The Kings Hotel.",
  alternates: {
    canonical: "/experience/dining",
  },
};

export default function DiningPage() {
  return (
    <div className="container-page py-24 space-y-12">
      <SectionHeader
        tag="Dining"
        title="Culinary Experiences"
        description="A journey of flavors awaits, from our fine dining restaurant to casual terrace gatherings."
      />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {diningOptions.map((option) => (
          <div
            key={option.id}
            className="rounded-lg bg-card border border-border p-6 transition-all duration-300 hover:shadow-card-hover hover:-translate-y-1"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gold/10 text-gold mb-4">
              {iconMap[option.icon] || <Utensils className="h-6 w-6" />}
            </div>
            <h3 className="heading-serif text-lg text-foreground mb-2">{option.title}</h3>
            <p className="text-sm text-muted-foreground">{option.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
