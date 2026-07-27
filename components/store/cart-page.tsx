"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Minus, Plus, ShoppingBag, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCart } from "@/components/store/cart-provider";
import { formatPrice } from "@/lib/utils";

export function CartPage() {
  const { items, subtotal, updateQuantity, removeItem } = useCart();

  if (!items.length) {
    return (
      <div className="container grid min-h-[60vh] place-items-center py-16 text-center">
        <div>
          <span className="mx-auto grid size-20 place-items-center rounded-full bg-muted">
            <ShoppingBag className="size-8 text-muted-foreground" />
          </span>
          <h1 className="font-display mt-6 text-4xl font-semibold">
            Your cart is empty.
          </h1>
          <p className="mt-3 text-sm text-muted-foreground">
            Your next favourite book is probably still on the shelf.
          </p>
          <Button asChild className="mt-7">
            <Link href="/shop">Browse the collection</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-10 sm:py-14">
      <Link
        href="/shop"
        className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" /> Continue shopping
      </Link>
      <h1 className="font-display text-4xl font-semibold sm:text-6xl">
        Your cart.
      </h1>
      <div className="mt-10 grid items-start gap-10 lg:grid-cols-[1fr_380px]">
        <div className="divide-y border-y">
          {items.map(({ book, quantity }) => (
            <article key={book.id} className="flex gap-4 py-6 sm:gap-6">
              <div className="relative h-36 w-24 shrink-0 overflow-hidden rounded-md bg-muted sm:h-44 sm:w-32">
                {book.cover_url && (
                  <Image
                    src={book.cover_url}
                    alt={book.name}
                    fill
                    sizes="128px"
                    className="object-cover"
                  />
                )}
              </div>
              <div className="flex min-w-0 flex-1 flex-col">
                <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-muted-foreground">
                  {book.category?.name}
                </p>
                <Link
                  href={`/books/${book.slug}`}
                  className="font-display mt-1 line-clamp-2 text-xl font-semibold sm:text-2xl"
                >
                  {book.name}
                </Link>
                <p className="mt-1 text-xs text-muted-foreground">
                  {book.writer?.name}
                </p>
                <div className="mt-auto flex flex-wrap items-end justify-between gap-4 pt-5">
                  <div className="flex h-10 items-center rounded-full border bg-card">
                    <button
                      className="grid size-9 place-items-center"
                      onClick={() => updateQuantity(book.id, quantity - 1)}
                      aria-label="Decrease quantity"
                    >
                      <Minus className="size-3.5" />
                    </button>
                    <span className="w-8 text-center text-xs font-bold">
                      {quantity}
                    </span>
                    <button
                      className="grid size-9 place-items-center"
                      onClick={() => updateQuantity(book.id, quantity + 1)}
                      aria-label="Increase quantity"
                    >
                      <Plus className="size-3.5" />
                    </button>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="font-display text-xl font-semibold">
                      {formatPrice(
                        (book.discount_price ?? book.regular_price) * quantity
                      )}
                    </span>
                    <button
                      onClick={() => removeItem(book.id)}
                      className="text-muted-foreground hover:text-destructive"
                      aria-label={`Remove ${book.name}`}
                    >
                      <Trash2 className="size-4" />
                    </button>
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>

        <aside className="sticky top-28 rounded-xl border bg-card p-6">
          <h2 className="font-display text-2xl font-semibold">Order summary</h2>
          <div className="mt-6 space-y-4 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Subtotal</span>
              <span className="font-semibold">{formatPrice(subtotal)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Delivery</span>
              <span>Calculated at checkout</span>
            </div>
          </div>
          <div className="mt-6 flex items-center justify-between border-t pt-5">
            <span className="font-semibold">Estimated total</span>
            <span className="font-display text-3xl font-semibold">
              {formatPrice(subtotal)}
            </span>
          </div>
          <Button asChild size="lg" className="mt-6 w-full">
            <Link href="/checkout">Proceed to checkout</Link>
          </Button>
        </aside>
      </div>
    </div>
  );
}
