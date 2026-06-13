import React, { useRef, useState } from "react";
import { Link } from "wouter";
import {
  useGetRestaurantInfo,
  useGetFeaturedDishes,
  useGetReviewSummary,
  useListReviews,
} from "@workspace/api-client-react";
import { useCart } from "@/lib/cart-context";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Star, MapPin, Clock, Phone, Mail, ChevronLeft, ChevronRight,
  Quote, CalendarDays, ShoppingBag, ArrowRight, Leaf, Flame,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

function StarRow({ rating, size = "md" }: { rating: number; size?: "sm" | "md" | "lg" }) {
  const cls = size === "sm" ? "h-3.5 w-3.5" : size === "lg" ? "h-7 w-7" : "h-5 w-5";
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <Star
          key={s}
          className={`${cls} ${s <= Math.round(rating) ? "fill-primary text-primary" : "text-muted-foreground/20 fill-transparent"}`}
        />
      ))}
    </div>
  );
}

export default function Home() {
  const { data: restaurant, isLoading: isLoadingRestaurant } = useGetRestaurantInfo();
  const { data: featuredDishes = [], isLoading: isLoadingDishes } = useGetFeaturedDishes();
  const { data: reviewSummary, isLoading: isLoadingSummary } = useGetReviewSummary();
  const { data: reviews = [], isLoading: isLoadingReviews } = useListReviews();
  const { addItem } = useCart();

  const [reviewIndex, setReviewIndex] = useState(0);
  const reviewsPerPage = 2;
  const totalPages = Math.ceil(reviews.length / reviewsPerPage);
  const visibleReviews = reviews.slice(
    reviewIndex * reviewsPerPage,
    reviewIndex * reviewsPerPage + reviewsPerPage
  );

  const containerVariants = {
    hidden: {},
    show: { transition: { staggerChildren: 0.12 } },
  };
  const itemVariants = {
    hidden: { opacity: 0, y: 24 },
    show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
  };

  return (
    <div className="flex flex-col min-h-screen">
      {/* ── HERO ───────────────────────────────────────── */}
      <section className="relative h-screen max-h-[820px] min-h-[600px] flex items-center justify-center overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0 z-0">
          {restaurant?.heroImageUrl ? (
            <img
              src={restaurant.heroImageUrl}
              alt="Sip of Sky hero"
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-slate-950 via-slate-900 to-amber-950" />
          )}
          <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/50 to-black/70" />
        </div>

        {/* Content */}
        <div className="relative z-10 text-center text-white px-4 max-w-4xl mx-auto">
          {isLoadingRestaurant ? (
            <div className="space-y-4">
              <Skeleton className="h-6 w-28 mx-auto bg-white/15 rounded-full" />
              <Skeleton className="h-20 w-96 mx-auto bg-white/15" />
              <Skeleton className="h-8 w-72 mx-auto bg-white/15" />
            </div>
          ) : (
            <motion.div
              initial="hidden"
              animate="show"
              variants={containerVariants}
              className="flex flex-col items-center gap-6"
            >
              {/* Open / Closed badge */}
              <motion.div variants={itemVariants}>
                <span
                  className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-medium backdrop-blur-sm border ${
                    restaurant?.isOpenNow
                      ? "bg-green-500/20 border-green-400/30 text-green-300"
                      : "bg-white/10 border-white/20 text-white/70"
                  }`}
                >
                  <span
                    className={`h-2 w-2 rounded-full ${restaurant?.isOpenNow ? "bg-green-400 animate-pulse" : "bg-white/50"}`}
                  />
                  {restaurant?.isOpenNow ? "Open Now" : "Currently Closed"}
                  {restaurant && (
                    <span className="opacity-70">
                      · {restaurant.openTime} – {restaurant.closeTime}
                    </span>
                  )}
                </span>
              </motion.div>

              {/* Name */}
              <motion.h1
                variants={itemVariants}
                className="font-serif text-6xl md:text-8xl font-bold tracking-tight leading-none"
              >
                {restaurant?.name || "Sip of Sky"}
              </motion.h1>

              {/* Tagline */}
              <motion.p
                variants={itemVariants}
                className="text-xl md:text-2xl font-light text-white/75 max-w-2xl leading-relaxed"
              >
                {restaurant?.tagline || "Elevated dining above the clouds."}
              </motion.p>

              {/* CTAs */}
              <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-4 mt-2">
                <Link href="/book">
                  <Button
                    size="lg"
                    className="text-base px-8 py-6 rounded-full shadow-lg shadow-primary/30 gap-2"
                  >
                    <CalendarDays className="h-4 w-4" />
                    Reserve a Table
                  </Button>
                </Link>
                <Link href="/menu">
                  <Button
                    size="lg"
                    variant="outline"
                    className="text-base px-8 py-6 rounded-full border-white/40 text-white hover:bg-white/10 backdrop-blur-sm gap-2"
                  >
                    <ShoppingBag className="h-4 w-4" />
                    Order Now
                  </Button>
                </Link>
              </motion.div>

              {/* Quick stats */}
              {!isLoadingSummary && reviewSummary && reviewSummary.totalReviews > 0 && (
                <motion.div
                  variants={itemVariants}
                  className="flex items-center gap-2 text-white/70 text-sm mt-2"
                >
                  <StarRow rating={reviewSummary.averageRating} size="sm" />
                  <span className="font-semibold text-white">{reviewSummary.averageRating.toFixed(1)}</span>
                  <span>· {reviewSummary.totalReviews} guest reviews</span>
                </motion.div>
              )}
            </motion.div>
          )}
        </div>

        {/* Scroll cue */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-1 text-white/40">
          <span className="text-xs tracking-widest uppercase">Scroll</span>
          <div className="h-8 w-px bg-gradient-to-b from-white/30 to-transparent" />
        </div>
      </section>

      {/* ── FEATURED DISHES ─────────────────────────── */}
      <section className="py-24 bg-background">
        <div className="container mx-auto max-w-6xl px-4">
          <div className="text-center mb-16">
            <p className="text-primary text-sm font-semibold tracking-widest uppercase mb-3">Chef's Favourites</p>
            <h2 className="font-serif text-4xl md:text-5xl mb-4">Signature Plates</h2>
            <p className="text-muted-foreground text-lg max-w-xl mx-auto">
              Seasonal creations crafted above the city — every dish designed to linger in memory.
            </p>
          </div>

          {isLoadingDishes ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[1, 2, 3].map((i) => (
                <div key={i} className="space-y-4">
                  <Skeleton className="h-72 w-full rounded-2xl" />
                  <Skeleton className="h-6 w-3/4" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
              ))}
            </div>
          ) : (
            <motion.div
              variants={containerVariants}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, amount: 0.15 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
            >
              {featuredDishes.slice(0, 3).map((dish) => (
                <motion.div key={dish.id} variants={itemVariants} className="group">
                  <div className="relative overflow-hidden rounded-2xl aspect-[4/3] mb-5 bg-muted">
                    {dish.imageUrl ? (
                      <img
                        src={dish.imageUrl}
                        alt={dish.name}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-primary/20 via-muted to-muted/60 flex items-center justify-center">
                        <span className="font-serif text-xl text-muted-foreground/60 px-6 text-center">{dish.name}</span>
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-end p-5">
                      <button
                        onClick={() => addItem({ menuItemId: dish.id, name: dish.name, price: dish.price, quantity: 1 })}
                        className="text-white text-sm font-medium border border-white/40 rounded-full px-4 py-2 hover:bg-white/20 transition-colors"
                      >
                        Add to Cart
                      </button>
                    </div>
                    {/* Tags */}
                    <div className="absolute top-3 left-3 flex gap-1.5">
                      {dish.isVegetarian && (
                        <div className="h-6 w-6 rounded-full bg-green-500/90 flex items-center justify-center" title="Vegetarian">
                          <Leaf className="h-3.5 w-3.5 text-white" />
                        </div>
                      )}
                      {dish.isSpicy && (
                        <div className="h-6 w-6 rounded-full bg-red-500/90 flex items-center justify-center" title="Spicy">
                          <Flame className="h-3.5 w-3.5 text-white" />
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-serif text-2xl leading-snug">{dish.name}</h3>
                    <span className="text-xl font-bold text-primary shrink-0 ml-2">${dish.price.toFixed(2)}</span>
                  </div>
                  <div className="flex items-center gap-2 mb-2">
                    <StarRow rating={dish.rating} size="sm" />
                    <span className="text-xs text-muted-foreground">{dish.rating.toFixed(1)}</span>
                  </div>
                  <p className="text-muted-foreground text-sm leading-relaxed line-clamp-2">{dish.description}</p>
                </motion.div>
              ))}
            </motion.div>
          )}

          <div className="text-center mt-14">
            <Link href="/menu">
              <Button variant="outline" size="lg" className="rounded-full gap-2 px-8">
                View Full Menu <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* ── REVIEW SUMMARY BANNER ─────────────────────── */}
      {!isLoadingSummary && reviewSummary && reviewSummary.totalReviews > 0 && (
        <section className="py-20 bg-primary/5 border-y border-primary/10">
          <div className="container mx-auto max-w-4xl px-4 text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <p className="text-primary text-sm font-semibold tracking-widest uppercase mb-4">Guest Love</p>
              <div className="flex items-center justify-center gap-4 mb-3">
                <StarRow rating={reviewSummary.averageRating} size="lg" />
                <span className="font-serif text-6xl font-bold text-primary">
                  {reviewSummary.averageRating.toFixed(1)}
                </span>
              </div>
              <p className="text-muted-foreground text-lg mb-8">
                Rated by <strong className="text-foreground">{reviewSummary.totalReviews}</strong> verified guests
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                {[
                  { label: "5 star", count: reviewSummary.fiveStarCount },
                  { label: "4 star", count: reviewSummary.fourStarCount },
                  { label: "3 star", count: reviewSummary.threeStarCount },
                ].filter(r => r.count > 0).map((r) => (
                  <span key={r.label} className="px-4 py-2 bg-card border border-card-border rounded-full text-sm font-medium shadow-sm">
                    {r.count} {r.label} {r.count === 1 ? "review" : "reviews"}
                  </span>
                ))}
              </div>
            </motion.div>
          </div>
        </section>
      )}

      {/* ── REVIEWS CAROUSEL ─────────────────────────── */}
      {reviews.length > 0 && (
        <section className="py-24 bg-background">
          <div className="container mx-auto max-w-5xl px-4">
            <div className="flex items-end justify-between mb-12">
              <div>
                <p className="text-primary text-sm font-semibold tracking-widest uppercase mb-3">What Guests Say</p>
                <h2 className="font-serif text-4xl md:text-5xl">Real Reviews</h2>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  className="rounded-full"
                  disabled={reviewIndex === 0}
                  onClick={() => setReviewIndex((i) => Math.max(0, i - 1))}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  className="rounded-full"
                  disabled={reviewIndex >= totalPages - 1}
                  onClick={() => setReviewIndex((i) => Math.min(totalPages - 1, i + 1))}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={reviewIndex}
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -30 }}
                transition={{ duration: 0.4 }}
                className="grid grid-cols-1 md:grid-cols-2 gap-6"
              >
                {visibleReviews.map((review) => (
                  <div
                    key={review.id}
                    className="bg-card border border-card-border rounded-2xl p-7 shadow-sm flex flex-col"
                  >
                    <Quote className="h-7 w-7 text-primary/25 mb-4" />
                    <p className="text-foreground leading-relaxed italic flex-1 mb-6">
                      &ldquo;{review.comment}&rdquo;
                    </p>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold">{review.customerName}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {new Date(review.createdAt).toLocaleDateString("en-US", {
                            month: "long",
                            year: "numeric",
                          })}
                        </p>
                      </div>
                      <StarRow rating={review.rating} size="sm" />
                    </div>
                  </div>
                ))}
              </motion.div>
            </AnimatePresence>

            {/* Dots */}
            {totalPages > 1 && (
              <div className="flex justify-center gap-2 mt-8">
                {Array.from({ length: totalPages }).map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setReviewIndex(i)}
                    className={`h-2 rounded-full transition-all duration-300 ${
                      i === reviewIndex ? "w-6 bg-primary" : "w-2 bg-muted-foreground/30"
                    }`}
                  />
                ))}
              </div>
            )}

            <div className="text-center mt-10">
              <Link href="/reviews">
                <Button variant="link" className="text-primary gap-2">
                  Read all reviews <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* ── INFO + MAP ─────────────────────────────────── */}
      <section className="py-24 bg-muted/30 border-t">
        <div className="container mx-auto max-w-6xl px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Info */}
            <div>
              <p className="text-primary text-sm font-semibold tracking-widest uppercase mb-4">Find Us</p>
              <h2 className="font-serif text-4xl mb-8">Visit Sip of Sky</h2>

              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
                    <MapPin className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-semibold mb-0.5">Location</p>
                    <p className="text-muted-foreground text-sm leading-relaxed">
                      {restaurant?.address || "42nd Floor, Sky Tower, 88 Rooftop Lane, New York, NY 10001"}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
                    <Clock className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-semibold mb-0.5">Hours</p>
                    <p className="text-muted-foreground text-sm">
                      {restaurant?.openTime || "11:00"} – {restaurant?.closeTime || "23:00"}, daily
                    </p>
                    {restaurant && (
                      <span className={`inline-flex items-center gap-1.5 mt-1.5 text-xs font-medium px-2.5 py-1 rounded-full border ${
                        restaurant.isOpenNow
                          ? "bg-green-500/10 text-green-600 border-green-500/20"
                          : "bg-muted text-muted-foreground border-border"
                      }`}>
                        <span className={`h-1.5 w-1.5 rounded-full ${restaurant.isOpenNow ? "bg-green-500 animate-pulse" : "bg-muted-foreground"}`} />
                        {restaurant.isOpenNow ? "Open now" : "Closed"}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
                    <Phone className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-semibold mb-0.5">Phone</p>
                    <a href={`tel:${restaurant?.phone}`} className="text-muted-foreground text-sm hover:text-primary transition-colors">
                      {restaurant?.phone || "+1 (212) 555-0199"}
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
                    <Mail className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-semibold mb-0.5">Email</p>
                    <a href={`mailto:${restaurant?.email}`} className="text-muted-foreground text-sm hover:text-primary transition-colors">
                      {restaurant?.email || "hello@sipofsky.com"}
                    </a>
                  </div>
                </div>
              </div>

              <div className="flex gap-3 mt-10">
                <Link href="/book">
                  <Button className="rounded-full gap-2 px-6">
                    <CalendarDays className="h-4 w-4" /> Book a Table
                  </Button>
                </Link>
                <Link href="/menu">
                  <Button variant="outline" className="rounded-full gap-2 px-6">
                    <ShoppingBag className="h-4 w-4" /> Order Now
                  </Button>
                </Link>
              </div>
            </div>

            {/* Map embed */}
            <div className="rounded-2xl overflow-hidden border border-border shadow-md h-80 lg:h-96 bg-muted">
              {restaurant?.mapEmbedUrl ? (
                <iframe
                  src={restaurant.mapEmbedUrl}
                  className="w-full h-full"
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="Sip of Sky location"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                  <MapPin className="h-10 w-10 opacity-30" />
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA BANNER ─────────────────────────────────── */}
      <section className="relative py-28 overflow-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-amber-950 text-white text-center">
        <div className="absolute inset-0 opacity-20 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-primary via-transparent to-transparent" />
        <div className="relative z-10 container mx-auto max-w-2xl px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="font-serif text-4xl md:text-5xl mb-5 leading-tight">
              An Evening Above the City Awaits
            </h2>
            <p className="text-white/70 text-lg mb-10 leading-relaxed">
              Reserve your table and let us take care of everything else.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/book">
                <Button size="lg" className="rounded-full px-8 py-6 text-base shadow-lg shadow-primary/25 gap-2">
                  <CalendarDays className="h-5 w-5" /> Reserve a Table
                </Button>
              </Link>
              <Link href="/menu">
                <Button
                  size="lg"
                  variant="outline"
                  className="rounded-full px-8 py-6 text-base border-white/30 text-white hover:bg-white/10 gap-2"
                >
                  <ShoppingBag className="h-5 w-5" /> Explore Menu
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
