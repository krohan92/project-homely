import { NavLink } from "react-router-dom";
import {
  LayoutDashboard, CalendarDays, Sparkles, Brush, GraduationCap,
  Dog, ShoppingBasket, Wallet, Wrench, Menu, X,
} from "lucide-react";
import { useState } from "react";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Avatar } from "@/components/Avatar";
import { useResource } from "@/hooks/useResource";

const NAV = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard, id: "dashboard" },
  { to: "/calendar", label: "Calendar", icon: CalendarDays, id: "calendar" },
  { to: "/chores", label: "Chores", icon: Brush, id: "chores" },
  { to: "/kids", label: "Kids & School", icon: GraduationCap, id: "kids" },
  { to: "/pets", label: "Pet Care", icon: Dog, id: "pets" },
  { to: "/groceries", label: "Groceries", icon: ShoppingBasket, id: "groceries" },
  { to: "/budget", label: "Budget", icon: Wallet, id: "budget" },
  { to: "/home", label: "Home Upkeep", icon: Wrench, id: "upkeep" },
];

const NavItems = ({ onPick }) => (
  <nav className="flex flex-col gap-1">
    {NAV.map(({ to, label, icon: Icon, id }) => (
      <NavLink
        key={to}
        to={to}
        end={to === "/"}
        onClick={onPick}
        data-testid={`nav-${id}`}
        className={({ isActive }) =>
          `group flex items-center gap-3 rounded-full px-4 py-3 text-sm font-semibold transition-colors duration-200 ${
            isActive
              ? "bg-primary text-primary-foreground"
              : "text-foreground/70 hover:bg-muted hover:text-foreground"
          }`
        }
      >
        <Icon className="h-[18px] w-[18px]" strokeWidth={2.4} />
        {label}
      </NavLink>
    ))}
  </nav>
);

export const Shell = ({ children }) => {
  const [open, setOpen] = useState(false);
  const members = useResource("members");
  return (
    <div className="min-h-screen bg-background">
      <aside className="fixed left-0 top-0 hidden h-screen w-[264px] flex-col border-r border-border bg-card px-5 py-8 lg:flex">
        <Brand />
        <div className="mt-10">
          <NavItems />
        </div>
        <div className="mt-auto space-y-4">
          <ThemeToggle />
          <div className="rounded-2xl bg-muted p-4">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground">Household</p>
            <p className="mt-2 font-display text-lg font-bold">The Harper Home</p>
            <div className="mt-3 flex -space-x-2">
              {members.items.map((m) => (
                <Avatar key={m.id} member={m} size={34} />
              ))}
            </div>
          </div>
        </div>
      </aside>

      <header className="sticky top-0 z-30 flex items-center justify-between border-b border-border bg-card px-5 py-4 lg:hidden">
        <Brand />
        <button
          data-testid="mobile-menu-btn"
          onClick={() => setOpen((v) => !v)}
          className="rounded-full bg-muted p-2 text-foreground transition-colors duration-200 hover:bg-accent"
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </header>
      {open && (
        <div className="border-b border-border bg-card px-5 py-4 lg:hidden" data-testid="mobile-nav">
          <NavItems onPick={() => setOpen(false)} />
          <div className="mt-4"><ThemeToggle /></div>
        </div>
      )}

      <main className="px-5 py-8 sm:px-8 lg:ml-[264px] lg:px-12 lg:py-12">{children}</main>
    </div>
  );
};

const Brand = () => (
  <div className="flex items-center gap-2">
    <span className="grid h-9 w-9 place-items-center rounded-2xl bg-primary text-primary-foreground">
      <Sparkles className="h-5 w-5" strokeWidth={2.6} />
    </span>
    <span className="font-display text-2xl font-black tracking-tighter">Homely</span>
  </div>
);
