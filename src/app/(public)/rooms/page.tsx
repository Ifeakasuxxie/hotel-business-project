import Link from "next/link";
import { Button } from "@/components/ui/button";
import { SectionHeader } from "@/components/common/section-header";
import { RoomCard } from "@/components/common/room-card";
import { getRooms } from "@/lib/data";
import { ArrowRight } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Rooms & Suites",
  description:
    "Explore our deluxe rooms, executive suites, and penthouse suites at The Kings Hotel.",
  alternates: {
    canonical: "/rooms",
  },
};

export default function RoomsPage() {
  const rooms = getRooms();

  return (
    <div className="py-24 space-y-12">
      <div className="container-page">
        <SectionHeader
          tag="Accommodation"
          title="Luxury Rooms & Executive Suites"
          description="Each room is designed with contemporary elegance, plush bedding, high-speed connectivity, and tranquil ambiance."
        />
      </div>
      <div className="container-page grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {rooms.map((room) => (
          <div key={room.id} className="flex flex-col gap-4">
            <RoomCard room={room} />
            <Button variant="gold" asChild>
              <Link href={`/book?room=${room.slug}`}>
                Book Room <ArrowRight className="h-4 w-4 ml-1" />
              </Link>
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}
