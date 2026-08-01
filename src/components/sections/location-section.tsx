import { SectionHeader } from "@/components/common/section-header";
import { ContactCard } from "@/components/common/contact-card";
import { Button } from "@/components/ui/button";
import { MapPin, Phone, Mail, ArrowRight } from "lucide-react";
import Link from "next/link";

export function LocationSection() {
  return (
    <section className="py-24 container-page">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
        <div className="space-y-8">
          <SectionHeader
            tag="Contact"
            title="Find Us"
            description="We are located in the heart of Victoria Island, easily accessible and surrounded by the city's finest attractions."
            align="left"
          />
          <div className="space-y-4">
              <ContactCard
                icon={<MapPin className="h-5 w-5" />}
                title="Address"
                content="12 Kings Avenue, Victoria Island, Lagos"
              />
              <ContactCard
                icon={<Phone className="h-5 w-5" />}
                title="Phone"
                content="+234 (0) 800 KINGS HOTEL"
              />
              <ContactCard
                icon={<Mail className="h-5 w-5" />}
                title="Email"
                content="reservations@thekingshotel.com"
              />
          </div>
          <Button asChild variant="outline" className="gap-2">
            <Link href="/contact">
              Get in Touch <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
        <div className="h-[350px] sm:h-[450px] rounded-lg overflow-hidden bg-muted border border-border shadow-soft">
          <div className="flex h-full items-center justify-center text-muted-foreground">
            <div className="text-center space-y-2">
              <MapPin className="h-10 w-10 mx-auto text-gold/60" />
              <p className="text-sm">Map integration coming soon</p>
              <p className="text-xs">12 Kings Avenue, Victoria Island, Lagos</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
