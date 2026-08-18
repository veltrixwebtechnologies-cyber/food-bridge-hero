import { Link, useRouterState } from "@tanstack/react-router";
import { Bell, LogOut, Menu, UserRound } from "lucide-react";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { useStore } from "@/lib/foodbridge/store";
import { cn } from "@/lib/utils";
import { Logo } from "./Logo";

const NAV = [
  { to: "/", label: "Home" },
  { to: "/how-it-works", label: "How It Works" },
  { to: "/donate", label: "Donate Food" },
  { to: "/find-food", label: "Find Food" },
  { to: "/live-donations", label: "Live Donations" },
  { to: "/map", label: "Map" },
  { to: "/dashboard", label: "Dashboard" },
  { to: "/about", label: "About" },
] as const;

export function Header() {
  const [open, setOpen] = useState(false);
  const { currentUser, notifications, markAllRead, logout } = useStore();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const unread = notifications.filter((n) => !n.read).length;

  return (
    <header className="sticky top-0 z-50 border-b bg-background/85 backdrop-blur">
      <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between gap-4 px-4 sm:px-6">
        <Logo />

        {/* Desktop navigation */}
        <nav className="hidden items-center gap-1 xl:flex">
          {NAV.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className={cn(
                "rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground",
                pathname === item.to && "bg-secondary text-foreground",
              )}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          {/* Notification centre */}
          <Popover onOpenChange={(o) => o && markAllRead()}>
            <PopoverTrigger asChild>
              <Button variant="ghost" size="icon" className="relative" aria-label="Notifications">
                <Bell className="size-5" />
                {unread > 0 && (
                  <span className="absolute right-1.5 top-1.5 flex size-4 items-center justify-center rounded-full bg-destructive text-[10px] font-bold text-destructive-foreground">
                    {unread}
                  </span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent align="end" className="w-80 p-0">
              <div className="border-b px-4 py-3 text-sm font-semibold">Notifications</div>
              <div className="max-h-80 overflow-y-auto">
                {notifications.length === 0 && (
                  <p className="p-4 text-sm text-muted-foreground">No notifications yet.</p>
                )}
                {notifications.map((n) => (
                  <div key={n.id} className="border-b px-4 py-3 last:border-0">
                    <p className="text-sm font-medium">{n.title}</p>
                    <p className="mt-0.5 text-xs text-muted-foreground">{n.message}</p>
                  </div>
                ))}
              </div>
            </PopoverContent>
          </Popover>

          {currentUser ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="gap-2">
                  <UserRound className="size-4" />
                  <span className="hidden sm:inline">{currentUser.name.split(" ")[0]}</span>
                  <Badge variant="secondary" className="hidden capitalize sm:inline-flex">
                    {currentUser.role}
                  </Badge>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel className="flex flex-col">
                  <span>{currentUser.name}</span>
                  <span className="text-xs font-normal text-muted-foreground">
                    {currentUser.email}
                  </span>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link to="/dashboard">Dashboard</Link>
                </DropdownMenuItem>
                {currentUser.role === "admin" && (
                  <DropdownMenuItem asChild>
                    <Link to="/admin">Admin Panel</Link>
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={logout}>
                  <LogOut className="mr-2 size-4" /> Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button asChild className="hidden sm:inline-flex">
              <Link to="/auth">Login / Register</Link>
            </Button>
          )}

          {/* Mobile navigation */}
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="xl:hidden" aria-label="Open menu">
                <Menu className="size-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[85vw] max-w-sm">
              <SheetTitle className="sr-only">Navigation</SheetTitle>
              <div className="px-4 pt-4">
                <Logo />
              </div>
              <nav className="mt-6 flex flex-col gap-1 px-3">
                {NAV.map((item) => (
                  <Link
                    key={item.to}
                    to={item.to}
                    onClick={() => setOpen(false)}
                    className={cn(
                      "rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground hover:bg-secondary hover:text-foreground",
                      pathname === item.to && "bg-secondary text-foreground",
                    )}
                  >
                    {item.label}
                  </Link>
                ))}
                <Link
                  to="/impact"
                  onClick={() => setOpen(false)}
                  className="rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground hover:bg-secondary hover:text-foreground"
                >
                  Impact
                </Link>
                <Link
                  to="/admin"
                  onClick={() => setOpen(false)}
                  className="rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground hover:bg-secondary hover:text-foreground"
                >
                  Admin Panel
                </Link>
                <Button asChild className="mt-3">
                  <Link to="/auth" onClick={() => setOpen(false)}>
                    Login / Register
                  </Link>
                </Button>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
