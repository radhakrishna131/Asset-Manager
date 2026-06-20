import { db } from "@workspace/db";
import { productsTable } from "@workspace/db";
import { eq, isNull, asc } from "drizzle-orm";
import { logger } from "./logger";

interface SyncResult {
  price?: number;
  originalPrice?: number | null;
  discountPercent?: number | null;
  rating?: number | null;
  reviewCount?: number | null;
  inStock?: boolean;
}

function extractJsonLd(html: string): SyncResult | null {
  const matches = html.match(/<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi);
  if (!matches) return null;

  for (const match of matches) {
    try {
      const jsonContent = match.replace(/<script[^>]+>/i, "").replace(/<\/script>/i, "").trim();
      const data = JSON.parse(jsonContent);
      const items = Array.isArray(data) ? data : [data];

      for (const item of items) {
        const type = item["@type"];
        if (type !== "Product" && type !== "product") continue;

        const result: SyncResult = {};

        const offers = item.offers || item.Offers;
        if (offers) {
          const offer = Array.isArray(offers) ? offers[0] : offers;
          const rawPrice = offer.price ?? offer.lowPrice;
          if (rawPrice != null) {
            const p = parseFloat(String(rawPrice).replace(/,/g, ""));
            if (!isNaN(p) && p > 0) result.price = p;
          }
          const avail = (offer.availability || "").toLowerCase();
          if (avail.includes("instock")) result.inStock = true;
          else if (avail.includes("outofstock") || avail.includes("soldout")) result.inStock = false;
        }

        const agg = item.aggregateRating;
        if (agg) {
          const r = parseFloat(String(agg.ratingValue || ""));
          if (!isNaN(r)) result.rating = r;
          const rc = parseInt(String(agg.reviewCount || agg.ratingCount || ""), 10);
          if (!isNaN(rc)) result.reviewCount = rc;
        }

        if (result.price != null) return result;
      }
    } catch {
    }
  }
  return null;
}

async function scrapeAmazon(html: string, cheerio: any): Promise<SyncResult> {
  const $ = cheerio.load(html);
  const result: SyncResult = {};

  const wholeEl = $(".a-price-whole").first();
  const fracEl = $(".a-price-fraction").first();
  if (wholeEl.length) {
    const whole = wholeEl.text().replace(/[^\d]/g, "");
    const frac = fracEl.text().replace(/[^\d]/g, "") || "00";
    const p = parseFloat(`${whole}.${frac}`);
    if (!isNaN(p) && p > 0) result.price = p;
  }

  if (!result.price) {
    const selectors = [
      "#priceblock_ourprice",
      "#priceblock_dealprice",
      "#priceblock_saleprice",
      "#corePrice_feature_div .a-offscreen",
      ".priceToPay .a-offscreen",
    ];
    for (const sel of selectors) {
      const text = $(sel).first().text().trim();
      const m = text.match(/[\d,]+\.?\d*/);
      if (m) {
        const p = parseFloat(m[0].replace(/,/g, ""));
        if (!isNaN(p) && p > 0) { result.price = p; break; }
      }
    }
  }

  const mrpSelectors = [
    "#priceblock_listprice",
    ".basisPrice .a-offscreen",
    ".a-text-price .a-offscreen",
  ];
  for (const sel of mrpSelectors) {
    const text = $(sel).first().text().trim();
    const m = text.match(/[\d,]+\.?\d*/);
    if (m) {
      const p = parseFloat(m[0].replace(/,/g, ""));
      if (!isNaN(p) && p > result.price! && p > 0) { result.originalPrice = p; break; }
    }
  }

  const availText = $("#availability span").first().text().toLowerCase().trim();
  if (availText) {
    if (availText.includes("in stock") || availText.includes("available")) result.inStock = true;
    else if (availText.includes("unavailable") || availText.includes("out of stock") || availText.includes("currently unavailable")) result.inStock = false;
  }

  const ratingText = $("#acrPopover .a-icon-alt").first().text().trim() ||
    $('[data-hook="average-star-rating"] .a-icon-alt').first().text().trim();
  const rm = ratingText.match(/([\d.]+)/);
  if (rm) result.rating = parseFloat(rm[1]);

  const reviewText = $("#acrCustomerReviewText").first().text().trim() ||
    $('[data-hook="total-review-count"]').first().text().trim();
  const rrm = reviewText.replace(/,/g, "").match(/\d+/);
  if (rrm) result.reviewCount = parseInt(rrm[0], 10);

  return result;
}

