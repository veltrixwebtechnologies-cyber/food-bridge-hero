import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Building2,
  CalendarHeart,
  Hotel,
  House,
  Landmark,
  School,
  Users,
  Utensils,
} from "lucide-react";
import { PageShell } from "@/components/site/PageShell";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About FoodBridge — Fighting Food Waste and Hunger Together" },
      {
        name: "description",
        content:
          "Learn what FoodBridge is, why food waste matters, how the platform works, and who can use it — from restaurants and hotels to NGOs and food banks.",
      },
      { property: "og:title", content: "About FoodBridge" },
      {
        property: "og:description",
        content:
          "A smart food donation network for a hunger-free community and sustainable development.",
      },
    ],
  }),
  component: About,
});

const USERS = [
  { icon: Utensils, label: "Restaurants" },
  { icon: Hotel, label: "Hotels" },
  { icon: CalendarHeart, label: "Event Organizers" },
  { icon: School, label: "Canteens" },
  { icon: House, label: "Households" },
  { icon: Building2, label: "NGOs" },
  { icon: Landmark, label: "Food Banks" },
  { icon: Users, label: "Community Organizations" },
];

function About() {
  return (
    <PageShell
      eyebrow="About"
      title="What is FoodBridge?"
      description="A smart food donation network that links surplus food with the people who need it, in real time and within a practical pickup radius."
      actions={
        <Button asChild>
          <Link to="/auth">Join the network</Link>
        </Button>
      }
    >
      <div className="grid gap-6 lg:grid-cols-3">
        <article className="surface-card p-6">
          <h2 className="font-display text-xl font-bold">Why food waste is a problem</h2>
          <p className="mt-3 text-sm text-muted-foreground">
            India wastes a significant share of the food it produces while millions go to bed
            hungry. Surplus food from kitchens, buffets and functions is edible for only a few
            hours, so it needs to move fast. Landfilled food also releases methane, making waste
            a climate problem as well as a hunger problem.
          </p>
        </article>
        <article className="surface-card p-6">
          <h2 className="font-display text-xl font-bold">How the platform works</h2>
          <p className="mt-3 text-sm text-muted-foreground">
            Donors post surplus food with quantity, freshness window and pickup location.
            FoodBridge geolocates the donation, scores every nearby verified NGO on six factors
            and recommends the best match. The NGO accepts, pickup is tracked to completion, and
            both sides see the impact on their dashboard.
          </p>
        </article>
        <article className="surface-card p-6">
          <h2 className="font-display text-xl font-bold">Our mission</h2>
          <p className="mt-3 text-sm text-muted-foreground">
            Save food, share hope and build a hunger-free community. FoodBridge is designed to be
            deployable in any city: verified NGOs, transparent tracking, measurable impact and a
            workflow simple enough for a household donor to complete in under a minute.
          </p>
        </article>
      </div>

      <section className="mt-12">
        <h2 className="font-display text-2xl font-bold">Who can use FoodBridge?</h2>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {USERS.map((u) => (
            <div key={u.label} className="surface-card flex items-center gap-3 p-5">
              <span className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <u.icon className="size-5" aria-hidden />
              </span>
              <span className="font-medium">{u.label}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-12 grid gap-6 md:grid-cols-2">
        <div className="surface-card p-6">
          <h2 className="font-display text-xl font-bold">Safety & trust</h2>
          <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
            <li>• Donors confirm the food is safe and suitable for donation.</li>
            <li>• NGOs are verified by the FoodBridge admin team before accepting food.</li>
            <li>• Every donation carries a preparation time and a best-before time.</li>
            <li>• Expired donations are automatically blocked from acceptance.</li>
            <li>• Users can only edit their own donations; admins moderate the network.</li>
          </ul>
        </div>
        <div className="surface-card p-6">
          <h2 className="font-display text-xl font-bold">Sustainable development</h2>
          <p className="mt-3 text-sm text-muted-foreground">
            FoodBridge contributes directly to SDG 2 (Zero Hunger), SDG 12 (Responsible
            Consumption and Production) and SDG 13 (Climate Action) by rerouting edible surplus
            away from landfill and towards communities.
          </p>
          <Button asChild variant="outline" className="mt-5">
            <Link to="/impact">See our impact</Link>
          </Button>
        </div>
      </section>
    </PageShell>
  );
}
