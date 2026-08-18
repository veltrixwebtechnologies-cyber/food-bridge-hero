import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Activity,
  Building2,
  CheckCircle2,
  HandHeart,
  PlayCircle,
  Recycle,
  RefreshCcw,
  Truck,
  Users,
  Utensils,
} from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { toast } from "sonner";
import { EmptyState } from "@/components/site/EmptyState";
import { PageShell } from "@/components/site/PageShell";
import { StatCard } from "@/components/site/StatCard";
import { StatusBadge } from "@/components/site/StatusBadge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DONATIONS_BY_DAY } from "@/lib/foodbridge/demo-data";
import { formatTimeLeft, rankMatches } from "@/lib/foodbridge/matching";
import { useStore } from "@/lib/foodbridge/store";
import type { Donation, DonationStatus } from "@/lib/foodbridge/types";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "Dashboard — Donations, Pickups & Impact | FoodBridge" },
      {
        name: "description",
        content:
          "Track active, accepted, completed and cancelled donations with live charts for meals rescued, category mix and daily donations.",
      },
      { property: "og:title", content: "FoodBridge Dashboard" },
      {
        property: "og:description",
        content: "Donation status tracking, pickup progress and impact analytics in one place.",
      },
    ],
  }),
  component: Dashboard,
});

const CHART_COLORS = [
  "var(--color-chart-1)",
  "var(--color-chart-2)",
  "var(--color-chart-3)",
  "var(--color-chart-4)",
  "var(--color-chart-5)",
];

