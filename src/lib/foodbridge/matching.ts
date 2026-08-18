import type { Donation, Ngo, Urgency } from "./types";

/** Haversine distance in kilometres between two coordinates. */
export function distanceKm(
  aLat: number,
  aLng: number,
  bLat: number,
  bLng: number,
): number {
  const R = 6371;
  const dLat = ((bLat - aLat) * Math.PI) / 180;
  const dLng = ((bLng - aLng) * Math.PI) / 180;
  const lat1 = (aLat * Math.PI) / 180;
  const lat2 = (bLat * Math.PI) / 180;
  const h =
    Math.sin(dLat / 2) ** 2 + Math.sin(dLng / 2) ** 2 * Math.cos(lat1) * Math.cos(lat2);
  return 2 * R * Math.asin(Math.sqrt(h));
}

const URGENCY_WEIGHT: Record<Urgency, number> = {
  low: 0.55,
  medium: 0.7,
  high: 0.88,
  critical: 1,
};

export interface MatchBreakdown {
  distance: number;
  quantity: number;
  foodType: number;
  timing: number;
  urgency: number;
  feasibility: number;
}

export interface MatchResult {
  ngo: Ngo;
  score: number;
  distanceKm: number;
  breakdown: MatchBreakdown;
  reason: string;
}

/**
 * Smart matching score (0-100).
 *
 * score = 30*distance + 25*quantity fit + 15*food type + 15*timing
 *       + 10*urgency + 5*pickup feasibility
 */
export function scoreMatch(donation: Donation, ngo: Ngo): MatchResult {
  const d = distanceKm(donation.lat, donation.lng, ngo.lat, ngo.lng);

  // 1. Distance — full marks under 1 km, zero beyond 15 km.
  const distance = clamp01(1 - Math.max(0, d - 1) / 14);

  // 2. Quantity fit — how well NGO capacity absorbs the available servings.
  const ratio = ngo.capacity === 0 ? 0 : donation.servings / ngo.capacity;
  const quantity = ratio >= 1 ? clamp01(1 / ratio) : clamp01(0.6 + 0.4 * ratio);

  // 3. Food type / dietary compatibility.
  const foodType =
    ngo.foodType === "Any" || ngo.foodType === donation.diet
      ? 1
      : donation.diet === "Mixed"
        ? 0.75
        : 0.45;

  // 4. Timing — how much of the freshness window is left.
  const minutesLeft = (new Date(donation.expiryTime).getTime() - Date.now()) / 60000;
  const timing = clamp01(minutesLeft / 180);

  // 5. Urgency of the receiving NGO.
  const urgency = URGENCY_WEIGHT[ngo.urgency];

  // 6. Pickup feasibility — can a vehicle realistically reach in time (25 km/h city avg).
  const travelMinutes = (d / 25) * 60;
  const feasibility = clamp01((minutesLeft - travelMinutes) / Math.max(minutesLeft, 1));

  const score = Math.round(
    (distance * 30 +
      quantity * 25 +
      foodType * 15 +
      timing * 15 +
      urgency * 10 +
      feasibility * 5) *
      1,
  );

  const reason = `${d.toFixed(1)} km away · needs ~${ngo.capacity} meals · ${ngo.urgency} urgency`;

  return {
    ngo,
    score: Math.max(0, Math.min(100, score)),
    distanceKm: d,
    breakdown: { distance, quantity, foodType, timing, urgency, feasibility },
    reason,
  };
}

/** Ranked list of NGOs for a donation, best match first. */
export function rankMatches(donation: Donation, ngos: Ngo[]): MatchResult[] {
  return ngos
    .map((n) => scoreMatch(donation, n))
    .sort((a, b) => b.score - a.score);
}

function clamp01(v: number) {
  return Math.max(0, Math.min(1, v));
}

export function minutesRemaining(iso: string) {
  return Math.round((new Date(iso).getTime() - Date.now()) / 60000);
}

export function formatTimeLeft(iso: string) {
  const mins = minutesRemaining(iso);
  if (mins <= 0) return "Expired";
  if (mins < 60) return `${mins} min left`;
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return m ? `${h}h ${m}m left` : `${h}h left`;
}
