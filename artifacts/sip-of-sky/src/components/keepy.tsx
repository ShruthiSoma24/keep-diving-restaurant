import { useMemo, useState } from "react";
import { Link, useLocation } from "wouter";
import { MessageCircle, X, ArrowRight, Sparkles } from "lucide-react";
import { useListMenuItems } from "@workspace/api-client-react";
import { formatINR } from "@/lib/keep-diving";

const baseReplies = [
  { label: "What should I order?", key: "menu" },
  { label: "Find me a table", key: "book" },
  { label: "What is vegetarian?", key: "veg" },
];

export function Keepy() {
  const [open, setOpen] = useState(false);
  const [reply, setReply] = useState("");
  const [location] = useLocation();
  const { data: items = [] } = useListMenuItems();
  const featured = useMemo(() => items.filter((item) => item.isFeatured).slice(0, 2), [items]);
  const answer = (key: string) => {
    if (key === "book") setReply("I can hold the details while you choose a date, time and table. Let’s make the evening easy.");
    if (key === "veg") {
      const veg = items.filter((item) => item.isVegetarian).slice(0, 2);
      setReply(veg.length ? `Try ${veg.map((item) => item.name).join(" and ")} — both are vegetarian and made for sharing.` : "Our team can guide you through vegetarian plates when you arrive.");
    }
    if (key === "menu") {
      setReply(featured.length ? `The kitchen is proud of ${featured.map((item) => `${item.name} (${formatINR(item.price)})`).join(" and ")} tonight.` : "Start with something bright, then let the kitchen take it somewhere warmer.");
    }
  };
  const context = location === "/menu" ? "You are exploring the menu." : location === "/book" ? "You are choosing a table." : "Ask me about your evening.";

  return (
    <div className="fixed bottom-5 right-4 z-[60] sm:right-6">
      {open && (
        <div className="mb-3 w-[min(350px,calc(100vw-2rem))] overflow-hidden rounded-[1.35rem] border border-primary/20 bg-card shadow-2xl animate-rise-in">
          <div className="ink-panel flex items-start justify-between p-4">
            <div className="flex gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-primary-foreground"><Sparkles className="h-4 w-4" /></div>
              <div><p className="font-semibold">Keepy, at your service</p><p className="text-xs text-secondary-foreground/65">{context}</p></div>
            </div>
            <button type="button" aria-label="Close Keepy" data-testid="button-close-keepy" onClick={() => setOpen(false)} className="rounded-full p-1 text-secondary-foreground/70 hover:bg-secondary-foreground/10"><X className="h-4 w-4" /></button>
          </div>
          <div className="space-y-3 p-4">
            {reply && <p className="rounded-xl bg-muted/65 p-3 text-sm leading-relaxed text-foreground">{reply}</p>}
            <div className="grid gap-2">
              {baseReplies.map((item) => <button type="button" data-testid={`button-keepy-${item.key}`} key={item.key} onClick={() => answer(item.key)} className="flex items-center justify-between rounded-xl border border-border bg-background/45 px-3 py-2.5 text-left text-sm transition-colors hover:border-primary hover:text-primary"><span>{item.label}</span><ArrowRight className="h-3.5 w-3.5" /></button>)}
            </div>
            <Link href={location === "/book" ? "/book" : "/menu"} onClick={() => setOpen(false)} className="block pt-1 text-center text-xs font-semibold uppercase tracking-[.14em] text-primary">Continue your evening</Link>
          </div>
        </div>
      )}
      <button type="button" aria-label="Open Keepy assistant" data-testid="button-open-keepy" onClick={() => setOpen((value) => !value)} className="group flex items-center gap-2 rounded-full bg-secondary px-4 py-3 text-sm font-semibold text-secondary-foreground shadow-xl transition-transform hover:-translate-y-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary">
        <MessageCircle className="h-4 w-4 text-primary transition-transform group-hover:rotate-12" /><span>Keepy</span>
      </button>
    </div>
  );
}