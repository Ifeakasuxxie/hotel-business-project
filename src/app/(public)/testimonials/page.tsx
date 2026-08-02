import { SectionHeader } from "@/components/common/section-header";
import { TestimonialCard } from "@/components/common/testimonial-card";
import { testimonials } from "@/lib/data";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Guest Testimonials",
  description:
    "Hear from those who have experienced The Kings Hotel's hospitality firsthand.",
  alternates: {
    canonical: "/testimonials",
  },
};

export default function TestimonialsPage() {
  return (
    <div className="py-24 space-y-12">
      <div className="container-page">
        <SectionHeader
          tag="Testimonials"
          title="What Our Guests Say"
          description="Hear from those who have experienced our hospitality firsthand."
        />
      </div>
      <div className="bg-navy py-20">
        <div className="container-page">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial) => (
              <TestimonialCard key={testimonial.id} testimonial={testimonial} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
