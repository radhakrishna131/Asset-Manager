import { Router } from "express";
import { db } from "@workspace/db";
import { productsTable, clickEventsTable } from "@workspace/db";
import { eq, ilike, gte, lte, desc, asc, sql, and, type SQL } from "drizzle-orm";
import {
  ListProductsQueryParams,
  CreateProductBody,
  GetProductParams,
  UpdateProductParams,
  UpdateProductBody,
  DeleteProductParams,
  TrackProductClickParams,
  GetFeaturedProductsQueryParams,
  GetTrendingProductsQueryParams,
  GetDealsProductsQueryParams,
  ScrapeProductUrlBody,
} from "@workspace/api-zod";

const router = Router();

function computeDiscount(price: number, originalPrice: number | null | undefined): number | null {
  if (!originalPrice || originalPrice <= price) return null;
  return Math.round(((originalPrice - price) / originalPrice) * 100);
}

function toProduct(row: typeof productsTable.$inferSelect) {
  const price = parseFloat(row.price as string);
  const originalPrice = row.originalPrice ? parseFloat(row.originalPrice as string) : null;
  return {
    ...row,
    price,
    originalPrice,
    rating: row.rating ? parseFloat(row.rating as string) : null,
    discountPercent: row.discountPercent ?? computeDiscount(price, originalPrice),
    images: (row.images as string[]) ?? [],
    specifications: (row.specifications as Record<string, string>) ?? {},
  };
}

router.get("/products/featured", async (req, res) => {
  const parsed = GetFeaturedProductsQueryParams.safeParse(req.query);
  const limit = parsed.success ? (parsed.data.limit ?? 8) : 8;
  const rows = await db.select().from(productsTable)
    .where(eq(productsTable.featured, true))
    .orderBy(desc(productsTable.createdAt))
    .limit(limit);
  res.json(rows.map(toProduct));
});

router.get("/products/trending", async (req, res) => {
  const parsed = GetTrendingProductsQueryParams.safeParse(req.query);
  const limit = parsed.success ? (parsed.data.limit ?? 8) : 8;
  const rows = await db.select().from(productsTable)
    .orderBy(desc(productsTable.clickCount))
    .limit(limit);
  res.json(rows.map(toProduct));
});

router.get("/products/deals", async (req, res) => {
  const parsed = GetDealsProductsQueryParams.safeParse(req.query);
  const limit = parsed.success ? (parsed.data.limit ?? 8) : 8;
  const rows = await db.select().from(productsTable)
    .where(gte(productsTable.discountPercent, 1))
    .orderBy(desc(productsTable.discountPercent))
    .limit(limit);
  res.json(rows.map(toProduct));
});

router.get("/products", async (req, res) => {
  const parsed = ListProductsQueryParams.safeParse(req.query);

  const page = parsed.success ? (parsed.data.page ?? 1) : 1;
  const limit = parsed.success ? (parsed.data.limit ?? 24) : 24;
  const offset = (page - 1) * limit;

  const conditions: SQL[] = [];

  if (parsed.success) {
    const p = parsed.data;
    if (p.search) {
      conditions.push(ilike(productsTable.title, `%${p.search}%`));
    }
    if (p.category) {
      conditions.push(ilike(productsTable.category, p.category));
    }
    if (p.minPrice !== undefined) {
      conditions.push(gte(sql`${productsTable.price}::numeric`, p.minPrice));
    }
    if (p.maxPrice !== undefined) {
      conditions.push(lte(sql`${productsTable.price}::numeric`, p.maxPrice));
    }
    if (p.minRating !== undefined) {
      conditions.push(gte(sql`${productsTable.rating}::numeric`, p.minRating));
    }
    if (p.featured !== undefined) {
      conditions.push(eq(productsTable.featured, p.featured));
    }
  }

  const where = conditions.length > 0 ? and(...conditions) : undefined;

  let orderBy;
  const sort = parsed.success ? parsed.data.sort : undefined;
  switch (sort) {
    case "popular": orderBy = desc(productsTable.clickCount); break;
    case "highest_rated": orderBy = desc(sql`${productsTable.rating}::numeric`); break;
    case "lowest_price": orderBy = asc(sql`${productsTable.price}::numeric`); break;
    case "highest_price": orderBy = desc(sql`${productsTable.price}::numeric`); break;
    case "biggest_discount": orderBy = desc(productsTable.discountPercent); break;
    case "latest": orderBy = desc(productsTable.createdAt); break;
    default: orderBy = desc(productsTable.createdAt);
  }

  const [rows, countResult] = await Promise.all([
    db.select().from(productsTable)
      .where(where)
      .orderBy(orderBy)
      .limit(limit)
      .offset(offset),
    db.select({ count: sql<number>`count(*)::int` }).from(productsTable).where(where),
  ]);

  res.json({
    products: rows.map(toProduct),
    total: countResult[0]?.count ?? 0,
    page,
    limit,
  });
});

