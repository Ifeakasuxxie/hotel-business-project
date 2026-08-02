import { SectionHeader } from "@/components/common/section-header";
import { AmenityCard } from "@/components/common/amenity-card";
import { amenities } from "@/lib/data";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Hotel Amenities",
  description:
    "Every comfort and convenience thoughtfully arranged for your enjoyment at The Kings Hotel.",
  alternates: {
    canonical: "/experience/amenities",
  },
};

export default function AmenitiesPage() {
  return (
    <div className="container-page py-24 space-y-12">
      <SectionHeader
        tag="Amenities"
        title="Hotel Facilities"
        description="Every comfort and convenience thoughtfully arranged for your enjoyment."
      />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {amenities.map((amenity) => (
          <AmenityCard key={amenity.id} amenity={amenity} />
        ))}
      </div>
    </div>
  );
}
