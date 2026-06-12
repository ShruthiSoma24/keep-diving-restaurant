import { Router } from "express";
import { db } from "@workspace/db";
import { reviewsTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { SubmitReviewBody } from "@workspace/api-zod";

const router = Router();

function formatReview(review: typeof reviewsTable.$inferSelect) {
  return {
    ...review,
    createdAt: review.createdAt.toISOString(),
  };
}

router.get("/reviews", async (req, res) => {
  try {
    const reviews = await db.select().from(reviewsTable).where(eq(reviewsTable.approved, true)).orderBy(reviewsTable.createdAt);
    res.json(reviews.map(formatReview).reverse());
  } catch (err) {
    req.log.error({ err }, "Failed to list reviews");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/reviews", async (req, res) => {
  try {
    const parsed = SubmitReviewBody.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error.message });
    }
    const body = parsed.data;
    if (body.rating < 1 || body.rating > 5) {
      return res.status(400).json({ error: "Rating must be between 1 and 5" });
    }
    const [review] = await db.insert(reviewsTable).values({
      customerName: body.customerName,
      rating: body.rating,
      comment: body.comment,
      approved: true,
    }).returning();
    res.status(201).json(formatReview(review));
  } catch (err) {
    req.log.error({ err }, "Failed to submit review");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/reviews/summary", async (req, res) => {
  try {
    const reviews = await db.select().from(reviewsTable).where(eq(reviewsTable.approved, true));
    const total = reviews.length;
    const avg = total > 0 ? reviews.reduce((sum, r) => sum + r.rating, 0) / total : 0;
    const summary = {
      averageRating: Math.round(avg * 10) / 10,
      totalReviews: total,
      fiveStarCount: reviews.filter(r => r.rating === 5).length,
      fourStarCount: reviews.filter(r => r.rating === 4).length,
      threeStarCount: reviews.filter(r => r.rating === 3).length,
      twoStarCount: reviews.filter(r => r.rating === 2).length,
      oneStarCount: reviews.filter(r => r.rating === 1).length,
    };
    res.json(summary);
  } catch (err) {
    req.log.error({ err }, "Failed to get review summary");
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
