import { createFileRoute, Link } from "@tanstack/react-router";
import { Building2, CheckCircle2, PackagePlus, Sparkles, Truck } from "lucide-react";
import { PageShell } from "@/components/site/PageShell";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/how-it-works")({
  head: () => ({
    meta: [
      { title: "How FoodBridge Works — Donate, Match, Connect, Deliver" },
      {
        name: "description",
        content:
          "Four steps to rescue surplus food: a donor posts food, FoodBridge matches nearby NGOs, the NGO accepts, and the food is picked up and distributed.",
      },
      { property: "og:title", content: "How FoodBridge Works" },
      {
        property: "og:description",
        content: "Donate, Match, Connect, Deliver — food rescue in four simple steps.",
      },
    ],
  }),
  component: HowItWorks,
});

const STEPS = [
  {
    icon: PackagePlus,
    title: "Donate",
    text: "A restaurant, hotel, canteen, event organiser or household posts surplus food with quantity, food type, freshness window and pickup location.",
  },
  {
    icon: Sparkles,
    title: "Match",
    text: "The smart matching engine scores every nearby NGO on distance, quantity fit, food type, timing, urgency and pickup feasibility, and surfaces the best match.",
  },
  {
    icon: Building2,
    title: "Connect",
    text: "The matched NGO gets a real-time notification and accepts the donation. Donor and NGO contact details are shared instantly.",
  },
  {
    icon: Truck,
    title: "Deliver",
    text: "Pickup status moves from Accepted to Pickup in Progress to Completed, and impact statistics update for both parties.",
  },
];

const SCORE_FACTORS = [
  { label: "Distance between donor & NGO", weight: 30 },
  { label: "Quantity required vs available", weight: 25 },
  { label: "Food type / dietary match", weight: 15 },
  { label: "Food availability & freshness window", weight: 15 },
  { label: "NGO urgency level", weight: 10 },
  { label: "Pickup feasibility (travel time)", weight: 5 },
];

function HowItWorks() {
  return (
    <PageShell
      eyebrow="Process"
      title="How FoodBridge Works"
      description="From surplus tray to served meal in four steps — with a transparent match score at every stage."
      actions={
        <Button asChild>
          <Link to="/donate">Post a donation</Link>
        </Button>
      }
    >
      <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
        {STEPS.map((step, i) => (
          <div key={step.title} className="surface-card p-6">
            <div className="flex items-center justify-between">
              <span className="flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <step.icon className="size-5" aria-hidden />
              </span>
              <span className="font-display text-3xl font-bold text-muted-foreground/30">
                0{i + 1}
              </span>
            </div>
            <h2 className="mt-4 font-display text-lg font-semibold">{step.title}</h2>
            <p className="mt-2 text-sm text-muted-foreground">{step.text}</p>
          </div>
        ))}
      </div>

      {/* Matching formula explanation — the core innovation */}
      <section className="mt-14 grid gap-6 lg:grid-cols-2">
        <div className="surface-card p-6">
          <h2 className="font-display text-xl font-bold">The matching score</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Every donor–NGO pair is scored out of 100. The higher the score, the more likely the
            food reaches people fresh and in the right quantity.
          </p>
          <ul className="mt-5 space-y-3">
            {SCORE_FACTORS.map((f) => (
              <li key={f.label}>
                <div className="flex justify-between text-sm">
                  <span>{f.label}</span>
                  <span className="font-semibold text-primary">{f.weight}%</span>
                </div>
                <div className="mt-1.5 h-2 rounded-full bg-secondary">
                  <div
                    className="h-2 rounded-full bg-primary"
                    style={{ width: `${(f.weight / 30) * 100}%` }}
                  />
                </div>
              </li>
            ))}
          </ul>
        </div>

        <div className="surface-card p-6">
          <h2 className="font-display text-xl font-bold">Worked example</h2>
          <div className="mt-4 space-y-3 text-sm">
            {[
              "Restaurant A has 100 meals available.",
              "NGO B needs 80 meals.",
              "Distance = 2.4 km.",
              "Availability = within 1 hour.",
              "Food type = Vegetarian, NGO accepts any.",
            ].map((line) => (
              <p key={line} className="flex items-start gap-2 text-muted-foreground">
                <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden />
                {line}
              </p>
            ))}
          </div>
          <div className="mt-6 rounded-2xl border border-primary/30 bg-primary/8 p-5">
            <p className="text-xs font-semibold uppercase tracking-wide text-primary">
              Recommended Match
            </p>
            <p className="mt-1 font-display text-4xl font-bold text-primary">95%</p>
            <p className="mt-1 text-sm text-muted-foreground">
              NGO B is notified instantly and can accept in one tap.
            </p>
          </div>
          <Button asChild className="mt-6 w-full">
            <Link to="/live-donations">Try it on live donations</Link>
          </Button>
        </div>
      </section>
    </PageShell>
  );
}
