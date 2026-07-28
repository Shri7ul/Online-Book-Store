"use client";

import Link from "next/link";
import { useState } from "react";
import {
  ChevronDown,
  Heart,
  Menu,
  Moon,
  Search,
  ShoppingBag,
  Sun,
  X
} from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/store/logo";
import { SearchDialog } from "@/components/store/search-dialog";
import { CartDrawer } from "@/components/store/cart-drawer";
import { useCart } from "@/components/store/cart-provider";
import type { StoreSettings } from "@/lib/types";

const categoryLinks = [
  ["Fiction", "/category/fiction"],
  ["Self Development", "/category/self-development"],
  ["Business", "/category/business"],
  ["Children", "/category/children"],
  ["History", "/category/history"],
  ["Religion", "/category/religion"],
  ["Science", "/category/science"],
  ["Bangla Literature", "/category/bangla-literature"]
];

export function StoreHeader({ settings }: { settings: StoreSettings }) {
  const [searchOpen, setSearchOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const { setTheme, resolvedTheme } = useTheme();
  const { count, setOpen: setCartOpen } = useCart();

  return (
    <>
      <div className="overflow-hidden bg-primary px-3 py-2 text-center text-[50px] font-semibold text-primary-foreground sm:text-[20px]">
        Delivery across Bangladesh · Inside Dhaka{" "}
        {settings.delivery_inside_dhaka} BDT · Outside Dhaka{" "}
        {settings.delivery_outside_dhaka} BDT
      </div>
      <header className="sticky top-0 z-40 border-b bg-background/90 backdrop-blur-xl">
        <div className="container flex h-20 min-w-0 items-center justify-between gap-2">
          <Logo imageUrl={settings.logo_url} />

          <nav className="hidden items-center gap-1 lg:flex">
            <Link
              href="/shop"
              className="rounded-full px-4 py-2 text-sm font-semibold transition hover:bg-muted"
            >
              Shop
            </Link>
            <div className="group relative">
              <button className="flex items-center gap-1 rounded-full px-4 py-2 text-sm font-semibold transition hover:bg-muted">
                Categories <ChevronDown className="size-3.5" />
              </button>
              <div className="invisible absolute left-1/2 top-full w-[540px] -translate-x-1/2 pt-4 opacity-0 transition group-hover:visible group-hover:opacity-100">
                <div className="grid grid-cols-2 gap-1 rounded-2xl border bg-background p-4 shadow-lift">
                  {categoryLinks.map(([label, href]) => (
                    <Link
                      key={href}
                      href={href}
                      className="rounded-xl px-4 py-3 text-sm font-medium transition hover:bg-muted hover:text-primary"
                    >
                      {label}
                    </Link>
                  ))}
                </div>
              </div>
            </div>
            <Link
              href="/writers"
              className="rounded-full px-4 py-2 text-sm font-semibold transition hover:bg-muted"
            >
              Writers
            </Link>
            <Link
              href="/shop?discount=true"
              className="rounded-full px-4 py-2 text-sm font-semibold transition hover:bg-muted"
            >
              Offers
            </Link>
            <Link
              href="/about"
              className="rounded-full px-4 py-2 text-sm font-semibold transition hover:bg-muted"
            >
              Our story
            </Link>
          </nav>

          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSearchOpen(true)}
              aria-label="Search"
            >
              <Search className="size-5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="hidden sm:inline-flex"
              onClick={() =>
                setTheme(resolvedTheme === "dark" ? "light" : "dark")
              }
              aria-label="Toggle theme"
            >
              {resolvedTheme === "dark" ? (
                <Sun className="size-5" />
              ) : (
                <Moon className="size-5" />
              )}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="hidden sm:inline-flex"
              aria-label="Wishlist"
              asChild
            >
              <Link href="/wishlist">
                <Heart className="size-5" />
              </Link>
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="relative"
              onClick={() => setCartOpen(true)}
              aria-label={`Cart with ${count} items`}
            >
              <ShoppingBag className="size-5" />
              {count > 0 && (
                <span className="absolute right-0 top-0 grid size-5 place-items-center rounded-full bg-accent text-[10px] font-black text-accent-foreground">
                  {count > 9 ? "9+" : count}
                </span>
              )}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={() => setMenuOpen((value) => !value)}
              aria-label="Toggle menu"
            >
              {menuOpen ? (
                <X className="size-5" />
              ) : (
                <Menu className="size-5" />
              )}
            </Button>
          </div>
        </div>

        {menuOpen && (
          <nav className="border-t bg-background px-4 py-5 lg:hidden">
            <div className="container grid gap-1 px-0">
              {[
                ["Shop all books", "/shop"],
                ["Categories", "/categories"],
                ["Writers", "/writers"],
                ["Current offers", "/shop?discount=true"],
                ["Our story", "/about"],
                ["Contact", "/contact"]
              ].map(([label, href]) => (
                <Link
                  key={href}
                  href={href}
                  onClick={() => setMenuOpen(false)}
                  className="rounded-xl px-3 py-3 text-sm font-semibold hover:bg-muted"
                >
                  {label}
                </Link>
              ))}
            </div>
          </nav>
        )}
      </header>
      <SearchDialog open={searchOpen} onOpenChange={setSearchOpen} />
      <CartDrawer />
    </>
  );
}
