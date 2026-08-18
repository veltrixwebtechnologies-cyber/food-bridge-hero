import { createFileRoute, Link } from "@tanstack/react-router";
import { CheckCircle2, Crosshair, Loader2, Sparkles } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { z } from "zod";
import { PageShell } from "@/components/site/PageShell";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { FOOD_IMAGES } from "@/lib/foodbridge/demo-data";
import { rankMatches } from "@/lib/foodbridge/matching";
import { useStore } from "@/lib/foodbridge/store";
import type { Donation, DonorType } from "@/lib/foodbridge/types";

export const Route = createFileRoute("/donate")({
  head: () => ({
    meta: [
      { title: "Donate Surplus Food — FoodBridge" },
      {
        name: "description",
        content:
          "Post surplus food in under a minute. FoodBridge instantly matches your donation with the best verified NGO nearby.",
      },
      { property: "og:title", content: "Donate Surplus Food — FoodBridge" },
      {
        property: "og:description",
        content: "Post surplus food and get matched with a nearby NGO in seconds.",
      },
    ],
  }),
  component: DonatePage,
});

/** Validation schema — every field is validated before a donation is created. */
const schema = z.object({
  donorName: z.string().trim().min(2, "Enter your full name").max(80),
  organization: z.string().trim().min(2, "Enter organization or 'Household'").max(120),
  phone: z.string().trim().regex(/^[+\d][\d\s-]{7,15}$/, "Enter a valid phone number"),
  email: z.string().trim().email("Enter a valid email").max(255),
  foodType: z.string().trim().min(3, "Describe the food").max(120),
  category: z.string().min(1, "Select a food category"),
  diet: z.enum(["Vegetarian", "Non-Vegetarian", "Mixed"]),
  donorType: z.string().min(1, "Select donor type"),
  quantity: z.string().trim().min(1, "Enter quantity").max(60),
  servings: z.coerce.number().int().min(1, "At least 1 serving").max(10000),
  preparedAt: z.string().min(1, "Select preparation time"),
  bestBefore: z.string().min(1, "Select best-before time"),
  address: z.string().trim().min(5, "Enter the pickup address").max(200),
  availableTime: z.string().trim().min(3, "Enter the available pickup time").max(80),
  description: z.string().trim().max(500).optional(),
});

const CATEGORIES = ["Cooked Meals", "Buffet Surplus", "Packed Food", "Bakery", "Raw Groceries", "Fruits & Vegetables"];
const DONOR_TYPES: DonorType[] = ["Restaurant", "Hotel", "Event Hall", "Canteen", "Household", "Caterer"];

type FormState = {
  donorName: string;
  organization: string;
  phone: string;
  email: string;
  foodType: string;
  category: string;
  diet: string;
  donorType: string;
  quantity: string;
  servings: string;
  preparedAt: string;
  bestBefore: string;
  address: string;
  availableTime: string;
  description: string;
};

const initialForm: FormState = {
  donorName: "",
  organization: "",
  phone: "",
  email: "",
  foodType: "",
  category: "",
  diet: "Vegetarian",
  donorType: "Restaurant",
  quantity: "",
  servings: "",
  preparedAt: "",
  bestBefore: "",
  address: "",
  availableTime: "",
  description: "",
};

