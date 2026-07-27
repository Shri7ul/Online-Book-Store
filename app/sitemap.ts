import type { MetadataRoute } from "next";
import {
  getBooks,
  getCategories,
  getWriters
} from "@/lib/repositories/catalog";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [bookResult, categories, writers] = await Promise.all([
    getBooks({ limit: 100 }),
    getCategories(),
    getWriters()
  ]);
  const base = "https://minibookcottage.com";
  return [
    "", "/shop", "/categories", "/writers", "/about", "/contact", "/privacy", "/terms",
    ...bookResult.books.map((book) => `/books/${book.slug}`),
    ...categories.map((category) => `/category/${category.slug}`),
    ...writers.map((writer) => `/writer/${writer.slug}`)
  ].map((path) => ({
    url: `${base}${path}`,
    lastModified: new Date(),
    changeFrequency: path === "" ? "daily" : "weekly",
    priority: path === "" ? 1 : 0.7
  }));
}
