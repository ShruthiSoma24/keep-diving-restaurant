import { Router } from "express";
import { db } from "@workspace/db";
import { menuItemsTable } from "@workspace/db";
import { eq, ilike, and, desc } from "drizzle-orm";
import {
  ListMenuItemsQueryParams,
  CreateMenuItemBody,
  UpdateMenuItemBody,
  GetMenuItemParams,
  UpdateMenuItemParams,
  DeleteMenuItemParams,
} from "@workspace/api-zod";

const router = Router();

router.get("/menu", async (req, res) => {
  try {
    const query = ListMenuItemsQueryParams.safeParse(req.query);
    let items = await db.select().from(menuItemsTable).orderBy(desc(menuItemsTable.rating));

    if (query.success) {
      const { category, search, featured } = query.data;
      items = items.filter((item) => {
        let match = true;
        if (category) match = match && item.category === category;
        if (search) match = match && (item.name.toLowerCase().includes(search.toLowerCase()) || item.description.toLowerCase().includes(search.toLowerCase()));
        if (featured !== undefined) {
          const featuredBool = String(featured) === "true";
          match = match && item.isFeatured === featuredBool;
        }
        return match;
      });
    }

    const result = items.map((item) => ({
      ...item,
      price: Number(item.price),
      rating: Number(item.rating),
      createdAt: item.createdAt.toISOString(),
    }));
    return res.json(result);
  } catch (err) {
    req.log.error({ err }, "Failed to list menu items");
    return res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/menu", async (req, res) => {
  try {
    const parsed = CreateMenuItemBody.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error.message });
    }
    const body = parsed.data;
    const [item] = await db.insert(menuItemsTable).values({
      name: body.name,
      description: body.description,
      price: String(body.price),
      category: body.category,
      imageUrl: body.imageUrl ?? null,
      isVegetarian: body.isVegetarian ?? false,
      isSpicy: body.isSpicy ?? false,
      isFeatured: body.isFeatured ?? false,
      available: body.available ?? true,
    }).returning();
    return res.status(201).json({ ...item, price: Number(item.price), rating: Number(item.rating), createdAt: item.createdAt.toISOString() });
  } catch (err) {
    req.log.error({ err }, "Failed to create menu item");
    return res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/menu/categories", async (req, res) => {
  try {
    const items = await db.select({ category: menuItemsTable.category }).from(menuItemsTable);
    const categories = [...new Set(items.map((i) => i.category))].sort();
    return res.json(categories);
  } catch (err) {
    req.log.error({ err }, "Failed to list categories");
    return res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/menu/featured", async (req, res) => {
  try {
    const items = await db.select().from(menuItemsTable).orderBy(desc(menuItemsTable.rating));
    const featured = items
      .filter((i) => i.isFeatured && i.available)
      .slice(0, 6)
      .map((item) => ({
        ...item,
        price: Number(item.price),
        rating: Number(item.rating),
        createdAt: item.createdAt.toISOString(),
      }));
    return res.json(featured);
  } catch (err) {
    req.log.error({ err }, "Failed to get featured dishes");
    return res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/menu/:id", async (req, res) => {
  try {
    const params = GetMenuItemParams.safeParse({ id: Number(req.params.id) });
    if (!params.success) return res.status(400).json({ error: "Invalid id" });
    const rows = await db.select().from(menuItemsTable).where(eq(menuItemsTable.id, params.data.id));
    if (rows.length === 0) return res.status(404).json({ error: "Not found" });
    const item = rows[0];
    return res.json({ ...item, price: Number(item.price), rating: Number(item.rating), createdAt: item.createdAt.toISOString() });
  } catch (err) {
    req.log.error({ err }, "Failed to get menu item");
    return res.status(500).json({ error: "Internal server error" });
  }
});

router.patch("/menu/:id", async (req, res) => {
  try {
    const params = UpdateMenuItemParams.safeParse({ id: Number(req.params.id) });
    if (!params.success) return res.status(400).json({ error: "Invalid id" });
    const parsed = UpdateMenuItemBody.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: parsed.error.message });
    const body = parsed.data;
    const updates: Record<string, unknown> = {};
    if (body.name !== undefined) updates.name = body.name;
    if (body.description !== undefined) updates.description = body.description;
    if (body.price !== undefined) updates.price = String(body.price);
    if (body.category !== undefined) updates.category = body.category;
    if (body.imageUrl !== undefined) updates.imageUrl = body.imageUrl;
    if (body.isVegetarian !== undefined) updates.isVegetarian = body.isVegetarian;
    if (body.isSpicy !== undefined) updates.isSpicy = body.isSpicy;
    if (body.isFeatured !== undefined) updates.isFeatured = body.isFeatured;
    if (body.available !== undefined) updates.available = body.available;
    const [item] = await db.update(menuItemsTable).set(updates).where(eq(menuItemsTable.id, params.data.id)).returning();
    if (!item) return res.status(404).json({ error: "Not found" });
    return res.json({ ...item, price: Number(item.price), rating: Number(item.rating), createdAt: item.createdAt.toISOString() });
  } catch (err) {
    req.log.error({ err }, "Failed to update menu item");
    return res.status(500).json({ error: "Internal server error" });
  }
});

router.delete("/menu/:id", async (req, res) => {
  try {
    const params = DeleteMenuItemParams.safeParse({ id: Number(req.params.id) });
    if (!params.success) return res.status(400).json({ error: "Invalid id" });
    await db.delete(menuItemsTable).where(eq(menuItemsTable.id, params.data.id));
    return res.status(204).send();
  } catch (err) {
    req.log.error({ err }, "Failed to delete menu item");
    return res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
