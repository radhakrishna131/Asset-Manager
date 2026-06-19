import { Router } from "express";
import { db } from "@workspace/db";
import { categoriesTable, productsTable } from "@workspace/db";
import { eq, sql } from "drizzle-orm";
import { CreateCategoryBody } from "@workspace/api-zod";

const router = Router();

router.get("/categories", async (req, res) => {
  const rows = await db.select().from(categoriesTable).orderBy(categoriesTable.name);

  const countRows = await db
    .select({ category: productsTable.category, count: sql<number>`count(*)::int` })
    .from(productsTable)
    .groupBy(productsTable.category);

  const countMap = new Map(countRows.map((r) => [r.category.toLowerCase(), r.count]));

  res.json(
    rows.map((cat) => ({
      ...cat,
      productCount: countMap.get(cat.slug.toLowerCase()) ?? 0,
    }))
  );
});

router.post("/categories", async (req, res) => {
  const session = (req as any).session;
  if (!session?.adminAuthenticated) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  const parsed = CreateCategoryBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [row] = await db.insert(categoriesTable).values(parsed.data).returning();
  res.status(201).json({ ...row, productCount: 0 });
});

export default router;
