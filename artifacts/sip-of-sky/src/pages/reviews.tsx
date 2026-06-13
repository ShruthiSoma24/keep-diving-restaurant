import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion } from "framer-motion";
import { useListReviews, useGetReviewSummary, useSubmitReview } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Star, Quote, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

const reviewSchema = z.object({
  customerName: z.string().min(2, "Name must be at least 2 characters"),
  rating: z.number().min(1, "Please select a rating").max(5),
  comment: z.string().min(20, "Please share at least 20 characters"),
});
type ReviewFormData = z.infer<typeof reviewSchema>;

function StarRatingInput({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  const [hovered, setHovered] = useState(0);
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map(star => (
        <button
          key={star}
          type="button"
          onClick={() => onChange(star)}
          onMouseEnter={() => setHovered(star)}
          onMouseLeave={() => setHovered(0)}
          className="transition-transform active:scale-90"
        >
          <Star
            className={`h-8 w-8 transition-colors duration-100 ${
              star <= (hovered || value)
                ? "fill-primary text-primary"
                : "text-muted-foreground/30 fill-transparent"
            }`}
          />
        </button>
      ))}
    </div>
  );
}

function RatingBar({ label, count, total }: { label: string; count: number; total: number }) {
  const pct = total > 0 ? (count / total) * 100 : 0;
  return (
    <div className="flex items-center gap-3">
      <span className="text-xs text-muted-foreground w-10 text-right shrink-0">{label}</span>
      <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
        <motion.div
          className="h-full bg-primary rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        />
      </div>
      <span className="text-xs text-muted-foreground w-6 shrink-0">{count}</span>
    </div>
  );
}

function ReviewCard({ review, index }: {
  review: { id: number; customerName: string; rating: number; comment: string; createdAt: string };
  index: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.06, duration: 0.4 }}
      className="bg-card border border-card-border rounded-2xl p-6 shadow-sm"
    >
      <Quote className="h-6 w-6 text-primary/30 mb-3" />
      <p className="text-foreground leading-relaxed mb-5 italic">&ldquo;{review.comment}&rdquo;</p>
      <div className="flex items-center justify-between">
        <div>
          <p className="font-semibold text-sm">{review.customerName}</p>
          <p className="text-xs text-muted-foreground">
            {new Date(review.createdAt).toLocaleDateString("en-US", { month: "long", year: "numeric" })}
          </p>
        </div>
        <div className="flex gap-0.5">
          {[1, 2, 3, 4, 5].map(s => (
            <Star key={s} className={`h-4 w-4 ${s <= review.rating ? "fill-primary text-primary" : "text-muted-foreground/20 fill-transparent"}`} />
          ))}
        </div>
      </div>
    </motion.div>
  );
}

