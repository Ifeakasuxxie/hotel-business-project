import Link from "next/link";
import { SectionHeader } from "@/components/common/section-header";
import { Button } from "@/components/ui/button";
import { serviceCategories, getServicesByCategory } from "@/lib/data";
import { Hotel, Utensils, GlassWater, Waves, ArrowRight } from "lucide-react";

const iconMap: Record<string, React.ReactNode> = {
  accommodation: <Hotel className="h-7 w-7" />,
  dining: <Utensils className="h-7 w-7" />,
  bar: <GlassWater className="h-7 w-7" />,
  pool: <Waves className="h-7 w-7" />,
};

const featuredCategories = ["accommodation", "dining", "bar", "pool"];

export function HomeServicesSection() {
  return (
    <section className="py-24 container-page">
      <SectionHeader
        tag="Services"
        title="Everything You Need"
        description="From luxurious rooms to exceptional dining, every detail is crafted for your comfort."
      />
      <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {featuredCategories.map((catId) => {
          const cat = serviceCategories.find((c) => c.id === catId);
          const items = getServicesByCategory(catId);
          return (
            <Link
              key={catId}
              href={`/services#${catId}`}
              className="group rounded-lg bg-card border border-border p-8 text-center transition-all duration-300 hover:shadow-card-hover hover:-translate-y-1"
            >
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gold/10 text-gold mx-auto mb-5 transition-colors group-hover:bg-gold/20">
                {iconMap[catId] || <Hotel className="h-7 w-7" />}
              </div>
              <h3 className="heading-serif text-lg text-foreground mb-2">{cat?.label}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{cat?.description}</p>
              <p className="mt-2 text-xs font-medium text-gold/70">{items.length} offerings</p>
              <div className="mt-4 flex items-center justify-center gap-1 text-sm font-medium text-gold opacity-0 group-hover:opacity-100 transition-opacity">
                Explore {cat?.label} <ArrowRight className="h-3.5 w-3.5" />
              </div>
            </Link>
          );
        })}
      </div>
      <div className="mt-10 text-center">
        <Button asChild variant="outline" className="gap-2">
          <Link href="/services">
            View All Services <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>
      </div>
    </section>
  );
}
