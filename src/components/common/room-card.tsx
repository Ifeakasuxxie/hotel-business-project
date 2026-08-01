import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import type { Room } from "@/lib/data";

interface RoomCardProps {
  room: Room;
}

export function RoomCard({ room }: RoomCardProps) {
  return (
    <div className="group rounded-lg bg-card border border-border overflow-hidden transition-all duration-300 hover:shadow-card-hover hover:-translate-y-1">
      <div className="relative h-56 overflow-hidden">
        <Image
          src={room.images[0] || "/images/room-deluxe.jpg"}
          alt={room.title}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-105"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
        <div className="absolute top-4 right-4 bg-gold text-white text-sm font-semibold px-3 py-1 rounded-md">
          ₦{room.price.toLocaleString()} / night
        </div>
      </div>
      <div className="p-6 space-y-4">
        <div>
          <h3 className="heading-serif text-xl text-foreground">{room.title}</h3>
          <p className="text-sm text-muted-foreground mt-1.5">{room.description}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {room.features.slice(0, 4).map((feature) => (
            <span
              key={feature}
              className="text-xs text-muted-foreground bg-muted px-2.5 py-1 rounded-full"
            >
              {feature}
            </span>
          ))}
        </div>
        <Button asChild className="w-full">
          <Link href={`/rooms/${room.slug}`}>View Details</Link>
        </Button>
      </div>
    </div>
  );
}
