import React from "react";
import { Link } from "wouter";
import { useGetRestaurantInfo, useGetFeaturedDishes, useGetReviewSummary, useListReviews } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Star, MapPin, Clock, Phone } from "lucide-react";
import { motion } from "framer-motion";

export default function Home() {
  const { data: restaurant, isLoading: isLoadingRestaurant } = useGetRestaurantInfo();
  const { data: featuredDishes, isLoading: isLoadingDishes } = useGetFeaturedDishes();
  const { data: reviewSummary, isLoading: isLoadingSummary } = useGetReviewSummary();
  const { data: reviews, isLoading: isLoadingReviews } = useListReviews();

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative h-[80vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-black/60 z-10" />
        {restaurant?.heroImageUrl ? (
          <img src={restaurant.heroImageUrl} alt="Hero" className="absolute inset-0 w-full h-full object-cover" />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-950 via-slate-900 to-amber-900" />
        )}
        
        <div className="relative z-20 text-center text-white px-4 flex flex-col items-center">
          {isLoadingRestaurant ? (
            <Skeleton className="h-16 w-64 bg-white/20 mb-4" />
          ) : (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
              {restaurant?.isOpenNow && (
                <Badge variant="secondary" className="mb-6 bg-white/10 text-white border-white/20 backdrop-blur-md">
                  Open Now
                </Badge>
              )}
              <h1 className="text-5xl md:text-7xl font-serif font-bold tracking-tight mb-4">
                {restaurant?.name || "Sip of Sky"}
              </h1>
              <p className="text-xl md:text-2xl font-light text-white/80 max-w-2xl mx-auto mb-8">
                {restaurant?.tagline || "Elevated dining above the clouds."}
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/book">
                  <Button size="lg" className="w-full sm:w-auto text-lg px-8 py-6 rounded-full bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg shadow-primary/20">
                    Reserve a Table
                  </Button>
                </Link>
                <Link href="/menu">
                  <Button size="lg" variant="outline" className="w-full sm:w-auto text-lg px-8 py-6 rounded-full border-white text-white hover:bg-white/10 backdrop-blur-md">
                    Explore Menu
                  </Button>
                </Link>
              </div>
            </motion.div>
          )}
        </div>
      </section>

      {/* Featured Dishes */}
      <section className="py-24 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-serif mb-4">Chef's Selection</h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Curated plates designed to elevate your evening.
            </p>
          </div>

          {isLoadingDishes ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[1, 2, 3].map((i) => (
                <div key={i} className="space-y-4">
                  <Skeleton className="h-64 w-full rounded-2xl" />
                  <Skeleton className="h-6 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {featuredDishes?.slice(0, 3).map((dish, i) => (
                <motion.div 
                  key={dish.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1, duration: 0.5 }}
                  className="group"
                >
                  <div className="relative overflow-hidden rounded-2xl aspect-[4/3] mb-6">
                    {dish.imageUrl ? (
                      <img src={dish.imageUrl} alt={dish.name} className="object-cover w-full h-full transition-transform duration-700 group-hover:scale-105" />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-tr from-muted to-muted/50 flex items-center justify-center">
                        <span className="font-serif text-2xl text-muted-foreground">{dish.name}</span>
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  </div>
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-2xl font-serif">{dish.name}</h3>
                    <span className="text-xl font-medium text-primary">${dish.price.toFixed(2)}</span>
                  </div>
                  <p className="text-muted-foreground">{dish.description}</p>
                </motion.div>
              ))}
            </div>
          )}
          
          <div className="text-center mt-12">
            <Link href="/order">
              <Button variant="outline" size="lg" className="rounded-full">Order Now</Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Reviews Summary */}
      <section className="py-24 bg-muted/30">
        <div className="container mx-auto px-4 text-center">
          {isLoadingSummary ? (
            <Skeleton className="h-32 w-64 mx-auto" />
          ) : reviewSummary ? (
            <div className="flex flex-col items-center">
              <h2 className="text-3xl font-serif mb-6">Guest Experiences</h2>
              <div className="flex items-center gap-4 mb-4">
                <div className="flex gap-1 text-primary">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className={`h-8 w-8 ${i < Math.round(reviewSummary.averageRating) ? "fill-primary" : "fill-muted text-muted"}`} />
                  ))}
                </div>
                <span className="text-4xl font-bold">{reviewSummary.averageRating.toFixed(1)}</span>
              </div>
              <p className="text-muted-foreground text-lg mb-8">Based on {reviewSummary.totalReviews} reviews</p>
              
              <Link href="/reviews">
                <Button variant="link" className="text-primary hover:text-primary/80">Read all reviews →</Button>
              </Link>
            </div>
          ) : null}
        </div>
      </section>

      {/* Info Section */}
      <section className="py-24 bg-background border-t">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-center">
            <div className="flex flex-col items-center p-6">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-6 text-primary">
                <MapPin className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-serif mb-2">Location</h3>
              <p className="text-muted-foreground">{restaurant?.address || "123 Skyview Ave, Rooftop"}</p>
            </div>
            
            <div className="flex flex-col items-center p-6">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-6 text-primary">
                <Clock className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-serif mb-2">Hours</h3>
              <p className="text-muted-foreground">
                {restaurant?.openTime || "5:00 PM"} - {restaurant?.closeTime || "12:00 AM"}
              </p>
            </div>
            
            <div className="flex flex-col items-center p-6">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-6 text-primary">
                <Phone className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-serif mb-2">Contact</h3>
              <p className="text-muted-foreground">{restaurant?.phone || "(555) 123-4567"}</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
