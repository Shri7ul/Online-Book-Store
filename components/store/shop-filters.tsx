"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { Check, Filter, RotateCcw, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { Category, Writer } from "@/lib/types";
import { cn } from "@/lib/utils";

export function ShopFilters({
  categories,
  writers
}: {
  categories: Category[];
  writers: Writer[];
}) {
  const router = useRouter();
  const current = useSearchParams();
  const [open, setOpen] = useState(false);

  function update(key: string, value?: string) {
    const params = new URLSearchParams(current.toString());
    if (!value || params.get(key) === value) params.delete(key);
    else params.set(key, value);
    params.delete("page");
    router.push(`/shop?${params.toString()}`);
  }

  const content = (
    <div className="space-y-8">
      <FilterGroup title="Category">
        {categories.map((category) => (
          <FilterButton
            key={category.id}
            active={current.get("category") === category.slug}
            onClick={() => update("category", category.slug)}
          >
            {category.name}
          </FilterButton>
        ))}
      </FilterGroup>

      <FilterGroup title="Writer">
        <div className="max-h-52 space-y-1 overflow-y-auto pr-2">
          {writers.map((writer) => (
            <FilterButton
              key={writer.id}
              active={current.get("writer") === writer.slug}
              onClick={() => update("writer", writer.slug)}
            >
              {writer.name}
            </FilterButton>
          ))}
        </div>
      </FilterGroup>

      <FilterGroup title="Price range">
        <div className="grid grid-cols-2 gap-2">
          <Input
            type="number"
            defaultValue={current.get("min") ?? ""}
            placeholder="Min ৳"
            onBlur={(event) => update("min", event.target.value)}
            className="h-10"
          />
          <Input
            type="number"
            defaultValue={current.get("max") ?? ""}
            placeholder="Max ৳"
            onBlur={(event) => update("max", event.target.value)}
            className="h-10"
          />
        </div>
      </FilterGroup>

      <FilterGroup title="Show only">
        {[
          ["discount", "Discounted books"],
          ["new", "New arrivals"],
          ["best", "Best sellers"],
          ["available", "In stock"]
        ].map(([key, label]) => (
          <FilterButton
            key={key}
            active={current.get(key) === "true"}
            onClick={() => update(key, "true")}
          >
            {label}
          </FilterButton>
        ))}
      </FilterGroup>

      <Button
        variant="outline"
        className="w-full"
        onClick={() => router.push("/shop")}
      >
        <RotateCcw className="size-4" /> Reset filters
      </Button>
    </div>
  );

  return (
    <>
      <Button
        variant="outline"
        className="lg:hidden"
        onClick={() => setOpen(true)}
      >
        <Filter className="size-4" /> Filters
      </Button>
      <aside className="hidden w-60 shrink-0 lg:block">{content}</aside>
      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            className="absolute inset-0 bg-foreground/30 backdrop-blur-sm"
            onClick={() => setOpen(false)}
            aria-label="Close filters"
          />
          <div className="absolute inset-y-0 left-0 w-[88%] max-w-sm overflow-y-auto bg-background p-6 shadow-lift">
            <div className="mb-8 flex items-center justify-between">
              <h2 className="font-display text-2xl font-semibold">Filters</h2>
              <Button
                size="icon"
                variant="ghost"
                onClick={() => setOpen(false)}
              >
                <X className="size-5" />
              </Button>
            </div>
            {content}
          </div>
        </div>
      )}
    </>
  );
}

function FilterGroup({
  title,
  children
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <h3 className="mb-3 text-xs font-black uppercase tracking-[0.12em]">
        {title}
      </h3>
      <div className="space-y-1">{children}</div>
    </div>
  );
}

function FilterButton({
  active,
  children,
  onClick
}: {
  active: boolean;
  children: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm transition hover:bg-muted",
        active && "bg-muted font-semibold text-primary"
      )}
    >
      {children}
      {active && <Check className="size-3.5" />}
    </button>
  );
}