router.post("/products/scrape", async (req, res) => {
  const session = (req as any).session;
  if (!session?.adminAuthenticated) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  const parsed = ScrapeProductUrlBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "URL is required" });
    return;
  }

  const { url } = parsed.data;

  try {
    const { default: fetch } = await import("node-fetch");
    const cheerio = await import("cheerio");

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    const response = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      },
      signal: controller.signal as any,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      res.status(400).json({ error: `Failed to fetch URL: ${response.status}` });
      return;
    }

    const html = await response.text();
    const $ = cheerio.load(html);

    const getMetaContent = (name: string) =>
      $(`meta[property="${name}"]`).attr("content") ||
      $(`meta[name="${name}"]`).attr("content") ||
      "";

    const title =
      getMetaContent("og:title") ||
      $("h1").first().text().trim() ||
      $("title").text().trim() ||
      "";

    const description =
      getMetaContent("og:description") ||
      getMetaContent("description") ||
      "";

    const ogImage = getMetaContent("og:image");
    const images: string[] = ogImage ? [ogImage] : [];

    const priceText =
      $('[class*="price"]').first().text().trim() ||
      $('[itemprop="price"]').attr("content") ||
      $('[data-price]').attr("data-price") ||
      "";

    const priceMatch = priceText.match(/[\d,]+\.?\d*/);
    const price = priceMatch ? parseFloat(priceMatch[0].replace(/,/g, "")) : null;

    const brand =
      $('[itemprop="brand"]').text().trim() ||
      $('[class*="brand"]').first().text().trim() ||
      "";

    const storeUrl = new URL(url);
    const store = storeUrl.hostname.replace("www.", "");

    const rating =
      parseFloat($('[itemprop="ratingValue"]').attr("content") || "") || null;
    const reviewCount =
      parseInt($('[itemprop="reviewCount"]').attr("content") || "") || null;

    res.json({
      title: title.slice(0, 500),
      description: description.slice(0, 2000) || null,
      price,
      originalPrice: null,
      currency: "USD",
      images,
      brand: brand.slice(0, 200) || null,
      category: null,
      rating,
      reviewCount,
      store,
      affiliateUrl: url,
      specifications: {},
    });
  } catch (err) {
    req.log.error({ err }, "Scrape error");
    res.status(400).json({ error: "Failed to scrape URL. Please fill in product details manually." });
  }
});

router.post("/products", async (req, res) => {
  const session = (req as any).session;
  if (!session?.adminAuthenticated) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  const parsed = CreateProductBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const data = parsed.data;
  const price = data.price;
  const originalPrice = data.originalPrice ?? null;
  const discountPercent = computeDiscount(price, originalPrice);

  const [row] = await db.insert(productsTable).values({
    title: data.title,
    description: data.description ?? null,
    price: String(price),
    originalPrice: originalPrice ? String(originalPrice) : null,
    discountPercent,
    currency: data.currency ?? "USD",
    images: data.images ?? [],
    brand: data.brand ?? null,
    category: data.category,
    rating: data.rating ? String(data.rating) : null,
    reviewCount: data.reviewCount ?? null,
    affiliateUrl: data.affiliateUrl,
    store: data.store ?? null,
    specifications: (data.specifications ?? {}) as Record<string, string>,
    featured: data.featured ?? false,
    inStock: data.inStock ?? true,
    sourceUrl: data.sourceUrl ?? null,
  }).returning();

  res.status(201).json(toProduct(row));
});

