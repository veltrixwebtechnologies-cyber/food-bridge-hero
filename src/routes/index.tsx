import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight,
  Building2,
  Clock3,
  HandHeart,
  Handshake,
  HeartHandshake,
  Leaf,
  LineChart,
  MapPin,
  Recycle,
  Truck,
  Users,
  Utensils,
  Zap,
} from "lucide-react";
import heroImage from "@/assets/hero.jpg";
import { DonationCard } from "@/components/site/DonationCard";
import { StatCard } from "@/components/site/StatCard";
import { Button } from "@/components/ui/button";
import { distanceKm } from "@/lib/foodbridge/matching";
import { useStore } from "@/lib/foodbridge/store";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "FoodBridge — Turn Surplus Food Into Hope" },
      {
        name: "description",
        content:
          "FoodBridge connects surplus food from restaurants, hotels and households with nearby NGOs in real time using smart location-based matching.",
      },
      { property: "og:title", content: "FoodBridge — Turn Surplus Food Into Hope" },
      {
        property: "og:description",
        content:
          "Real-time, location-based smart matching of surplus food with nearby NGOs and food banks.",
      },
    ],
  }),
  component: Home,
});

const WHY = [
  {
    icon: Recycle,
    title: "Reduce Food Waste",
    text: "Every surplus tray posted on FoodBridge is diverted from the bin to a plate.",
  },
  {
    icon: Zap,
    title: "Real-Time Matching",
    text: "Our engine scores every donor–NGO pair the moment a donation is posted.",
  },
  {
    icon: MapPin,
    title: "Location-Based Connection",
    text: "Geolocation finds verified receivers within a practical pickup radius.",
  },
  {
    icon: Truck,
    title: "Quick Pickup",
    text: "Pickup feasibility is part of the score, so food reaches people while fresh.",
  },
  {
    icon: LineChart,
    title: "Transparent Tracking",
    text: "Available → Accepted → Pickup → Completed, visible to both sides.",
  },
  {
    icon: HeartHandshake,
    title: "Community Impact",
    text: "Meals rescued, people served and waste avoided, measured for every donor.",
  },
];

