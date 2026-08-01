import { SectionHeader } from "@/components/common/section-header";
import { experienceStories } from "@/lib/data";
import Image from "next/image";

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