router.get("/products/:id", async (req, res) => {
  const parsed = GetProductParams.safeParse(req.params);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid ID" });
    return;
  }

  const [row] = await db.select().from(productsTable).where(eq(productsTable.id, parsed.data.id));
  if (!row) {
    res.status(404).json({ error: "Product not found" });
    return;
  }
  res.json(toProduct(row));
});

router.patch("/products/:id", async (req, res) => {
  const session = (req as any).session;
  if (!session?.adminAuthenticated) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  const paramsParsed = UpdateProductParams.safeParse(req.params);
  const bodyParsed = UpdateProductBody.safeParse(req.body);
  if (!paramsParsed.success || !bodyParsed.success) {
    res.status(400).json({ error: "Invalid input" });
    return;
  }

  const { id } = paramsParsed.data;
  const data = bodyParsed.data;

  const updateData: Record<string, unknown> = { updatedAt: new Date() };
  if (data.title !== undefined) updateData.title = data.title;
  if (data.description !== undefined) updateData.description = data.description;
  if (data.price !== undefined) {
    updateData.price = String(data.price);
    const origPrice = data.originalPrice ?? null;
    updateData.discountPercent = computeDiscount(data.price, origPrice);
  }
  if (data.originalPrice !== undefined) updateData.originalPrice = data.originalPrice ? String(data.originalPrice) : null;
  if (data.currency !== undefined) updateData.currency = data.currency;
  if (data.images !== undefined) updateData.images = data.images;
  if (data.brand !== undefined) updateData.brand = data.brand;
  if (data.category !== undefined) updateData.category = data.category;
  if (data.rating !== undefined) updateData.rating = data.rating ? String(data.rating) : null;
  if (data.reviewCount !== undefined) updateData.reviewCount = data.reviewCount;
  if (data.affiliateUrl !== undefined) updateData.affiliateUrl = data.affiliateUrl;
  if (data.store !== undefined) updateData.store = data.store;
  if (data.specifications !== undefined) updateData.specifications = data.specifications as Record<string, string>;
  if (data.featured !== undefined) updateData.featured = data.featured;
  if (data.inStock !== undefined) updateData.inStock = data.inStock;

  const [row] = await db.update(productsTable)
    .set(updateData as Parameters<typeof db.update>[0] extends infer T ? any : never)
    .where(eq(productsTable.id, id))
    .returning();
  if (!row) {
    res.status(404).json({ error: "Product not found" });
    return;
  }
  res.json(toProduct(row));
});

router.delete("/products/:id", async (req, res) => {
  const session = (req as any).session;
  if (!session?.adminAuthenticated) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  const parsed = DeleteProductParams.safeParse(req.params);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid ID" });
    return;
  }

  const result = await db.delete(productsTable).where(eq(productsTable.id, parsed.data.id));
  if ((result as any).rowCount === 0) {
    res.status(404).json({ error: "Product not found" });
    return;
  }
  res.status(204).send();
});

router.post("/products/:id/click", async (req, res) => {
  const parsed = TrackProductClickParams.safeParse(req.params);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid ID" });
    return;
  }

  const { id } = parsed.data;

  await db.insert(clickEventsTable).values({
    productId: id,
    userAgent: req.headers["user-agent"] ?? null,
    referer: req.headers["referer"] ?? null,
  });

  const [updated] = await db.update(productsTable)
    .set({ clickCount: sql`${productsTable.clickCount} + 1` })
    .where(eq(productsTable.id, id))
    .returning({ clickCount: productsTable.clickCount });

  res.json({ success: true, clickCount: updated?.clickCount ?? 0 });
});

export default router;
