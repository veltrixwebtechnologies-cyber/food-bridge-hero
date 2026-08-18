import { Badge } from "@/components/ui/badge";
import type { DonationStatus, Urgency } from "@/lib/foodbridge/types";
import { cn } from "@/lib/utils";

const STATUS_LABEL: Record<DonationStatus, string> = {
  available: "Available",
  matched: "Matched",
  accepted: "Accepted",
  pickup: "Pickup in Progress",
  completed: "Completed",
  cancelled: "Cancelled",
  expired: "Expired",
};

const STATUS_STYLE: Record<DonationStatus, string> = {
  available: "bg-success/12 text-success border-success/30",
  matched: "bg-info/12 text-info border-info/30",
  accepted: "bg-primary/12 text-primary border-primary/30",
  pickup: "bg-warning/18 text-warning-foreground border-warning/40",
  completed: "bg-muted text-muted-foreground border-border",
  cancelled: "bg-destructive/10 text-destructive border-destructive/30",
  expired: "bg-destructive/10 text-destructive border-destructive/30",
};

export function StatusBadge({ status }: { status: DonationStatus }) {
  return (
    <Badge variant="outline" className={cn("rounded-full font-medium", STATUS_STYLE[status])}>
      {STATUS_LABEL[status]}
    </Badge>
  );
}

const URGENCY_STYLE: Record<Urgency, string> = {
  low: "bg-muted text-muted-foreground border-border",
  medium: "bg-info/12 text-info border-info/30",
  high: "bg-warning/18 text-warning-foreground border-warning/40",
  critical: "bg-destructive/12 text-destructive border-destructive/30",
};

export function UrgencyBadge({ urgency }: { urgency: Urgency }) {
  return (
    <Badge
      variant="outline"
      className={cn("rounded-full capitalize font-medium", URGENCY_STYLE[urgency])}
    >
      {urgency} urgency
    </Badge>
  );
}
