import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useListMenuItems, useListCategories, useGetFeaturedDishes } from "@workspace/api-client-react";
import { useCart } from "@/lib/cart-context";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import {
  Search, SlidersHorizontal, Leaf, Flame, ShoppingCart, Plus, Minus, Trash2, Star, ChevronRight
} from "lucide-react";
import { Link } from "wouter";
import { formatINR } from "@/lib/keep-diving";

function MenuItemCard({ item }: { item: {
  id: number; name: string; description: string; price: number; category: string;
  imageUrl?: string | null; rating: number; isVegetarian: boolean; isSpicy: boolean;
  isFeatured: boolean; available: boolean;
}}) {
  const { addItem, items, updateQuantity, removeItem } = useCart();
  const cartItem = items.find(i => i.menuItemId === item.id);
  const qty = cartItem?.quantity ?? 0;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.97 }}
      transition={{ duration: 0.3 }}
      className={`group relative flex flex-col bg-card border border-card-border rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300 ${!item.available ? "opacity-60" : ""}`}
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-muted">
        {item.imageUrl ? (
          <img
            src={item.imageUrl}
            alt={item.name}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-primary/20 via-muted to-muted/60 flex items-center justify-center">
            <span className="font-serif text-2xl text-muted-foreground/60 px-4 text-center">{item.name}</span>
          </div>
        )}
        {item.isFeatured && (
          <div className="absolute top-3 left-3">
            <Badge className="bg-primary/90 text-primary-foreground text-xs backdrop-blur-sm">Chef's Pick</Badge>
          </div>
        )}
        {!item.available && (
          <div className="absolute inset-0 bg-background/70 flex items-center justify-center">
            <span className="text-sm font-medium text-muted-foreground">Currently Unavailable</span>
          </div>
        )}
        <div className="absolute top-3 right-3 flex gap-1">
          {item.isVegetarian && (
            <div className="h-6 w-6 rounded-full bg-green-500/90 flex items-center justify-center" title="Vegetarian">
              <Leaf className="h-3.5 w-3.5 text-white" />
            </div>
          )}
          {item.isSpicy && (
            <div className="h-6 w-6 rounded-full bg-red-500/90 flex items-center justify-center" title="Spicy">
              <Flame className="h-3.5 w-3.5 text-white" />
            </div>
          )}
        </div>
      </div>

      <div className="flex flex-col flex-1 p-5">
        <div className="flex items-start justify-between gap-2 mb-1.5">
          <h3 className="font-serif text-lg leading-snug">{item.name}</h3>
          <div className="flex items-center gap-1 shrink-0">
            <Star className="h-3.5 w-3.5 fill-primary text-primary" />
            <span className="text-sm font-medium">{item.rating.toFixed(1)}</span>
          </div>
        </div>
        <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2 mb-4 flex-1">{item.description}</p>

        <div className="flex items-center justify-between">
           <span className="text-xl font-bold text-primary">{formatINR(item.price)}</span>

          {item.available && (
            qty === 0 ? (
              <Button
                size="sm"
                className="rounded-full gap-1.5 px-4"
                onClick={() => addItem({ menuItemId: item.id, name: item.name, price: item.price, quantity: 1 })}
              >
                <Plus className="h-3.5 w-3.5" />
                Add
              </Button>
            ) : (
              <div className="flex items-center gap-2">
                <Button
                  size="icon"
                  variant="outline"
                  className="h-8 w-8 rounded-full"
                  onClick={() => {
                    if (qty === 1) removeItem(item.id);
                    else updateQuantity(item.id, qty - 1);
                  }}
                >
                  {qty === 1 ? <Trash2 className="h-3.5 w-3.5" /> : <Minus className="h-3.5 w-3.5" />}
                </Button>
                <span className="w-5 text-center font-semibold text-sm">{qty}</span>
                <Button
                  size="icon"
                  className="h-8 w-8 rounded-full"
                  onClick={() => updateQuantity(item.id, qty + 1)}
                >
                  <Plus className="h-3.5 w-3.5" />
                </Button>
              </div>
            )
          )}
        </div>
      </div>
    </motion.div>
  );
}

