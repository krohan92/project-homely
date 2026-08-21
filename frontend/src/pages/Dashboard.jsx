import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  CalendarDays, Brush, GraduationCap, Dog, ShoppingBasket, Wallet,
  Sparkles, RefreshCw, ListTodo, ArrowUpRight,
} from "lucide-react";
import { Card, CardTitle, PageHead, Pill, Empty } from "@/components/Bits";
import { Avatar } from "@/components/Avatar";
import { useResource } from "@/hooks/useResource";
import { api, fmtDate, money, today } from "@/lib/api";
import { toast } from "sonner";

const HERO = "https://static.prod-images.emergentagent.com/jobs/2126ddcf-02c3-4ae4-9679-4a095e3c697d/images/bc85964a72dd8cb13055ab002ac5b2fa59d5e0e06236697e93d3a75519c7b378.jpeg";

const greeting = () => {
  const h = new Date().getHours();
  if (h < 5) return "Still up?";
  if (h < 12) return "Good morning";
  if (h < 18) return "Good afternoon";
  return "Good evening";
};

const Hero = ({ members }) => (
  <section className="relative overflow-hidden rounded-[2rem] border border-border" data-testid="dashboard-hero">
    <img src={HERO} alt="Cozy family home" className="h-[300px] w-full object-cover sm:h-[360px]" />
    <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/45 to-black/10" />
    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
    <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-10">
      <p className="text-xs font-bold uppercase tracking-[0.24em] text-white/70">
        {new Date().toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" })}
      </p>
      <h1 className="mt-2 font-display text-4xl font-black tracking-tighter text-white sm:text-5xl lg:text-6xl">
        {greeting()}, Harpers
      </h1>
      <p className="mt-3 max-w-xl text-base leading-relaxed text-white/80">
        Appointments, chores, homework, the dog, the shopping and the money — all quietly under control.
      </p>
      <div className="mt-5 flex items-center gap-3">
        <div className="flex -space-x-3">
          {members.map((m) => (
            <Avatar key={m.id} member={m} size={42} className="float-slow" />
          ))}
        </div>
        <span className="rounded-full bg-white/15 px-3 py-1 text-xs font-bold text-white backdrop-blur-md">
          {members.length} at home + Buddy
        </span>
      </div>
    </div>
  </section>
);

const Catchup = () => {
  const [data, setData] = useState(null);
  const [busy, setBusy] = useState(true);

  const load = async () => {
    setBusy(true);
    try {
      setData(await api.catchup());
    } catch {
      toast.error("Could not load your catch-up");
    }
    setBusy(false);
  };
  useEffect(() => {
    load();
  }, []);

  const lines = (data?.summary || "").split("\n").filter(Boolean);

  return (
    <Card className="relative overflow-hidden grain !bg-accent/45" data-testid="ai-catchup-card">
      <img
        src="https://images.pexels.com/photos/15558300/pexels-photo-15558300.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940"
        alt=""
        className="pointer-events-none absolute inset-0 h-full w-full object-cover opacity-[0.14]"
      />
      <div className="relative z-10">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.24em] text-accent-foreground/60">
              Your daily catch-up
            </p>
            <h2 className="mt-2 flex items-center gap-2 font-display text-2xl font-bold tracking-tight sm:text-3xl">
              <Sparkles className="h-6 w-6" strokeWidth={2.6} />
              What needs you today
            </h2>
          </div>
          <button
            data-testid="refresh-catchup-btn"
            onClick={load}
            className="rounded-full bg-card px-4 py-2 text-sm font-semibold text-foreground transition-colors duration-200 hover:bg-primary hover:text-primary-foreground"
          >
            <RefreshCw className={`inline h-4 w-4 ${busy ? "animate-spin" : ""}`} />
            <span className="ml-2 hidden sm:inline">Refresh</span>
          </button>
        </div>

        <div className="mt-6 space-y-2" data-testid="catchup-text">
          {busy && <p className="text-base text-accent-foreground/70">Reading your week…</p>}
          {!busy &&
            lines.map((l, i) => (
              <p
                key={i}
                className={`rise text-base leading-relaxed ${l.startsWith("-") ? "pl-1 font-semibold" : "text-accent-foreground/80"}`}
                style={{ animationDelay: `${i * 70}ms` }}
              >
                {l.replace(/^[-•]\s*/, l.startsWith("-") ? "• " : "")}
              </p>
            ))}
          {!busy && !lines.length && <Empty>Nothing to catch up on.</Empty>}
        </div>
      </div>
    </Card>
  );
};

