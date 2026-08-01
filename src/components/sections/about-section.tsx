import Image from "next/image";
import Link from "next/link";
import { SectionHeader } from "@/components/common/section-header";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

const highlights = [
  { icon: "🏛️", label: "Premium Accommodation" },
  { icon: "🍽️", label: "Fine Dining" },
  { icon: "✨", label: "Personalized Service" },
];

export function AboutSection() {
  return (
    <section className="py-24 container-page">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
        <div className="relative">
          <div className="relative h-[400px] sm:h-[500px] rounded-lg overflow-hidden shadow-soft">
            <Image
              src="https://images.unsplash.com/photo-1590490360182-c33d57733427?w=800&q=80"
              alt="Hotel lobby with elegant furnishings"
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 50vw"
            />
          </div>
          <div className="absolute -bottom-6 -right-6 w-44 h-44 sm:w-52 sm:h-52 rounded-lg overflow-hidden border-4 border-background shadow-soft">
            <Image
              src="https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=400&q=80"
              alt="Hotel reception area"
              fill
              className="object-cover"
              sizes="200px"
            />
          </div>
        </div>
        <div className="space-y-8">
          <SectionHeader
            tag="About Us"
            title="A Legacy of Warm Hospitality"
            description="Nestled in the heart of the city, our hotel has been a beacon of refined comfort and personalized service for over a decade."
            align="left"
          />
          <p className="text-muted-foreground leading-relaxed">
            From the moment you step through our doors, you are welcomed into a world where
            every detail has been carefully considered. Our dedicated team takes pride in
            anticipating your needs and creating an environment that feels like a home away
            from home — only more indulgent.
          </p>
          <div className="grid grid-cols-3 gap-8 pt-2">
            {highlights.map((h) => (
              <div key={h.label} className="text-center">
                <div className="text-3xl sm:text-4xl mb-1">{h.icon}</div>
                <div className="text-sm text-muted-foreground mt-1">{h.label}</div>
              </div>
            ))}
          </div>
          <Button asChild variant="outline" className="gap-2">
            <Link href="/about">
              Learn More <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