function Dashboard() {
  const { donations, ngos, impact, updateDonationStatus, resetDemo, addDonation, userLocation } =
    useStore();

  const byStatus = (statuses: DonationStatus[]) =>
    donations.filter((d) => statuses.includes(d.status));

  const categoryData = Object.entries(
    donations.reduce<Record<string, number>>((acc, d) => {
      acc[d.category] = (acc[d.category] ?? 0) + d.servings;
      return acc;
    }, {}),
  ).map(([name, value]) => ({ name, value }));

  const completedVsPending = [
    { name: "Completed", value: impact.completed },
    { name: "Pending", value: impact.active },
  ];

  /**
   * SIH demo mode: runs the full end-to-end journey
   * post → match → accept → pickup → completed with visible status updates.
   */
  const runDemoFlow = () => {
    const donation = addDonation({
      donorName: "Demo Donor",
      organization: "Demo Restaurant",
      donorType: "Restaurant",
      phone: "+91 90000 11111",
      email: "demo.donor@foodbridge.app",
      foodType: "Veg Pulao & Dal Fry",
      category: "Cooked Meals",
      diet: "Vegetarian",
      quantity: "10 trays",
      servings: 100,
      preparedAt: new Date().toISOString(),
      expiryTime: new Date(Date.now() + 150 * 60000).toISOString(),
      address: "Demo Kitchen, Kalyani Nagar, Pune",
      lat: userLocation.lat + 0.01,
      lng: userLocation.lng + 0.01,
      availableTime: "Now – next 2 hours",
      description: "Auto-generated demo donation for the end-to-end walkthrough.",
      image: donations[0]?.image ?? "",
    });

    const best = rankMatches(donation, ngos)[0];
    toast.success(`Donation ${donation.donationId} posted · 100 meals`, {
      description: best
        ? `Best match: ${best.ngo.name} — ${best.score}% (${best.distanceKm.toFixed(1)} km)`
        : "No NGO nearby yet.",
    });

    const ngoId = best?.ngo.id;
    setTimeout(() => {
      updateDonationStatus(donation.donationId, "accepted", ngoId);
      toast.success("NGO accepted the donation");
    }, 1200);
    setTimeout(() => {
      updateDonationStatus(donation.donationId, "pickup", ngoId);
      toast.info("Pickup in progress");
    }, 2600);
    setTimeout(() => {
      updateDonationStatus(donation.donationId, "completed", ngoId);
      toast.success("Donation completed — dashboard statistics updated");
    }, 4200);
  };

  return (
    <PageShell
      eyebrow="Dashboard"
      title="Your FoodBridge control centre"
      description="Live donation pipeline, pickup tracking and impact analytics."
      actions={
        <>
          <Button onClick={runDemoFlow}>
            <PlayCircle className="mr-2 size-4" /> Run SIH demo flow
          </Button>
          <Button
            variant="outline"
            onClick={() => {
              resetDemo();
              toast.success("Demo data reset");
            }}
          >
            <RefreshCcw className="mr-2 size-4" /> Reset demo data
          </Button>
        </>
      }
    >
      {/* KPI cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7">
        <StatCard icon={HandHeart} label="Total Donations" value={impact.donations} />
        <StatCard icon={Activity} label="Active Donations" value={impact.active} />
        <StatCard icon={CheckCircle2} label="Completed" value={impact.completed} />
        <StatCard icon={Utensils} label="Meals Rescued" value={impact.mealsRescued} />
        <StatCard icon={Building2} label="NGOs Connected" value={impact.ngos} />
        <StatCard icon={Users} label="People Served" value={impact.peopleServed} />
        <StatCard
          icon={Recycle}
          label="Waste Reduced"
          value={`${impact.wasteReducedKg.toLocaleString("en-IN")} kg`}
        />
      </div>

      {/* Charts */}
      <div className="mt-8 grid gap-5 lg:grid-cols-2">
        <ChartCard title="Donations by day">
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={DONATIONS_BY_DAY}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
              <XAxis dataKey="day" stroke="var(--color-muted-foreground)" fontSize={12} />
              <YAxis stroke="var(--color-muted-foreground)" fontSize={12} />
              <Tooltip />
              <Bar dataKey="donations" fill="var(--color-chart-1)" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Meals rescued (weekly trend)">
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={DONATIONS_BY_DAY}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
              <XAxis dataKey="day" stroke="var(--color-muted-foreground)" fontSize={12} />
              <YAxis stroke="var(--color-muted-foreground)" fontSize={12} />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="meals"
                stroke="var(--color-chart-2)"
                strokeWidth={3}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Food category distribution">
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie data={categoryData} dataKey="value" nameKey="name" outerRadius={90} label>
                {categoryData.map((_, i) => (
                  <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                ))}
              </Pie>
              <Legend />
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Completed vs pending donations">
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie
                data={completedVsPending}
                dataKey="value"
                nameKey="name"
                innerRadius={55}
                outerRadius={90}
                label
              >
                <Cell fill="var(--color-chart-1)" />
                <Cell fill="var(--color-chart-3)" />
              </Pie>
              <Legend />
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* Donation pipeline */}
      <section className="mt-10">
        <h2 className="font-display text-xl font-bold">Donation pipeline</h2>
        <Tabs defaultValue="active" className="mt-4">
          <TabsList className="flex-wrap">
            <TabsTrigger value="active">Active</TabsTrigger>
            <TabsTrigger value="accepted">Accepted</TabsTrigger>
            <TabsTrigger value="completed">Completed</TabsTrigger>
            <TabsTrigger value="cancelled">Cancelled</TabsTrigger>
          </TabsList>
          {(
            [
              ["active", ["available", "matched"]],
              ["accepted", ["accepted", "pickup"]],
              ["completed", ["completed"]],
              ["cancelled", ["cancelled"]],
            ] as [string, DonationStatus[]][]
          ).map(([key, statuses]) => {
            const list = byStatus(statuses);
            return (
              <TabsContent key={key} value={key} className="mt-4">
                {list.length === 0 ? (
                  <EmptyState
                    title="Nothing here yet."
                    description="Donations will appear in this stage as their status changes."
                    action={
                      <Button asChild>
                        <Link to="/donate">Post a donation</Link>
                      </Button>
                    }
                  />
                ) : (
                  <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                    {list.map((d) => (
                      <DonationRow
                        key={d.donationId}
                        donation={d}
                        ngoName={ngos.find((n) => n.id === d.matchedNgoId)?.name}
                        onAdvance={(status) =>
                          updateDonationStatus(d.donationId, status, d.matchedNgoId)
                        }
                      />
                    ))}
                  </div>
                )}
              </TabsContent>
            );
          })}
        </Tabs>
      </section>

      {/* Recent activity */}
      <section className="mt-10">
        <h2 className="font-display text-xl font-bold">Recent activity</h2>
        <RecentActivity />
      </section>
    </PageShell>
  );
}

