import type { Amenity } from "@/lib/data";
import * as LucideIcons from "lucide-react";

interface AmenityCardProps {
  amenity: Amenity;
}

function getIcon(iconName: string) {
  const icons: Record<string, React.ReactNode> = {
    Waves: <LucideIcons.Waves className="h-6 w-6" />,
    Sparkles: <LucideIcons.Sparkles className="h-6 w-6" />,
    Dumbbell: <LucideIcons.Dumbbell className="h-6 w-6" />,
    Wifi: <LucideIcons.Wifi className="h-6 w-6" />,
    Car: <LucideIcons.Car className="h-6 w-6" />,
    Building2: <LucideIcons.Building2 className="h-6 w-6" />,
  };
  return icons[iconName] || <LucideIcons.Sparkles className="h-6 w-6" />;
}

export function AmenityCard({ amenity }: AmenityCardProps) {
  return (
    <div className="group rounded-lg bg-card border border-border p-6 transition-all duration-300 hover:shadow-card-hover hover:-translate-y-1">
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gold/10 text-gold mb-5 transition-colors group-hover:bg-gold/20">
        {getIcon(amenity.icon)}
      </div>
      <h3 className="heading-serif text-lg text-foreground mb-2">{amenity.title}</h3>
      <p className="text-sm text-muted-foreground leading-relaxed">{amenity.description}</p>
    </div>
  );
}
