import { useEffect, useMemo, useState } from "react";
import { Link } from "wouter";
import { CalendarDays, ChevronRight, Clock3, Plus, UtensilsCrossed, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { readLocalReservations, formatDateLong, LocalReservation, RESERVATION_STORAGE_KEY } from "@/lib/keep-diving";
import { toast } from "sonner";

export default function Reservations() {
  const [reservations, setReservations] = useState<LocalReservation[]>([]);
  useEffect(() => setReservations(readLocalReservations()), []);
  const upcoming = useMemo(() => reservations.filter((entry) => entry.status !== "cancelled" && new Date(`${entry.date}T${entry.time}`) >= new Date()), [reservations]);
  const past = useMemo(() => reservations.filter((entry) => entry.status === "cancelled" || new Date(`${entry.date}T${entry.time}`) < new Date()), [reservations]);
  const cancel = (id: number) => {
    const next = reservations.map((entry) => entry.id === id ? { ...entry, status: "cancelled" as const } : entry);
    setReservations(next);
    localStorage.setItem(RESERVATION_STORAGE_KEY, JSON.stringify(next));
    toast.success("Reservation marked for cancellation.");
  };
  const ReservationCard = ({ entry, canCancel }: { entry: LocalReservation; canCancel: boolean }) => (
    <article className="rounded-2xl border border-card-border bg-card p-5 shadow-sm transition-transform hover:-translate-y-0.5">
      <div className="flex items-start justify-between gap-4">
        <div><p className="eyebrow mb-2">{entry.status === "cancelled" ? "Cancelled" : "Confirmed evening"}</p><h3 className="font-serif text-2xl">{formatDateLong(entry.date)}</h3></div>
        <span className={`rounded-full border px-2.5 py-1 text-xs font-semibold ${entry.status === "cancelled" ? "border-destructive/20 bg-destructive/10 text-destructive" : "border-accent/20 bg-accent/10 text-accent"}`}>{entry.status}</span>
      </div>
      <div className="mt-5 grid grid-cols-2 gap-3 border-y border-border py-4 text-sm">
        <span className="flex items-center gap-2 text-muted-foreground"><Clock3 className="h-4 w-4 text-primary" />{entry.time}</span>
        <span className="flex items-center gap-2 text-muted-foreground"><CalendarDays className="h-4 w-4 text-primary" />{entry.partySize} guests</span>
      </div>
      <p className="mt-4 text-sm text-muted-foreground">{entry.tableName || "A considered table in the dining room"}{entry.preOrder ? ` · ${entry.preOrder}` : ""}</p>
      {canCancel && <div className="mt-5 flex flex-wrap gap-2"><Button asChild size="sm" variant="outline" className="rounded-full"><Link href="/menu"><UtensilsCrossed className="mr-1.5 h-3.5 w-3.5" />Add food</Link></Button><Button size="sm" variant="ghost" className="rounded-full text-destructive hover:text-destructive" onClick={() => cancel(entry.id)}><XCircle className="mr-1.5 h-3.5 w-3.5" />Cancel</Button></div>}
    </article>
  );
  return <div className="min-h-[75vh] bg-background"><section className="ink-panel px-4 py-16"><div className="mx-auto max-w-6xl"><p className="eyebrow text-primary">Your table, held</p><div className="mt-3 flex flex-col justify-between gap-6 md:flex-row md:items-end"><div><h1 className="text-5xl text-secondary-foreground md:text-7xl">Your evenings.</h1><p className="mt-3 max-w-xl text-secondary-foreground/70">Keep a quiet record of the tables you’ve chosen and the ones still to come.</p></div><Button asChild className="w-fit rounded-full"><Link href="/book"><Plus className="mr-2 h-4 w-4" />Reserve another</Link></Button></div></div></section>
    <main className="mx-auto max-w-6xl px-4 py-12"><section><div className="mb-5 flex items-center justify-between"><h2 className="font-serif text-3xl">Upcoming</h2><span className="text-sm text-muted-foreground">{upcoming.length} saved</span></div>{upcoming.length ? <div className="grid gap-5 md:grid-cols-2">{upcoming.map((entry) => <ReservationCard key={entry.id} entry={entry} canCancel />)}</div> : <div className="rounded-2xl border border-dashed border-border bg-muted/25 p-10 text-center"><CalendarDays className="mx-auto mb-3 h-9 w-9 text-primary/60" /><p className="font-serif text-xl">No upcoming tables yet.</p><p className="mt-1 text-sm text-muted-foreground">The best evenings usually start with a date.</p></div>}</section>
      {past.length > 0 && <section className="mt-14"><h2 className="mb-5 font-serif text-3xl">Past & cancelled</h2><div className="grid gap-5 md:grid-cols-2">{past.map((entry) => <ReservationCard key={entry.id} entry={entry} canCancel={false} />)}</div></section>}
      <Link href="/book" className="mt-10 flex items-center gap-2 text-sm font-semibold text-primary">Need a new plan? Reserve a table <ChevronRight className="h-4 w-4" /></Link>
    </main></div>;
}