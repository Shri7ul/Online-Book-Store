import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { BookCard } from "@/components/store/book-card";
import type { Book } from "@/lib/types";

export function BookShelf({
  title,
  eyebrow,
  books,
  href = "/shop"
}: {
  title: string;
  eyebrow?: string;
  books: Book[];
  href?: string;
}) {
  if (!books.length) return null;
  return (
    <section className="container py-14 sm:py-20">
      <div className="mb-8 flex items-end justify-between gap-5">
        <div>
          {eyebrow && (
            <p className="mb-3 text-xs font-black uppercase tracking-[0.16em] text-accent-foreground">
              {eyebrow}
            </p>
          )}
          <h2 className="font-display text-3xl font-semibold sm:text-4xl">
            {title}
          </h2>
        </div>
        <Link
          href={href}
          className="hidden items-center gap-2 text-sm font-bold hover:text-primary sm:flex"
        >
          View all <ArrowRight className="size-4" />
        </Link>
      </div>
      <div className="grid grid-cols-2 gap-x-4 gap-y-9 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 lg:gap-6">
        {books.slice(0, 6).map((book) => (
          <BookCard key={book.id} book={book} />
        ))}
      </div>
    </section>
  );
}
