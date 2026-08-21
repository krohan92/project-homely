import { useState } from "react";
import { Wallet, Plus, Trash2, TrendingDown, TrendingUp } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, CartesianGrid } from "recharts";
import { Card, CardTitle, Empty, PageHead } from "@/components/Bits";
import { Field, btnCls, inputCls } from "@/pages/Calendar";
import { useResource } from "@/hooks/useResource";
import { fmtDate, money, today } from "@/lib/api";
import { toast } from "sonner";

const CATS = ["Groceries", "Utilities", "Kids", "Pets", "Dining", "Home", "Income", "Other"];
const COLORS = ["#81B29A", "#E07A5F", "#F2CC8F", "#9A8C98", "#8FB3C9", "#C9A88F", "#A3B18A"];

export default function Budget() {
  const { items, add, del } = useResource("transactions");
  const [form, setForm] = useState({ label: "", amount: "", category: "Groceries", type: "expense", date: today() });

  const submit = async (e) => {
    e.preventDefault();
    if (!form.label.trim() || !form.amount) return;
    await add({ ...form, amount: Number(form.amount) });
    setForm({ ...form, label: "", amount: "", type: "expense" });
    toast.success("Transaction saved");
  };

  const expenses = items.filter((i) => i.type === "expense");
  const income = items.filter((i) => i.type === "income").reduce((s, i) => s + Number(i.amount), 0);
  const spent = expenses.reduce((s, i) => s + Number(i.amount), 0);

  const byCat = Object.entries(
    expenses.reduce((acc, i) => ({ ...acc, [i.category]: (acc[i.category] || 0) + Number(i.amount) }), {})
  ).map(([name, value]) => ({ name, value }));

  return (
    <>
      <PageHead
        testId="budget-page"
        title="Household money"
        subtitle="Where it goes each month, without the spreadsheet guilt."
      />
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card data-testid="income-card">
          <span className="grid h-11 w-11 place-items-center rounded-2xl bg-secondary/25 text-secondary"><TrendingUp className="h-5 w-5" strokeWidth={2.4} /></span>
          <p className="mt-5 font-display text-3xl font-black tracking-tighter">{money(income)}</p>
          <p className="text-sm font-semibold text-foreground/60">Income logged</p>
        </Card>
        <Card data-testid="spent-card">
          <span className="grid h-11 w-11 place-items-center rounded-2xl bg-primary/15 text-primary"><TrendingDown className="h-5 w-5" strokeWidth={2.4} /></span>
          <p className="mt-5 font-display text-3xl font-black tracking-tighter">{money(spent)}</p>
          <p className="text-sm font-semibold text-foreground/60">Spent</p>
        </Card>
        <Card data-testid="left-card">
          <span className="grid h-11 w-11 place-items-center rounded-2xl bg-accent/60 text-accent-foreground"><Wallet className="h-5 w-5" strokeWidth={2.4} /></span>
          <p className="mt-5 font-display text-3xl font-black tracking-tighter">{money(income - spent)}</p>
          <p className="text-sm font-semibold text-foreground/60">Left over</p>
        </Card>

        <Card className="lg:col-span-2" data-testid="chart-card">
          <CardTitle icon={Wallet}>Where the money went</CardTitle>
          {byCat.length ? (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div className="h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={byCat} dataKey="value" nameKey="name" innerRadius={48} outerRadius={80} paddingAngle={3}>
                      {byCat.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} stroke="none" />)}
                    </Pie>
                    <Tooltip formatter={(v) => money(v)} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={byCat}>
                    <CartesianGrid vertical={false} stroke="#E8E4DB" />
                    <XAxis dataKey="name" tick={{ fontSize: 11 }} interval={0} angle={-25} height={50} textAnchor="end" />
                    <Tooltip formatter={(v) => money(v)} />
                    <Bar dataKey="value" fill="#81B29A" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          ) : (
            <Empty>No spending logged yet.</Empty>
          )}
        </Card>

        <Card data-testid="add-transaction-card">
          <CardTitle icon={Plus}>Log spending</CardTitle>
          <form onSubmit={submit} className="space-y-4">
            <Field label="What"><input data-testid="tx-label-input" value={form.label} onChange={(e) => setForm({ ...form, label: e.target.value })} placeholder="Weekly shop" className={inputCls} /></Field>
            <Field label="Amount"><input type="number" step="0.01" data-testid="tx-amount-input" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} placeholder="120" className={inputCls} /></Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Category">
                <select data-testid="tx-category-select" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className={inputCls}>
                  {CATS.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </Field>
              <Field label="Type">
                <select data-testid="tx-type-select" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} className={inputCls}>
                  <option value="expense">expense</option>
                  <option value="income">income</option>
                </select>
              </Field>
            </div>
            <Field label="Date"><input type="date" data-testid="tx-date-input" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} className={inputCls} /></Field>
            <button data-testid="add-tx-btn" type="submit" className={btnCls}>Save transaction</button>
          </form>
        </Card>

        <Card className="lg:col-span-3" data-testid="tx-list-card">
          <CardTitle icon={Wallet}>Recent transactions</CardTitle>
          <ul className="divide-y divide-border">
            {[...items].reverse().map((i) => (
              <li key={i.id} className="flex items-center justify-between gap-4 py-3">
                <div>
                  <p className="font-semibold">{i.label}</p>
                  <p className="text-sm text-foreground/60">{i.category} · {fmtDate(i.date)}</p>
                </div>
                <div className="flex items-center gap-4">
                  <span className={`font-display font-black ${i.type === "income" ? "text-secondary" : "text-primary"}`}>
                    {i.type === "income" ? "+" : "−"}{money(i.amount)}
                  </span>
                  <button data-testid={`delete-tx-${i.id}`} onClick={() => del(i.id)} className="text-muted-foreground transition-colors duration-200 hover:text-destructive">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </li>
            ))}
            {!items.length && <Empty>No transactions.</Empty>}
          </ul>
        </Card>
      </div>
    </>
  );
}
