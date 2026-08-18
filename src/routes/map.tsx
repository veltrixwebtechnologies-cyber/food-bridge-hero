import { createFileRoute } from "@tanstack/react-router";
import { Building2, Crosshair, Loader2, Navigation, Utensils } from "lucide-react";
import { lazy, Suspense, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { PageShell } from "@/components/site/PageShell";
import { StatusBadge } from "@/components/site/StatusBadge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { distanceKm } from "@/lib/foodbridge/matching";
import { useStore } from "@/lib/foodbridge/store";

/** Leaflet is browser-only: load the map component lazily after hydration. */
const FoodMap = lazy(() =>
  import("@/components/site/FoodMap").then((m) => ({ default: m.FoodMap })),
);

export const Route = createFileRoute("/map")({
  head: () => ({
    meta: [
      { title: "Live Food Donation Map — FoodBridge" },
      {
        name: "description",
        content:
          "See donors, NGOs, food banks and active donations on an interactive map. Find the nearest NGO or the nearest donation instantly.",
      },
      { property: "og:title", content: "Live Food Donation Map — FoodBridge" },
      {
        property: "og:description",
        content: "Interactive map of donors, NGOs, food banks and active donations.",
      },
    ],
  }),
  component: MapPage,
});

function MapPage() {
  const { donations, ngos, userLocation, setUserLocation, acceptDonation } = useStore();
  const [focus, setFocus] = useState<{ lat: number; lng: number } | null>(null);
  const [selected, setSelected] = useState<{ kind: "donation" | "ngo"; id: string } | null>(null);
  const [locating, setLocating] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Only render the map on the client (Leaflet touches window/document).
  useEffect(() => setMounted(true), []);

  const activeDonations = useMemo(
    () => donations.filter((d) => !["cancelled", "completed"].includes(d.status)),
    [donations],
  );

  const nearestNgo = useMemo(
    () =>
      [...ngos]
        .map((n) => ({ n, d: distanceKm(userLocation.lat, userLocation.lng, n.lat, n.lng) }))
        .sort((a, b) => a.d - b.d)[0],
    [ngos, userLocation],
  );

  const nearestDonation = useMemo(
    () =>
      activeDonations
        .map((x) => ({ x, d: distanceKm(userLocation.lat, userLocation.lng, x.lat, x.lng) }))
        .sort((a, b) => a.d - b.d)[0],
    [activeDonations, userLocation],
  );

  const detectLocation = () => {
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      toast.error("Location not supported by this browser.");
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const loc = {
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          label: "Your current location",
        };
        setUserLocation(loc);
        setFocus(loc);
        setLocating(false);
        toast.success("Location detected");
      },
      () => {
        setLocating(false);
        toast.error("Missing location", {
          description: "Permission denied — showing the default city view.",
        });
      },
      { timeout: 8000 },
    );
  };

  const selectedDonation =
    selected?.kind === "donation"
      ? donations.find((d) => d.donationId === selected.id)
      : undefined;
  const selectedNgo =
    selected?.kind === "ngo" ? ngos.find((n) => n.id === selected.id) : undefined;

  return (
    <PageShell
      eyebrow="Location intelligence"
      title="Live Map"
      description="Donors, NGOs, food banks and active donations plotted on one map."
      actions={
        <>
          <Button variant="outline" onClick={detectLocation} disabled={locating}>
            {locating ? <Loader2 className="mr-2 size-4 animate-spin" /> : <Crosshair className="mr-2 size-4" />}
            Use my location
          </Button>
          <Button
            variant="secondary"
            onClick={() => {
              if (!nearestNgo) {
                toast.error("No suitable NGO found nearby.");
                return;
              }
              setFocus({ lat: nearestNgo.n.lat, lng: nearestNgo.n.lng });
              setSelected({ kind: "ngo", id: nearestNgo.n.id });
              toast.success(`Nearest NGO: ${nearestNgo.n.name}`, {
                description: `${nearestNgo.d.toFixed(1)} km away`,
              });
            }}
          >
            <Building2 className="mr-2 size-4" /> Find Nearest NGO
          </Button>
          <Button
            onClick={() => {
              if (!nearestDonation) {
                toast.error("No active food donations found nearby.");
                return;
              }
              setFocus({ lat: nearestDonation.x.lat, lng: nearestDonation.x.lng });
              setSelected({ kind: "donation", id: nearestDonation.x.donationId });
              toast.success(`Nearest donation: ${nearestDonation.x.organization}`, {
                description: `${nearestDonation.d.toFixed(1)} km away`,
              });
            }}
          >
            <Navigation className="mr-2 size-4" /> Find Nearest Donation
          </Button>
        </>
      }
    >
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          {mounted ? (
            <Suspense
              fallback={
                <div className="flex h-[28rem] items-center justify-center rounded-2xl border md:h-[34rem]">
                  <Loader2 className="size-6 animate-spin text-primary" />
                </div>
              }
            >
              <FoodMap
                donations={activeDonations}
                ngos={ngos}
                center={userLocation}
                focus={focus}
                onSelect={setSelected}
              />
            </Suspense>
          ) : (
            <div className="flex h-[28rem] items-center justify-center rounded-2xl border md:h-[34rem]">
              <Loader2 className="size-6 animate-spin text-primary" />
            </div>
          )}
          <div className="mt-4 flex flex-wrap gap-3 text-xs text-muted-foreground">
            <Legend color="bg-success" label="Available donation" />
            <Legend color="bg-warning" label="Matched / in progress" />
            <Legend color="bg-primary" label="NGO / community kitchen" />
            <Legend color="bg-info" label="Your location" />
          </div>
        </div>

        {/* Marker detail panel */}
        <aside className="surface-card h-fit p-6">
          <h2 className="font-display text-lg font-semibold">Marker details</h2>
          {!selected && (
            <p className="mt-3 text-sm text-muted-foreground">
              Click any marker on the map to see availability, quantity, distance and contact
              details.
            </p>
          )}

          {selectedDonation && (
            <div className="mt-4 space-y-2 text-sm">
              <StatusBadge status={selectedDonation.status} />
              <p className="font-display text-lg font-semibold">{selectedDonation.organization}</p>
              <Row label="Food" value={selectedDonation.foodType} />
              <Row label="Quantity" value={`${selectedDonation.quantity} · ${selectedDonation.servings} meals`} />
              <Row label="Location" value={selectedDonation.address} />
              <Row
                label="Distance"
                value={`${distanceKm(userLocation.lat, userLocation.lng, selectedDonation.lat, selectedDonation.lng).toFixed(1)} km`}
              />
              <Row label="Contact" value={selectedDonation.phone} />
              <div className="flex flex-wrap gap-2 pt-3">
                <Button
                  onClick={() => {
                    const res = acceptDonation(selectedDonation.donationId, ngos[0]!.id);
                    res.ok
                      ? toast.success("Donation accepted", { description: res.message })
                      : toast.error("Could not accept", { description: res.message });
                  }}
                  disabled={!["available", "matched"].includes(selectedDonation.status)}
                >
                  Accept
                </Button>
                <Button variant="outline" asChild>
                  <a href={`tel:${selectedDonation.phone.replace(/\s/g, "")}`}>Call</a>
                </Button>
              </div>
            </div>
          )}

          {selectedNgo && (
            <div className="mt-4 space-y-2 text-sm">
              <Badge variant="secondary">{selectedNgo.type}</Badge>
              <p className="font-display text-lg font-semibold">{selectedNgo.name}</p>
              <Row label="Contact person" value={selectedNgo.contactPerson} />
              <Row label="Needs" value={`~${selectedNgo.capacity} meals`} />
              <Row label="Location" value={selectedNgo.location} />
              <Row
                label="Distance"
                value={`${distanceKm(userLocation.lat, userLocation.lng, selectedNgo.lat, selectedNgo.lng).toFixed(1)} km`}
              />
              <Row label="Phone" value={selectedNgo.phone} />
              <Row label="Verified" value={selectedNgo.verified ? "Yes" : "Pending verification"} />
            </div>
          )}

          <div className="mt-6 border-t pt-4">
            <h3 className="flex items-center gap-2 text-sm font-semibold">
              <Utensils className="size-4 text-primary" /> On the map
            </h3>
            <p className="mt-2 text-sm text-muted-foreground">
              {activeDonations.length} active donations · {ngos.length} NGOs & food banks
            </p>
          </div>
        </aside>
      </div>
    </PageShell>
  );
}

function Legend({ color, label }: { color: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-2">
      <span className={`size-3 rounded-full ${color}`} /> {label}
    </span>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <p className="flex justify-between gap-3 border-b py-1.5 last:border-0">
      <span className="text-muted-foreground">{label}</span>
      <span className="text-right font-medium">{value}</span>
    </p>
  );
}
