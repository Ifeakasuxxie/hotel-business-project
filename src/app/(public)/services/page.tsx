import { SectionHeader } from "@/components/common/section-header";
import { serviceCategories, getServicesByCategory } from "@/lib/data";
import { Bed, Hotel, Building2, Utensils, Sun, Coffee, GlassWater, Waves, Sparkles, Dumbbell, Dices, CircleDot, Gamepad2, Trees, Bell, ConciergeBell, Shirt, Plane, Wifi, Car } from "lucide-react";

const iconMap: Record<string, React.ReactNode> = {
  Bed: <Bed className="h-6 w-6" />,
  Hotel: <Hotel className="h-6 w-6" />,
  Building2: <Building2 className="h-6 w-6" />,
  Utensils: <Utensils className="h-6 w-6" />,
  Sun: <Sun className="h-6 w-6" />,
  Coffee: <Coffee className="h-6 w-6" />,
  GlassWater: <GlassWater className="h-6 w-6" />,
  Waves: <Waves className="h-6 w-6" />,
  Sparkles: <Sparkles className="h-6 w-6" />,
  Dumbbell: <Dumbbell className="h-6 w-6" />,
  Dices: <Dices className="h-6 w-6" />,
  CircleDot: <CircleDot className="h-6 w-6" />,
  Gamepad2: <Gamepad2 className="h-6 w-6" />,
  Trees: <Trees className="h-6 w-6" />,
  Bell: <Bell className="h-6 w-6" />,
  ConciergeBell: <ConciergeBell className="h-6 w-6" />,
  Shirt: <Shirt className="h-6 w-6" />,
  Plane: <Plane className="h-6 w-6" />,
  Wifi: <Wifi className="h-6 w-6" />,
  Car: <Car className="h-6 w-6" />,
};

export default function ServicesPage() {
  return (
    <div className="py-24 space-y-24">
      {serviceCategories.map((category) => {
        const items = getServicesByCategory(category.id);
        return (
          <section key={category.id} id={category.id} className="container-page">
            <SectionHeader
              tag={category.label}
              title={category.label}
              description={category.description}
              align="left"
            />
            <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="group rounded-lg bg-card border border-border p-6 transition-all duration-300 hover:shadow-card-hover hover:-translate-y-1"
                >
                  <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gold/10 text-gold mb-5 transition-colors group-hover:bg-gold/20">
                    {iconMap[item.icon] || <Hotel className="h-6 w-6" />}
                  </div>
                  <h3 className="heading-serif text-lg text-foreground mb-2">{item.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{item.description}</p>
                </div>
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}
