import { Clock, MapPin, Package, Route, Store, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { formatTimeLeft } from "@/lib/foodbridge/matching";
import type { Donation } from "@/lib/foodbridge/types";
import { StatusBadge } from "./StatusBadge";

interface DonationCardProps {
  donation: Donation;
  distanceKm?: number;
  matchScore?: number;
  onAccept?: (donation: Donation) => void;
  actionLabel?: string;
  footer?: React.ReactNode;
}

/** Card used on Live Donations, Find Food, Map details and dashboards. */
export function DonationCard({
  donation,
  distanceKm,
  matchScore,
  onAccept,
  actionLabel = "Accept Donation",
  footer,
}: DonationCardProps) {
  const expired = new Date(donation.expiryTime).getTime() < Date.now();
  const acceptable = ["available", "matched"].includes(donation.status) && !expired;

  return (
    <article className="surface-card flex flex-col overflow-hidden transition-shadow hover:shadow-lift">
      <div className="relative h-40 w-full overflow-hidden bg-muted">
        <img
          src={donation.image}
          alt={donation.foodType}
          loading="lazy"
          width={800}
          height={600}
          className="size-full object-cover"
        />
        <div className="absolute left-3 top-3">
          <StatusBadge status={expired ? "expired" : donation.status} />
        </div>
        {typeof matchScore === "number" && (
          <div className="absolute right-3 top-3 rounded-full bg-primary px-2.5 py-1 text-xs font-semibold text-primary-foreground">
            {matchScore}% match
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-3 p-5">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-primary">
            {donation.donationId} · {donation.category}
          </p>
          <h3 className="mt-1 font-display text-lg font-semibold leading-snug">
            {donation.foodType}
          </h3>
        </div>

        <dl className="grid grid-cols-2 gap-3 text-sm">
          <Detail icon={Package} label="Quantity" value={`${donation.quantity}`} />
          <Detail icon={Users} label="Servings" value={`${donation.servings} meals`} />
          <Detail icon={Store} label="Donor" value={donation.donorType} />
          <Detail
            icon={Route}
            label="Distance"
            value={distanceKm === undefined ? "—" : `${distanceKm.toFixed(1)} km`}
          />
        </dl>

        <p className="flex items-start gap-2 text-sm text-muted-foreground">
          <MapPin className="mt-0.5 size-4 shrink-0" aria-hidden />
          {donation.address}
        </p>
        <p className="flex items-center gap-2 text-sm text-muted-foreground">
          <Clock className="size-4 shrink-0" aria-hidden />
          {donation.availableTime} · {formatTimeLeft(donation.expiryTime)}
        </p>

        {typeof matchScore === "number" && (
          <div>
            <div className="mb-1 flex justify-between text-xs text-muted-foreground">
              <span>Match score</span>
              <span>{matchScore}%</span>
            </div>
            <Progress value={matchScore} className="h-2" />
          </div>
        )}

        <div className="mt-auto flex flex-wrap gap-2 pt-2">
          {onAccept && (
            <Button
              className="flex-1"
              disabled={!acceptable}
              onClick={() => onAccept(donation)}
            >
              {expired
                ? "Expired"
                : acceptable
                  ? actionLabel
                  : `Already ${donation.status}`}
            </Button>
          )}
          {footer}
        </div>
      </div>
    </article>
  );
}

function Detail({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
}) {
  return (
    <div>
      <dt className="flex items-center gap-1.5 text-xs text-muted-foreground">
        <Icon className="size-3.5" aria-hidden /> {label}
      </dt>
      <dd className="mt-0.5 font-medium">{value}</dd>
    </div>
  );
}
