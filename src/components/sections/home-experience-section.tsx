import Link from "next/link";
import { SectionHeader } from "@/components/common/section-header";
import { Button } from "@/components/ui/button";
import { experienceStories } from "@/lib/data";
import Image from "next/image";
import { ArrowRight } from "lucide-react";

export function HomeExperienceSection() {
  const story = experienceStories[1];
  return (
    <section className="py-24 bg-cream/60">
      <div className="container-page">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          <div className="relative h-[350px] sm:h-[450px] rounded-lg overflow-hidden shadow-soft">
            <Image
              src={story.image}
              alt={story.title}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 50vw"
            />
          </div>
          <div className="space-y-6">
            <SectionHeader
              tag="The Experience"
              title={story.title}
              description={story.description}
              align="left"
            />
            <Button asChild variant="outline" className="gap-2">
              <Link href="/experience">
                Explore The Experience <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