async function scrapeFlipkart(html: string, cheerio: any): Promise<SyncResult> {
  const $ = cheerio.load(html);
  const result: SyncResult = {};

  const priceSelectors = [
    "._30jeq3._16Jk6d",
    "._16Jk6d",
    "._1vC4OE._3qQ9m1",
    "._25b18",
    "[class*='_30jeq3']",
  ];
  for (const sel of priceSelectors) {
    const text = $(sel).first().text().trim();
    const m = text.match(/[\d,]+/);
    if (m) {
      const p = parseFloat(m[0].replace(/,/g, ""));
      if (!isNaN(p) && p > 0) { result.price = p; break; }
    }
  }

  const mrpSelectors = ["._3I9_wc._2p6lqe", "._3I9_wc", "[class*='_3I9_wc']"];
  for (const sel of mrpSelectors) {
    const text = $(sel).first().text().trim();
    const m = text.match(/[\d,]+/);
    if (m) {
      const p = parseFloat(m[0].replace(/,/g, ""));
      if (!isNaN(p) && p > (result.price ?? 0) && p > 0) { result.originalPrice = p; break; }
    }
  }

  const discountText = $("[class*='_3Ay6Sb']").first().text().trim() || $("[class*='VGWI6T']").first().text().trim();
  const dm = discountText.match(/(\d+)%/);
  if (dm) result.discountPercent = parseInt(dm[1], 10);

  const fullPageText = $("body").text().toLowerCase();
  if (fullPageText.includes("sold out") || fullPageText.includes("out of stock") || fullPageText.includes("notify me")) {
    result.inStock = false;
  } else if (result.price) {
    result.inStock = true;
  }

  const ratingText = $("._3LWZlK").first().text().trim();
  const rm = ratingText.match(/([\d.]+)/);
  if (rm) result.rating = parseFloat(rm[1]);

  const reviewText = $("._2_R_DZ span").first().text().trim();
  const rrm = reviewText.replace(/,/g, "").match(/\d+/);
  if (rrm) result.reviewCount = parseInt(rrm[0], 10);

  return result;
}

async function scrapeGeneric(html: string, cheerio: any): Promise<SyncResult> {
  const $ = cheerio.load(html);
  const result: SyncResult = {};

  const jsonLd = extractJsonLd(html);
  if (jsonLd?.price) return jsonLd;

  const itempropPrice = $('[itemprop="price"]').first();
  const priceVal = itempropPrice.attr("content") || itempropPrice.text().trim();
  if (priceVal) {
    const m = priceVal.match(/[\d,]+\.?\d*/);
    if (m) {
      const p = parseFloat(m[0].replace(/,/g, ""));
      if (!isNaN(p) && p > 0) result.price = p;
    }
  }

  if (!result.price) {
    const priceText =
      $('[class*="price"]').filter((_: number, el: any) => {
        const text = $(el).text().trim();
        return text.length > 0 && text.length < 30;
      }).first().text().trim() ||
      $('[data-price]').attr("data-price") || "";
    const m = priceText.match(/[\d,]+\.?\d*/);
    if (m) {
      const p = parseFloat(m[0].replace(/,/g, ""));
      if (!isNaN(p) && p > 0) result.price = p;
    }
  }

  const avail = $('[itemprop="availability"]').attr("content") || "";
  if (avail.toLowerCase().includes("instock")) result.inStock = true;
  else if (avail.toLowerCase().includes("outofstock")) result.inStock = false;

  const ratingContent = $('[itemprop="ratingValue"]').attr("content") || $('[itemprop="ratingValue"]').text().trim();
  if (ratingContent) {
    const r = parseFloat(ratingContent);
    if (!isNaN(r)) result.rating = r;
  }

  const reviewContent = $('[itemprop="reviewCount"]').attr("content") || $('[itemprop="reviewCount"]').text().trim();
  if (reviewContent) {
    const rc = parseInt(reviewContent.replace(/,/g, ""), 10);
    if (!isNaN(rc)) result.reviewCount = rc;
  }

  return result;
}

