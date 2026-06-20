import { pgTable, serial, text, numeric, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const categoriesTable = pgTable("categories", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  icon: text("icon"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const productsTable = pgTable("products", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  price: numeric("price", { precision: 10, scale: 2 }).notNull(),
  originalPrice: numeric("original_price", { precision: 10, scale: 2 }),
  discountPercent: integer("discount_percent"),
  currency: text("currency").default("USD").notNull(),
  images: jsonb("images").$type<string[]>().default([]).notNull(),
  brand: text("brand"),
  category: text("category").notNull(),
  rating: numeric("rating", { precision: 3, scale: 1 }),
  reviewCount: integer("review_count"),
  affiliateUrl: text("affiliate_url").notNull(),
  store: text("store"),
  specifications: jsonb("specifications").$type<Record<string, string>>().default({}).notNull(),
  clickCount: integer("click_count").default(0).notNull(),
  featured: boolean("featured").default(false).notNull(),
  inStock: boolean("in_stock").default(true).notNull(),
  sourceUrl: text("source_url"),
  lastSyncedAt: timestamp("last_synced_at"),
  syncError: text("sync_error"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const clickEventsTable = pgTable("click_events", {
  id: serial("id").primaryKey(),
  productId: integer("product_id").notNull(),
  clickedAt: timestamp("clicked_at").defaultNow().notNull(),
  userAgent: text("user_agent"),
  referer: text("referer"),
});

export const insertProductSchema = createInsertSchema(productsTable).omit({
  id: true,
  clickCount: true,
  createdAt: true,
  updatedAt: true,
});

export const insertCategorySchema = createInsertSchema(categoriesTable).omit({
  id: true,
  createdAt: true,
});

export type InsertProduct = z.infer<typeof insertProductSchema>;
export type Product = typeof productsTable.$inferSelect;
export type InsertCategory = z.infer<typeof insertCategorySchema>;
export type Category = typeof categoriesTable.$inferSelect;
export type ClickEvent = typeof clickEventsTable.$inferSelect;
