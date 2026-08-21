import { useState } from "react";
import { ShoppingBasket, Plus, Trash2, Check } from "lucide-react";
import { Card, CardTitle, Empty, PageHead, Pill } from "@/components/Bits";
import { inputCls } from "@/pages/Calendar";
import { useResource } from "@/hooks/useResource";
import { toast } from "sonner";

const AISLES = ["Produce", "Dairy", "Pantry", "Household", "Pets", "Frozen", "Other"];

export default function Groceries() {
  const { items, add, patch, del } = useResource("groceries");
  const [name, setName] = useState("");
  const [qty, setQty] = useState("1");
  const [aisle, setAisle] = useState("Produce");

  const submit = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    await add({ name, qty, aisle, done: false });
    setName("");
    setQty("1");
    toast.success(`${name} added to the list`);
  };

  const open = items.filter((i) => !i.done);
  const bought = items.filter((i) => i.done);
  const byAisle = AISLES.map((a) => [a, open.filter((i) => i.aisle === a)]).filter(([, l]) => l.length);

  return (
    <>
      <PageHead
        testId="groceries-page"
        title="Groceries"
        subtitle="A shared list that's actually up to date, sorted by aisle so the shop takes ten minutes."
        action={<Pill tone="primary">{open.length} to buy</Pill>}
      />
      <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2" data-testid="grocery-list-card">
          <form onSubmit={submit} className="mb-8 flex flex-col gap-3 sm:flex-row">
            <input data-testid="grocery-name-input" value={name} onChange={(e) => setName(e.target.value)} placeholder="Add an item…" className={inputCls} />
            <input data-testid="grocery-qty-input" value={qty} onChange={(e) => setQty(e.target.value)} placeholder="Qty" className={`${inputCls} sm:w-24`} />
            <select data-testid="grocery-aisle-select" value={aisle} onChange={(e) => setAisle(e.target.value)} className={`${inputCls} sm:w-40`}>
              {AISLES.map((a) => <option key={a} value={a}>{a}</option>)}
            </select>
            <button data-testid="add-grocery-btn" type="submit" className="rounded-full bg-primary px-6 py-3 text-sm font-bold text-primary-foreground transition-transform duration-200 hover:-translate-y-0.5 active:scale-95">
              <Plus className="inline h-4 w-4" /> Add
            </button>
          </form>

          {byAisle.map(([a, list]) => (
            <div key={a} className="mb-8">
              <h4 className="text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground">{a}</h4>
              <ul className="mt-3 divide-y divide-border">
                {list.map((i, idx) => (
                  <li key={i.id} className="rise flex items-center gap-4 py-3" style={{ animationDelay: `${idx * 40}ms` }}>
                    <input
                      type="checkbox"
                      data-testid={`grocery-check-${i.id}`}
                      checked={false}
                      onChange={() => patch(i.id, { done: true })}
                      className="h-5 w-5 accent-[hsl(var(--secondary))]"
                    />
                    <span className="flex-1 font-semibold">{i.name}</span>
                    <span className="text-sm text-foreground/50">{i.qty}</span>
                    <button data-testid={`delete-grocery-${i.id}`} onClick={() => del(i.id)} className="text-muted-foreground transition-colors duration-200 hover:text-destructive">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ))}
          {!open.length && (
            <div className="text-center">
              <img
                src="https://images.pexels.com/photos/9070106/pexels-photo-9070106.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940"
                alt="Fresh produce"
                className="mx-auto h-56 w-full rounded-2xl object-cover"
              />
              <Empty>The list is empty. Nicely done.</Empty>
            </div>
          )}
        </Card>

        <Card data-testid="bought-card">
          <CardTitle icon={ShoppingBasket}>In the basket</CardTitle>
          <ul className="space-y-3">
            {bought.map((i) => (
              <li key={i.id} className="flex items-center gap-3">
                <button data-testid={`grocery-undo-${i.id}`} onClick={() => patch(i.id, { done: false })} className="grid h-6 w-6 place-items-center rounded-full bg-secondary text-secondary-foreground">
                  <Check className="h-3.5 w-3.5" strokeWidth={3} />
                </button>
                <span className="text-sm font-semibold text-muted-foreground line-through">{i.name}</span>
              </li>
            ))}
            {!bought.length && <Empty>Nothing bought yet.</Empty>}
          </ul>
        </Card>
      </div>
    </>
  );
}
