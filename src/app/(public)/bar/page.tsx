import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { GlassWater, Clock } from "lucide-react";

export default function BarPage() {
  return (
    <div className="py-16 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto space-y-12">
      <div className="text-center space-y-4 max-w-3xl mx-auto">
        <Badge variant="gold">VIP Lounge & Nightlife</Badge>
        <h1 className="font-serif text-4xl sm:text-5xl font-bold text-slate-100">
          Bar & Table Reservations
        </h1>
        <p className="text-slate-400">
          Enjoy handcrafted mixology, vintage single-malt whiskeys, live jazz performances, and reserved private lounge booths.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <Card className="glass-card">
          <CardHeader>
            <CardTitle>Reserve a Lounge Table</CardTitle>
            <CardDescription>Book a VIP table booth for evening social gatherings.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-xs font-semibold text-amber-400 uppercase">Reservation Date</label>
              <input type="date" className="w-full rounded-md bg-slate-950 border border-amber-500/30 p-2 text-sm text-slate-200" />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-semibold text-amber-400 uppercase">Preferred Time Slot</label>
              <select className="w-full rounded-md bg-slate-950 border border-amber-500/30 p-2 text-sm text-slate-200">
                <option>7:00 PM - 9:00 PM</option>
                <option>9:00 PM - 11:00 PM</option>
                <option>11:00 PM - Late Night</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-semibold text-amber-400 uppercase">Party Size</label>
              <select className="w-full rounded-md bg-slate-950 border border-amber-500/30 p-2 text-sm text-slate-200">
                <option>2 Guests (Standard Booth)</option>
                <option>4 Guests (Executive Booth)</option>
                <option>8 Guests (VIP Section)</option>
              </select>
            </div>
            <Button variant="gold" className="w-full mt-2">
              Confirm Table Reservation
            </Button>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-500/10 text-amber-400 mb-2">
                <GlassWater className="h-5 w-5" />
              </div>
              <CardTitle className="text-xl">Signature Cocktails & Spirits</CardTitle>
              <CardDescription>
                Curated list of premium champagne, vintage cognac, and house specialty mixology cocktails.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-500/10 text-amber-400 mb-2">
                <Clock className="h-5 w-5" />
              </div>
              <CardTitle className="text-xl">Opening Hours</CardTitle>
              <CardDescription>
                Open daily from 4:00 PM to 2:00 AM. Happy hour specials from 5:00 PM to 7:00 PM.
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </div>
    </div>
  );
}
