import React from "react";

export function SectionCard({
  title,
  subtitle,
  children,
  right,
}: { title: string; subtitle?: string; children: React.ReactNode; right?: React.ReactNode }) {
  return (
    <section className="rounded-2xl border border-black/10 bg-background/60 p-5 backdrop-blur dark:border-white/10">
      <div className="mb-4 flex items-start gap-2">
        <div>
          <h3 className="text-base font-semibold">{title}</h3>
          {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
        </div>
        <div className="ml-auto">{right}</div>
      </div>
      {children}
    </section>
  );
}
