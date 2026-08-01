import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

export function CTASection() {
  return (
    <section className="py-24 bg-navy">
      <div className="container-page text-center space-y-8">
        <span className="inline-block text-xs font-semibold uppercase tracking-[0.2em] text-gold/80">
          Reserve Your Experience
        </span>
        <h2 className="heading-serif text-3xl sm:text-4xl lg:text-5xl text-white max-w-2xl mx-auto leading-tight">
          Ready to Experience Unforgettable Hospitality?
        </h2>
        <p className="text-white/60 max-w-xl mx-auto leading-relaxed">
          Book your stay directly with us for the best rates and exclusive benefits.
          Our team is ready to welcome you.
        </p>
        <Button asChild size="lg" className="min-w-[200px] gap-2 mt-2">
          <Link href="/book">
            Book Your Stay <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>
      </div>
    </section>
  );
}
