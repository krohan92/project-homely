import { useState } from "react";
import { Wrench, Plus, Trash2, ListTodo, Users } from "lucide-react";
import { Card, CardTitle, Empty, PageHead, Pill } from "@/components/Bits";
import { Avatar } from "@/components/Avatar";
import { Field, btnCls, inputCls } from "@/pages/Calendar";
import { useResource } from "@/hooks/useResource";
import { fmtDate, today } from "@/lib/api";
import { toast } from "sonner";

export default function Upkeep() {
  const maint = useResource("maintenance");
  const todos = useResource("todos");
  const members = useResource("members");
  const [m, setM] = useState({ title: "", due: today(), interval: "3 months", done: false });
  const [t, setT] = useState({ title: "", owner: "", priority: "medium", done: false });

  return (
    <>
      <PageHead
        testId="upkeep-page"
        title="Home upkeep"
        subtitle="Filters, alarms, insurance renewals and every 'we should really sort that' task."
      />
      <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2" data-testid="maintenance-card">
          <CardTitle icon={Wrench}>Recurring maintenance</CardTitle>
          <ul className="divide-y divide-border">
            {maint.items.map((i) => (
              <li key={i.id} className="flex items-center gap-4 py-4">
                <input type="checkbox" data-testid={`maint-check-${i.id}`} checked={!!i.done} onChange={() => maint.patch(i.id, { done: !i.done })} className="h-5 w-5 accent-[hsl(var(--secondary))]" />
                <div className="flex-1">
                  <p className={`font-semibold ${i.done ? "text-muted-foreground line-through" : ""}`}>{i.title}</p>
                  <p className="text-sm text-foreground/60">due {fmtDate(i.due)}</p>
                </div>
                <Pill tone="sage">every {i.interval}</Pill>
                <button data-testid={`delete-maint-${i.id}`} onClick={() => maint.del(i.id)} className="text-muted-foreground transition-colors duration-200 hover:text-destructive">
                  <Trash2 className="h-4 w-4" />
                </button>
              </li>
            ))}
            {!maint.items.length && <Empty>Nothing scheduled.</Empty>}
          </ul>

          <form
            onSubmit={async (e) => { e.preventDefault(); if (!m.title.trim()) return; await maint.add(m); setM({ ...m, title: "" }); toast.success("Added"); }}
            className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-4"
          >
            <input data-testid="maint-title-input" value={m.title} onChange={(e) => setM({ ...m, title: e.target.value })} placeholder="Bleed radiators" className={`${inputCls} sm:col-span-2`} />
            <input type="date" data-testid="maint-due-input" value={m.due} onChange={(e) => setM({ ...m, due: e.target.value })} className={inputCls} />
            <button data-testid="add-maint-btn" type="submit" className="rounded-full bg-primary px-5 py-3 text-sm font-bold text-primary-foreground transition-transform duration-200 hover:-translate-y-0.5 active:scale-95">
              <Plus className="inline h-4 w-4" /> Add
            </button>
          </form>
        </Card>

        <div className="space-y-6">
          <Card data-testid="upkeep-todos-card">
            <CardTitle icon={ListTodo}>To-do list</CardTitle>
            <ul className="space-y-3">
              {todos.items.map((td) => (
                <li key={td.id} className="flex items-start gap-3">
                  <input type="checkbox" data-testid={`upkeep-todo-check-${td.id}`} checked={!!td.done} onChange={() => todos.patch(td.id, { done: !td.done })} className="mt-1 h-5 w-5 accent-[hsl(var(--primary))]" />
                  <div className="flex-1">
                    <p className={`text-sm font-semibold ${td.done ? "text-muted-foreground line-through" : ""}`}>{td.title}</p>
                    <p className="text-xs text-foreground/50">{td.owner} · {td.priority}</p>
                  </div>
                  <button data-testid={`delete-todo-${td.id}`} onClick={() => todos.del(td.id)} className="text-muted-foreground transition-colors duration-200 hover:text-destructive">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </li>
              ))}
              {!todos.items.length && <Empty>Nothing to do.</Empty>}
            </ul>
            <form
              onSubmit={async (e) => { e.preventDefault(); if (!t.title.trim()) return; await todos.add(t); setT({ ...t, title: "" }); toast.success("To-do added"); }}
              className="mt-6 space-y-3"
            >
              <input data-testid="todo-title-input" value={t.title} onChange={(e) => setT({ ...t, title: e.target.value })} placeholder="Call the plumber" className={inputCls} />
              <div className="grid grid-cols-2 gap-3">
                <select data-testid="todo-owner-select" value={t.owner} onChange={(e) => setT({ ...t, owner: e.target.value })} className={inputCls}>
                  <option value="">Owner</option>
                  {members.items.map((mm) => <option key={mm.id} value={mm.name}>{mm.name}</option>)}
                </select>
                <select data-testid="todo-priority-select" value={t.priority} onChange={(e) => setT({ ...t, priority: e.target.value })} className={inputCls}>
                  {["low", "medium", "high"].map((p) => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>
              <button data-testid="add-todo-btn" type="submit" className={btnCls}>Add to-do</button>
            </form>
          </Card>

          <Card data-testid="household-card">
            <CardTitle icon={Users}>Household</CardTitle>
            <ul className="space-y-3">
              {members.items.map((mm) => (
                <li key={mm.id} className="flex items-center gap-3">
                  <Avatar member={mm} size={36} />
                  <div>
                    <p className="text-sm font-semibold">{mm.name}</p>
                    <p className="text-xs text-foreground/50">{mm.grade || mm.role}</p>
                  </div>
                </li>
              ))}
            </ul>
          </Card>
        </div>
      </div>
    </>
  );
}
