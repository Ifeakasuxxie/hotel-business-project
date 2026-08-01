import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Dices, Trophy, Clock } from "lucide-react";

export default function RecreationPage() {
  return (
    <div className="py-16 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto space-y-12">
      <div className="text-center space-y-4 max-w-3xl mx-auto">
        <Badge variant="gold">Leisure & Gaming</Badge>
        <h1 className="font-serif text-4xl sm:text-5xl font-bold text-slate-100">
          Snooker & Recreation Lounge
        </h1>
        <p className="text-slate-400">
          Compete on professional tournament-grade Riley snooker tables, enjoy board games, and unwind in our air-conditioned leisure club.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <Card className="glass-card">
          <CardHeader>
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-500/10 text-amber-400 mb-2">
              <Dices className="h-5 w-5" />
            </div>
            <CardTitle>Snooker / Billiards Table Booking</CardTitle>
            <CardDescription>Reserve a dedicated table slot for practice or casual matches.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-xs font-semibold text-amber-400 uppercase">Select Date</label>
              <input type="date" className="w-full rounded-md bg-slate-950 border border-amber-500/30 p-2 text-sm text-slate-200" />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-semibold text-amber-400 uppercase">Time Slot (Hourly)</label>
              <select className="w-full rounded-md bg-slate-950 border border-amber-500/30 p-2 text-sm text-slate-200">
                <option>2:00 PM - 3:00 PM (₦5,000 / hr)</option>
                <option>3:00 PM - 4:00 PM (₦5,000 / hr)</option>
                <option>5:00 PM - 6:00 PM (₦7,500 / hr Peak)</option>
                <option>8:00 PM - 9:00 PM (₦7,500 / hr Peak)</option>
              </select>
            </div>
            <Button variant="gold" className="w-full mt-2">
              Book Table Slot
            </Button>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-500/10 text-amber-400 mb-2">
                <Trophy className="h-5 w-5" />
              </div>
              <CardTitle className="text-xl">Weekly Snooker Tournament</CardTitle>
              <CardDescription>
                Join our Saturday evening guest tournament for prize rewards, drinks, and competitive fun.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-500/10 text-amber-400 mb-2">
                <Clock className="h-5 w-5" />
              </div>
              <CardTitle className="text-xl">Lounge Hours</CardTitle>
              <CardDescription>
                Open daily from 12:00 PM to midnight. Cue sticks and professional chalk provided.
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </div>
    </div>
  );
}
