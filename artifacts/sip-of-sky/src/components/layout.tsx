import React, { useState } from "react";
import { Link, useLocation } from "wouter";
import { useCart } from "@/lib/cart-context";
import { useTheme } from "@/lib/theme-provider";
import { useGetRestaurantInfo } from "@workspace/api-client-react";
import { CalendarDays, Clock3, Mail, MapPin, Menu as MenuIcon, Moon, Phone, ShoppingBag, Sun, X } from "lucide-react";
import { Keepy } from "@/components/keepy";

const navLinks = [
  { href: "/", label: "Discover" },
  { href: "/menu", label: "Menu" },
  { href: "/book", label: "Reserve" },
  { href: "/reviews", label: "Reviews" },
  { href: "/reservations", label: "My tables" },
];

export function Navbar() {
  const [location] = useLocation();
  const [open, setOpen] = useState(false);
  const { totalItems } = useCart();
  const { theme, setTheme } = useTheme();
  const { data: restaurant } = useGetRestaurantInfo();
  const isDark = theme === "dark";
  return <header className="sticky top-0 z-50 border-b border-border/70 bg-background/90 backdrop-blur-xl">
    <div className="mx-auto flex h-[4.5rem] max-w-7xl items-center justify-between gap-4 px-4 sm:px-6">
      <Link href="/" className="group flex items-center gap-3" data-testid="link-brand">
        <span className="flex h-9 w-9 rotate-45 items-center justify-center rounded-[.7rem] bg-primary text-primary-foreground transition-transform group-hover:rotate-90"><span className="-rotate-45 font-serif text-xl group-hover:-rotate-90">K</span></span>
        <span><span className="block font-mono text-[.62rem] font-bold tracking-[.23em] text-primary">KEEP</span><span className="block -mt-1 font-serif text-2xl leading-none">Diving</span></span>
      </Link>
      <nav className="hidden items-center gap-1 lg:flex" aria-label="Primary navigation">{navLinks.map((link) => <Link key={link.href} href={link.href} data-testid={`link-nav-${link.label.toLowerCase().replace(" ", "-")}`} className={`relative rounded-full px-4 py-2 text-sm font-semibold transition-colors hover:text-primary ${location === link.href ? "text-primary" : "text-muted-foreground"}`}>{link.label}{location === link.href && <span className="absolute bottom-0 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full bg-primary" />}</Link>)}</nav>
      <div className="flex items-center gap-2">
        <span className={`hidden items-center gap-1.5 rounded-full border px-3 py-1.5 text-[.65rem] font-bold uppercase tracking-wider sm:flex ${restaurant?.isOpenNow ? "border-accent/30 bg-accent/10 text-accent" : "border-border text-muted-foreground"}`}><span className={`h-1.5 w-1.5 rounded-full ${restaurant?.isOpenNow ? "bg-accent" : "bg-muted-foreground"}`} />{restaurant?.isOpenNow ? "Open tonight" : "Closed now"}</span>
        <button type="button" aria-label="Toggle theme" data-testid="button-toggle-theme" onClick={() => setTheme(isDark ? "light" : "dark")} className="hidden rounded-full p-2 text-muted-foreground hover:bg-muted hover:text-foreground sm:block">{isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}</button>
        <Link href="/order" data-testid="link-cart" className="relative flex items-center gap-2 rounded-full bg-secondary px-3 py-2 text-sm font-bold text-secondary-foreground"><ShoppingBag className="h-4 w-4 text-primary" /><span className="hidden sm:inline">Bag</span>{totalItems > 0 && <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[.6rem] text-primary-foreground">{totalItems}</span>}</Link>
        <button type="button" aria-label="Open menu" data-testid="button-open-navigation" onClick={() => setOpen(true)} className="rounded-full p-2 text-foreground hover:bg-muted lg:hidden"><MenuIcon className="h-5 w-5" /></button>
      </div>
    </div>
    {open && <div className="fixed inset-0 z-[70] bg-background p-6 lg:hidden"><div className="flex items-center justify-between"><Link href="/" onClick={() => setOpen(false)} className="font-serif text-2xl">KEEP <span className="text-primary">DIVING</span></Link><button type="button" aria-label="Close menu" data-testid="button-close-navigation" onClick={() => setOpen(false)} className="rounded-full p-2 hover:bg-muted"><X className="h-5 w-5" /></button></div><nav className="mt-16 flex flex-col gap-2">{navLinks.map((link) => <Link key={link.href} href={link.href} onClick={() => setOpen(false)} className="border-b border-border py-4 font-serif text-4xl hover:text-primary">{link.label}</Link>)}</nav><button type="button" onClick={() => setTheme(isDark ? "light" : "dark")} className="mt-10 flex items-center gap-2 text-sm text-muted-foreground">{isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />} {isDark ? "Light room" : "Dark room"}</button></div>}
  </header>;
}

export function Layout({ children }: { children: React.ReactNode }) {
  const { data: restaurant } = useGetRestaurantInfo();
  return <div className="min-h-[100dvh] bg-background"><Navbar /><main>{children}</main><footer className="ink-panel mt-20"><div className="mx-auto grid max-w-7xl gap-12 px-4 py-14 sm:px-6 md:grid-cols-[1.4fr_.8fr_.8fr]"><div><p className="font-serif text-5xl">Keep diving.</p><p className="mt-3 max-w-sm text-sm leading-relaxed text-secondary-foreground/65">An evening above the city where discovery, flavour and the last light are all part of the table.</p><div className="mt-7 flex flex-col gap-2 text-sm text-secondary-foreground/70">{restaurant?.address && <span className="flex gap-2"><MapPin className="h-4 w-4 text-primary" />{restaurant.address}</span>}{restaurant?.phone && <a className="flex gap-2 hover:text-primary" href={`tel:${restaurant.phone}`}><Phone className="h-4 w-4 text-primary" />{restaurant.phone}</a>}{restaurant?.email && <a className="flex gap-2 hover:text-primary" href={`mailto:${restaurant.email}`}><Mail className="h-4 w-4 text-primary" />{restaurant.email}</a>}</div></div><div><p className="eyebrow mb-4">Explore</p><div className="flex flex-col gap-3 text-sm text-secondary-foreground/75">{navLinks.slice(0, 4).map((link) => <Link key={link.href} href={link.href} className="hover:text-primary">{link.label}</Link>)}<Link href="/admin" className="hover:text-primary">Kitchen desk</Link></div></div><div><p className="eyebrow mb-4">Tonight</p><div className="space-y-3 text-sm text-secondary-foreground/70"><p className="flex gap-2"><Clock3 className="h-4 w-4 text-primary" />{restaurant?.openTime || "18:00"} – {restaurant?.closeTime || "23:00"}</p><p className="flex gap-2"><CalendarDays className="h-4 w-4 text-primary" />Reservations recommended</p><p className="flex gap-2"><ShoppingBag className="h-4 w-4 text-primary" />Pre-order available</p></div></div></div><div className="border-t border-secondary-foreground/10"><div className="mx-auto flex max-w-7xl flex-col gap-2 px-4 py-5 text-xs text-secondary-foreground/45 sm:flex-row sm:items-center sm:justify-between sm:px-6"><span>© {new Date().getFullYear()} KEEP DIVING</span><span>Dive Into Exceptional Flavours.</span></div></div><Keepy /></footer></div>;
}