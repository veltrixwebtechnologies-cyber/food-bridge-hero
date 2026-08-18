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
  component: FindFood;
});

function FindFood() {
  return null;
}
