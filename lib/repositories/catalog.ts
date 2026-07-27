import "server-only";
import {
  demoBanners,
  demoBooks,
  demoCategories,
  demoSettings,
  demoWriters
} from "@/lib/demo-data";
import { createPublicClient } from "@/lib/supabase/public";
import type {
  Book,
  Category,
  HeroBanner,
  StoreSettings,
  Writer
} from "@/lib/types";

export const isSupabaseConfigured = Boolean(
  process.env.NEXT_PUBLIC_SUPABASE_URL &&
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export const isSupabaseAdminConfigured = Boolean(
  isSupabaseConfigured && process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function withFallback<T>(
  query: () => Promise<T>,
  fallback: T
): Promise<T> {
  if (!isSupabaseConfigured) return fallback;
  return query();
}

const bookListSelect = `
  *,
  writer:writers(id,name,slug,photo_url),
  category:categories(id,name,slug)
`;

const bookDetailSelect = `
  ${bookListSelect},
  gallery:book_images(*),
  previews:book_previews(*)
`;

export async function getSettings(): Promise<StoreSettings> {
  return withFallback(async () => {
    const supabase = createPublicClient();
    const { data, error } = await supabase
      .from("settings")
      .select("*")
      .eq("id", true)
      .single();
    if (error) throw error;
    return data as StoreSettings;
  }, demoSettings);
}

export async function getCategories(): Promise<Category[]> {
  return withFallback(async () => {
    const supabase = createPublicClient();
    const { data, error } = await supabase
      .from("categories")
      .select("*, books(count)")
      .eq("is_active", true)
      .order("sort_order");
    if (error) throw error;
    return (data ?? []).map((item) => ({
      ...item,
      book_count: item.books?.[0]?.count ?? 0
    })) as Category[];
  }, demoCategories);
}

export async function getWriters(limit?: number): Promise<Writer[]> {
  return withFallback(async () => {
    const supabase = createPublicClient();
    let query = supabase
      .from("writers")
      .select("*, books(count)")
      .eq("is_active", true)
      .order("name");
    if (limit) query = query.limit(limit);
    const { data, error } = await query;
    if (error) throw error;
    return (data ?? []).map((item) => ({
      ...item,
      book_count: item.books?.[0]?.count ?? 0
    })) as Writer[];
  }, limit ? demoWriters.slice(0, limit) : demoWriters);
}

export async function getHeroBanners(): Promise<HeroBanner[]> {
  return withFallback(async () => {
    const supabase = createPublicClient();
    const { data, error } = await supabase
      .from("hero_banners")
      .select("*")
      .eq("is_active", true)
      .order("sort_order");
    if (error) throw error;
    return data as HeroBanner[];
  }, demoBanners);
}

export type BookQuery = {
  search?: string;
  category?: string;
  writer?: string;
  discount?: boolean;
  newArrival?: boolean;
  bestSeller?: boolean;
  featured?: boolean;
  trending?: boolean;
  available?: boolean;
  sort?: string;
  minPrice?: number;
  maxPrice?: number;
  page?: number;
  limit?: number;
};

export async function getBooks(query: BookQuery = {}) {
  const page = Math.max(
    1,
    Number.isFinite(query.page) ? Math.floor(query.page!) : 1
  );
  const limit = Math.min(
    100,
    Math.max(1, Number.isFinite(query.limit) ? Math.floor(query.limit!) : 20)
  );

  return withFallback(async () => {
    const supabase = createPublicClient();

    if (query.search) {
      const { data, error } = await supabase.rpc("search_books", {
        search_term: query.search,
        result_limit: limit,
        result_offset: (page - 1) * limit
      });
      if (error) throw error;
      return { books: data as Book[], count: data?.[0]?.total_count ?? 0 };
    }

    let request = supabase
      .from("books")
      .select(bookListSelect, { count: "exact" })
      .eq("is_active", true);

    if (query.category) {
      const { data: category, error } = await supabase
        .from("categories")
        .select("id")
        .eq("slug", query.category)
        .eq("is_active", true)
        .maybeSingle();
      if (error) throw error;
      if (!category) return { books: [], count: 0 };
      request = request.eq("category_id", category.id);
    }
    if (query.writer) {
      const { data: writer, error } = await supabase
        .from("writers")
        .select("id")
        .eq("slug", query.writer)
        .eq("is_active", true)
        .maybeSingle();
      if (error) throw error;
      if (!writer) return { books: [], count: 0 };
      request = request.eq("writer_id", writer.id);
    }
    if (query.discount) request = request.not("discount_price", "is", null);
    if (query.newArrival) request = request.eq("new_arrival", true);
    if (query.bestSeller) request = request.eq("best_seller", true);
    if (query.featured) request = request.eq("featured", true);
    if (query.trending) request = request.eq("trending", true);
    if (query.available) request = request.gt("stock", 0);
    if (query.minPrice !== undefined)
      request = request.gte("regular_price", query.minPrice);
    if (query.maxPrice !== undefined)
      request = request.lte("regular_price", query.maxPrice);

    switch (query.sort) {
      case "price-low":
        request = request.order("regular_price");
        break;
      case "price-high":
        request = request.order("regular_price", { ascending: false });
        break;
      case "popular":
        request = request.order("sold_count", { ascending: false });
        break;
      case "discount":
        request = request.order("discount_price");
        break;
      default:
        request = request.order("created_at", { ascending: false });
    }

    const { data, error, count } = await request.range(
      (page - 1) * limit,
      page * limit - 1
    );
    if (error) throw error;
    return { books: data as Book[], count: count ?? 0 };
  }, filterDemoBooks(query, page, limit));
}

function filterDemoBooks(query: BookQuery, page: number, limit: number) {
  let books = [...demoBooks];
  const search = query.search?.toLowerCase();
  if (search) {
    books = books.filter((book) =>
      [
        book.name,
        book.writer?.name,
        book.category?.name,
        book.publisher
      ].some((value) => value?.toLowerCase().includes(search))
    );
  }
  if (query.category)
    books = books.filter((book) => book.category?.slug === query.category);
  if (query.writer)
    books = books.filter((book) => book.writer?.slug === query.writer);
  if (query.discount)
    books = books.filter((book) => book.discount_price !== null);
  if (query.newArrival) books = books.filter((book) => book.new_arrival);
  if (query.bestSeller) books = books.filter((book) => book.best_seller);
  if (query.featured) books = books.filter((book) => book.featured);
  if (query.trending) books = books.filter((book) => book.trending);
  if (query.available) books = books.filter((book) => book.stock > 0);
  if (query.minPrice !== undefined)
    books = books.filter((book) => book.regular_price >= query.minPrice!);
  if (query.maxPrice !== undefined)
    books = books.filter((book) => book.regular_price <= query.maxPrice!);

  books.sort((a, b) => {
    if (query.sort === "price-low")
      return (a.discount_price ?? a.regular_price) -
        (b.discount_price ?? b.regular_price);
    if (query.sort === "price-high")
      return (b.discount_price ?? b.regular_price) -
        (a.discount_price ?? a.regular_price);
    if (query.sort === "popular") return b.sold_count - a.sold_count;
    if (query.sort === "discount") {
      const aDiscount = a.regular_price - (a.discount_price ?? a.regular_price);
      const bDiscount = b.regular_price - (b.discount_price ?? b.regular_price);
      return bDiscount - aDiscount;
    }
    return b.created_at.localeCompare(a.created_at);
  });

  return {
    books: books.slice((page - 1) * limit, page * limit),
    count: books.length
  };
}

export async function getBookBySlug(slug: string): Promise<Book | null> {
  return withFallback(async () => {
    const supabase = createPublicClient();
    const { data, error } = await supabase
      .from("books")
      .select(bookDetailSelect)
      .eq("slug", slug)
      .eq("is_active", true)
      .single();
    if (error) throw error;
    return data as Book;
  }, demoBooks.find((book) => book.slug === slug) ?? null);
}

export async function getCategoryBySlug(slug: string) {
  const category =
    (await getCategories()).find((item) => item.slug === slug) ?? null;
  const result = await getBooks({ category: slug, limit: 24 });
  return { category, ...result };
}

export async function getWriterBySlug(slug: string) {
  const writer =
    (await getWriters()).find((item) => item.slug === slug) ?? null;
  const result = await getBooks({ writer: slug, limit: 24 });
  return { writer, ...result };
}

export async function getHomeData() {
  const [banners, categories, writers, settings] = await Promise.all([
    getHeroBanners(),
    getCategories(),
    getWriters(6),
    getSettings()
  ]);

  const [featured, newArrivals, bestSellers, trending, discounts] =
    await Promise.all([
      getBooks({ featured: true, limit: 8 }),
      getBooks({ newArrival: true, limit: 8 }),
      getBooks({ bestSeller: true, sort: "popular", limit: 8 }),
      getBooks({ trending: true, sort: "popular", limit: 8 }),
      getBooks({ discount: true, sort: "discount", limit: 8 })
    ]);

  return {
    banners,
    categories,
    writers,
    settings,
    featured: featured.books,
    newArrivals: newArrivals.books,
    bestSellers: bestSellers.books,
    trending: trending.books,
    discounts: discounts.books
  };
}
