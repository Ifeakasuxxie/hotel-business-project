"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ChevronDown } from "lucide-react";

export function HeroSection() {
  return (
    <section className="relative flex min-h-screen items-center justify-center overflow-hidden">
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: "url('/images/hero-bg.webp')" }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-navy/70 via-navy/50 to-navy/80" />
      <div className="relative z-10 mx-auto max-w-4xl px-4 text-center space-y-8">
        <span className="inline-block text-xs font-semibold uppercase tracking-[0.2em] text-gold/90">
          Welcome to The Kings Hotel
        </span>
        <h1 className="heading-serif text-4xl sm:text-5xl md:text-6xl lg:text-7xl text-white leading-tight">
          Where Every Stay
          <br />
          <span className="text-gold">Tells a Story</span>
        </h1>
        <p className="mx-auto max-w-2xl text-base sm:text-lg text-white/70 leading-relaxed">
          Experience refined hospitality in the heart of the city — where elegant accommodations,
          exceptional dining, and warm hospitality create unforgettable moments.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
          <Button asChild size="lg" className="min-w-[180px]">
            <Link href="/rooms">Explore Rooms</Link>
          </Button>
          <Button
            asChild
            size="lg"
            className="min-w-[180px] bg-navy/60 text-white border border-white/20 hover:bg-navy/80"
          >
            <Link href="/contact">Contact Us</Link>
          </Button>
        </div>
      </div>
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
        <ChevronDown className="h-6 w-6 text-white/40" />
      </div>
    </section>
  );
}
