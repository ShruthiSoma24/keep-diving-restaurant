import { Router } from "express";
import { db } from "@workspace/db";
import { bookingsTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import {
  CreateBookingBody,
  UpdateBookingStatusBody,
  GetBookingParams,
  UpdateBookingStatusParams,
} from "@workspace/api-zod";

const router = Router();

function formatBooking(booking: typeof bookingsTable.$inferSelect) {
  return {
    ...booking,
    createdAt: booking.createdAt.toISOString(),
  };
}

router.get("/bookings", async (req, res) => {
  try {
    const bookings = await db.select().from(bookingsTable).orderBy(bookingsTable.createdAt);
    res.json(bookings.map(formatBooking).reverse());
  } catch (err) {
    req.log.error({ err }, "Failed to list bookings");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/bookings", async (req, res) => {
  try {
    const parsed = CreateBookingBody.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error.message });
    }
    const body = parsed.data;
    const [booking] = await db.insert(bookingsTable).values({
      customerName: body.customerName,
      customerEmail: body.customerEmail,
      customerPhone: body.customerPhone,
      date: body.date,
      time: body.time,
      partySize: body.partySize,
      specialRequests: body.specialRequests ?? null,
      status: "pending",
    }).returning();
    res.status(201).json(formatBooking(booking));
  } catch (err) {
    req.log.error({ err }, "Failed to create booking");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/bookings/:id", async (req, res) => {
  try {
    const params = GetBookingParams.safeParse({ id: Number(req.params.id) });
    if (!params.success) return res.status(400).json({ error: "Invalid id" });
    const rows = await db.select().from(bookingsTable).where(eq(bookingsTable.id, params.data.id));
    if (rows.length === 0) return res.status(404).json({ error: "Not found" });
    res.json(formatBooking(rows[0]));
  } catch (err) {
    req.log.error({ err }, "Failed to get booking");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.patch("/bookings/:id", async (req, res) => {
  try {
    const params = UpdateBookingStatusParams.safeParse({ id: Number(req.params.id) });
    if (!params.success) return res.status(400).json({ error: "Invalid id" });
    const parsed = UpdateBookingStatusBody.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: parsed.error.message });
    const [booking] = await db.update(bookingsTable).set({ status: parsed.data.status }).where(eq(bookingsTable.id, params.data.id)).returning();
    if (!booking) return res.status(404).json({ error: "Not found" });
    res.json(formatBooking(booking));
  } catch (err) {
    req.log.error({ err }, "Failed to update booking status");
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
