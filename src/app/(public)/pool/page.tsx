import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Waves, Sun, ShieldCheck } from "lucide-react";

export default function PoolPage() {
  return (
    <div className="py-16 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto space-y-12">
      <div className="text-center space-y-4 max-w-3xl mx-auto">
        <Badge variant="gold">Outdoor Wellness & Oasis</Badge>
        <h1 className="font-serif text-4xl sm:text-5xl font-bold text-slate-100">
          Olympic Swimming Pool & Cabanas
        </h1>
        <p className="text-slate-400">
          Relax in temperature-controlled waters, enjoy poolside lounger service, and book private cabanas for family or group relaxation.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <Card className="flex flex-col justify-between">
          <CardHeader>
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-500/10 text-amber-400 mb-2">
              <Waves className="h-5 w-5" />
            </div>
            <CardTitle>Standard Pool Pass</CardTitle>
            <CardDescription>Full-day pool access, towel service, and complimentary welcome smoothie.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-400 font-serif mb-4">₦10,000 / Person</div>
            <Button variant="gold" className="w-full">Book Pool Pass</Button>
          </CardContent>
        </Card>

        <Card className="flex flex-col justify-between border-amber-500/40">
          <CardHeader>
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-500/20 text-amber-300 mb-2">
              <Sun className="h-5 w-5" />
            </div>
            <CardTitle>VIP Private Cabana</CardTitle>
            <CardDescription>Private shaded cabana lounge, fruit basket, champagne bottle, and dedicated butler.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-400 font-serif mb-4">₦45,000 / Day</div>
            <Button variant="gold" className="w-full">Book Private Cabana</Button>
          </CardContent>
        </Card>

        <Card className="flex flex-col justify-between">
          <CardHeader>
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-500/10 text-amber-400 mb-2">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <CardTitle>Resident Hotel Guests</CardTitle>
            <CardDescription>Complimentary unlimited pool access for all checked-in hotel room guests.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-400 font-serif mb-4">FREE</div>
            <Button variant="outline" className="w-full">Show Keycard Access</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
