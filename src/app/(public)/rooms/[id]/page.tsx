import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Hotel, ArrowLeft, Check, ArrowRight } from "lucide-react";

export default async function RoomDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return (
    <div className="py-16 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto space-y-8">
      <Link href="/rooms" className="inline-flex items-center gap-2 text-sm text-amber-400 hover:underline mb-4">
        <ArrowLeft className="h-4 w-4" /> Back to Room Catalog
      </Link>

      <div className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <Badge variant="gold" className="uppercase tracking-widest mb-2">Executive Accommodation</Badge>
            <h1 className="font-serif text-3xl sm:text-4xl font-bold text-slate-100 capitalize">
              {id.replace("-", " ")}
            </h1>
          </div>
          <div className="text-right">
            <span className="text-sm text-slate-400">Starting from</span>
            <div className="text-3xl font-bold text-amber-400 font-serif">₦85,000 / Night</div>
          </div>
        </div>
      </div>

      <div className="h-80 bg-slate-800 rounded-2xl flex items-center justify-center text-slate-500 border border-amber-500/20">
        <div className="text-center space-y-2">
          <Hotel className="h-12 w-12 mx-auto text-amber-500/50" />
          <p className="text-sm font-medium">Room Gallery & Interactive View Placeholder</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Room Description & Amenities</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-slate-300 text-sm leading-relaxed">
              <p>
                Experience the pinnacle of luxury in our meticulously crafted suite. Featuring bespoke hardwood furnishings, premium Egyptian cotton bedding, and soundproof windows offering sweeping views of the property gardens.
              </p>
              <h4 className="font-semibold text-slate-100 text-base pt-2">Included Amenities</h4>
              <div className="grid grid-cols-2 gap-3">
                {["Super King Size Bed", "Marble Ensuite Bathroom", "Complimentary Gourmet Breakfast", "24/7 Room Service", "High-Speed Fiber Wi-Fi", "Mini Bar & Nespresso Machine"].map((amenity, i) => (
                  <div key={i} className="flex items-center gap-2 text-xs text-slate-300">
                    <Check className="h-4 w-4 text-amber-400 shrink-0" />
                    <span>{amenity}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <div>
          <Card className="glass-card gold-border-glow">
            <CardHeader>
              <CardTitle className="text-xl">Reserve Room</CardTitle>
              <CardDescription>Select check-in & check-out dates to book directly.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-semibold text-amber-400 uppercase">Check-In</label>
                <input type="date" className="w-full rounded-md bg-slate-950 border border-amber-500/30 p-2 text-sm text-slate-200" />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-semibold text-amber-400 uppercase">Check-Out</label>
                <input type="date" className="w-full rounded-md bg-slate-950 border border-amber-500/30 p-2 text-sm text-slate-200" />
              </div>
              <Button variant="gold" asChild className="w-full mt-4">
                <Link href={`/book?room=${id}`}>
                  Proceed to Booking <ArrowRight className="h-4 w-4 ml-1" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
