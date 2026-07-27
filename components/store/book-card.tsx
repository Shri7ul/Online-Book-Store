"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { Eye, Heart, ShoppingBag, Star } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useCart } from "@/components/store/cart-provider";
import type { Book } from "@/lib/types";
import { discountPercent, formatPrice } from "@/lib/utils";

export function BookCard({ book }: { book: Book }) {
  const { addItem } = useCart();
  const discount = discountPercent(book.regular_price, book.discount_price);

  return (
    <motion.article
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.4 }}
      className="group min-w-0"
    >
      <div className="relative aspect-[3/4.15] overflow-hidden rounded-lg bg-muted shadow-soft transition duration-500 group-hover:-translate-y-1 group-hover:shadow-lift">
        <Link href={`/books/${book.slug}`} className="absolute inset-0">
          {book.cover_url ? (
            <Image
              src={book.cover_url}
              alt={book.name}
              fill
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 25vw, 210px"
              className="object-cover transition duration-700 group-hover:scale-[1.035]"
            />
          ) : (
            <div className="grid h-full place-items-center p-6 text-center font-display text-xl font-semibold">
              {book.name}
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-foreground/28 via-transparent to-transparent opacity-0 transition group-hover:opacity-100" />
        </Link>

        <div className="absolute left-3 top-3 flex flex-col items-start gap-2">
          {discount > 0 && <Badge>Save {discount}%</Badge>}
          {book.new_arrival && (
            <Badge className="bg-white text-primary">New</Badge>
          )}
        </div>

        <button
          className="absolute right-3 top-3 grid size-9 translate-y-1 place-items-center rounded-full bg-white/92 text-primary opacity-0 shadow-sm backdrop-blur transition hover:bg-white group-hover:translate-y-0 group-hover:opacity-100"
          aria-label={`Add ${book.name} to wishlist`}
        >
          <Heart className="size-4" />
        </button>

        <div className="absolute bottom-3 left-3 right-3 flex translate-y-3 gap-2 opacity-0 transition duration-300 group-hover:translate-y-0 group-hover:opacity-100">
          <Button
            className="h-10 flex-1 bg-white text-primary hover:bg-white"
            onClick={() => addItem(book)}
            disabled={book.stock < 1}
          >
            <ShoppingBag className="size-4" />
            {book.stock > 0 ? "Add to cart" : "Out of stock"}
          </Button>
          <Button asChild size="icon" className="bg-primary text-white">
            <Link href={`/books/${book.slug}`} aria-label="View book">
              <Eye className="size-4" />
            </Link>
          </Button>
        </div>
      </div>

      <div className="pt-4">
        <p className="truncate text-[11px] font-bold uppercase tracking-[0.1em] text-muted-foreground">
          {book.category?.name}
        </p>
        <Link
          href={`/books/${book.slug}`}
          className="font-display mt-1 line-clamp-2 min-h-12 text-lg font-semibold leading-6 transition hover:text-primary"
        >
          {book.name}
        </Link>
        <p className="mt-1 truncate text-xs text-muted-foreground">
          {book.writer?.name}
        </p>
        <div className="mt-3 flex items-center justify-between gap-3">
          <div className="flex items-baseline gap-2">
            <span className="font-bold text-primary">
              {formatPrice(book.discount_price ?? book.regular_price)}
            </span>
            {book.discount_price && (
              <span className="text-xs text-muted-foreground line-through">
                {formatPrice(book.regular_price)}
              </span>
            )}
          </div>
          <span className="flex items-center gap-1 text-[11px] font-semibold text-muted-foreground">
            <Star className="size-3 fill-accent text-accent" />
            {(book.rating ?? 4.8).toFixed(1)}
          </span>
        </div>
      </div>
    </motion.article>
  );
}
