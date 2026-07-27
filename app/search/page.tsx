import { BookCard } from "@/components/store/book-card";
import { getBooks } from "@/lib/repositories/catalog";

export const dynamic = "force-dynamic";

export default async function SearchPage({
  searchParams
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q = "" } = await searchParams;
  const result = await getBooks({ search: q, limit: 40 });
  return (
    <div className="container py-12">
      <p className="text-xs font-black uppercase tracking-[0.16em] text-accent-foreground">
        Search results
      </p>
      <h1 className="font-display mt-3 text-4xl font-semibold sm:text-6xl">
        {q ? `Results for “${q}”` : "Search the collection"}
      </h1>
      <p className="mt-4 text-sm text-muted-foreground">
        {result.count} close {result.count === 1 ? "match" : "matches"}
      </p>
      <div className="mt-10 grid grid-cols-2 gap-x-4 gap-y-10 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 lg:gap-6">
        {result.books.map((book) => (
          <BookCard key={book.id} book={book} />
        ))}
      </div>
    </div>
  );
}
