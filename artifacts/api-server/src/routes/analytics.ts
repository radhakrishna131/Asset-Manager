import { Router } from "express";
import { db } from "@workspace/db";
import { productsTable, clickEventsTable, categoriesTable } from "@workspace/db";
import { desc, sql, gte } from "drizzle-orm";
import { GetTopProductsQueryParams } from "@workspace/api-zod";

const router = Router();

router.get("/analytics/summary", async (req, res) => {
  const session = (req as any).session;
  if (!session?.adminAuthenticated) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 7);

  const [
    totalProductsResult,
    totalClicksResult,
    totalCategoriesResult,
    topCategoryResult,
    avgDiscountResult,
    clicksTodayResult,
    newProductsResult,
  ] = await Promise.all([
    db.select({ count: sql<number>`count(*)::int` }).from(productsTable),
    db.select({ total: sql<number>`sum(click_count)::int` }).from(productsTable),
    db.select({ count: sql<number>`count(*)::int` }).from(categoriesTable),
    db
      .select({ category: productsTable.category, count: sql<number>`count(*)::int` })
      .from(productsTable)
      .groupBy(productsTable.category)
      .orderBy(desc(sql`count(*)`))
      .limit(1),
    db
      .select({ avg: sql<number>`avg(discount_percent)::numeric(5,1)` })
      .from(productsTable)
      .where(gte(productsTable.discountPercent, 1)),
    db
      .select({ count: sql<number>`count(*)::int` })
      .from(clickEventsTable)
      .where(gte(clickEventsTable.clickedAt, today)),
    db
      .select({ count: sql<number>`count(*)::int` })
      .from(productsTable)
      .where(gte(productsTable.createdAt, weekAgo)),
  ]);

  res.json({
    totalProducts: totalProductsResult[0]?.count ?? 0,
    totalClicks: totalClicksResult[0]?.total ?? 0,
    totalCategories: totalCategoriesResult[0]?.count ?? 0,
    topCategory: topCategoryResult[0]?.category ?? null,
    averageDiscount: avgDiscountResult[0]?.avg ? parseFloat(String(avgDiscountResult[0].avg)) : null,
    clicksToday: clicksTodayResult[0]?.count ?? 0,
    newProductsThisWeek: newProductsResult[0]?.count ?? 0,
  });
});

router.get("/analytics/top-products", async (req, res) => {
  const session = (req as any).session;
  if (!session?.adminAuthenticated) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  const parsed = GetTopProductsQueryParams.safeParse(req.query);
  const limit = parsed.success ? (parsed.data.limit ?? 10) : 10;

  const rows = await db
    .select()
    .from(productsTable)
    .orderBy(desc(productsTable.clickCount))
    .limit(limit);

  res.json(
    rows.map((r) => ({
      id: r.id,
      title: r.title,
      clickCount: r.clickCount,
      category: r.category,
      price: parseFloat(r.price as string),
      images: (r.images as string[]) ?? [],
    }))
  );
});

export default router;