export async function syncProduct(productId: number): Promise<{ success: boolean; error?: string }> {
  const [product] = await db.select().from(productsTable).where(eq(productsTable.id, productId));
  if (!product) return { success: false, error: "Product not found" };

  const url = product.affiliateUrl;
  try {
    const { default: fetch } = await import("node-fetch");
    const cheerio = await import("cheerio");

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000);

    const response = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
        "Accept-Language": "en-IN,en-GB;q=0.9,en;q=0.8",
        "Accept-Encoding": "gzip, deflate, br",
        "Cache-Control": "no-cache",
        "Pragma": "no-cache",
      },
      signal: controller.signal as any,
    });
    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const html = await response.text();
    const hostname = new URL(url).hostname.toLowerCase();

    let scraped: SyncResult;

    if (hostname.includes("amazon.")) {
      scraped = await scrapeAmazon(html, cheerio);
      if (!scraped.price) {
        const ld = extractJsonLd(html);
        if (ld?.price) scraped = { ...scraped, ...ld };
      }
    } else if (hostname.includes("flipkart.")) {
      scraped = await scrapeFlipkart(html, cheerio);
      if (!scraped.price) {
        const ld = extractJsonLd(html);
        if (ld?.price) scraped = { ...scraped, ...ld };
      }
    } else {
      scraped = await scrapeGeneric(html, cheerio);
    }

    if (!scraped.price) {
      throw new Error("Could not extract price from page");
    }

    const price = scraped.price;
    const originalPrice = scraped.originalPrice ?? null;
    let discountPercent = scraped.discountPercent ?? null;
    if (!discountPercent && originalPrice && originalPrice > price) {
      discountPercent = Math.round(((originalPrice - price) / originalPrice) * 100);
    }

    await db.update(productsTable).set({
      price: String(price),
      ...(originalPrice !== undefined && { originalPrice: originalPrice ? String(originalPrice) : null }),
      ...(discountPercent !== undefined && { discountPercent }),
      ...(scraped.rating !== undefined && { rating: scraped.rating ? String(scraped.rating) : null }),
      ...(scraped.reviewCount !== undefined && { reviewCount: scraped.reviewCount }),
      ...(scraped.inStock !== undefined && { inStock: scraped.inStock }),
      lastSyncedAt: new Date(),
      syncError: null,
      updatedAt: new Date(),
    }).where(eq(productsTable.id, productId));

    logger.info({ productId, price, discountPercent, inStock: scraped.inStock }, "Product synced");
    return { success: true };
  } catch (err: any) {
    const errorMsg = err?.message || "Unknown error";
    logger.warn({ productId, url, err: errorMsg }, "Price sync failed");

    await db.update(productsTable).set({
      lastSyncedAt: new Date(),
      syncError: errorMsg,
    }).where(eq(productsTable.id, productId));

    return { success: false, error: errorMsg };
  }
}

export async function syncAllProducts(): Promise<{ total: number; success: number; failed: number }> {
  const products = await db.select({ id: productsTable.id }).from(productsTable).orderBy(asc(productsTable.id));

  let success = 0;
  let failed = 0;

  for (const { id } of products) {
    const result = await syncProduct(id);
    if (result.success) success++;
    else failed++;
    await new Promise(r => setTimeout(r, 2000));
  }

  logger.info({ total: products.length, success, failed }, "Sync all products complete");
  return { total: products.length, success, failed };
}

let syncInProgress = false;

export function startBackgroundSync(intervalMs: number = 6 * 60 * 60 * 1000) {
  logger.info({ intervalHours: intervalMs / 3600000 }, "Background price sync scheduled");

  setInterval(async () => {
    if (syncInProgress) {
      logger.info("Skipping sync — previous run still in progress");
      return;
    }
    syncInProgress = true;
    try {
      await syncAllProducts();
    } finally {
      syncInProgress = false;
    }
  }, intervalMs);
}

export function isSyncInProgress() {
  return syncInProgress;
}

export function setSyncInProgress(value: boolean) {
  syncInProgress = value;
}
