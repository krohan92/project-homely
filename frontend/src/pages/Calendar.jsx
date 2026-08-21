import { useState } from "react";
import { CalendarDays, Plus, Trash2 } from "lucide-react";
import { Card, CardTitle, Empty, PageHead, Pill } from "@/components/Bits";
import { useResource } from "@/hooks/useResource";
import { fmtDate, today } from "@/lib/api";
import { toast } from "sonner";

const CATS = ["kids", "school", "pet", "home", "health", "other"];

export default function CalendarPage() {
  const { items, add, del } = useResource("events");
  const [form, setForm] = useState({ title: "", date: today(), time: "09:00", category: "kids", who: "" });

  const submit = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) return;
    await add(form);
    setForm({ ...form, title: "", who: "" });
    toast.success("Appointment added");
  };

  const sorted = [...items].sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time));
  const upcoming = sorted.filter((e) => e.date >= today());
  const past = sorted.filter((e) => e.date < today()).reverse();

  return (
    <>
      <PageHead
        testId="calendar-page"
        title="Appointments"
        subtitle="Dentists, vet visits, swim class, parent evenings — one shared schedule for the whole house."
      />
      <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2" data-testid="events-list">
          <CardTitle icon={CalendarDays}>Upcoming</CardTitle>
          <ul className="divide-y divide-border">
            {upcoming.map((e, i) => (
              <li key={e.id} className="rise flex items-center justify-between gap-4 py-4" style={{ animationDelay: `${i * 50}ms` }}>
                <div>
                  <p className="font-semibold">{e.title}</p>
                  <p className="text-sm text-foreground/60">{fmtDate(e.date)} · {e.time} · {e.who || "Household"}</p>
                </div>
                <div className="flex items-center gap-3">
                  <Pill tone={e.category === "pet" ? "sage" : "primary"}>{e.category}</Pill>
                  <button data-testid={`delete-event-${e.id}`} onClick={() => del(e.id)} className="text-muted-foreground transition-colors duration-200 hover:text-destructive">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </li>
            ))}
            {!upcoming.length && <Empty>Nothing scheduled yet.</Empty>}
          </ul>

          {!!past.length && (
            <>
              <h4 className="mt-8 text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground">Past</h4>
              <ul className="mt-3 space-y-2">
                {past.slice(0, 5).map((e) => (
                  <li key={e.id} className="text-sm text-foreground/50">{fmtDate(e.date)} — {e.title}</li>
                ))}
              </ul>
            </>
          )}
        </Card>

        <Card data-testid="add-event-card">
          <CardTitle icon={Plus}>New appointment</CardTitle>
          <form onSubmit={submit} className="space-y-4">
            <Field label="What is it?">
              <input data-testid="event-title-input" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Mia - dentist" className={inputCls} />
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Date">
                <input type="date" data-testid="event-date-input" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} className={inputCls} />
              </Field>
              <Field label="Time">
                <input type="time" data-testid="event-time-input" value={form.time} onChange={(e) => setForm({ ...form, time: e.target.value })} className={inputCls} />
              </Field>
            </div>
            <Field label="Who">
              <input data-testid="event-who-input" value={form.who} onChange={(e) => setForm({ ...form, who: e.target.value })} placeholder="Mia" className={inputCls} />
            </Field>
            <Field label="Category">
              <select data-testid="event-category-select" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className={inputCls}>
                {CATS.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </Field>
            <button data-testid="add-event-btn" type="submit" className={btnCls}>Add to calendar</button>
          </form>
        </Card>
      </div>
    </>
  );
}

export const Field = ({ label, children }) => (
  <label className="block">
    <span className="text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground">{label}</span>
    <div className="mt-2">{children}</div>
  </label>
);

export const inputCls =
  "w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm font-medium text-foreground transition-colors duration-200 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/40";

export const btnCls =
  "w-full rounded-full bg-primary px-5 py-3 text-sm font-bold text-primary-foreground transition-transform duration-200 hover:-translate-y-0.5 active:scale-95";
