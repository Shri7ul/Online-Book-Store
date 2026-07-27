"use client";

import * as Dialog from "@radix-ui/react-dialog";
import Image from "next/image";
import Link from "next/link";
import { Minus, Plus, ShoppingBag, Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCart } from "@/components/store/cart-provider";
import { formatPrice } from "@/lib/utils";

export function CartDrawer() {
  const {
    items,
    subtotal,
    isOpen,
    setOpen,
    updateQuantity,
    removeItem
  } = useCart();

  return (
    <Dialog.Root open={isOpen} onOpenChange={setOpen}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-foreground/30 backdrop-blur-sm data-[state=open]:animate-in" />
        <Dialog.Content className="fixed inset-y-0 right-0 z-50 flex w-full max-w-md flex-col border-l bg-background p-0 shadow-lift outline-none">
          <div className="flex h-20 items-center justify-between border-b px-6">
            <div>
              <Dialog.Title className="font-display text-2xl font-semibold">
                Your cart
              </Dialog.Title>
              <Dialog.Description className="mt-1 text-xs text-muted-foreground">
                {items.length} {items.length === 1 ? "title" : "titles"} selected
              </Dialog.Description>
            </div>
            <Dialog.Close asChild>
              <Button variant="ghost" size="icon" aria-label="Close cart">
                <X className="size-5" />
              </Button>
            </Dialog.Close>
          </div>

          {items.length ? (
            <>
              <div className="flex-1 space-y-5 overflow-y-auto px-6 py-5">
                {items.map(({ book, quantity }) => (
                  <div key={book.id} className="flex gap-4">
                    <div className="relative h-28 w-20 shrink-0 overflow-hidden rounded-md bg-muted">
                      {book.cover_url && (
                        <Image
                          src={book.cover_url}
                          alt={book.name}
                          fill
                          sizes="80px"
                          className="object-cover"
                        />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <Link
                        href={`/books/${book.slug}`}
                        onClick={() => setOpen(false)}
                        className="line-clamp-2 font-display text-lg font-semibold leading-tight hover:text-primary"
                      >
                        {book.name}
                      </Link>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {book.writer?.name}
                      </p>
                      <div className="mt-4 flex items-center justify-between">
                        <div className="flex h-9 items-center rounded-full border bg-card">
                          <button
                            className="grid size-8 place-items-center"
                            onClick={() =>
                              updateQuantity(book.id, quantity - 1)
                            }
                            aria-label="Decrease quantity"
                          >
                            <Minus className="size-3.5" />
                          </button>
                          <span className="w-7 text-center text-xs font-bold">
                            {quantity}
                          </span>
                          <button
                            className="grid size-8 place-items-center"
                            onClick={() =>
                              updateQuantity(book.id, quantity + 1)
                            }
                            aria-label="Increase quantity"
                          >
                            <Plus className="size-3.5" />
                          </button>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold">
                            {formatPrice(
                              (book.discount_price ?? book.regular_price) *
                                quantity
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
                  </div>
                ))}
              </div>
              <div className="border-t bg-card p-6">
                <div className="mb-4 flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Subtotal</span>
                  <span className="font-display text-2xl font-semibold">
                    {formatPrice(subtotal)}
                  </span>
                </div>
                <p className="mb-5 text-xs leading-relaxed text-muted-foreground">
                  Delivery and coupon discounts are calculated at checkout.
                </p>
                <Button asChild size="lg" className="w-full">
                  <Link href="/checkout" onClick={() => setOpen(false)}>
                    Continue to checkout
                  </Link>
                </Button>
                <Button
                  asChild
                  variant="ghost"
                  className="mt-2 w-full"
                >
                  <Link href="/cart" onClick={() => setOpen(false)}>
                    View full cart
                  </Link>
                </Button>
              </div>
            </>
          ) : (
            <div className="grid flex-1 place-items-center p-8 text-center">
              <div>
                <span className="mx-auto grid size-16 place-items-center rounded-full bg-muted">
                  <ShoppingBag className="size-7 text-muted-foreground" />
                </span>
                <h3 className="font-display mt-5 text-2xl font-semibold">
                  Your shelf is empty
                </h3>
                <p className="mx-auto mt-2 max-w-xs text-sm leading-relaxed text-muted-foreground">
                  Browse the collection and add a few books worth keeping.
                </p>
                <Button asChild className="mt-6">
                  <Link href="/shop" onClick={() => setOpen(false)}>
                    Browse books
                  </Link>
                </Button>
              </div>
            </div>
          )}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