function DonationRow({
  donation,
  ngoName,
  onAdvance,
}: {
  donation: Donation;
  ngoName?: string | undefined;
  onAdvance: (status: DonationStatus) => void;
}) {
  const next: Partial<Record<DonationStatus, { label: string; status: DonationStatus }>> = {
    available: { label: "Mark accepted", status: "accepted" },
    matched: { label: "Mark accepted", status: "accepted" },
    accepted: { label: "Start pickup", status: "pickup" },
    pickup: { label: "Mark completed", status: "completed" },
  };
  const action = next[donation.status];

  return (
    <article className="surface-card space-y-2 p-5 text-sm">
      <div className="flex items-center justify-between gap-2">
        <span className="font-semibold text-primary">{donation.donationId}</span>
        <StatusBadge status={donation.status} />
      </div>
      <p className="font-display text-base font-semibold">{donation.foodType}</p>
      <Row label="Quantity" value={`${donation.quantity} · ${donation.servings} meals`} />
      <Row label="Location" value={donation.address} />
      <Row label="Available" value={donation.availableTime} />
      <Row label="Time left" value={formatTimeLeft(donation.expiryTime)} />
      <Row label="Matched NGO" value={ngoName ?? "Awaiting match"} />
      <Row
        label="Pickup status"
        value={
          donation.status === "pickup"
            ? "In progress"
            : donation.status === "completed"
              ? "Delivered"
              : "Not started"
        }
      />
      <div className="flex flex-wrap gap-2 pt-2">
        {action && (
          <Button size="sm" onClick={() => onAdvance(action.status)}>
            <Truck className="mr-1.5 size-3.5" /> {action.label}
          </Button>
        )}
        {["available", "matched", "accepted"].includes(donation.status) && (
          <Button size="sm" variant="outline" onClick={() => onAdvance("cancelled")}>
            Cancel
          </Button>
        )}
      </div>
    </article>
  );
}

function RecentActivity() {
  const { activity } = useStore();
  return (
    <ol className="surface-card mt-4 divide-y">
      {activity.slice(0, 8).map((a) => (
        <li key={a.id} className="flex items-start gap-3 p-4">
          <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
            {a.kind === "posted" ? (
              <HandHeart className="size-4" />
            ) : a.kind === "accepted" ? (
              <CheckCircle2 className="size-4" />
            ) : a.kind === "pickup" ? (
              <Truck className="size-4" />
            ) : (
              <Utensils className="size-4" />
            )}
          </span>
          <div>
            <p className="text-sm font-medium">{a.label}</p>
            <p className="text-xs text-muted-foreground">{a.detail}</p>
          </div>
          <span className="ml-auto whitespace-nowrap text-xs text-muted-foreground">
            {new Date(a.createdAt).toLocaleTimeString("en-IN", {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </span>
        </li>
      ))}
    </ol>
  );
}

function ChartCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="surface-card p-5">
      <h3 className="mb-4 font-display text-base font-semibold">{title}</h3>
      {children}
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <p className="flex justify-between gap-3">
      <span className="text-muted-foreground">{label}</span>
      <span className="text-right font-medium">{value}</span>
    </p>
  );
}
