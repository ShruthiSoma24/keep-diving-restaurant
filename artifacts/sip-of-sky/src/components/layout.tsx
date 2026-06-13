import React from "react";
import { Link, useLocation } from "wouter";
import { useCart } from "@/lib/cart-context";
import { useTheme } from "@/lib/theme-provider";
import { useGetRestaurantInfo } from "@workspace/api-client-react";
import { Moon, Sun, ShoppingCart, Menu as MenuIcon, MapPin, Clock, Phone, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { motion, AnimatePresence } from "framer-motion";

export function Navbar() {
  const [location] = useLocation();
  const { totalItems } = useCart();
  const { theme, setTheme } = useTheme();
  const { data: restaurant } = useGetRestaurantInfo();
  const [isOpen, setIsOpen] = React.useState(false);

  const links = [
    { href: "/", label: "Home" },
    { href: "/menu", label: "Menu" },
    { href: "/book", label: "Book a Table" },
    { href: "/reviews", label: "Reviews" },
  ];

  const isDark = theme === "dark";

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-border/60 bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto max-w-6xl px-4 h-16 flex items-center justify-between">
        {/* Logo + status */}
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center gap-2">
            <span className="font-serif text-2xl font-bold text-primary">Sip of Sky</span>
          </Link>
          {restaurant && (
            <span
              className={`hidden md:inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full border ${
                restaurant.isOpenNow
                  ? "bg-green-500/10 text-green-600 border-green-500/20"
                  : "bg-muted text-muted-foreground border-border"
              }`}
            >
              <span className={`h-1.5 w-1.5 rounded-full ${restaurant.isOpenNow ? "bg-green-500 animate-pulse" : "bg-muted-foreground"}`} />
              {restaurant.isOpenNow ? "Open Now" : "Closed"}
            </span>
          )}
        </div>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-1">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`relative px-3 py-2 text-sm font-medium transition-colors rounded-lg hover:text-primary ${
                location === link.href ? "text-primary" : "text-muted-foreground"
              }`}
            >
              {link.label}
              {location === link.href && (
                <motion.div
                  layoutId="nav-indicator"
                  className="absolute inset-0 bg-primary/8 rounded-lg"
                  transition={{ type: "spring", stiffness: 350, damping: 30 }}
                />
              )}
            </Link>
          ))}
        </div>

        {/* Right actions */}
        <div className="flex items-center gap-2">
          {/* Theme toggle */}
          <Button
            variant="ghost"
            size="icon"
            className="rounded-full"
            onClick={() => setTheme(isDark ? "light" : "dark")}
          >
            <Sun className="h-[1.1rem] w-[1.1rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-[1.1rem] w-[1.1rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            <span className="sr-only">Toggle theme</span>
          </Button>

          {/* Cart button */}
          <Link href="/order">
            <Button variant="outline" className="relative rounded-full gap-2 pl-3 pr-4 hidden sm:flex">
              <ShoppingCart className="h-4 w-4" />
              <span className="text-sm">Cart</span>
              <AnimatePresence>
                {totalItems > 0 && (
                  <motion.span
                    key="badge"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                    className="absolute -top-2 -right-2 h-5 w-5 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center font-bold shadow-sm"
                  >
                    {totalItems > 9 ? "9+" : totalItems}
                  </motion.span>
                )}
              </AnimatePresence>
            </Button>
          </Link>

          {/* Cart icon (mobile) */}
          <Link href="/order" className="sm:hidden">
            <Button variant="outline" size="icon" className="relative rounded-full">
              <ShoppingCart className="h-4 w-4" />
              <AnimatePresence>
                {totalItems > 0 && (
                  <motion.span
                    key="badge-mobile"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                    className="absolute -top-2 -right-2 h-5 w-5 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center font-bold shadow-sm"
                  >
                    {totalItems > 9 ? "9+" : totalItems}
                  </motion.span>
                )}
              </AnimatePresence>
            </Button>
          </Link>

          {/* Mobile hamburger */}
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden rounded-full">
                <MenuIcon className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-72">
              <SheetHeader>
                <SheetTitle className="font-serif text-2xl text-left text-primary">Sip of Sky</SheetTitle>
              </SheetHeader>
              <div className="flex flex-col gap-1 mt-8">
                {links.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`text-base font-medium px-3 py-2.5 rounded-xl transition-colors ${
                      location === link.href
                        ? "text-primary bg-primary/8"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
                    }`}
                    onClick={() => setIsOpen(false)}
                  >
                    {link.label}
                  </Link>
                ))}
                <div className="h-px bg-border my-3" />
                <button
                  className="flex items-center gap-2 px-3 py-2.5 text-sm text-muted-foreground hover:text-foreground rounded-xl hover:bg-muted/60 transition-colors text-left"
                  onClick={() => setTheme(isDark ? "light" : "dark")}
                >
                  {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                  {isDark ? "Light Mode" : "Dark Mode"}
                </button>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </nav>
  );
}

export function Layout({ children }: { children: React.ReactNode }) {
  const { data: restaurant } = useGetRestaurantInfo();

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">{children}</main>

      <footer className="border-t bg-muted/20">
        {/* Main footer */}
        <div className="container mx-auto max-w-6xl px-4 py-16">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
            {/* Brand */}
            <div className="md:col-span-2">
              <p className="font-serif text-3xl text-primary mb-3">Sip of Sky</p>
              <p className="text-muted-foreground text-sm leading-relaxed max-w-xs mb-6">
                {restaurant?.tagline || "Elevated dining above the city — where every meal feels like golden hour."}
              </p>
              <div className="space-y-2.5">
                {restaurant?.address && (
                  <div className="flex items-start gap-2 text-sm text-muted-foreground">
                    <MapPin className="h-4 w-4 shrink-0 mt-0.5 text-primary/60" />
                    <span>{restaurant.address}</span>
                  </div>
                )}
                {restaurant?.phone && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Phone className="h-4 w-4 shrink-0 text-primary/60" />
                    <a href={`tel:${restaurant.phone}`} className="hover:text-primary transition-colors">{restaurant.phone}</a>
                  </div>
                )}
                {restaurant?.email && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Mail className="h-4 w-4 shrink-0 text-primary/60" />
                    <a href={`mailto:${restaurant.email}`} className="hover:text-primary transition-colors">{restaurant.email}</a>
                  </div>
                )}
                {restaurant && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock className="h-4 w-4 shrink-0 text-primary/60" />
                    <span>{restaurant.openTime} – {restaurant.closeTime} daily</span>
                  </div>
                )}
              </div>
            </div>

            {/* Navigate */}
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-4">Navigate</p>
              <div className="space-y-2">
                {[
                  { href: "/", label: "Home" },
                  { href: "/menu", label: "Our Menu" },
                  { href: "/book", label: "Reserve a Table" },
                  { href: "/reviews", label: "Reviews" },
                  { href: "/order", label: "Order Food" },
                ].map(link => (
                  <Link key={link.href} href={link.href} className="block text-sm text-muted-foreground hover:text-primary transition-colors py-0.5">
                    {link.label}
                  </Link>
                ))}
              </div>
            </div>

            {/* Manage */}
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-4">Manage</p>
              <div className="space-y-2">
                <Link href="/admin" className="block text-sm text-muted-foreground hover:text-primary transition-colors py-0.5">
                  Admin Panel
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t">
          <div className="container mx-auto max-w-6xl px-4 py-5 flex flex-col sm:flex-row items-center justify-between gap-3">
            <p className="text-xs text-muted-foreground">
              &copy; {new Date().getFullYear()} Sip of Sky. All rights reserved.
            </p>
            <p className="text-xs text-muted-foreground">
              Rooftop dining elevated to an art form.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
