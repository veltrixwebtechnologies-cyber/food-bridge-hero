import { Link } from "@tanstack/react-router";
import { Leaf } from "lucide-react";

/** FoodBridge wordmark + icon, used in the header, footer and auth pages. */
export function Logo({ compact = false }: { compact?: boolean }) {
  return (
    <Link to="/" className="flex items-center gap-2.5" aria-label="FoodBridge home">
      <span className="brand-gradient flex size-9 items-center justify-center rounded-xl text-primary-foreground shadow-soft">
        <Leaf className="size-5" aria-hidden />
      </span>
      {!compact && (
        <span className="flex flex-col leading-none">
          <span className="font-display text-lg font-bold tracking-tight">FoodBridge</span>
          <span className="text-[11px] text-muted-foreground">Save Food. Share Hope.</span>
        </span>
      )}
    </Link>
  );
}
