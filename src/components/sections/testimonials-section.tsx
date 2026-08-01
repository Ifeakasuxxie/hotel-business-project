import { SectionHeader } from "@/components/common/section-header";
import { TestimonialCard } from "@/components/common/testimonial-card";
import { testimonials } from "@/lib/data";

export function TestimonialsSection() {
  return (
    <section className="py-24 bg-navy">
      <div className="container-page space-y-12">
        <SectionHeader
          tag="Testimonials"
          title="What Our Guests Say"
          description="Hear from those who have experienced our hospitality firsthand."
        />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial) => (
            <TestimonialCard key={testimonial.id} testimonial={testimonial} />
          ))}
        </div>
      </div>
    </section>
  );
}
