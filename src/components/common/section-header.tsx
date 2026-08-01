import { cn } from "@/lib/utils";

interface SectionHeaderProps {
  tag?: string;
  title: string;
  description?: string;
  align?: "center" | "left";
  className?: string;
}

export function SectionHeader({ tag, title, description, align = "center", className }: SectionHeaderProps) {
  return (
    <div
      className={cn(
        "max-w-2xl space-y-3",
        align === "center" && "mx-auto text-center",
        className
      )}
    >
      {tag && (
        <span className="section-tag">{tag}</span>
      )}
      <h2 className="heading-serif text-3xl sm:text-4xl lg:text-5xl text-foreground">
        {title}
      </h2>
      {description && (
        <p className="text-muted-foreground leading-relaxed text-base sm:text-lg">
          {description}
        </p>
      )}
    </div>
  );
}