function Home() {
  const { donations, impact, userLocation } = useStore();
  const live = donations.filter((d) => d.status === "available" || d.status === "matched").slice(0, 3);

  return (
    <div>
      {/* ---------- Hero ---------- */}
      <section className="hero-wash border-b">
        <div className="mx-auto grid w-full max-w-7xl items-center gap-10 px-4 py-14 sm:px-6 lg:grid-cols-2 lg:py-20">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border bg-card px-3 py-1 text-xs font-medium text-primary">
              <Leaf className="size-3.5" /> Smart Food Donation Network
            </span>
            <h1 className="mt-5 font-display text-4xl font-bold leading-[1.08] sm:text-5xl lg:text-6xl">
              Turn Surplus Food <span className="text-primary">Into Hope</span>
            </h1>
            <p className="mt-5 max-w-xl text-base text-muted-foreground sm:text-lg">
              Connecting surplus food with nearby NGOs and communities in real time.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild size="lg">
                <Link to="/donate">
                  Donate Food <ArrowRight className="ml-1 size-4" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="secondary">
                <Link to="/find-food">Find Food</Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link to="/live-donations">Explore Live Donations</Link>
              </Button>
            </div>
            <p className="mt-6 text-sm text-muted-foreground">
              Serving <strong className="text-foreground">{userLocation.label}</strong> ·{" "}
              {impact.active} active donations right now
            </p>
          </div>

          <div className="relative">
            <img
              src={heroImage}
              alt="Volunteers loading packed surplus meals into an NGO van"
              width={1600}
              height={1100}
              className="w-full rounded-3xl object-cover shadow-lift"
            />
            <div className="surface-card absolute -bottom-6 left-4 hidden max-w-[15rem] p-4 sm:block">
              <p className="text-xs text-muted-foreground">Recommended Match</p>
              <p className="mt-1 font-display text-2xl font-bold text-primary">95%</p>
              <p className="text-xs text-muted-foreground">
                Restaurant A (100 meals) → NGO B (80 meals) · 2.4 km · pickup in 1 hour
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ---------- Flow diagram ---------- */}
      <section className="mx-auto w-full max-w-7xl px-4 py-14 sm:px-6">
        <h2 className="text-center font-display text-2xl font-bold sm:text-3xl">
          One bridge, four stops
        </h2>
        <div className="mt-8 grid gap-4 md:grid-cols-7 md:items-center">
          {[
            { icon: Utensils, label: "Donor", note: "Surplus food posted" },
            { icon: Leaf, label: "FoodBridge", note: "Smart match in seconds" },
            { icon: Building2, label: "NGO", note: "Accepts & picks up" },
            { icon: Users, label: "People in Need", note: "Meals served" },
          ].map((step, i, arr) => (
            <div key={step.label} className="contents">
              <div className="surface-card flex flex-col items-center gap-2 p-6 text-center md:col-span-1 md:min-h-40">
                <span className="flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <step.icon className="size-5" aria-hidden />
                </span>
                <p className="font-semibold">{step.label}</p>
                <p className="text-xs text-muted-foreground">{step.note}</p>
              </div>
              {i < arr.length - 1 && (
                <div className="hidden items-center justify-center text-primary md:flex">
                  <ArrowRight className="size-6" aria-hidden />
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* ---------- Impact statistics ---------- */}
      <section className="border-y bg-secondary/40">
        <div className="mx-auto w-full max-w-7xl px-4 py-14 sm:px-6">
          <h2 className="font-display text-2xl font-bold sm:text-3xl">Impact so far</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Live network statistics across all connected donors and NGOs.
          </p>
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            <StatCard icon={HandHeart} label="Food Donations" value={impact.donations} />
            <StatCard icon={Utensils} label="Meals Rescued" value={impact.mealsRescued} />
            <StatCard icon={Building2} label="NGOs Connected" value={impact.ngos} />
            <StatCard icon={Users} label="People Served" value={impact.peopleServed} />
            <StatCard
              icon={Recycle}
              label="Food Waste Reduced"
              value={`${impact.wasteReducedKg.toLocaleString("en-IN")} kg`}
            />
          </div>
        </div>
      </section>

      {/* ---------- Why FoodBridge ---------- */}
      <section className="mx-auto w-full max-w-7xl px-4 py-16 sm:px-6">
        <div className="max-w-2xl">
          <h2 className="font-display text-2xl font-bold sm:text-3xl">Why FoodBridge?</h2>
          <p className="mt-2 text-sm text-muted-foreground sm:text-base">
            Donors rarely know who needs food nearby. FoodBridge removes that guesswork with a
            transparent, real-time matching layer.
          </p>
        </div>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {WHY.map((item) => (
            <div key={item.title} className="surface-card p-6">
              <span className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <item.icon className="size-5" aria-hidden />
              </span>
              <h3 className="mt-4 font-display text-lg font-semibold">{item.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{item.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ---------- Live donations preview ---------- */}
      <section className="border-t bg-secondary/30">
        <div className="mx-auto w-full max-w-7xl px-4 py-16 sm:px-6">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <h2 className="font-display text-2xl font-bold sm:text-3xl">Live donations near you</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Updated in real time as donors post surplus food.
              </p>
            </div>
            <Button asChild variant="outline">
              <Link to="/live-donations">View all</Link>
            </Button>
          </div>
          <div className="mt-8 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {live.map((d) => (
              <DonationCard
                key={d.donationId}
                donation={d}
                distanceKm={distanceKm(userLocation.lat, userLocation.lng, d.lat, d.lng)}
              />
            ))}
          </div>
        </div>
      </section>

      {/* ---------- CTA ---------- */}
      <section className="mx-auto w-full max-w-7xl px-4 py-16 sm:px-6">
        <div className="brand-gradient flex flex-col items-center gap-5 rounded-3xl px-6 py-14 text-center text-primary-foreground">
          <Handshake className="size-10" aria-hidden />
          <h2 className="font-display text-2xl font-bold sm:text-3xl">
            Save Food. Share Hope. Build a Hunger-Free Community.
          </h2>
          <p className="max-w-2xl text-sm opacity-90">
            Join restaurants, hotels, canteens, event organisers, households, NGOs and food banks
            already rescuing meals with FoodBridge.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Button asChild size="lg" variant="secondary">
              <Link to="/auth">Get Started</Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="bg-transparent">
              <Link to="/how-it-works">
                <Clock3 className="mr-1 size-4" /> See How It Works
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
