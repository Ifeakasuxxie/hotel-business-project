import type { Testimonial } from "@/lib/data";
import { Star } from "lucide-react";

interface TestimonialCardProps {
  testimonial: Testimonial;
}

export function TestimonialCard({ testimonial }: TestimonialCardProps) {
  return (
    <div className="rounded-lg bg-navy-medium/50 border border-white/5 p-8 text-center space-y-6">
      <div className="flex justify-center gap-1">
        {Array.from({ length: testimonial.rating }).map((_, i) => (
          <Star key={i} className="h-5 w-5 fill-gold text-gold" />
        ))}
      </div>
      <blockquote className="text-white/80 leading-relaxed text-base italic">
        &ldquo;{testimonial.quote}&rdquo;
      </blockquote>
      <div className="space-y-1">
        <div className="flex items-center justify-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gold/20 text-gold text-sm font-semibold">
            {testimonial.avatar}
          </div>
          <div className="text-left">
            <div className="text-white font-medium text-sm">{testimonial.name}</div>
            <div className="text-white/50 text-xs">{testimonial.role}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
