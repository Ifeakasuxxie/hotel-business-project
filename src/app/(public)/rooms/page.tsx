import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Star, Wifi, Tv, Coffee, ShieldCheck, ArrowRight } from "lucide-react";

export default function RoomsPage() {
  const rooms = [
    {
      id: "deluxe-king",
      title: "Deluxe King Room",
      price: "₦65,000",
      description: "Super king bed, luxury ensuite bathroom, smart TV, and ergonomic workspace.",
      capacity: "2 Guests",
    },
    {
      id: "executive-suite",
      title: "Executive Suite",
      price: "₦120,000",
      description: "Separate living lounge, complimentary express breakfast, and private balcony.",
      capacity: "2 Guests",
    },
    {
      id: "family-suite",
      title: "Family Interconnecting Suite",
      price: "₦180,000",
      description: "Two connected bedrooms, dual luxury bathrooms, and spacious lounge area.",
      capacity: "4 Guests",
    },
    {
      id: "presidential-penthouse",
      title: "Presidential Penthouse",
      price: "₦350,000",
      description: "Top-floor panoramic skyline views, private jacuzzi, and 24/7 dedicated butler service.",
      capacity: "4 Guests",
    },
  ];

  return (
    <div className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-12">
      <div className="text-center space-y-4 max-w-3xl mx-auto">
        <Badge variant="gold">Accommodation Catalog</Badge>
        <h1 className="font-serif text-4xl sm:text-5xl font-bold text-slate-100">
          Luxury Rooms & Executive Suites
        </h1>
        <p className="text-slate-400">
          Each room is designed with contemporary elegance, plush bedding, high-speed connectivity, and tranquil ambiance.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {rooms.map((room) => (
          <Card key={room.id} className="flex flex-col justify-between overflow-hidden">
            <div>
              <div className="h-60 bg-slate-800 relative flex items-center justify-center text-slate-500">
                <span>{room.title} Image Placeholder</span>
                <Badge variant="gold" className="absolute top-4 right-4">{room.price} / night</Badge>
              </div>
              <CardHeader>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-1 text-amber-400">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="h-3.5 w-3.5 fill-current" />
                    ))}
                  </div>
                  <span className="text-xs text-slate-400 font-medium">{room.capacity}</span>
                </div>
                <CardTitle className="text-2xl">{room.title}</CardTitle>
                <CardDescription className="text-sm">{room.description}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-4 text-xs text-slate-400">
                  <span className="flex items-center gap-1"><Wifi className="h-3.5 w-3.5 text-amber-400" /> Free Wi-Fi</span>
                  <span className="flex items-center gap-1"><Tv className="h-3.5 w-3.5 text-amber-400" /> Smart TV</span>
                  <span className="flex items-center gap-1"><Coffee className="h-3.5 w-3.5 text-amber-400" /> Breakfast</span>
                  <span className="flex items-center gap-1"><ShieldCheck className="h-3.5 w-3.5 text-amber-400" /> Safe</span>
                </div>
              </CardContent>
            </div>
            <div className="p-6 pt-0 flex gap-3">
              <Button variant="outline" asChild className="flex-1">
                <Link href={`/rooms/${room.id}`}>View Details</Link>
              </Button>
              <Button variant="gold" asChild className="flex-1">
                <Link href={`/book?room=${room.id}`}>Book Room <ArrowRight className="h-4 w-4 ml-1" /></Link>
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
