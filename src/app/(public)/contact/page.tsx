import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { MapPin, Phone, Mail, Clock, Send } from "lucide-react";

export default function ContactPage() {
  return (
    <div className="py-16 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto space-y-12">
      <div className="text-center space-y-4 max-w-3xl mx-auto">
        <Badge variant="gold">Guest Concierge</Badge>
        <h1 className="font-serif text-4xl sm:text-5xl font-bold text-slate-100">
          Contact & Location
        </h1>
        <p className="text-slate-400">
          Our concierge desk is available 24 hours a day to assist with room reservations, private event inquiries, and special requests.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <Card className="glass-card">
          <CardHeader>
            <CardTitle>Send Us a Message</CardTitle>
            <CardDescription>We typically respond within 15 minutes.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">Your Full Name</label>
              <input type="text" placeholder="John Doe" className="w-full rounded-md bg-slate-950 border border-slate-700 p-2 text-sm text-slate-200" />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">Email Address</label>
              <input type="email" placeholder="john@example.com" className="w-full rounded-md bg-slate-950 border border-slate-700 p-2 text-sm text-slate-200" />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">Inquiry Type</label>
              <select className="w-full rounded-md bg-slate-950 border border-slate-700 p-2 text-sm text-slate-200">
                <option>Room Booking Inquiry</option>
                <option>Restaurant & Catering</option>
                <option>Private Event / Wedding</option>
                <option>Other Services</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">Message</label>
              <textarea rows={4} placeholder="How can we assist you today?" className="w-full rounded-md bg-slate-950 border border-slate-700 p-2 text-sm text-slate-200" />
            </div>
            <Button variant="gold" className="w-full gap-2">
              <Send className="h-4 w-4" /> Send Inquiry
            </Button>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Location & Contact Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm text-slate-300">
              <div className="flex items-start gap-3">
                <MapPin className="h-5 w-5 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <div className="font-semibold text-slate-100">Hotel Address</div>
                  <div className="text-slate-400">12 Kings Avenue, Victoria Island, Lagos, Nigeria</div>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Phone className="h-5 w-5 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <div className="font-semibold text-slate-100">Direct Desk & Reservations</div>
                  <div className="text-slate-400">+234 (0) 800 KINGS HOTEL</div>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Mail className="h-5 w-5 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <div className="font-semibold text-slate-100">Email Inquiries</div>
                  <div className="text-slate-400">reservations@thekingshotel.com</div>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Clock className="h-5 w-5 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <div className="font-semibold text-slate-100">Concierge Desk Hours</div>
                  <div className="text-slate-400">24/7 Front Desk Operations</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