const Stat = ({ icon: Icon, label, value, to, tone }) => (
  <Link
    to={to}
    data-testid={`stat-${label.toLowerCase().replace(/\s/g, "-")}`}
    className="group rounded-3xl border border-border bg-card p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] transition-transform duration-200 ease-out hover:-translate-y-1"
  >
    <span className={`grid h-11 w-11 place-items-center rounded-2xl ${tone}`}>
      <Icon className="h-5 w-5" strokeWidth={2.4} />
    </span>
    <p className="mt-5 font-display text-3xl font-black tracking-tighter">{value}</p>
    <p className="mt-1 flex items-center gap-1 text-sm font-semibold text-foreground/60">
      {label}
      <ArrowUpRight className="h-4 w-4 opacity-0 transition-opacity duration-200 group-hover:opacity-100" />
    </p>
  </Link>
);

export default function Dashboard() {
  const chores = useResource("chores");
  const events = useResource("events");
  const homework = useResource("homework");
  const groceries = useResource("groceries");
  const tx = useResource("transactions");
  const todos = useResource("todos");
  const members = useResource("members");

  const t = today();
  const openChores = chores.items.filter((c) => !c.done);
  const upcoming = events.items.filter((e) => e.date >= t).sort((a, b) => a.date.localeCompare(b.date));
  const openHw = homework.items.filter((h) => !h.done);
  const openGroc = groceries.items.filter((g) => !g.done);
  const spent = tx.items.filter((x) => x.type === "expense").reduce((s, x) => s + Number(x.amount), 0);

  return (
    <>
      <PageHead testId="dashboard-head" title="Home base" />
      <div className="space-y-8" data-testid="dashboard-page">
        <Hero members={members.items} />
        <Catchup />

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <Stat icon={Brush} label="Open chores" value={openChores.length} to="/chores" tone="bg-primary/15 text-primary" />
          <Stat icon={GraduationCap} label="Homework due" value={openHw.length} to="/kids" tone="bg-accent/60 text-accent-foreground" />
          <Stat icon={ShoppingBasket} label="Grocery items" value={openGroc.length} to="/groceries" tone="bg-secondary/25 text-secondary" />
          <Stat icon={Wallet} label="Spent this month" value={money(spent)} to="/budget" tone="bg-muted text-foreground/70" />
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <Card className="lg:col-span-2" data-testid="upcoming-card">
            <CardTitle icon={CalendarDays} right={<Link to="/calendar" className="text-sm font-semibold text-primary">View all</Link>}>
              Coming up
            </CardTitle>
            <ul className="divide-y divide-border">
              {upcoming.slice(0, 5).map((e, i) => (
                <li key={e.id} className="rise flex items-center justify-between gap-4 py-4" style={{ animationDelay: `${i * 60}ms` }}>
                  <div>
                    <p className="font-semibold">{e.title}</p>
                    <p className="text-sm text-foreground/60">
                      {fmtDate(e.date)} · {e.time} · {e.who}
                    </p>
                  </div>
                  <Pill tone={e.category === "pet" ? "sage" : "primary"}>{e.category}</Pill>
                </li>
              ))}
              {!upcoming.length && <Empty>No upcoming appointments.</Empty>}
            </ul>
          </Card>

          <Card data-testid="todos-card">
            <CardTitle icon={ListTodo}>Household to-do</CardTitle>
            <ul className="space-y-3">
              {todos.items.map((td) => (
                <li key={td.id} className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    data-testid={`todo-check-${td.id}`}
                    checked={!!td.done}
                    onChange={() => todos.patch(td.id, { done: !td.done })}
                    className="mt-1 h-5 w-5 accent-[hsl(var(--primary))]"
                  />
                  <span className={`text-sm font-semibold ${td.done ? "text-muted-foreground line-through" : ""}`}>
                    {td.title}
                    <span className="ml-2 font-normal text-foreground/50">{td.owner}</span>
                  </span>
                </li>
              ))}
              {!todos.items.length && <Empty>All clear.</Empty>}
            </ul>
          </Card>
        </div>

        <Card data-testid="dog-strip" className="relative overflow-hidden">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
            <img
              src="https://images.unsplash.com/photo-1633722715463-d30f4f325e24?crop=entropy&cs=srgb&fm=jpg&q=85&w=900"
              alt="Buddy the dog"
              className="h-40 w-full rounded-2xl object-cover sm:h-32 sm:w-48"
            />
            <div className="flex-1">
              <CardTitle icon={Dog}>Buddy's day</CardTitle>
              <p className="text-base text-foreground/70">
                Log walks, poops, meals and keep vaccines on schedule.
              </p>
              <Link
                to="/pets"
                data-testid="go-pets-btn"
                className="mt-5 inline-block rounded-full bg-secondary px-5 py-2.5 text-sm font-bold text-secondary-foreground transition-transform duration-200 hover:-translate-y-0.5 active:scale-95"
              >
                Open pet care
              </Link>
            </div>
          </div>
        </Card>
      </div>
    </>
  );
}
