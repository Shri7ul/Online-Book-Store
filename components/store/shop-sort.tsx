"use client";

import { useRouter, useSearchParams } from "next/navigation";

export function ShopSort() {
  const router = useRouter();
  const current = useSearchParams();
  return (
    <select
      value={current.get("sort") ?? "newest"}
      onChange={(event) => {
        const params = new URLSearchParams(current.toString());
        params.set("sort", event.target.value);
        router.push(`/shop?${params.toString()}`);
      }}
      className="h-11 rounded-xl border bg-background px-4 text-sm font-semibold outline-none focus:border-primary"
      aria-label="Sort books"
    >
      <option value="newest">Newest</option>
      <option value="price-low">Price: low to high</option>
      <option value="price-high">Price: high to low</option>
      <option value="popular">Most popular</option>
      <option value="discount">Highest discount</option>
    </select>
  );
}
