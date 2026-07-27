import type { Metadata } from "next";
import { BookCard } from "@/components/store/book-card";
import { ShopFilters } from "@/components/store/shop-filters";
import { ShopSort } from "@/components/store/shop-sort";
import { getBooks, getCategories, getWriters } from "@/lib/repositories/catalog";

export const metadata: Metadata = {
  title: "Shop books",
  description: "Browse books by category, writer, price, and popularity."
};
export const dynamic = "force-dynamic";

type Props = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function ShopPage({ searchParams }: Props) {
  const params = await searchParams;
  const value = (key: string) =>
    typeof params[key] === "string" ? params[key] : undefined;
  const page = Number(value("page") ?? 1);

  const [categories, writers, result] = await Promise.all([
    getCategories(),
    getWriters(),
    getBooks({
      search: value("q"),
      category: value("category"),
      writer: value("writer"),
      discount: value("discount") === "true",
      newArrival: value("new") === "true",
      bestSeller: value("best") === "true",
      available: value("available") === "true",
      sort: value("sort"),
      minPrice: Number(value("min")) || undefined,
      maxPrice: Number(value("max")) || undefined,
      page,
      limit: 24
    })
  ]);

  return (
    <div className="container py-10 sm:py-14">
      <div className="mb-10 max-w-3xl">
        <p className="mb-3 text-xs font-black uppercase tracking-[0.16em] text-accent-foreground">
          The complete collection
        </p>
        <h1 className="font-display text-4xl font-semibold sm:text-6xl">
          Find a book worth keeping.
        </h1>
        <p className="mt-4 text-sm leading-7 text-muted-foreground sm:text-base">
          Browse by subject, writer, price, or what readers are loving now.
        </p>
      </div>

      <div className="mb-8 flex items-center justify-between gap-4 border-y py-4">
        <div className="flex items-center gap-4">
          <div className="lg:hidden">
            <ShopFilters categories={categories} writers={writers} />
          </div>
          <p className="text-sm text-muted-foreground">
            <strong className="text-foreground">{result.count}</strong> books
          </p>
        </div>
        <ShopSort />
      </div>

      <div className="flex items-start gap-10">
        <div className="hidden lg:block">
          <ShopFilters categories={categories} writers={writers} />
        </div>
        <div className="min-w-0 flex-1">
          {result.books.length ? (
            <div className="grid grid-cols-2 gap-x-4 gap-y-10 sm:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 lg:gap-x-6">
              {result.books.map((book) => (
                <BookCard key={book.id} book={book} />
              ))}
            </div>
          ) : (
            <div className="grid min-h-80 place-items-center rounded-2xl border bg-card p-8 text-center">
              <div>
                <h2 className="font-display text-2xl font-semibold">
                  No books match these filters
                </h2>
                <p className="mt-2 text-sm text-muted-foreground">
                  Remove one or two filters and try again.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