function DonatePage() {
  const { addDonation, ngos, userLocation, setUserLocation, currentUser } = useStore();
  const [form, setForm] = useState<FormState>({
    ...initialForm,
    donorName: currentUser?.name ?? "",
    organization: currentUser?.organization ?? "",
    phone: currentUser?.phone ?? "",
    email: currentUser?.email ?? "",
    address: currentUser?.location ?? "",
  });
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({});
  const [confirmed, setConfirmed] = useState(false);
  const [imageIndex, setImageIndex] = useState(0);
  const [locating, setLocating] = useState(false);
  const [created, setCreated] = useState<Donation | null>(null);

  const set = (key: keyof FormState, value: string) => {
    setForm((f) => ({ ...f, [key]: value }));
    setErrors((e) => ({ ...e, [key]: "" }));
  };

  /** Uses the browser geolocation API when permission is granted. */
  const detectLocation = () => {
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      toast.error("Location not supported", {
        description: "Your browser does not support geolocation. Enter the address manually.",
      });
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserLocation({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          label: "Your current location",
        });
        setLocating(false);
        toast.success("Location detected", {
          description: `${pos.coords.latitude.toFixed(4)}, ${pos.coords.longitude.toFixed(4)}`,
        });
      },
      () => {
        setLocating(false);
        toast.error("Missing location", {
          description: "Location permission denied. Using the default city centre instead.",
        });
      },
      { timeout: 8000 },
    );
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = schema.safeParse(form);
    if (!parsed.success) {
      const fieldErrors: Partial<Record<keyof FormState, string>> = {};
      for (const issue of parsed.error.issues) {
        fieldErrors[String(issue.path[0]) as keyof FormState] = issue.message;
      }
      setErrors(fieldErrors);
      toast.error("Invalid form", { description: "Please fix the highlighted fields." });
      return;
    }
    if (!confirmed) {
      toast.error("Confirmation required", {
        description: "Please confirm the food is safe and suitable for donation.",
      });
      return;
    }

    const d = parsed.data;
    const expiry = new Date(`${new Date().toISOString().slice(0, 10)}T${d.bestBefore}:00`);
    if (expiry.getTime() < Date.now()) expiry.setDate(expiry.getDate() + 1);
    const prepared = new Date(`${new Date().toISOString().slice(0, 10)}T${d.preparedAt}:00`);

    const donation = addDonation({
      donorName: d.donorName,
      organization: d.organization,
      donorType: d.donorType as DonorType,
      phone: d.phone,
      email: d.email,
      foodType: d.foodType,
      category: d.category,
      diet: d.diet,
      quantity: d.quantity,
      servings: d.servings,
      preparedAt: prepared.toISOString(),
      expiryTime: expiry.toISOString(),
      address: d.address,
      lat: userLocation.lat,
      lng: userLocation.lng,
      availableTime: d.availableTime,
      description: d.description ?? "",
      image: FOOD_IMAGES[imageIndex % FOOD_IMAGES.length]!,
    });

    setCreated(donation);
    toast.success("Food donation posted successfully.", {
      description: `Donation ID ${donation.donationId}`,
    });
    setForm(initialForm);
    setConfirmed(false);
  };

  const bestMatch = created ? rankMatches(created, ngos)[0] : null;

  return (
    <PageShell
      eyebrow="Donor module"
      title="Donate Food"
      description="Fill in the details of your surplus food. FoodBridge will instantly find the best verified NGO nearby."
      actions={
        <Button variant="outline" onClick={detectLocation} disabled={locating}>
          {locating ? (
            <Loader2 className="mr-2 size-4 animate-spin" />
          ) : (
            <Crosshair className="mr-2 size-4" />
          )}
          Use current location
        </Button>
      }
    >
      <form onSubmit={submit} className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Section title="Donor details">
            <Field label="Donor Name" error={errors.donorName}>
              <Input value={form.donorName} onChange={(e) => set("donorName", e.target.value)} placeholder="Aarav Mehta" />
            </Field>
            <Field label="Organization / Restaurant / Hotel Name" error={errors.organization}>
              <Input value={form.organization} onChange={(e) => set("organization", e.target.value)} placeholder="Spice Garden Restaurant" />
            </Field>
            <Field label="Phone Number" error={errors.phone}>
              <Input value={form.phone} onChange={(e) => set("phone", e.target.value)} placeholder="+91 98200 11223" />
            </Field>
            <Field label="Email" error={errors.email}>
              <Input type="email" value={form.email} onChange={(e) => set("email", e.target.value)} placeholder="you@example.com" />
            </Field>
            <Field label="Donor Type" error={errors.donorType}>
              <Select value={form.donorType} onValueChange={(v) => set("donorType", v)}>
                <SelectTrigger><SelectValue placeholder="Select donor type" /></SelectTrigger>
                <SelectContent>
                  {DONOR_TYPES.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                </SelectContent>
              </Select>
            </Field>
          </Section>

          <Section title="Food details">
            <Field label="Food Type" error={errors.foodType}>
              <Input value={form.foodType} onChange={(e) => set("foodType", e.target.value)} placeholder="Veg Thali (rice, dal, sabzi, roti)" />
            </Field>
            <Field label="Food Category" error={errors.category}>
              <Select value={form.category} onValueChange={(v) => set("category", v)}>
                <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                </SelectContent>
              </Select>
            </Field>
            <Field label="Vegetarian / Non-Vegetarian" error={errors.diet}>
              <Select value={form.diet} onValueChange={(v) => set("diet", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Vegetarian">Vegetarian</SelectItem>
                  <SelectItem value="Non-Vegetarian">Non-Vegetarian</SelectItem>
                  <SelectItem value="Mixed">Mixed</SelectItem>
                </SelectContent>
              </Select>
            </Field>
            <Field label="Quantity" error={errors.quantity}>
              <Input value={form.quantity} onChange={(e) => set("quantity", e.target.value)} placeholder="12 trays" />
            </Field>
            <Field label="Number of Servings" error={errors.servings}>
              <Input type="number" min={1} value={form.servings} onChange={(e) => set("servings", e.target.value)} placeholder="120" />
            </Field>
            <Field label="Food Preparation Time" error={errors.preparedAt}>
              <Input type="time" value={form.preparedAt} onChange={(e) => set("preparedAt", e.target.value)} />
            </Field>
            <Field label="Best Before Time" error={errors.bestBefore}>
              <Input type="time" value={form.bestBefore} onChange={(e) => set("bestBefore", e.target.value)} />
            </Field>
          </Section>

          <Section title="Pickup details">
            <Field label="Pickup Address" error={errors.address} full>
              <Input value={form.address} onChange={(e) => set("address", e.target.value)} placeholder="Spice Garden, Kalyani Nagar, Pune" />
            </Field>
            <Field label="Current Location (detected)">
              <Input readOnly value={`${userLocation.label} · ${userLocation.lat.toFixed(4)}, ${userLocation.lng.toFixed(4)}`} />
            </Field>
            <Field label="Available Pickup Time" error={errors.availableTime}>
              <Input value={form.availableTime} onChange={(e) => set("availableTime", e.target.value)} placeholder="Now – 9:30 PM" />
            </Field>
            <Field label="Food Description" error={errors.description} full>
              <Textarea rows={3} value={form.description} onChange={(e) => set("description", e.target.value)} placeholder="Packed and sealed in food-grade trays, prepared for a corporate lunch." />
            </Field>
            <Field label="Upload Food Image" full>
              <div className="flex flex-wrap items-center gap-3">
                {FOOD_IMAGES.map((src, i) => (
                  <button
                    type="button"
                    key={src}
                    onClick={() => setImageIndex(i)}
                    className={`size-16 overflow-hidden rounded-lg border-2 ${i === imageIndex ? "border-primary" : "border-transparent"}`}
                    aria-label={`Select sample food image ${i + 1}`}
                  >
                    <img src={src} alt="" loading="lazy" className="size-full object-cover" />
                  </button>
                ))}
                <Input
                  type="file"
                  accept="image/*"
                  className="max-w-xs"
                  onChange={() => toast.info("Image selected", { description: "Demo mode uses a sample image preview." })}
                />
              </div>
            </Field>
          </Section>
        </div>

        {/* Sticky summary / submit panel */}
        <aside className="lg:sticky lg:top-24 lg:h-fit">
          <div className="surface-card space-y-4 p-6">
            <h2 className="font-display text-lg font-semibold">Post your donation</h2>
            <p className="text-sm text-muted-foreground">
              {ngos.length} verified receivers are online near {userLocation.label}. Your donation
              gets a match score instantly.
            </p>
            <label className="flex items-start gap-3 rounded-xl bg-secondary/60 p-3 text-sm">
              <Checkbox checked={confirmed} onCheckedChange={(v) => setConfirmed(Boolean(v))} className="mt-0.5" />
              <span>I confirm that the food is safe and suitable for donation.</span>
            </label>
            <Button type="submit" size="lg" className="w-full">
              Post Donation
            </Button>
            <Button asChild variant="ghost" className="w-full">
              <Link to="/live-donations">View live donations</Link>
            </Button>
          </div>
        </aside>
      </form>

      {/* Success dialog with generated donation ID and best match */}
      <Dialog open={Boolean(created)} onOpenChange={(o) => !o && setCreated(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CheckCircle2 className="size-5 text-primary" /> Food donation posted successfully.
            </DialogTitle>
            <DialogDescription>
              Donation ID <strong className="text-foreground">{created?.donationId}</strong> is now
              live for nearby NGOs.
            </DialogDescription>
          </DialogHeader>
          {bestMatch ? (
            <div className="rounded-2xl border border-primary/30 bg-primary/8 p-4">
              <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-primary">
                <Sparkles className="size-4" /> Recommended Match – {bestMatch.score}%
              </p>
              <p className="mt-2 font-display text-lg font-semibold">{bestMatch.ngo.name}</p>
              <p className="text-sm text-muted-foreground">{bestMatch.reason}</p>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              No suitable NGO found nearby. We will notify you when a match becomes available.
            </p>
          )}
          <DialogFooter>
            <Button asChild variant="outline">
              <Link to="/dashboard">Go to dashboard</Link>
            </Button>
            <Button onClick={() => setCreated(null)}>Post another</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PageShell>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="surface-card p-6">
      <h2 className="font-display text-lg font-semibold">{title}</h2>
      <div className="mt-4 grid gap-4 sm:grid-cols-2">{children}</div>
    </section>
  );
}

function Field({
  label,
  error,
  children,
  full,
}: {
  label: string;
  error?: string | undefined;
  children: React.ReactNode;
  full?: boolean | undefined;
}) {
  return (
    <div className={full ? "sm:col-span-2" : undefined}>
      <Label className="mb-1.5 block text-sm">{label}</Label>
      {children}
      {error && <p className="mt-1 text-xs text-destructive">{error}</p>}
    </div>
  );
}
