import { Router } from "express";
import { db } from "@workspace/db";
import { restaurantInfoTable } from "@workspace/db";

const router = Router();

router.get("/restaurant", async (req, res) => {
  try {
    const rows = await db.select().from(restaurantInfoTable).limit(1);
    if (rows.length === 0) {
      return res.status(404).json({ error: "Restaurant info not found" });
    }
    const info = rows[0];

    const now = new Date();
    const hours = now.getHours();
    const minutes = now.getMinutes();
    const currentMinutes = hours * 60 + minutes;

    const [openH, openM] = info.openTime.split(":").map(Number);
    const [closeH, closeM] = info.closeTime.split(":").map(Number);
    const openMinutes = openH * 60 + openM;
    const closeMinutes = closeH * 60 + closeM;
    const isOpenNow = currentMinutes >= openMinutes && currentMinutes < closeMinutes;

    res.json({ ...info, isOpenNow });
  } catch (err) {
    req.log.error({ err }, "Failed to get restaurant info");
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