function CartDrawer() {
  const { items, totalItems, totalPrice, updateQuantity, removeItem } = useCart();

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button className="relative gap-2 rounded-full shadow-md shadow-primary/20">
          <ShoppingCart className="h-4 w-4" />
          <span>View Cart</span>
          {totalItems > 0 && (
            <span className="ml-1 h-5 w-5 rounded-full bg-primary-foreground text-primary text-xs font-bold flex items-center justify-center">
              {totalItems}
            </span>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent className="flex flex-col w-full sm:max-w-md">
        <SheetHeader>
          <SheetTitle className="font-serif text-2xl">Your Cart</SheetTitle>
        </SheetHeader>
        {items.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-4 text-center">
            <ShoppingCart className="h-16 w-16 text-muted-foreground/30" />
            <p className="text-muted-foreground text-lg">Your cart is empty</p>
            <p className="text-sm text-muted-foreground">Add some dishes from the menu</p>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto py-4 space-y-4 -mx-2 px-2">
              {items.map(item => (
                <div key={item.menuItemId} className="flex items-center gap-3 p-3 bg-muted/40 rounded-xl">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{item.name}</p>
                     <p className="text-primary text-sm font-semibold">{formatINR(item.price * item.quantity)}</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Button size="icon" variant="outline" className="h-7 w-7 rounded-full"
                      onClick={() => { if (item.quantity === 1) removeItem(item.menuItemId); else updateQuantity(item.menuItemId, item.quantity - 1); }}>
                      {item.quantity === 1 ? <Trash2 className="h-3 w-3" /> : <Minus className="h-3 w-3" />}
                    </Button>
                    <span className="w-4 text-center font-bold text-sm">{item.quantity}</span>
                    <Button size="icon" className="h-7 w-7 rounded-full"
                      onClick={() => updateQuantity(item.menuItemId, item.quantity + 1)}>
                      <Plus className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
            <div className="border-t pt-4 space-y-4">
              <div className="flex justify-between items-center text-lg font-semibold">
                <span>Total</span>
                 <span className="text-primary">{formatINR(totalPrice)}</span>
              </div>
              <Link href="/order">
                <Button className="w-full rounded-full gap-2 text-base py-5">
                  Checkout
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}

export default function Menu() {
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [vegOnly, setVegOnly] = useState(false);
  const [spicyOnly, setSpicyOnly] = useState(false);

  const { data: categories = [], isLoading: isLoadingCats, isError: categoriesError } = useListCategories();
  const { data: allItems = [], isLoading: isLoadingItems, isError: itemsError, refetch } = useListMenuItems();
  const { data: featuredDishes = [] } = useGetFeaturedDishes();
  const { totalItems, totalPrice } = useCart();

  const allCategories = ["All", ...categories];

  const filtered = useMemo(() => {
    return allItems.filter(item => {
      const matchCat = activeCategory === "All" || item.category === activeCategory;
      const matchSearch = !search || item.name.toLowerCase().includes(search.toLowerCase()) || item.description.toLowerCase().includes(search.toLowerCase());
      const matchVeg = !vegOnly || item.isVegetarian;
      const matchSpicy = !spicyOnly || item.isSpicy;
      return matchCat && matchSearch && matchVeg && matchSpicy;
    });
  }, [allItems, activeCategory, search, vegOnly, spicyOnly]);

  const isLoading = isLoadingItems || isLoadingCats;
  const hasError = categoriesError || itemsError;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-gradient-to-b from-muted/50 to-background pt-16 pb-10 px-4 text-center">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <h1 className="font-serif text-4xl md:text-5xl mb-3">Our Menu</h1>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto">
            Seasonal plates crafted above the clouds — every dish tells a story.
          </p>
        </motion.div>
      </div>

      {/* Chef's Picks Strip */}
      {featuredDishes.length > 0 && (
        <div className="bg-primary/5 border-y border-primary/10 py-4 px-4">
          <div className="container mx-auto max-w-6xl">
            <div className="flex gap-6 overflow-x-auto scrollbar-none pb-1">
              <span className="text-xs font-semibold text-primary uppercase tracking-widest shrink-0 self-center">Chef's Picks</span>
              {featuredDishes.slice(0, 5).map(dish => (
                <div key={dish.id} className="flex items-center gap-2 shrink-0">
                  <Star className="h-3.5 w-3.5 fill-primary text-primary" />
                  <span className="text-sm font-medium">{dish.name}</span>
                   <span className="text-sm text-primary font-semibold">{formatINR(dish.price)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="container mx-auto max-w-6xl px-4 py-8">
        {/* Search + Filters Row */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search dishes..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="pl-10 rounded-full border-border/60 h-11"
            />
          </div>
          <div className="flex gap-2 items-center">
            <SlidersHorizontal className="h-4 w-4 text-muted-foreground shrink-0" />
            <Button
              variant={vegOnly ? "default" : "outline"}
              size="sm"
              className="rounded-full gap-1.5"
              onClick={() => setVegOnly(v => !v)}
            >
              <Leaf className="h-3.5 w-3.5" /> Vegetarian
            </Button>
            <Button
              variant={spicyOnly ? "default" : "outline"}
              size="sm"
              className="rounded-full gap-1.5"
              onClick={() => setSpicyOnly(s => !s)}
            >
              <Flame className="h-3.5 w-3.5" /> Spicy
            </Button>
          </div>
        </div>

        {/* Category Tabs */}
        <div className="flex gap-2 overflow-x-auto scrollbar-none pb-2 mb-8">
          {(isLoadingCats ? ["All", "cat-1", "cat-2", "cat-3"] : allCategories).map((cat, idx) => (
            <button
              key={isLoadingCats ? idx : cat}
              onClick={() => setActiveCategory(cat)}
              className={`shrink-0 px-5 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                activeCategory === cat
                  ? "bg-primary text-primary-foreground shadow-sm shadow-primary/25"
                  : "bg-muted text-muted-foreground hover:bg-muted/70"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Items Grid */}
        {hasError ? (
          <div className="rounded-2xl border border-destructive/20 bg-destructive/5 px-6 py-16 text-center">
            <p className="font-serif text-2xl">The menu is taking a moment.</p>
            <p className="mt-2 text-sm text-muted-foreground">Please try again — the kitchen is still here.</p>
            <Button variant="outline" className="mt-5 rounded-full" onClick={() => refetch()}>Try again</Button>
          </div>
        ) : isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="space-y-3">
                <Skeleton className="h-52 w-full rounded-2xl" />
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-24">
            <Search className="h-14 w-14 text-muted-foreground/30 mx-auto mb-4" />
            <p className="text-xl font-serif text-muted-foreground mb-2">No dishes found</p>
            <p className="text-sm text-muted-foreground">Try adjusting your search or filters</p>
          </div>
        ) : (
          <AnimatePresence mode="popLayout">
            <motion.div
              key={`${activeCategory}-${vegOnly}-${spicyOnly}-${search}`}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {filtered.map(item => (
                <MenuItemCard key={item.id} item={item} />
              ))}
            </motion.div>
          </AnimatePresence>
        )}
      </div>

      {/* Floating Cart Bar */}
      <AnimatePresence>
        {totalItems > 0 && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50"
          >
            <div className="bg-card border border-card-border rounded-2xl shadow-2xl px-5 py-3 flex items-center gap-6">
              <div>
                <p className="text-xs text-muted-foreground">{totalItems} item{totalItems !== 1 ? "s" : ""}</p>
                 <p className="font-bold text-primary">{formatINR(totalPrice)}</p>
              </div>
              <CartDrawer />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
