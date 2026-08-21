import { useState } from "react";
import { Brush, Plus, Trash2, Trophy } from "lucide-react";
import { Card, CardTitle, Empty, PageHead, Pill } from "@/components/Bits";
import { Avatar } from "@/components/Avatar";
import { Field, btnCls, inputCls } from "@/pages/Calendar";
import { useResource } from "@/hooks/useResource";
import { fmtDate, today } from "@/lib/api";
import { toast } from "sonner";

export default function Chores() {
  const { items, add, patch, del } = useResource("chores");
  const members = useResource("members");
  const partners = members.items.filter((m) => m.role === "partner");
  const [form, setForm] = useState({ title: "", assignee: "", day: today(), repeat: "weekly", points: 2, done: false });

  const submit = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) return;
    await add({ ...form, assignee: form.assignee || partners[0]?.name || "Anyone", points: Number(form.points) });
    setForm({ ...form, title: "" });
    toast.success("Chore added");
  };

  const score = (name) =>
    items.filter((c) => c.done && c.assignee === name).reduce((s, c) => s + Number(c.points || 0), 0);

  const open = items.filter((c) => !c.done);
  const done = items.filter((c) => c.done);

  return (
    <>
      <PageHead
        testId="chores-page"
        title="Chores, fairly split"
        subtitle="Dishes, laundry, mopping — who's doing what, and who's quietly winning this week."
      />
      <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Card data-testid="open-chores-card">
            <CardTitle icon={Brush} right={<Pill tone="primary">{open.length} open</Pill>}>This week</CardTitle>
            <ul className="divide-y divide-border">
              {open.map((c, i) => (
                <li key={c.id} className="rise flex items-center gap-4 py-4" style={{ animationDelay: `${i * 50}ms` }}>
                  <input
                    type="checkbox"
                    data-testid={`chore-checkbox-${c.id}`}
                    checked={false}
                    onChange={() => { patch(c.id, { done: true }); toast.success(`${c.title} done. Nice.`); }}
                    className="h-5 w-5 accent-[hsl(var(--secondary))]"
                  />
                  <div className="flex-1">
                    <p className="font-semibold">{c.title}</p>
                    <p className="text-sm text-foreground/60">{c.assignee} · {fmtDate(c.day)} · {c.repeat}</p>
                  </div>
                  <Pill tone="sun">{c.points} pts</Pill>
                  <button data-testid={`delete-chore-${c.id}`} onClick={() => del(c.id)} className="text-muted-foreground transition-colors duration-200 hover:text-destructive">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </li>
              ))}
              {!open.length && <Empty>Everything's done. Put your feet up.</Empty>}
            </ul>
          </Card>

          <Card data-testid="done-chores-card">
            <CardTitle icon={Trophy}>Done</CardTitle>
            <ul className="space-y-3">
              {done.map((c) => (
                <li key={c.id} className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    data-testid={`chore-undo-${c.id}`}
                    checked
                    onChange={() => patch(c.id, { done: false })}
                    className="h-5 w-5 accent-[hsl(var(--secondary))]"
                  />
                  <span className="text-sm font-semibold text-muted-foreground line-through">{c.title} — {c.assignee}</span>
                </li>
              ))}
              {!done.length && <Empty>Nothing ticked off yet.</Empty>}
            </ul>
          </Card>
        </div>

        <div className="space-y-6">
          <Card data-testid="scoreboard-card">
            <CardTitle icon={Trophy}>Fairness board</CardTitle>
            <ul className="space-y-4">
              {partners.map((p) => (
                <li key={p.id} className="flex items-center gap-3">
                  <Avatar member={p} size={40} />
                  <div className="flex-1">
                    <p className="font-semibold">{p.name}</p>
                    <div className="mt-1 h-2 w-full overflow-hidden rounded-full bg-muted">
                      <div className="h-full rounded-full bg-secondary" style={{ width: `${Math.min(100, score(p.name) * 12)}%` }} />
                    </div>
                  </div>
                  <span className="font-display font-black">{score(p.name)}</span>
                </li>
              ))}
            </ul>
          </Card>

          <Card data-testid="add-chore-card">
            <CardTitle icon={Plus}>Add a chore</CardTitle>
            <form onSubmit={submit} className="space-y-4">
              <Field label="Chore"><input data-testid="chore-title-input" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Mop the hallway" className={inputCls} /></Field>
              <Field label="Assignee">
                <select data-testid="chore-assignee-select" value={form.assignee} onChange={(e) => setForm({ ...form, assignee: e.target.value })} className={inputCls}>
                  <option value="">Pick someone</option>
                  {members.items.map((m) => <option key={m.id} value={m.name}>{m.name}</option>)}
                </select>
              </Field>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Day"><input type="date" data-testid="chore-day-input" value={form.day} onChange={(e) => setForm({ ...form, day: e.target.value })} className={inputCls} /></Field>
                <Field label="Points"><input type="number" min="1" data-testid="chore-points-input" value={form.points} onChange={(e) => setForm({ ...form, points: e.target.value })} className={inputCls} /></Field>
              </div>
              <Field label="Repeat">
                <select data-testid="chore-repeat-select" value={form.repeat} onChange={(e) => setForm({ ...form, repeat: e.target.value })} className={inputCls}>
                  {["once", "daily", "weekly", "monthly"].map((r) => <option key={r} value={r}>{r}</option>)}
                </select>
              </Field>
              <button data-testid="add-chore-btn" type="submit" className={btnCls}>Add chore</button>
            </form>
          </Card>
        </div>
      </div>
    </>
  );
}
