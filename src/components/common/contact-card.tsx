import type { ReactNode } from "react";

interface ContactCardProps {
  icon: ReactNode;
  title: string;
  content: string;
}

export function ContactCard({ icon, title, content }: ContactCardProps) {
  return (
    <div className="flex items-start gap-4 p-5 rounded-lg bg-card border border-border transition-all duration-300 hover:shadow-soft">
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gold/10 text-gold">
        {icon}
      </div>
      <div className="space-y-0.5">
        <h4 className="font-medium text-foreground text-sm">{title}</h4>
        <p className="text-sm text-muted-foreground">{content}</p>
      </div>
    </div>
  );
}
