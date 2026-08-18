/**
 * FoodBridge domain types.
 * The prototype keeps all data client-side (localStorage) so judges can run the
 * full donor -> match -> NGO -> pickup -> completed flow without any setup.
 */

export type Role = "donor" | "ngo" | "admin";

export type DonationStatus =
  | "available"
  | "matched"
  | "accepted"
  | "pickup"
  | "completed"
  | "cancelled"
  | "expired";

export type Urgency = "low" | "medium" | "high" | "critical";

export type DonorType =
  | "Restaurant"
  | "Hotel"
  | "Event Hall"
  | "Canteen"
  | "Household"
  | "Caterer";

export interface AppUser {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: Role;
  organization?: string;
  location: string;
  lat: number;
  lng: number;
  verified?: boolean;
  createdAt: string;
}

export interface Donation {
  donationId: string;
  donorId: string;
  donorName: string;
  organization: string;
  donorType: DonorType;
  phone: string;
  email: string;
  foodType: string;
  category: string;
  diet: "Vegetarian" | "Non-Vegetarian" | "Mixed";
  quantity: string;
  servings: number;
  preparedAt: string;
  expiryTime: string;
  address: string;
  lat: number;
  lng: number;
  availableTime: string;
  description: string;
  image: string;
  status: DonationStatus;
  matchedNgoId?: string;
  matchScore?: number;
  createdAt: string;
}

export interface FoodRequest {
  requestId: string;
  ngoId: string;
  organization: string;
  contactPerson: string;
  phone: string;
  location: string;
  lat: number;
  lng: number;
  foodType: string;
  requiredServings: number;
  people: number;
  urgency: Urgency;
  requiredBy: string;
  createdAt: string;
  status: "open" | "fulfilled";
}

export interface Ngo {
  id: string;
  name: string;
  contactPerson: string;
  phone: string;
  location: string;
  lat: number;
  lng: number;
  capacity: number;
  urgency: Urgency;
  foodType: string;
  verified: boolean;
  type: "NGO" | "Food Bank" | "Community Kitchen";
}

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  kind: "donation" | "match" | "pickup" | "completed" | "system";
  audience: Role | "all";
  createdAt: string;
  read: boolean;
}

export interface ActivityEvent {
  id: string;
  label: string;
  detail: string;
  kind: "posted" | "accepted" | "pickup" | "completed";
  createdAt: string;
}
