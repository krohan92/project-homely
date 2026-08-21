import { Dog, Footprints, Syringe, Utensils, Droplets } from "lucide-react";
import { Card, CardTitle, Empty, PageHead, Pill } from "@/components/Bits";
import { useResource } from "@/hooks/useResource";
import { fmtDate } from "@/lib/api";
import { toast } from "sonner";

const QUICK = [
  { type: "walk", label: "Walked", icon: Footprints, note: "Walk logged" },
  { type: "poop", label: "Pooped", icon: Droplets, note: "Business done" },
  { type: "food", label: "Fed", icon: Utensils, note: "Meal given" },
  { type: "meds", label: "Meds", icon: Syringe, note: "Medication given" },
];

export default function Pets() {
  const pets = useResource("pets");
  const logs = useResource("petlogs");
  const pet = pets.items[0];

  const log = async (q) => {
    await logs.add({ pet: pet?.name || "Pet", type: q.type, note: q.note, at: new Date().toISOString(), by: "You" });
    toast.success(`${q.label} — logged`);
  };

  const recent = [...logs.items].reverse();
  const todayCount = (type) =>
    logs.items.filter((l) => l.type === type && (l.at || "").slice(0, 10) === new Date().toISOString().slice(0, 10)).length;

  return (
    <>
      <PageHead
        testId="pets-page"
        title="Pet care"
        subtitle="Walks, poops, meals, meds and vaccine dates — so nobody has to ask 'did you take the dog out?'"
      />
      <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2" data-testid="pet-profile-card">
          <div className="flex flex-col gap-6 sm:flex-row">
            <img
              src="https://images.unsplash.com/photo-1633722715463-d30f4f325e24?crop=entropy&cs=srgb&fm=jpg&q=85&w=900"
              alt={pet?.name || "Pet"}
              className="h-48 w-full rounded-2xl object-cover sm:h-44 sm:w-56"
            />
            <div className="flex-1">
              <h3 className="font-display text-3xl font-black tracking-tighter">{pet?.name || "Your pet"}</h3>
              <p className="mt-1 text-base text-foreground/70">{pet?.breed} · {pet?.age}</p>
              <div className="mt-4 flex flex-wrap gap-2">
                <Pill tone="sage">Vet: {pet?.vet || "—"}</Pill>
                <Pill tone="primary">{pet?.vaccine_name}: {fmtDate(pet?.next_vaccine)}</Pill>
              </div>
              <div className="mt-6 flex flex-wrap gap-3">
                {QUICK.map((q) => (
                  <button
                    key={q.type}
                    data-testid={`log-${q.type}-btn`}
                    onClick={() => log(q)}
                    className="flex items-center gap-2 rounded-full bg-muted px-4 py-2.5 text-sm font-bold transition-colors duration-200 hover:bg-secondary hover:text-secondary-foreground active:scale-95"
                  >
                    <q.icon className="h-4 w-4" strokeWidth={2.4} /> {q.label}
                    <span className="rounded-full bg-card px-2 text-xs">{todayCount(q.type)}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </Card>

        <Card data-testid="pet-log-card">
          <CardTitle icon={Dog}>Recent activity</CardTitle>
          <ul className="space-y-4">
            {recent.slice(0, 12).map((l, i) => (
              <li key={l.id} className="rise" style={{ animationDelay: `${i * 40}ms` }}>
                <p className="text-sm font-semibold capitalize">{l.type} · {l.note}</p>
                <p className="text-xs text-foreground/50">
                  {new Date(l.at).toLocaleString(undefined, { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })} · {l.by}
                </p>
              </li>
            ))}
            {!recent.length && <Empty>No activity logged yet.</Empty>}
          </ul>
        </Card>
      </div>
    </>
  );
}
