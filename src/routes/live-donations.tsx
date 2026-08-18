import { createFileRoute } from "@tanstack/react-router";
import { Search } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { DonationCard } from "@/components/site/DonationCard";
import { EmptyState } from "@/components/site/EmptyState";
import { PageShell } from "@/components/site/PageShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { distanceKm, minutesRemaining, scoreMatch } from "@/lib/foodbridge/matching";
import { useStore } from "@/lib/foodbridge/store";

export const Route = createFileRoute("/live-donations")({
  head: () => ({
    meta: [
      { title: "Live Food Donations Near You — FoodBridge" },
      {
        name: "description",
        content:
          "Browse active surplus food donations nearby with distance, time remaining, quantity and match score. Accept a donation in one tap.",
      },
      { property: "og:title", content: "Live Food Donations — FoodBridge" },
      {
        property: "og:description",
        content: "Active surplus food donations near you, updated in real time.",
      },
    ],
  }),
  component: LiveDonations,
});

function LiveDonations() {
  const { donations, ngos, userLocation, acceptDonation, currentUser } = useStore();
  const [query, setQuery] = useState("");
  const [foodType, setFoodType] = useState("all");
  const [urgency, setUrgency] = useState("all");
  const [minQty, setMinQty] = useState(0);
  const [maxDistance, setMaxDistance] = useState(25);
  const [timeWindow, setTimeWindow] = useState("all");

  // The acting NGO: the logged-in NGO's org, otherwise the first verified NGO (demo).
  const actingNgo =
    ngos.find((n) => n.name === currentUser?.organization) ?? ngos[0]!;

  const results = useMemo(() => {
    return donations
      .filter((d) => ["available", "matched"].includes(d.status))
      .map((d) => ({
        donation: d,
        distance: distanceKm(userLocation.lat, userLocation.lng, d.lat, d.lng),
        score: scoreMatch(d, actingNgo).score,
        minsLeft: minutesRemaining(d.expiryTime),
      }))
      .filter((r) => {
        const q = query.trim().toLowerCase();
        if (
          q &&
          !`${r.donation.foodType} ${r.donation.organization} ${r.donation.address} ${r.donation.donationId}`
            .toLowerCase()
            .includes(q)
        )
          return false;
        if (foodType !== "all" && r.donation.diet !== foodType) return false;
        if (r.donation.servings < minQty) return false;
        if (r.distance > maxDistance) return false;
        if (timeWindow !== "all" && r.minsLeft > Number(timeWindow)) return false;
        if (urgency !== "all") {
          const isUrgent = r.minsLeft <= 120;
          if (urgency === "urgent" && !isUrgent) return false;
          if (urgency === "normal" && isUrgent) return false;
        }
        return true;
      })
      .sort((a, b) => b.score - a.score);
  }, [donations, query, foodType, urgency, minQty, maxDistance, timeWindow, userLocation, actingNgo]);

  const handleAccept = (id: string) => {
    const res = acceptDonation(id, actingNgo.id);
    if (res.ok) toast.success("Donation accepted", { description: res.message });
    else toast.error("Could not accept", { description: res.message });
  };

  return (
    <PageShell
      eyebrow="Real time"
      title="Live Donations"
      description={`Active surplus food near ${userLocation.label}, ranked by match score for ${actingNgo.name}.`}
      actions={
        <Button
          variant="outline"
          onClick={() => {
            setQuery("");
            setFoodType("all");
            setUrgency("all");
            setMinQty(0);
            setMaxDistance(25);
            setTimeWindow("all");
          }}
        >
          Reset filters
        </Button>
      }
    >
      {/* Filters */}
      <div className="surface-card grid gap-4 p-5 lg:grid-cols-6">
        <div className="lg:col-span-2">
          <Label className="mb-1.5 block text-sm">Search</Label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              className="pl-9"
              placeholder="Food, donor, area or ID"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
        </div>
        <div>
          <Label className="mb-1.5 block text-sm">Food type</Label>
          <Select value={foodType} onValueChange={setFoodType}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All types</SelectItem>
              <SelectItem value="Vegetarian">Vegetarian</SelectItem>
              <SelectItem value="Non-Vegetarian">Non-Vegetarian</SelectItem>
              <SelectItem value="Mixed">Mixed</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label className="mb-1.5 block text-sm">Urgency</Label>
          <Select value={urgency} onValueChange={setUrgency}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Any urgency</SelectItem>
              <SelectItem value="urgent">Urgent (≤ 2h left)</SelectItem>
              <SelectItem value="normal">Normal</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label className="mb-1.5 block text-sm">Time remaining</Label>
          <Select value={timeWindow} onValueChange={setTimeWindow}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Any time</SelectItem>
              <SelectItem value="60">Under 1 hour</SelectItem>
              <SelectItem value="180">Under 3 hours</SelectItem>
              <SelectItem value="360">Under 6 hours</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-4">
          <div>
            <Label className="mb-1.5 block text-sm">Distance ≤ {maxDistance} km</Label>
            <Slider value={[maxDistance]} min={1} max={40} step={1} onValueChange={(v) => setMaxDistance(v[0]!)} />
          </div>
          <div>
            <Label className="mb-1.5 block text-sm">Min servings: {minQty}</Label>
            <Slider value={[minQty]} min={0} max={200} step={10} onValueChange={(v) => setMinQty(v[0]!)} />
          </div>
        </div>
      </div>

      <p className="mt-6 text-sm text-muted-foreground">
        Showing <strong className="text-foreground">{results.length}</strong> active donation
        {results.length === 1 ? "" : "s"}.
      </p>

      <div className="mt-4 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        {results.map((r) => (
          <DonationCard
            key={r.donation.donationId}
            donation={r.donation}
            distanceKm={r.distance}
            matchScore={r.score}
            onAccept={(d) => handleAccept(d.donationId)}
          />
        ))}
      </div>

      {results.length === 0 && (
        <div className="mt-4">
          <EmptyState
            title="No active food donations found nearby."
            description="Try widening the distance filter or clearing the search. New donations appear here in real time."
          />
        </div>
      )}
    </PageShell>
  );
}
