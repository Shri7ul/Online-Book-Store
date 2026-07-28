"use client";

import * as Dialog from "@radix-ui/react-dialog";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { LoaderCircle, Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import type { Book } from "@/lib/types";
import { formatPrice } from "@/lib/utils";

export function SearchDialog({
  open,
  onOpenChange
}: {
  open: boolean;
  onOpenChange: (value: boolean) => void;
}) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Book[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      setLoading(false);
      return;
    }
    const controller = new AbortController();
    const timer = window.setTimeout(async () => {
      setLoading(true);
      try {
        const response = await fetch(
          `/api/search?q=${encodeURIComponent(query.trim())}`,
          { signal: controller.signal }
        );
        const data = (await response.json()) as { books: Book[] };
        setResults(data.books ?? []);
      } catch {
        if (!controller.signal.aborted) setResults([]);
      } finally {
        setLoading(false);
      }
    }, 220);

    return () => {
      controller.abort();
      window.clearTimeout(timer);
    };
  }, [query]);

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-foreground/25 backdrop-blur-sm" />
        <Dialog.Content className="fixed left-1/2 top-[10vh] z-50 w-[calc(100%-2rem)] max-w-2xl -translate-x-1/2 overflow-hidden rounded-2xl border bg-background shadow-lift outline-none">
          <Dialog.Title className="sr-only">Search books</Dialog.Title>
          <div className="relative border-b p-4">
            <Search className="absolute left-8 top-1/2 size-5 -translate-y-1/2 text-muted-foreground" />
            <Input
              autoFocus
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search by title, writer, category, or publisher"
              className="h-14 border-0 bg-muted pl-12 pr-12 text-base focus:ring-0"
            />
            {loading ? (
              <LoaderCircle className="absolute right-8 top-1/2 size-5 -translate-y-1/2 animate-spin text-muted-foreground" />
            ) : (
              <Dialog.Close className="absolute right-8 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                <X className="size-5" />
              </Dialog.Close>
            )}
          </div>

          <div className="max-h-[60vh] overflow-y-auto p-3">
            {!query.trim() ? (
              <div className="p-8 text-center text-sm text-muted-foreground">
                Try “quiet”, “business”, or a writer’s name.
              </div>
            ) : results.length ? (
              <div className="space-y-1">
                {results.map((book) => (
                  <Link
                    key={book.id}
                    href={`/books/${book.slug}`}
                    onClick={() => onOpenChange(false)}
                    className="flex items-center gap-4 rounded-xl p-3 transition hover:bg-muted"
                  >
                    <div className="relative h-16 w-12 shrink-0 overflow-hidden rounded bg-card">
                      {book.cover_url && (
                        <Image
                          src={book.cover_url}
                          alt=""
                          fill
                          sizes="48px"
                          className="object-cover"
                        />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-display text-lg font-semibold">
                        {book.name}
                      </p>
                      <p className="truncate text-xs text-muted-foreground">
                        {book.writer?.name} · {book.category?.name}
                      </p>
                    </div>
                    <span className="text-sm font-bold">
                      {formatPrice(book.discount_price ?? book.regular_price)}
                    </span>
                  </Link>
                ))}
                <Link
                  href={`/search?q=${encodeURIComponent(query)}`}
                  onClick={() => onOpenChange(false)}
                  className="mt-2 flex h-12 items-center justify-center rounded-xl bg-muted text-sm font-semibold hover:bg-border"
                >
                  See all results for “{query}”
                </Link>
              </div>
            ) : (
              !loading && (
                <div className="p-8 text-center">
                  <p className="font-display text-xl font-semibold">
                    No close matches yet
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Try a shorter title or the writer’s name.
                  </p>
                </div>
              )
            )}
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
