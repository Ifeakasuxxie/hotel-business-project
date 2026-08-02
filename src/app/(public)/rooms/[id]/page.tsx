import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { getRoomBySlug } from "@/lib/data";
import { formatCurrency } from "@/lib/utils";
import { ArrowLeft, ArrowRight, Check, Users, BedDouble, Maximize } from "lucide-react";

interface RoomDetailParams {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: RoomDetailParams): Promise<Metadata> {
  const { id } = await params;
  const room = getRoomBySlug(id);
  if (!room) {
    return { title: "Room Not Found | The Kings Hotel" };
  }
  return {
    title: `${room.title} | The Kings Hotel`,
    description: room.longDescription,
    alternates: { canonical: `/rooms/${room.slug}` },
    openGraph: {
      title: `${room.title} | The Kings Hotel`,
      description: room.longDescription,
      images: room.images.length ? [{ url: room.images[0], alt: room.title }] : undefined,
    },
  };
}

export default async function RoomDetailPage({ params }: RoomDetailParams) {
  const { id } = await params;
  const room = getRoomBySlug(id);
  if (!room) notFound();

  const details = [
    { icon: Users, label: "Occupancy", value: room.capacity },
    { icon: BedDouble, label: "Bed Type", value: room.bed },
    { icon: Maximize, label: "Size", value: room.size },
  ];

  return (
    <div className="container-page py-24 space-y-10">
      <Link href="/rooms" className="inline-flex items-center gap-2 text-sm text-gold hover:underline">
        <ArrowLeft className="h-4 w-4" /> Back to Room Catalog
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2 space-y-8">
          <div className="relative h-[360px] sm:h-[460px] rounded-lg overflow-hidden">
            <Image
              src={room.images[0] || "/images/room-deluxe.jpg"}
              alt={room.title}
              fill
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 66vw"
            />
          </div>

          <Card>
            <CardHeader>
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <Badge variant="gold" className="uppercase tracking-widest mb-2">
                    Executive Accommodation
                  </Badge>
                  <h1 className="heading-serif text-3xl sm:text-4xl font-bold text-foreground">{room.title}</h1>
                </div>
                <div className="text-right">
                  <span className="text-sm text-muted-foreground">Starting from</span>
                  <div className="text-3xl font-bold text-gold font-serif">
                    {formatCurrency(room.price)} <span className="text-base text-muted-foreground">/ night</span>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <p className="text-muted-foreground leading-relaxed">{room.longDescription}</p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {details.map(({ icon: Icon, label, value }) => (
                  <div key={label} className="flex items-center gap-3 rounded-lg border border-border bg-muted/50 px-4 py-3">
                    <Icon className="h-5 w-5 text-gold shrink-0" />
                    <div>
                      <div className="text-xs text-muted-foreground uppercase tracking-wider">{label}</div>
                      <div className="text-sm font-medium text-foreground">{value}</div>
                    </div>
                  </div>
                ))}
              </div>

              <div>
                <h4 className="font-semibold text-foreground text-base mb-3">Included Amenities</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {room.features.map((feature) => (
                    <div key={feature} className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Check className="h-4 w-4 text-gold shrink-0" />
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div>
          <Card className="sticky top-28">
            <CardHeader>
              <CardTitle className="text-xl">Reserve Room</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Select your dates and preferences to book the {room.title.toLowerCase()}.
              </p>
              <div className="rounded-lg border border-border bg-muted/50 px-4 py-3 flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Rate per night</span>
                <span className="font-semibold text-foreground">{formatCurrency(room.price)}</span>
              </div>
              <Button variant="gold" asChild className="w-full mt-2">
                <Link href={`/book?room=${room.slug}`}>
                  Book Room <ArrowRight className="h-4 w-4 ml-1" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
