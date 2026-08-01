import Image from "next/image";
import { SectionHeader } from "@/components/common/section-header";

const galleryImages = [
  {
    src: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=600&q=80",
    alt: "Hotel exterior with pool",
    span: "col-span-2 row-span-2",
  },
  {
    src: "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=600&q=80",
    alt: "Hotel lobby interior",
    span: "col-span-1 row-span-1",
  },
  {
    src: "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=600&q=80",
    alt: "Hotel pool and loungers",
    span: "col-span-1 row-span-1",
  },
  {
    src: "https://images.unsplash.com/photo-1584132967334-10e028bd69f7?w=600&q=80",
    alt: "Hotel room interior",
    span: "col-span-1 row-span-1",
  },
  {
    src: "https://images.unsplash.com/photo-1591088398332-8a7791972843?w=600&q=80",
    alt: "Hotel dining area",
    span: "col-span-1 row-span-1",
  },
];

export function GallerySection() {
  return (
    <section className="py-24 bg-cream/60">
      <div className="container-page space-y-12">
        <SectionHeader
          tag="Gallery"
          title="A Glimpse of Our World"
          description="Browse through our spaces and imagine yourself here."
        />
        <div className="grid grid-cols-2 sm:grid-cols-3 sm:grid-rows-2 gap-4 max-w-5xl mx-auto">
          {galleryImages.map((img) => (
            <div
              key={img.alt}
              className={`relative rounded-lg overflow-hidden ${img.span} min-h-[180px] sm:min-h-[220px]`}
            >
              <Image
                src={img.src}
                alt={img.alt}
                fill
                className="object-cover transition-transform duration-500 hover:scale-105"
                sizes="(max-width: 768px) 50vw, 33vw"
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
