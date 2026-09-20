import { Router } from "express";
import { db } from "@workspace/db";
import { ordersTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import {
  CreateOrderBody,
  UpdateOrderStatusBody,
  GetOrderParams,
  UpdateOrderStatusParams,
} from "@workspace/api-zod";

const router = Router();

function formatOrder(order: typeof ordersTable.$inferSelect) {
  return {
    ...order,
    totalAmount: Number(order.totalAmount),
    createdAt: order.createdAt.toISOString(),
    items: order.items as Array<{ menuItemId: number; name: string; price: number; quantity: number }>,
  };
}

router.get("/orders", async (req, res) => {
  try {
    const orders = await db.select().from(ordersTable).orderBy(ordersTable.createdAt);
    return res.json(orders.map(formatOrder).reverse());
  } catch (err) {
    req.log.error({ err }, "Failed to list orders");
    return res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/orders", async (req, res) => {
  try {
    const parsed = CreateOrderBody.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error.message });
    }
    const body = parsed.data;
    const [order] = await db.insert(ordersTable).values({
      customerName: body.customerName,
      customerEmail: body.customerEmail,
      customerPhone: body.customerPhone,
      items: body.items as object,
      totalAmount: String(body.totalAmount),
      status: "pending",
      specialInstructions: body.specialInstructions ?? null,
    }).returning();
    return res.status(201).json(formatOrder(order));
  } catch (err) {
    req.log.error({ err }, "Failed to create order");
    return res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/orders/stats", async (req, res) => {
  try {
    const orders = await db.select().from(ordersTable);
    const stats = {
      totalOrders: orders.length,
      totalRevenue: orders.filter(o => o.status !== "cancelled").reduce((sum, o) => sum + Number(o.totalAmount), 0),
      pendingOrders: orders.filter(o => o.status === "pending").length,
      confirmedOrders: orders.filter(o => o.status === "confirmed").length,
      preparingOrders: orders.filter(o => o.status === "preparing").length,
      readyOrders: orders.filter(o => o.status === "ready").length,
      deliveredOrders: orders.filter(o => o.status === "delivered").length,
      cancelledOrders: orders.filter(o => o.status === "cancelled").length,
    };
    return res.json(stats);
  } catch (err) {
    req.log.error({ err }, "Failed to get order stats");
    return res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/orders/:id", async (req, res) => {
  try {
    const params = GetOrderParams.safeParse({ id: Number(req.params.id) });
    if (!params.success) return res.status(400).json({ error: "Invalid id" });
    const rows = await db.select().from(ordersTable).where(eq(ordersTable.id, params.data.id));
    if (rows.length === 0) return res.status(404).json({ error: "Not found" });
    return res.json(formatOrder(rows[0]));
  } catch (err) {
    req.log.error({ err }, "Failed to get order");
    return res.status(500).json({ error: "Internal server error" });
  }
});

router.patch("/orders/:id", async (req, res) => {
  try {
    const params = UpdateOrderStatusParams.safeParse({ id: Number(req.params.id) });
    if (!params.success) return res.status(400).json({ error: "Invalid id" });
    const parsed = UpdateOrderStatusBody.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: parsed.error.message });
    const [order] = await db.update(ordersTable).set({ status: parsed.data.status }).where(eq(ordersTable.id, params.data.id)).returning();
    if (!order) return res.status(404).json({ error: "Not found" });
    return res.json(formatOrder(order));
  } catch (err) {
    req.log.error({ err }, "Failed to update order status");
    return res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
