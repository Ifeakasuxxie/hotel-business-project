import { HeroSection } from "@/components/sections/hero-section";
import { BookingSearch } from "@/components/sections/booking-search";
import { AboutSection } from "@/components/sections/about-section";
import { FeaturedRooms } from "@/components/sections/featured-rooms";
import { HomeServicesSection } from "@/components/sections/home-services-section";
import { HomeExperienceSection } from "@/components/sections/home-experience-section";
import { GallerySection } from "@/components/sections/gallery-section";
import { TestimonialsSection } from "@/components/sections/testimonials-section";
import { LocationSection } from "@/components/sections/location-section";
import { CTASection } from "@/components/sections/cta-section";

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <BookingSearch />
      <AboutSection />
      <FeaturedRooms />
      <HomeServicesSection />
      <HomeExperienceSection />
      <GallerySection />
      <TestimonialsSection />
      <LocationSection />
      <CTASection />
    </>
  );
}
