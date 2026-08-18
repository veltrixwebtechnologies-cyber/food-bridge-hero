import { Link } from "@tanstack/react-router";
import { Facebook, Instagram, Linkedin, Mail, MapPin, Phone, Twitter } from "lucide-react";
import { Logo } from "./Logo";

const quickLinks = [
  { to: "/how-it-works", label: "How It Works" },
  { to: "/donate", label: "Donate Food" },
  { to: "/find-food", label: "Find Food" },
  { to: "/live-donations", label: "Live Donations" },
  { to: "/map", label: "Map" },
  { to: "/impact", label: "Impact" },
] as const;

export function Footer() {
  return (
    <footer className="mt-20 border-t bg-secondary/40">
      <div className="mx-auto grid w-full max-w-7xl gap-10 px-4 py-12 sm:px-6 md:grid-cols-4">
        <div className="md:col-span-2">
          <Logo />
          <p className="mt-4 max-w-sm text-sm text-muted-foreground">
            FoodBridge is a real-time, location-aware network that connects surplus food from
            restaurants, hotels, canteens, events and households with verified NGOs and food
            banks nearby.
          </p>
          <div className="mt-5 flex gap-2">
            {[Twitter, Instagram, Linkedin, Facebook].map((Icon, i) => (
              <a
                key={i}
                href="#"
                aria-label="FoodBridge social profile"
                className="flex size-9 items-center justify-center rounded-lg border bg-card text-muted-foreground transition-colors hover:text-primary"
              >
                <Icon className="size-4" aria-hidden />
              </a>
            ))}
          </div>
        </div>

        <div>
          <h3 className="text-sm font-semibold">Quick Links</h3>
          <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
            {quickLinks.map((l) => (
              <li key={l.to}>
                <Link to={l.to} className="transition-colors hover:text-primary">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="text-sm font-semibold">Contact</h3>
          <ul className="mt-4 space-y-3 text-sm text-muted-foreground">
            <li className="flex items-start gap-2">
              <Mail className="mt-0.5 size-4 shrink-0" aria-hidden /> support@foodbridge.app
            </li>
            <li className="flex items-start gap-2">
              <Phone className="mt-0.5 size-4 shrink-0" aria-hidden /> +91 1800 123 4567
            </li>
            <li className="flex items-start gap-2">
              <MapPin className="mt-0.5 size-4 shrink-0" aria-hidden /> Pune, Maharashtra, India
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t">
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-2 px-4 py-5 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <p>© {new Date().getFullYear()} FoodBridge. All rights reserved.</p>
          <p>Save Food. Share Hope. Build a Hunger-Free Community.</p>
        </div>
      </div>
    </footer>
  );
}
