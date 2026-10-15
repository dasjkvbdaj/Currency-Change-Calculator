import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface SectionCardProps {
  title: string;
  children: ReactNode;
  className?: string;
}

export const SectionCard = ({ title, children, className }: SectionCardProps) => (
  <section className={cn("calc-card", className)}>
    <h2 className="mb-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">{title}</h2>
    {children}
  </section>
);
