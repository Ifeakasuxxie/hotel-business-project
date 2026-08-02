import Link from "next/link";
import { SectionHeader } from "@/components/common/section-header";
import { RoomCard } from "@/components/common/room-card";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { getFeaturedRooms } from "@/lib/data";

export function FeaturedRooms() {
  const rooms = getFeaturedRooms();

  return (
    <section className="py-24 bg-cream/60">
      <div className="container-page space-y-12">
        <SectionHeader
          tag="Accommodation"
          title="Featured Rooms & Suites"
          description="Each room is thoughtfully designed to provide the perfect balance of comfort, style, and functionality."
        />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {rooms.map((room) => (
            <RoomCard key={room.id} room={room} />
          ))}
        </div>
        <div className="text-center">
          <Button asChild variant="outline" className="gap-2">
            <Link href="/rooms">
              View All Rooms <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
