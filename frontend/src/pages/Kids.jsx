import { useState } from "react";
import { GraduationCap, Plus, Trash2 } from "lucide-react";
import { Card, CardTitle, Empty, PageHead, Pill } from "@/components/Bits";
import { Avatar } from "@/components/Avatar";
import { Field, btnCls, inputCls } from "@/pages/Calendar";
import { useResource } from "@/hooks/useResource";
import { fmtDate, today } from "@/lib/api";
import { toast } from "sonner";

export default function Kids() {
  const hw = useResource("homework");
  const members = useResource("members");
  const kids = members.items.filter((m) => m.role === "kid");
  const [form, setForm] = useState({ child: "", subject: "", title: "", due: today(), done: false });

  const submit = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) return;
    await hw.add({ ...form, child: form.child || kids[0]?.name || "Kid" });
    setForm({ ...form, title: "", subject: "" });
    toast.success("Homework added");
  };

  return (
    <>
      <PageHead
        testId="kids-page"
        title="Kids & school"
        subtitle="Homework, due dates and school life for each child — nothing forgotten on a Sunday night."
      />
      <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          {kids.map((k) => {
            const list = hw.items.filter((h) => h.child === k.name);
            const done = list.filter((h) => h.done).length;
            const pct = list.length ? Math.round((done / list.length) * 100) : 0;
            return (
              <Card key={k.id} data-testid={`kid-card-${k.name}`}>
                <CardTitle icon={GraduationCap} right={<Pill tone="sun">{k.grade}</Pill>}>
                  <span className="flex items-center gap-3"><Avatar member={k} size={36} />{k.name}</span>
                </CardTitle>
                <div className="mb-6">
                  <div className="flex items-center justify-between text-sm font-semibold text-foreground/60">
                    <span>{done} of {list.length} done</span><span>{pct}%</span>
                  </div>
                  <div className="mt-2 h-2.5 w-full overflow-hidden rounded-full bg-muted">
                    <div className="h-full rounded-full bg-secondary transition-[width] duration-500" style={{ width: `${pct}%` }} />
                  </div>
                </div>
                <ul className="divide-y divide-border">
                  {list.map((h) => (
                    <li key={h.id} className="flex items-center gap-4 py-3">
                      <input
                        type="checkbox"
                        data-testid={`homework-check-${h.id}`}
                        checked={!!h.done}
                        onChange={() => hw.patch(h.id, { done: !h.done })}
                        className="h-5 w-5 accent-[hsl(var(--secondary))]"
                      />
                      <div className="flex-1">
                        <p className={`font-semibold ${h.done ? "text-muted-foreground line-through" : ""}`}>{h.title}</p>
                        <p className="text-sm text-foreground/60">{h.subject} · due {fmtDate(h.due)}</p>
                      </div>
                      <button data-testid={`delete-homework-${h.id}`} onClick={() => hw.del(h.id)} className="text-muted-foreground transition-colors duration-200 hover:text-destructive">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </li>
                  ))}
                  {!list.length && <Empty>No homework logged.</Empty>}
                </ul>
              </Card>
            );
          })}
          {!kids.length && <Card><Empty>No kids added yet.</Empty></Card>}
        </div>

        <Card data-testid="add-homework-card">
          <CardTitle icon={Plus}>Add homework</CardTitle>
          <form onSubmit={submit} className="space-y-4">
            <Field label="Child">
              <select data-testid="homework-child-select" value={form.child} onChange={(e) => setForm({ ...form, child: e.target.value })} className={inputCls}>
                <option value="">Pick a child</option>
                {kids.map((k) => <option key={k.id} value={k.name}>{k.name}</option>)}
              </select>
            </Field>
            <Field label="Subject"><input data-testid="homework-subject-input" value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} placeholder="Math" className={inputCls} /></Field>
            <Field label="Task"><input data-testid="homework-title-input" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Worksheet p.42" className={inputCls} /></Field>
            <Field label="Due"><input type="date" data-testid="homework-due-input" value={form.due} onChange={(e) => setForm({ ...form, due: e.target.value })} className={inputCls} /></Field>
            <button data-testid="add-homework-btn" type="submit" className={btnCls}>Add homework</button>
          </form>
        </Card>
      </div>
    </>
  );
}
