import { createFileRoute } from "@tanstack/react-router";
import { Sparkles } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { DonationCard } from "@/components/site/DonationCard";
import { EmptyState } from "@/components/site/EmptyState";
import { PageShell } from "@/components/site/PageShell";
import { UrgencyBadge } from "@/components/site/StatusBadge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { distanceKm, scoreMatch } from "@/lib/foodbridge/matching";
import { useStore } from "@/lib/foodbridge/store";
import type { Ngo, Urgency } from "@/lib/foodbridge/types";

export const Route = createFileRoute("/find-food")({
  head: () => ({
    meta: [
      { title: "Find Food — NGO & Food Bank Requests | FoodBridge" },
      {
        name: "description",
        content:
          "NGOs and food banks can post their requirement and instantly see the best-matched surplus food donations nearby.",
      },
      { property: "og:title", content: "Find Food — FoodBridge" },
      {
        property: "og:description",
        content: "Post your requirement and get matched with nearby surplus food donations.",
      },
    ],
  }),
  component: FindFood,
});

interface RequestForm {
  organization: string;
  contactPerson: string;
  phone: string;
  location: string;
  foodType: string;
  requiredServings: string;
  people: string;
  urgency: Urgency;
  requiredBy: string;
}

function FindFood() {
  const { ngos, donations, userLocation, addRequest, acceptDonation, currentUser } = useStore();

  const defaultNgo: Ngo =
    ngos.find((n) => n.name === currentUser?.organization) ?? ngos[0]!;

  const [form, setForm] = useState<RequestForm>({
    organization: defaultNgo.name,
    contactPerson: defaultNgo.contactPerson,
    phone: defaultNgo.phone,
    location: defaultNgo.location,
    foodType: "Any",
    requiredServings: String(defaultNgo.capacity),
    people: String(defaultNgo.capacity),
    urgency: defaultNgo.urgency,
    requiredBy: "Today, 8:00 PM",
  });
  const [errors, setErrors] = useState<Partial<Record<keyof RequestForm, string>>>({});
  const [submitted, setSubmitted] = useState(false);

  const set = (k: keyof RequestForm, v: string) => {
    setForm((f) => ({ ...f, [k]: v }));
    setErrors((e) => ({ ...e, [k]: "" }));
  };

  /** The virtual NGO profile used for scoring, built from the live form values. */
  const scoringNgo: Ngo = {
    ...defaultNgo,
    name: form.organization || defaultNgo.name,
    capacity: Number(form.requiredServings) || defaultNgo.capacity,
    urgency: form.urgency,
    foodType: form.foodType,
  };

  const matches = useMemo(() => {
    return donations
      .filter((d) => ["available", "matched"].includes(d.status))
      .map((d) => ({
        donation: d,
        score: scoreMatch(d, scoringNgo).score,
        distance: distanceKm(scoringNgo.lat, scoringNgo.lng, d.lat, d.lng),
      }))
      .sort((a, b) => b.score - a.score);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [donations, form.requiredServings, form.urgency, form.foodType, scoringNgo.lat, scoringNgo.lng]);

  const best = matches[0];

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const next: Partial<Record<keyof RequestForm, string>> = {};
    if (form.organization.trim().length < 2) next.organization = "Enter organization name";
    if (form.contactPerson.trim().length < 2) next.contactPerson = "Enter contact person";
    if (!/^[+\d][\d\s-]{7,15}$/.test(form.phone.trim())) next.phone = "Enter a valid phone number";
    if (form.location.trim().length < 3) next.location = "Enter your location";
    if (!Number(form.requiredServings)) next.requiredServings = "Enter required quantity";
    if (!Number(form.people)) next.people = "Enter number of people";
    if (Object.keys(next).length) {
      setErrors(next);
      toast.error("Invalid form", { description: "Please fix the highlighted fields." });
      return;
    }

    addRequest({
      ngoId: defaultNgo.id,
      organization: form.organization,
      contactPerson: form.contactPerson,
      phone: form.phone,
      location: form.location,
      lat: defaultNgo.lat,
      lng: defaultNgo.lng,
      foodType: form.foodType,
      requiredServings: Number(form.requiredServings),
      people: Number(form.people),
      urgency: form.urgency,
      requiredBy: form.requiredBy,
    });
    setSubmitted(true);
    toast.success("Request posted", {
      description: best
        ? `Best match found: ${best.donation.organization} (${best.score}%).`
        : "No suitable donation nearby yet — we will notify you.",
    });
  };

  const handleAccept = (id: string) => {
    const res = acceptDonation(id, defaultNgo.id);
    if (res.ok) toast.success("Donation accepted", { description: res.message });
    else toast.error("Could not accept", { description: res.message });
  };

  return (
    <PageShell
      eyebrow="NGO / Receiver module"
      title="Find Food"
      description="Tell us what your organisation needs. FoodBridge ranks every nearby donation by match score."
    >
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Requirement form */}
        <form onSubmit={submit} className="surface-card h-fit space-y-4 p-6 lg:sticky lg:top-24">
          <h2 className="font-display text-lg font-semibold">Your requirement</h2>

          <Field label="Organization Name" error={errors.organization}>
            <Input value={form.organization} onChange={(e) => set("organization", e.target.value)} />
          </Field>
          <Field label="Contact Person" error={errors.contactPerson}>
            <Input value={form.contactPerson} onChange={(e) => set("contactPerson", e.target.value)} />
          </Field>
          <Field label="Phone" error={errors.phone}>
            <Input value={form.phone} onChange={(e) => set("phone", e.target.value)} />
          </Field>
          <Field label="Location" error={errors.location}>
            <Input value={form.location} onChange={(e) => set("location", e.target.value)} />
          </Field>
          <Field label="Required Food Type">
            <Select value={form.foodType} onValueChange={(v) => set("foodType", v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="Any">Any</SelectItem>
                <SelectItem value="Vegetarian">Vegetarian</SelectItem>
                <SelectItem value="Non-Vegetarian">Non-Vegetarian</SelectItem>
                <SelectItem value="Mixed">Mixed</SelectItem>
              </SelectContent>
            </Select>
          </Field>
          <Field label="Required Quantity (servings)" error={errors.requiredServings}>
            <Input type="number" min={1} value={form.requiredServings} onChange={(e) => set("requiredServings", e.target.value)} />
          </Field>
          <Field label="Number of People" error={errors.people}>
            <Input type="number" min={1} value={form.people} onChange={(e) => set("people", e.target.value)} />
          </Field>
          <Field label="Urgency Level">
            <Select value={form.urgency} onValueChange={(v) => set("urgency", v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="critical">Critical</SelectItem>
              </SelectContent>
            </Select>
          </Field>
          <Field label="Required Time">
            <Input value={form.requiredBy} onChange={(e) => set("requiredBy", e.target.value)} />
          </Field>

          <Button type="submit" className="w-full">Post Requirement & Match</Button>
          {submitted && (
            <p className="text-xs text-muted-foreground">
              Requirement posted. Matching donations refresh automatically.
            </p>
          )}
        </form>

        {/* Matches */}
        <div className="space-y-6 lg:col-span-2">
          {best ? (
            <div className="surface-card border-primary/40 p-6">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-primary">
                  <Sparkles className="size-4" /> Best Match — Recommended
                </p>
                <UrgencyBadge urgency={form.urgency} />
              </div>
              <h2 className="mt-3 font-display text-xl font-bold">
                {best.donation.organization} · {best.donation.servings} meals
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                {best.donation.foodType} · {best.distance.toFixed(1)} km away ·{" "}
                {best.donation.availableTime}
              </p>
              <div className="mt-4">
                <div className="mb-1 flex justify-between text-sm">
                  <span>Match score</span>
                  <span className="font-semibold text-primary">{best.score}%</span>
                </div>
                <Progress value={best.score} className="h-2.5" />
              </div>
              <div className="mt-5 flex flex-wrap gap-2">
                <Button onClick={() => handleAccept(best.donation.donationId)}>
                  Accept Donation
                </Button>
                <Button variant="outline" asChild>
                  <a href={`tel:${best.donation.phone.replace(/\s/g, "")}`}>Call donor</a>
                </Button>
              </div>
            </div>
          ) : (
            <EmptyState
              title="No suitable NGO match found nearby."
              description="No suitable donation is available right now. We will notify you when a match becomes available."
            />
          )}

          <div>
            <h2 className="font-display text-xl font-bold">Available nearby donations</h2>
            <div className="mt-4 grid gap-5 md:grid-cols-2">
              {matches.map((m) => (
                <DonationCard
                  key={m.donation.donationId}
                  donation={m.donation}
                  distanceKm={m.distance}
                  matchScore={m.score}
                  onAccept={(d) => handleAccept(d.donationId)}
                />
              ))}
            </div>
            {matches.length === 0 && (
              <div className="mt-4">
                <EmptyState title="No active food donations found nearby." />
              </div>
            )}
          </div>
        </div>
      </div>
    </PageShell>
  );
}

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string | undefined;
  children: React.ReactNode;
}) {
  return (
    <div>
      <Label className="mb-1.5 block text-sm">{label}</Label>
      {children}
      {error && <p className="mt-1 text-xs text-destructive">{error}</p>}
    </div>
  );
}
