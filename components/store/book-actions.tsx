"use client";

import { useState } from "react";
import { Heart, Minus, Plus, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCart } from "@/components/store/cart-provider";
import type { Book } from "@/lib/types";

export function BookActions({ book }: { book: Book }) {
  const [quantity, setQuantity] = useState(1);
  const { addItem } = useCart();

  return (
    <div className="mt-8 flex flex-col gap-3 sm:flex-row">
      <div className="flex h-[52px] items-center justify-between rounded-full border bg-card px-2 sm:w-36">
        <button
          className="grid size-10 place-items-center rounded-full hover:bg-muted"
          onClick={() => setQuantity((value) => Math.max(1, value - 1))}
          aria-label="Decrease quantity"
        >
          <Minus className="size-4" />
        </button>
        <span className="text-sm font-black">{quantity}</span>
        <button
          className="grid size-10 place-items-center rounded-full hover:bg-muted"
          onClick={() =>
            setQuantity((value) => Math.min(book.stock, value + 1))
          }
          aria-label="Increase quantity"
        >
          <Plus className="size-4" />
        </button>
      </div>
      <Button
        size="lg"
        className="flex-1"
        onClick={() => addItem(book, quantity)}
        disabled={book.stock < 1}
      >
        <ShoppingBag className="size-5" />
        {book.stock > 0 ? "Add to cart" : "Currently unavailable"}
      </Button>
      <Button
        size="icon"
        variant="outline"
        className="h-[52px] w-full sm:w-[52px]"
        aria-label="Add to wishlist"
      >
        <Heart className="size-5" />
      </Button>
    </div>
  );
}
