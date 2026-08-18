import { createFileRoute } from "@tanstack/react-router";
import { AlertTriangle, BadgeCheck, Building2, ShieldCheck, Users } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { PageShell } from "@/components/site/PageShell";
import { StatCard } from "@/components/site/StatCard";
import { StatusBadge, UrgencyBadge } from "@/components/site/StatusBadge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useStore } from "@/lib/foodbridge/store";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Admin Panel — Users, NGOs & Donation Moderation | FoodBridge" },
      {
        name: "description",
        content:
          "Verify NGOs, approve or reject donations, monitor active pickups and review reported issues across the FoodBridge network.",
      },
      { property: "og:title", content: "FoodBridge Admin Panel" },
      {
        property: "og:description",
        content: "Network moderation, NGO verification and donation oversight.",
      },
    ],
  }),
  component: AdminPanel,
});

const REPORTED_ISSUES = [
  {
    id: "ISS-201",
    subject: "Pickup delayed by 40 minutes",
    reporter: "Care Community",
    severity: "Medium",
  },
  {
    id: "ISS-202",
    subject: "Quantity received lower than posted",
    reporter: "Hope Foundation",
    severity: "High",
  },
];

function AdminPanel() {
  const { users, donations, ngos, requests, impact, updateDonationStatus } = useStore();
  const [verified, setVerified] = useState<Record<string, boolean>>(
    Object.fromEntries(ngos.map((n) => [n.id, n.verified])),
  );

  return (
    <PageShell
      eyebrow="Admin"
      title="Admin Dashboard"
      description="Full oversight of users, NGOs, donations, requests and reported issues."
      actions={<Badge variant="secondary" className="gap-1"><ShieldCheck className="size-3.5" /> Full access</Badge>}
    >
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={Users} label="Registered users" value={users.length} />
        <StatCard icon={Building2} label="NGOs & food banks" value={ngos.length} />
        <StatCard icon={BadgeCheck} label="Active donations" value={impact.active} />
        <StatCard icon={AlertTriangle} label="Open issues" value={REPORTED_ISSUES.length} />
      </div>

      <Tabs defaultValue="donations" className="mt-8">
        <TabsList className="flex-wrap">
          <TabsTrigger value="donations">Donations</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="ngos">NGOs</TabsTrigger>
          <TabsTrigger value="requests">Requests</TabsTrigger>
          <TabsTrigger value="issues">Issues</TabsTrigger>
        </TabsList>

        <TabsContent value="donations" className="mt-4">
          <div className="surface-card overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Donor</TableHead>
                  <TableHead>Food</TableHead>
                  <TableHead>Servings</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Moderation</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {donations.map((d) => (
                  <TableRow key={d.donationId}>
                    <TableCell className="font-medium">{d.donationId}</TableCell>
                    <TableCell>{d.organization}</TableCell>
                    <TableCell className="max-w-56 truncate">{d.foodType}</TableCell>
                    <TableCell>{d.servings}</TableCell>
                    <TableCell><StatusBadge status={d.status} /></TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            updateDonationStatus(d.donationId, "available");
                            toast.success(`Donation ${d.donationId} approved`);
                          }}
                        >
                          Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => {
                            updateDonationStatus(d.donationId, "cancelled");
                            toast.error(`Donation ${d.donationId} rejected`);
                          }}
                        >
                          Reject
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        <TabsContent value="users" className="mt-4">
          <div className="surface-card overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Organization</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Location</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((u) => (
                  <TableRow key={u.id}>
                    <TableCell className="font-medium">{u.name}</TableCell>
                    <TableCell><Badge variant="secondary" className="capitalize">{u.role}</Badge></TableCell>
                    <TableCell>{u.organization ?? "—"}</TableCell>
                    <TableCell>{u.email}</TableCell>
                    <TableCell>{u.location}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        <TabsContent value="ngos" className="mt-4">
          <div className="surface-card overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>NGO</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Capacity</TableHead>
                  <TableHead>Urgency</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {ngos.map((n) => (
                  <TableRow key={n.id}>
                    <TableCell className="font-medium">{n.name}</TableCell>
                    <TableCell>{n.type}</TableCell>
                    <TableCell>{n.capacity} meals</TableCell>
                    <TableCell><UrgencyBadge urgency={n.urgency} /></TableCell>
                    <TableCell>
                      {verified[n.id] ? (
                        <Badge className="gap-1"><BadgeCheck className="size-3.5" /> Verified</Badge>
                      ) : (
                        <Badge variant="outline">Pending</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        size="sm"
                        variant={verified[n.id] ? "outline" : "default"}
                        onClick={() => {
                          setVerified((v) => ({ ...v, [n.id]: !v[n.id] }));
                          toast.success(
                            verified[n.id]
                              ? `${n.name} verification revoked`
                              : `${n.name} verified`,
                          );
                        }}
                      >
                        {verified[n.id] ? "Revoke" : "Verify NGO"}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        <TabsContent value="requests" className="mt-4">
          <div className="surface-card overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Request</TableHead>
                  <TableHead>Organization</TableHead>
                  <TableHead>Servings</TableHead>
                  <TableHead>People</TableHead>
                  <TableHead>Urgency</TableHead>
                  <TableHead>Required by</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {requests.map((r) => (
                  <TableRow key={r.requestId}>
                    <TableCell className="font-medium">{r.requestId}</TableCell>
                    <TableCell>{r.organization}</TableCell>
                    <TableCell>{r.requiredServings}</TableCell>
                    <TableCell>{r.people}</TableCell>
                    <TableCell><UrgencyBadge urgency={r.urgency} /></TableCell>
                    <TableCell>{r.requiredBy}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        <TabsContent value="issues" className="mt-4">
          <div className="surface-card overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Issue</TableHead>
                  <TableHead>Reported by</TableHead>
                  <TableHead>Severity</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {REPORTED_ISSUES.map((i) => (
                  <TableRow key={i.id}>
                    <TableCell className="font-medium">{i.id}</TableCell>
                    <TableCell>{i.subject}</TableCell>
                    <TableCell>{i.reporter}</TableCell>
                    <TableCell>{i.severity}</TableCell>
                    <TableCell className="text-right">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => toast.success(`Issue ${i.id} marked resolved`)}
                      >
                        Resolve
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </TabsContent>
      </Tabs>
    </PageShell>
  );
}