export default function Reviews() {
  const { data: reviews = [], isLoading: isLoadingReviews, refetch } = useListReviews();
  const { data: summary, isLoading: isLoadingSummary } = useGetReviewSummary();
  const submitReview = useSubmitReview();
  const [submitted, setSubmitted] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ReviewFormData>({
    resolver: zodResolver(reviewSchema),
    defaultValues: { rating: 0 },
  });

  const rating = watch("rating");

  const onSubmit = (data: ReviewFormData) => {
    return new Promise<void>((resolve) => {
      submitReview.mutate(
        { data: { customerName: data.customerName, rating: data.rating, comment: data.comment } },
        {
          onSuccess: () => {
            toast.success("Thank you for your review!");
            setSubmitted(true);
            reset();
            refetch();
            resolve();
          },
          onError: () => {
            toast.error("Failed to submit review. Please try again.");
            resolve();
          },
        }
      );
    });
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-gradient-to-b from-muted/50 to-background pt-16 pb-12 px-4 text-center">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="font-serif text-4xl md:text-5xl mb-3">Guest Experiences</h1>
          <p className="text-muted-foreground text-lg max-w-lg mx-auto">
            Real stories from real guests — every visit, every memory.
          </p>
        </motion.div>
      </div>

      <div className="container mx-auto max-w-5xl px-4 pb-20">
        {/* Summary Card */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-card border border-card-border rounded-2xl p-8 shadow-sm mb-14"
        >
          {isLoadingSummary ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <Skeleton className="h-32 w-full rounded-xl" />
              <div className="space-y-3">
                {[1,2,3,4,5].map(i => <Skeleton key={i} className="h-4 w-full" />)}
              </div>
            </div>
          ) : summary ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
              <div className="text-center">
                <div className="text-7xl font-bold text-primary mb-2">{summary.averageRating.toFixed(1)}</div>
                <div className="flex justify-center gap-1 mb-3">
                  {[1, 2, 3, 4, 5].map(s => (
                    <Star key={s} className={`h-6 w-6 ${s <= Math.round(summary.averageRating) ? "fill-primary text-primary" : "text-muted-foreground/20 fill-transparent"}`} />
                  ))}
                </div>
                <p className="text-muted-foreground">Based on {summary.totalReviews} review{summary.totalReviews !== 1 ? "s" : ""}</p>
              </div>
              <div className="space-y-2.5">
                <RatingBar label="5 stars" count={summary.fiveStarCount} total={summary.totalReviews} />
                <RatingBar label="4 stars" count={summary.fourStarCount} total={summary.totalReviews} />
                <RatingBar label="3 stars" count={summary.threeStarCount} total={summary.totalReviews} />
                <RatingBar label="2 stars" count={summary.twoStarCount} total={summary.totalReviews} />
                <RatingBar label="1 star" count={summary.oneStarCount} total={summary.totalReviews} />
              </div>
            </div>
          ) : null}
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* Review List */}
          <div className="lg:col-span-2">
            <h2 className="font-serif text-2xl mb-6">All Reviews</h2>
            {isLoadingReviews ? (
              <div className="space-y-4">
                {[1,2,3].map(i => (
                  <div key={i} className="bg-card border border-card-border rounded-2xl p-6 space-y-3">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-4/5" />
                    <Skeleton className="h-4 w-1/3" />
                  </div>
                ))}
              </div>
            ) : reviews.length === 0 ? (
              <div className="text-center py-16 bg-muted/30 rounded-2xl">
                <Star className="h-12 w-12 text-muted-foreground/25 mx-auto mb-4" />
                <p className="text-muted-foreground">No reviews yet. Be the first to share your experience!</p>
              </div>
            ) : (
              <div className="space-y-5">
                {reviews.map((review, i) => (
                  <ReviewCard key={review.id} review={review} index={i} />
                ))}
              </div>
            )}
          </div>

          {/* Submit Form */}
          <div className="lg:col-span-1">
            <div className="sticky top-24">
              <h2 className="font-serif text-2xl mb-6">Share Your Experience</h2>

              {submitted ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-green-500/10 border border-green-500/20 rounded-2xl p-8 text-center"
                >
                  <CheckCircle2 className="h-12 w-12 text-green-500 mx-auto mb-4" />
                  <p className="font-serif text-xl mb-2">Thank you!</p>
                  <p className="text-sm text-muted-foreground mb-4">Your review has been published.</p>
                  <Button variant="outline" size="sm" className="rounded-full" onClick={() => setSubmitted(false)}>
                    Write Another
                  </Button>
                </motion.div>
              ) : (
                <form onSubmit={handleSubmit(onSubmit)} className="bg-card border border-card-border rounded-2xl p-6 shadow-sm space-y-5">
                  <div className="space-y-1.5">
                    <Label htmlFor="reviewName" className="text-sm">Your Name</Label>
                    <Input id="reviewName" placeholder="Alexandra Chen" {...register("customerName")}
                      className={errors.customerName ? "border-destructive" : ""} />
                    {errors.customerName && <p className="text-xs text-destructive">{errors.customerName.message}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm">Rating</Label>
                    <StarRatingInput value={rating} onChange={v => setValue("rating", v, { shouldValidate: true })} />
                    {errors.rating && <p className="text-xs text-destructive">{errors.rating.message}</p>}
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="comment" className="text-sm">Your Review</Label>
                    <Textarea id="comment" rows={4}
                      placeholder="Tell us about your dining experience..."
                      {...register("comment")}
                      className={errors.comment ? "border-destructive" : ""} />
                    {errors.comment && <p className="text-xs text-destructive">{errors.comment.message}</p>}
                  </div>

                  <Button
                    type="submit"
                    disabled={isSubmitting || submitReview.isPending}
                    className="w-full rounded-full gap-2"
                  >
                    {isSubmitting || submitReview.isPending ? (
                      <span className="flex items-center gap-2">
                        <span className="h-3.5 w-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Submitting...
                      </span>
                    ) : "Submit Review"}
                  </Button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
