import { SectionHeader } from "@/components/common/section-header";
import { Bell, ConciergeBell, Shirt, Plane } from "lucide-react";
import { guestServices } from "@/lib/data";

const iconMap: Record<string, React.ReactNode> = {
  Bell: <Bell className="h-6 w-6" />,
  ConciergeBell: <ConciergeBell className="h-6 w-6" />,
  Shirt: <Shirt className="h-6 w-6" />,
  Plane: <Plane className="h-6 w-6" />,
};

export default function ServicesPage() {
  return (
    <div className="container-page py-24 space-y-12">
      <SectionHeader
        tag="Services"
        title="Guest Services"
        description="Thoughtful services designed to make your stay effortless and enjoyable."
      />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {guestServices.map((service) => (
          <div
            key={service.id}
            className="rounded-lg bg-card border border-border p-6 transition-all duration-300 hover:shadow-card-hover hover:-translate-y-1"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gold/10 text-gold mb-4">
              {iconMap[service.icon] || <ConciergeBell className="h-6 w-6" />}
            </div>
            <h3 className="heading-serif text-lg text-foreground mb-2">{service.title}</h3>
            <p className="text-sm text-muted-foreground">{service.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
