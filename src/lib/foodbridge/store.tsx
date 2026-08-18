import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  BASE_IMPACT,
  CITY_CENTER,
  DEMO_ACTIVITY,
  DEMO_DONATIONS,
  DEMO_NGOS,
  DEMO_NOTIFICATIONS,
  DEMO_REQUESTS,
  DEMO_USERS,
} from "./demo-data";
import { rankMatches } from "./matching";
import type {
  ActivityEvent,
  AppNotification,
  AppUser,
  Donation,
  DonationStatus,
  FoodRequest,
  Ngo,
} from "./types";

/**
 * Client-side application store.
 * All state is persisted to localStorage so the prototype keeps its data across
 * reloads during a demo, while remaining fully offline / zero-setup.
 */

const STORAGE_KEY = "foodbridge.state.v1";

interface State {
  users: AppUser[];
  donations: Donation[];
  ngos: Ngo[];
  requests: FoodRequest[];
  notifications: AppNotification[];
  activity: ActivityEvent[];
  currentUserId: string | null;
  userLocation: { lat: number; lng: number; label: string };
}

const initialState: State = {
  users: DEMO_USERS,
  donations: DEMO_DONATIONS,
  ngos: DEMO_NGOS,
  requests: DEMO_REQUESTS,
  notifications: DEMO_NOTIFICATIONS,
  activity: DEMO_ACTIVITY,
  currentUserId: null,
  userLocation: CITY_CENTER,
};

interface StoreValue extends State {
  currentUser: AppUser | null;
  impact: {
    donations: number;
    mealsRescued: number;
    ngos: number;
    peopleServed: number;
    wasteReducedKg: number;
    active: number;
    completed: number;
  };
  login: (email: string, role?: AppUser["role"]) => AppUser | null;
  register: (user: Omit<AppUser, "id" | "createdAt">) => AppUser;
  logout: () => void;
  addDonation: (
    d: Omit<Donation, "donationId" | "status" | "createdAt" | "donorId">,
  ) => Donation;
  updateDonationStatus: (id: string, status: DonationStatus, ngoId?: string) => void;
  acceptDonation: (id: string, ngoId: string) => { ok: boolean; message: string };
  addRequest: (r: Omit<FoodRequest, "requestId" | "createdAt" | "status">) => FoodRequest;
  pushNotification: (n: Omit<AppNotification, "id" | "createdAt" | "read">) => void;
  markAllRead: () => void;
  setUserLocation: (loc: { lat: number; lng: number; label: string }) => void;
  resetDemo: () => void;
}

const StoreContext = createContext<StoreValue | null>(null);

const uid = (prefix: string) =>
  `${prefix}-${Math.random().toString(36).slice(2, 6).toUpperCase()}${Date.now()
    .toString()
    .slice(-3)}`;

