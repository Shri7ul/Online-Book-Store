"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState
} from "react";
import { toast } from "sonner";
import type { Book, CartItem } from "@/lib/types";

type CartContextValue = {
  items: CartItem[];
  count: number;
  subtotal: number;
  isOpen: boolean;
  setOpen: (value: boolean) => void;
  addItem: (book: Book, quantity?: number) => void;
  updateQuantity: (bookId: string, quantity: number) => void;
  removeItem: (bookId: string) => void;
  clearCart: () => void;
};

const CartContext = createContext<CartContextValue | null>(null);
const CART_KEY = "mini-book-cottage-cart";

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isOpen, setOpen] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const stored = window.localStorage.getItem(CART_KEY);
    if (stored) {
      try {
        setItems(JSON.parse(stored) as CartItem[]);
      } catch {
        window.localStorage.removeItem(CART_KEY);
      }
    }
    setReady(true);
  }, []);

  useEffect(() => {
    if (ready) window.localStorage.setItem(CART_KEY, JSON.stringify(items));
  }, [items, ready]);

  const addItem = useCallback((book: Book, quantity = 1) => {
    if (book.stock < 1) {
      toast.error("This book is currently out of stock.");
      return;
    }
    setItems((current) => {
      const existing = current.find((item) => item.book.id === book.id);
      if (existing) {
        return current.map((item) =>
          item.book.id === book.id
            ? {
                ...item,
                quantity: Math.min(item.quantity + quantity, book.stock)
              }
            : item
        );
      }
      return [...current, { book, quantity: Math.min(quantity, book.stock) }];
    });
    toast.success(`${book.name} added to your cart.`);
  }, []);

  const updateQuantity = useCallback((bookId: string, quantity: number) => {
    if (quantity <= 0) {
      setItems((current) =>
        current.filter((item) => item.book.id !== bookId)
      );
      return;
    }
    setItems((current) =>
      current.map((item) =>
        item.book.id === bookId
          ? { ...item, quantity: Math.min(quantity, item.book.stock) }
          : item
      )
    );
  }, []);

  const removeItem = useCallback((bookId: string) => {
    setItems((current) => current.filter((item) => item.book.id !== bookId));
  }, []);

  const value = useMemo(
    () => ({
      items,
      count: items.reduce((total, item) => total + item.quantity, 0),
      subtotal: items.reduce(
        (total, item) =>
          total +
          (item.book.discount_price ?? item.book.regular_price) * item.quantity,
        0
      ),
      isOpen,
      setOpen,
      addItem,
      updateQuantity,
      removeItem,
      clearCart: () => setItems([])
    }),
    [addItem, isOpen, items, removeItem, updateQuantity]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart must be used inside CartProvider");
  return context;
}
