import { PackageOpen } from "lucide-react";
import type { ReactNode } from "react";

/** Consistent empty-state block (no donations, no NGO match, etc.). */
export function EmptyState({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="surface-card flex flex-col items-center gap-3 px-6 py-14 text-center">
      <span className="flex size-12 items-center justify-center rounded-2xl bg-secondary text-muted-foreground">
        <PackageOpen className="size-6" aria-hidden />
      </span>
      <h3 className="font-display text-lg font-semibold">{title}</h3>
      {description && (
        <p className="max-w-md text-sm text-muted-foreground">{description}</p>
      )}
      {action}
    </div>
  );
}
