"use client";

import { Suspense, useState, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { SectionHeader } from "@/components/common/section-header";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { rooms } from "@/lib/data";
import { formatCurrency, cn } from "@/lib/utils";
import { Minus, Plus, CalendarDays, User, Mail, Phone, MessageSquare } from "lucide-react";

function calcNights(checkIn: string, checkOut: string): number {
  if (!checkIn || !checkOut) return 0;
  const d1 = new Date(checkIn);
  const d2 = new Date(checkOut);
  const diff = (d2.getTime() - d1.getTime()) / (1000 * 60 * 60 * 24);
  return Math.max(0, diff);
}

export default function BookPageWrapper() {
  return (
    <Suspense fallback={<div className="container-page py-24 text-center text-muted-foreground">Loading booking...</div>}>
      <BookPageContent />
    </Suspense>
  );
}

function BookPageContent() {
  const searchParams = useSearchParams();
  const initialCheckIn = searchParams.get("checkIn") || "";
  const initialCheckOut = searchParams.get("checkOut") || "";
  const initialGuests = searchParams.get("guests") || "2";
  const initialRoom = searchParams.get("room") || "";

  const [checkIn, setCheckIn] = useState(initialCheckIn);
  const [checkOut, setCheckOut] = useState(initialCheckOut);
  const [guests, setGuests] = useState(initialGuests);
  const [quantities, setQuantities] = useState<Record<string, number>>(
    () => rooms.reduce((acc, r) => ({ ...acc, [r.id]: initialRoom === r.slug ? 1 : 0 }), {} as Record<string, number>)
  );
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [specialRequests, setSpecialRequests] = useState("");

  const nights = useMemo(() => calcNights(checkIn, checkOut), [checkIn, checkOut]);

  const selectedRooms = useMemo(
    () => rooms.filter((r) => (quantities[r.id] || 0) > 0),
    [quantities]
  );

  const totalPrice = useMemo(
    () => selectedRooms.reduce((sum, r) => sum + r.price * (quantities[r.id] || 0) * Math.max(1, nights), 0),
    [selectedRooms, quantities, nights]
  );

  const adjustQty = (roomId: string, delta: number) => {
    setQuantities((prev) => {
      const current = prev[roomId] || 0;
      const next = Math.max(0, Math.min(10, current + delta));
      return { ...prev, [roomId]: next };
    });
  };

  return (
    <div className="container-page py-24 space-y-12">
      <SectionHeader
        tag="Reservations"
        title="Book Your Stay"
        description="Select your rooms, dates, and preferences — we will handle the rest."
      />

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-10">
        <div className="lg:col-span-3 space-y-8">
          <div className="rounded-lg bg-card border border-border p-6 sm:p-8 space-y-6">
            <h3 className="heading-serif text-xl text-foreground">1. Choose Your Dates & Guests</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
              <div className="space-y-2">
                <Label htmlFor="ci" className="flex items-center gap-1.5">
                  <CalendarDays className="h-3.5 w-3.5 text-gold" /> Check-In
                </Label>
                <Input id="ci" type="date" value={checkIn} onChange={(e) => setCheckIn(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="co" className="flex items-center gap-1.5">
                  <CalendarDays className="h-3.5 w-3.5 text-gold" /> Check-Out
                </Label>
                <Input id="co" type="date" value={checkOut} onChange={(e) => setCheckOut(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="g" className="flex items-center gap-1.5">
                  <User className="h-3.5 w-3.5 text-gold" /> Guests
                </Label>
                <select
                  id="g"
                  value={guests}
                  onChange={(e) => setGuests(e.target.value)}
                  className="flex h-11 w-full rounded-md border border-border bg-input px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-gold/40 focus:border-gold/60"
                >
                  {[1, 2, 3, 4, 5, 6].map((n) => (
                    <option key={n} value={n}>{n} Guest{n > 1 ? "s" : ""}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="rounded-lg bg-card border border-border p-6 sm:p-8 space-y-6">
            <h3 className="heading-serif text-xl text-foreground">2. Select Rooms</h3>
            <div className="space-y-4">
              {rooms.map((room) => {
                const qty = quantities[room.id] || 0;
                return (
                  <div
                    key={room.id}
                    className={cn(
                      "rounded-lg border p-4 sm:p-5 transition-all duration-200",
                      qty > 0
                        ? "border-gold/40 bg-gold/5 shadow-sm"
                        : "border-border bg-background"
                    )}
                  >
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-semibold text-foreground">{room.title}</h4>
                          <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full shrink-0">
                            {room.capacity}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground">{room.description}</p>
                        <div className="mt-1.5 text-sm font-semibold text-gold">
                          {formatCurrency(room.price)} / night
                        </div>
                      </div>
                      <div className="flex items-center gap-3 shrink-0">
                        <button
                          type="button"
                          onClick={() => adjustQty(room.id, -1)}
                          className="flex h-9 w-9 items-center justify-center rounded-md border border-border bg-background text-foreground hover:bg-secondary transition-colors disabled:opacity-30"
                          disabled={qty === 0}
                        >
                          <Minus className="h-4 w-4" />
                        </button>
                        <span className="w-8 text-center font-semibold text-lg tabular-nums">{qty}</span>
                        <button
                          type="button"
                          onClick={() => adjustQty(room.id, 1)}
                          className="flex h-9 w-9 items-center justify-center rounded-md border border-border bg-background text-foreground hover:bg-secondary transition-colors disabled:opacity-30"
                          disabled={qty >= 10}
                        >
                          <Plus className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                    {qty > 0 && nights > 0 && (
                      <div className="mt-3 pt-3 border-t border-border text-sm text-muted-foreground flex justify-between">
                        <span>{qty} room{qty > 1 ? "s" : ""} x {Math.max(1, nights)} night{nights !== 1 ? "s" : ""}</span>
                        <span className="font-medium text-foreground">
                          {formatCurrency(room.price * qty * Math.max(1, nights))}
                        </span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="rounded-lg bg-card border border-border p-6 sm:p-8 space-y-6">
            <h3 className="heading-serif text-xl text-foreground">3. Your Details</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div className="space-y-2">
                <Label htmlFor="name" className="flex items-center gap-1.5">
                  <User className="h-3.5 w-3.5 text-gold" /> Full Name
                </Label>
                <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email" className="flex items-center gap-1.5">
                  <Mail className="h-3.5 w-3.5 text-gold" /> Email
                </Label>
                <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="your@email.com" />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone" className="flex items-center gap-1.5">
                <Phone className="h-3.5 w-3.5 text-gold" /> Phone
              </Label>
              <Input id="phone" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+234 ..." />
            </div>
            <div className="space-y-2">
              <Label htmlFor="requests" className="flex items-center gap-1.5">
                <MessageSquare className="h-3.5 w-3.5 text-gold" /> Special Requests
              </Label>
              <Textarea id="requests" value={specialRequests} onChange={(e) => setSpecialRequests(e.target.value)} placeholder="Any special requirements or preferences..." />
            </div>
          </div>
        </div>

        <div className="lg:col-span-2">
          <div className="sticky top-28 rounded-lg bg-card border border-border p-6 sm:p-8 space-y-6">
            <h3 className="heading-serif text-lg text-foreground">Booking Summary</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Check-In</span>
                <span className="font-medium">{checkIn || "—"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Check-Out</span>
                <span className="font-medium">{checkOut || "—"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Nights</span>
                <span className="font-medium">{nights || "—"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Guests</span>
                <span className="font-medium">{guests}</span>
              </div>
              <div className="border-t border-border pt-3" />
              {selectedRooms.length === 0 ? (
                <p className="text-muted-foreground text-center py-4">No rooms selected yet</p>
              ) : (
                selectedRooms.map((room) => {
                  const qty = quantities[room.id] || 0;
                  const subtotal = room.price * qty * Math.max(1, nights);
                  return (
                    <div key={room.id} className="flex justify-between">
                      <span className="text-muted-foreground">
                        {room.title} <span className="text-xs">x{qty}</span>
                      </span>
                      <span className="font-medium">{formatCurrency(subtotal)}</span>
                    </div>
                  );
                })
              )}
              <div className="border-t border-border pt-3" />
              <div className="flex justify-between text-base">
                <span className="font-semibold text-foreground">Total</span>
                <span className="font-bold text-gold text-lg">{formatCurrency(totalPrice)}</span>
              </div>
            </div>
            <Button
              className="w-full"
              size="lg"
              disabled={!checkIn || !checkOut || selectedRooms.length === 0 || !name || !email}
              onClick={() => {
                const msg = [
                  `Booking Request — The Kings Hotel`,
                  ``,
                  `Name: ${name}`,
                  `Email: ${email}`,
                  `Phone: ${phone}`,
                  ``,
                  `Check-In: ${checkIn}`,
                  `Check-Out: ${checkOut}`,
                  `Nights: ${nights}`,
                  `Guests: ${guests}`,
                  ``,
                  `Rooms:`,
                  ...selectedRooms.map((r) => `  ${r.title} x${quantities[r.id]} = ${formatCurrency(r.price * (quantities[r.id] || 0) * Math.max(1, nights))}`),
                  ``,
                  `Total: ${formatCurrency(totalPrice)}`,
                  ``,
                  `Special Requests: ${specialRequests || "None"}`,
                ].join("\n");
                alert(msg);
              }}
            >
              Submit Booking Request
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
