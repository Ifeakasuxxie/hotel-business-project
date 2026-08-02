import { SectionHeader } from "@/components/common/section-header";
import { Dices, CircleDot, Gamepad2, Trees } from "lucide-react";
import { recreationOptions } from "@/lib/data";
import type { Metadata } from "next";

const iconMap: Record<string, React.ReactNode> = {
  Dices: <Dices className="h-6 w-6" />,
  CircleDot: <CircleDot className="h-6 w-6" />,
  Gamepad2: <Gamepad2 className="h-6 w-6" />,
  Trees: <Trees className="h-6 w-6" />,
};

export const metadata: Metadata = {
  title: "Recreation",
  description:
    "Snooker, games, and outdoor activities available to guests at The Kings Hotel.",
  alternates: {
    canonical: "/experience/recreation",
  },
};

export default function RecreationPage() {
  return (
    <div className="container-page py-24 space-y-12">
      <SectionHeader
        tag="Recreation"
        title="Leisure & Activities"
        description="Unwind and play with our range of recreational facilities and organized activities."
      />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {recreationOptions.map((option) => (
          <div
            key={option.id}
            className="rounded-lg bg-card border border-border p-6 transition-all duration-300 hover:shadow-card-hover hover:-translate-y-1"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gold/10 text-gold mb-4">
              {iconMap[option.icon] || <Dices className="h-6 w-6" />}
            </div>
            <h3 className="heading-serif text-lg text-foreground mb-2">{option.title}</h3>
            <p className="text-sm text-muted-foreground">{option.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
