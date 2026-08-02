import { SectionHeader } from "@/components/common/section-header";
import Image from "next/image";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Our Story",
  description:
    "Discover the passion and dedication that has made The Kings Hotel a destination for discerning travelers.",
  alternates: {
    canonical: "/about",
  },
};

export default function AboutPage() {
  return (
    <div className="container-page py-24 space-y-16">
      <SectionHeader
        tag="About"
        title="Our Story"
        description="Discover the passion and dedication that has made us a destination for discerning travelers."
      />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        <div className="relative h-[400px] rounded-lg overflow-hidden">
          <Image
            src="https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&q=80"
            alt="Hotel exterior"
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 50vw"
          />
        </div>
        <div className="space-y-4 text-muted-foreground leading-relaxed">
          <p>
            Founded on the principles of genuine hospitality and attention to detail, our hotel
            has welcomed guests from around the world for over fifteen years. Every corner of
            our property reflects our commitment to creating memorable experiences.
          </p>
          <p>
            From our thoughtfully designed rooms to our curated dining experiences, we strive
            to exceed expectations at every turn. Our team, many of whom have been with us
            for years, takes genuine pride in delivering warm, personalized service.
          </p>
        </div>
      </div>
    </div>
  );
}
