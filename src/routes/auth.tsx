import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Building2, ShieldCheck, Utensils } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CITY_CENTER } from "@/lib/foodbridge/demo-data";
import { useStore } from "@/lib/foodbridge/store";
import type { Role } from "@/lib/foodbridge/types";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Login or Register — FoodBridge" },
      {
        name: "description",
        content:
          "Sign in as a donor, NGO or admin, or use one-tap demo logins to explore the complete FoodBridge workflow.",
      },
      { property: "og:title", content: "Login or Register — FoodBridge" },
      {
        property: "og:description",
        content: "Donor, NGO and Admin accounts with instant demo logins.",
      },
    ],
  }),
  component: AuthPage,
});

const DEMO_ACCOUNTS: { role: Role; email: string; label: string; icon: typeof Utensils }[] = [
  { role: "donor", email: "donor@foodbridge.app", label: "Demo Donor", icon: Utensils },
  { role: "ngo", email: "ngo@foodbridge.app", label: "Demo NGO", icon: Building2 },
  { role: "admin", email: "admin@foodbridge.app", label: "Demo Admin", icon: ShieldCheck },
];

function AuthPage() {
  const navigate = useNavigate();
  const { login, register, currentUser, logout } = useStore();

  const [loginForm, setLoginForm] = useState({ email: "", password: "", role: "donor" as Role });
  const [regForm, setRegForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    location: "",
    organization: "",
    role: "donor" as Role,
  });
  const [error, setError] = useState("");

  const demoLogin = (email: string, role: Role) => {
    const user = login(email, role);
    if (!user) {
      toast.error("Demo account unavailable", { description: "Try resetting demo data." });
      return;
    }
    toast.success(`Signed in as ${user.name}`, { description: `Role: ${role}` });
    navigate({ to: role === "admin" ? "/admin" : "/dashboard" });
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!/^\S+@\S+\.\S+$/.test(loginForm.email)) return setError("Enter a valid email address.");
    if (loginForm.password.length < 6) return setError("Password must be at least 6 characters.");
    const user = login(loginForm.email, loginForm.role);
    if (!user) {
      setError("No account found for that email and role. Try a demo login below.");
      return;
    }
    setError("");
    toast.success(`Welcome back, ${user.name}`);
    navigate({ to: user.role === "admin" ? "/admin" : "/dashboard" });
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    if (regForm.name.trim().length < 2) return setError("Enter your full name.");
    if (!/^\S+@\S+\.\S+$/.test(regForm.email)) return setError("Enter a valid email address.");
    if (!/^[+\d][\d\s-]{7,15}$/.test(regForm.phone)) return setError("Enter a valid phone number.");
    if (regForm.password.length < 6) return setError("Password must be at least 6 characters.");
    if (regForm.location.trim().length < 3) return setError("Enter your location.");
    if (regForm.role !== "donor" && regForm.organization.trim().length < 2)
      return setError("Organization name is required for NGO and admin accounts.");

    setError("");
    const user = register({
      name: regForm.name,
      email: regForm.email,
      phone: regForm.phone,
      role: regForm.role,
      organization: regForm.organization || "Household",
      location: regForm.location,
      lat: CITY_CENTER.lat,
      lng: CITY_CENTER.lng,
    });
    toast.success("Account created", { description: `Welcome to FoodBridge, ${user.name}.` });
    navigate({ to: user.role === "admin" ? "/admin" : "/dashboard" });
  };

  return (
    <PageShell
      eyebrow="Access"
      title="Login / Register"
      description="Donors, NGOs and administrators use the same secure entry point. Passwords are never displayed or shared."
    >
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <div className="surface-card p-6">
            <Tabs defaultValue="login">
              <TabsList>
                <TabsTrigger value="login">Login</TabsTrigger>
                <TabsTrigger value="register">Register</TabsTrigger>
              </TabsList>

              <TabsContent value="login" className="mt-6">
                <form onSubmit={handleLogin} className="grid gap-4 sm:grid-cols-2">
                  <div className="sm:col-span-2">
                    <Label className="mb-1.5 block text-sm">I am a</Label>
                    <Select
                      value={loginForm.role}
                      onValueChange={(v) => setLoginForm((f) => ({ ...f, role: v as Role }))}
                    >
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="donor">Donor</SelectItem>
                        <SelectItem value="ngo">NGO</SelectItem>
                        <SelectItem value="admin">Admin</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="mb-1.5 block text-sm">Email</Label>
                    <Input
                      type="email"
                      value={loginForm.email}
                      onChange={(e) => setLoginForm((f) => ({ ...f, email: e.target.value }))}
                      placeholder="you@example.com"
                    />
                  </div>
                  <div>
                    <Label className="mb-1.5 block text-sm">Password</Label>
                    <Input
                      type="password"
                      value={loginForm.password}
                      onChange={(e) => setLoginForm((f) => ({ ...f, password: e.target.value }))}
                      placeholder="••••••••"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <Button type="submit" className="w-full">Login</Button>
                  </div>
                </form>
              </TabsContent>

              <TabsContent value="register" className="mt-6">
                <form onSubmit={handleRegister} className="grid gap-4 sm:grid-cols-2">
                  <div className="sm:col-span-2">
                    <Label className="mb-1.5 block text-sm">Register as</Label>
                    <Select
                      value={regForm.role}
                      onValueChange={(v) => setRegForm((f) => ({ ...f, role: v as Role }))}
                    >
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="donor">Donor</SelectItem>
                        <SelectItem value="ngo">NGO</SelectItem>
                        <SelectItem value="admin">Admin</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="mb-1.5 block text-sm">Name</Label>
                    <Input value={regForm.name} onChange={(e) => setRegForm((f) => ({ ...f, name: e.target.value }))} />
                  </div>
                  <div>
                    <Label className="mb-1.5 block text-sm">Email</Label>
                    <Input type="email" value={regForm.email} onChange={(e) => setRegForm((f) => ({ ...f, email: e.target.value }))} />
                  </div>
                  <div>
                    <Label className="mb-1.5 block text-sm">Phone</Label>
                    <Input value={regForm.phone} onChange={(e) => setRegForm((f) => ({ ...f, phone: e.target.value }))} placeholder="+91 98200 11223" />
                  </div>
                  <div>
                    <Label className="mb-1.5 block text-sm">Password</Label>
                    <Input type="password" value={regForm.password} onChange={(e) => setRegForm((f) => ({ ...f, password: e.target.value }))} />
                  </div>
                  <div>
                    <Label className="mb-1.5 block text-sm">Location</Label>
                    <Input value={regForm.location} onChange={(e) => setRegForm((f) => ({ ...f, location: e.target.value }))} placeholder="Kalyani Nagar, Pune" />
                  </div>
                  <div>
                    <Label className="mb-1.5 block text-sm">Organization Name (if applicable)</Label>
                    <Input value={regForm.organization} onChange={(e) => setRegForm((f) => ({ ...f, organization: e.target.value }))} />
                  </div>
                  <div className="sm:col-span-2">
                    <Button type="submit" className="w-full">Create account</Button>
                  </div>
                </form>
              </TabsContent>
            </Tabs>

            {error && <p className="mt-4 text-sm text-destructive">{error}</p>}
          </div>
        </div>

        {/* Demo mode panel for hackathon judges */}
        <aside className="surface-card h-fit p-6">
          <h2 className="font-display text-lg font-semibold">SIH Demo Mode</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            One-tap sign in as any role. No setup, no credentials required.
          </p>
          <div className="mt-4 space-y-2">
            {DEMO_ACCOUNTS.map((a) => (
              <Button
                key={a.role}
                variant="outline"
                className="w-full justify-start"
                onClick={() => demoLogin(a.email, a.role)}
              >
                <a.icon className="mr-2 size-4" /> {a.label}
              </Button>
            ))}
          </div>
          {currentUser && (
            <div className="mt-5 rounded-xl bg-secondary/60 p-4 text-sm">
              <p className="font-medium">Signed in as {currentUser.name}</p>
              <p className="text-xs capitalize text-muted-foreground">{currentUser.role}</p>
              <Button variant="ghost" size="sm" className="mt-2" onClick={logout}>
                Log out
              </Button>
            </div>
          )}
          <p className="mt-5 text-xs text-muted-foreground">
            Security: users can only edit their own donations, NGOs can only accept donations that
            are still available, and admins have full moderation access.
          </p>
        </aside>
      </div>
    </PageShell>
  );
}
