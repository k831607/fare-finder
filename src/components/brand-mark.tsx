import { Plane } from "lucide-react";

export function BrandMark({ compact = false }: { compact?: boolean }) {
  return (
    <div className="flex items-center gap-3">
      <span className="grid size-9 shrink-0 place-items-center rounded-full bg-primary text-primary-foreground shadow-[3px_3px_0_var(--ink-blue)]">
        <Plane className="size-[18px] -rotate-12" aria-hidden="true" />
      </span>
      {!compact && (
        <span className="font-display text-sm font-bold text-foreground sm:text-base">
          Flight Price Notifier
        </span>
      )}
    </div>
  );
}