export function FoodBridgeProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<State>(initialState);
  const [hydrated, setHydrated] = useState(false);

  // Load persisted state after hydration (avoids SSR mismatches).
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setState({ ...initialState, ...(JSON.parse(raw) as State) });
    } catch {
      /* corrupted storage — fall back to demo data */
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      /* storage full / disabled — demo continues in memory */
    }
  }, [state, hydrated]);

  const pushNotification = useCallback(
    (n: Omit<AppNotification, "id" | "createdAt" | "read">) => {
      setState((s) => ({
        ...s,
        notifications: [
          { ...n, id: uid("NTF"), createdAt: new Date().toISOString(), read: false },
          ...s.notifications,
        ].slice(0, 40),
      }));
    },
    [],
  );

  const addActivity = useCallback((e: Omit<ActivityEvent, "id" | "createdAt">) => {
    setState((s) => ({
      ...s,
      activity: [
        { ...e, id: uid("ACT"), createdAt: new Date().toISOString() },
        ...s.activity,
      ].slice(0, 30),
    }));
  }, []);

  const value = useMemo<StoreValue>(() => {
    const currentUser = state.users.find((u) => u.id === state.currentUserId) ?? null;

    const completed = state.donations.filter((d) => d.status === "completed");
    const active = state.donations.filter((d) =>
      ["available", "matched", "accepted", "pickup"].includes(d.status),
    );
    const rescued = completed.reduce((sum, d) => sum + d.servings, 0);

    return {
      ...state,
      currentUser,
      impact: {
        donations: BASE_IMPACT.donations + state.donations.length,
        mealsRescued: BASE_IMPACT.mealsRescued + rescued,
        ngos: BASE_IMPACT.ngos + state.ngos.length,
        peopleServed: BASE_IMPACT.peopleServed + rescued,
        wasteReducedKg: BASE_IMPACT.wasteReducedKg + Math.round(rescued * 0.4),
        active: active.length,
        completed: completed.length,
      },

      login(email, role) {
        const user = state.users.find(
          (u) => u.email.toLowerCase() === email.toLowerCase() && (!role || u.role === role),
        );
        if (user) setState((s) => ({ ...s, currentUserId: user.id }));
        return user ?? null;
      },

      register(u) {
        const user: AppUser = { ...u, id: uid("USR"), createdAt: new Date().toISOString() };
        setState((s) => ({ ...s, users: [...s.users, user], currentUserId: user.id }));
        return user;
      },

      logout() {
        setState((s) => ({ ...s, currentUserId: null }));
      },

      addDonation(input) {
        const donation: Donation = {
          ...input,
          donationId: `FB-${Math.floor(1000 + Math.random() * 8999)}`,
          donorId: state.currentUserId ?? "USR-GUEST",
          status: "available",
          createdAt: new Date().toISOString(),
        };
        // Run the smart matching engine immediately so a best match is ready.
        const best = rankMatches(donation, state.ngos)[0];
        if (best) donation.matchScore = best.score;

        setState((s) => ({ ...s, donations: [donation, ...s.donations] }));
        addActivity({
          label: "Donation posted",
          detail: `${donation.organization} · ${donation.servings} meals · ${donation.address}`,
          kind: "posted",
        });
        pushNotification({
          title: "New donation available nearby",
          message: `${donation.organization} posted ${donation.servings} meals${
            best ? ` · best match ${best.ngo.name} (${best.score}%)` : ""
          }.`,
          kind: "donation",
          audience: "ngo",
        });
        return donation;
      },

      updateDonationStatus(id, status, ngoId) {
        setState((s) => ({
          ...s,
          donations: s.donations.map((d): Donation =>
            d.donationId === id
              ? ngoId ?? d.matchedNgoId
                ? { ...d, status, matchedNgoId: (ngoId ?? d.matchedNgoId) as string }
                : { ...d, status }
              : d,
          ),
        }));
        const labels: Record<string, ActivityEvent["kind"]> = {
          accepted: "accepted",
          pickup: "pickup",
          completed: "completed",
        };
        if (labels[status]) {
          addActivity({
            label:
              status === "accepted"
                ? "NGO accepted"
                : status === "pickup"
                  ? "Pickup started"
                  : "Donation completed",
            detail: `Donation ${id} · status updated to ${status}`,
            kind: labels[status],
          });
          pushNotification({
            title:
              status === "completed"
                ? "Donation completed"
                : status === "pickup"
                  ? "Pickup in progress"
                  : "Donation accepted",
            message: `Donation ${id} is now ${status}.`,
            kind: status === "completed" ? "completed" : "pickup",
            audience: "all",
          });
        }
      },

      acceptDonation(id, ngoId) {
        const donation = state.donations.find((d) => d.donationId === id);
        if (!donation) return { ok: false, message: "Donation not found." };
        if (new Date(donation.expiryTime).getTime() < Date.now())
          return { ok: false, message: "This donation has expired." };
        if (!["available", "matched"].includes(donation.status))
          return { ok: false, message: "This donation has already been accepted." };

        setState((s) => ({
          ...s,
          donations: s.donations.map((d) =>
            d.donationId === id ? { ...d, status: "accepted", matchedNgoId: ngoId } : d,
          ),
        }));
        const ngo = state.ngos.find((n) => n.id === ngoId);
        addActivity({
          label: "NGO accepted",
          detail: `${ngo?.name ?? "NGO"} accepted ${id} · ${donation.servings} meals`,
          kind: "accepted",
        });
        pushNotification({
          title: "Donation accepted",
          message: `${ngo?.name ?? "An NGO"} accepted donation ${id}.`,
          kind: "match",
          audience: "donor",
        });
        return { ok: true, message: `Donation ${id} accepted. Pickup can begin.` };
      },

      addRequest(r) {
        const request: FoodRequest = {
          ...r,
          requestId: uid("REQ"),
          createdAt: new Date().toISOString(),
          status: "open",
        };
        setState((s) => ({ ...s, requests: [request, ...s.requests] }));
        pushNotification({
          title: "Food request created",
          message: `${request.organization} requested ${request.requiredServings} meals.`,
          kind: "system",
          audience: "all",
        });
        return request;
      },

      pushNotification,

      markAllRead() {
        setState((s) => ({
          ...s,
          notifications: s.notifications.map((n) => ({ ...n, read: true })),
        }));
      },

      setUserLocation(loc) {
        setState((s) => ({ ...s, userLocation: loc }));
      },

      resetDemo() {
        setState(initialState);
        try {
          localStorage.removeItem(STORAGE_KEY);
        } catch {
          /* ignore */
        }
      },
    };
  }, [state, addActivity, pushNotification]);

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore must be used inside FoodBridgeProvider");
  return ctx;
}
