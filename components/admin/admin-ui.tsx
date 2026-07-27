import type { LucideIcon } from "lucide-react";
import { cn, formatPrice } from "@/lib/utils";

export function AdminPageHeader({
  eyebrow,
  title,
  description,
  action
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="mb-7 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
      <div>
        {eyebrow && (
          <p className="mb-2 text-[10px] font-black uppercase tracking-[0.16em] text-accent-foreground">
            {eyebrow}
          </p>
        )}
        <h1 className="font-display text-3xl font-semibold sm:text-4xl">
          {title}
        </h1>
        {description && (
          <p className="mt-2 text-sm text-muted-foreground">{description}</p>
        )}
      </div>
      {action}
    </div>
  );
}

export function MetricCard({
  label,
  value,
  icon: Icon,
  money = false,
  tone = "default"
}: {
  label: string;
  value: number;
  icon: LucideIcon;
  money?: boolean;
  tone?: "default" | "accent";
}) {
  return (
    <div className="rounded-xl border bg-card p-5">
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold text-muted-foreground">{label}</p>
        <span
          className={cn(
            "grid size-9 place-items-center rounded-lg bg-muted text-primary",
            tone === "accent" && "bg-accent/20 text-accent-foreground"
          )}
        >
          <Icon className="size-4" />
        </span>
      </div>
      <p className="font-display mt-5 text-3xl font-semibold">
        {money ? formatPrice(value) : value.toLocaleString("en-BD")}
      </p>
    </div>
  );
}

export function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    pending: "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300",
    confirmed:
      "bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-300",
    packed:
      "bg-violet-100 text-violet-800 dark:bg-violet-950 dark:text-violet-300",
    shipped:
      "bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300",
    delivered:
      "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300",
    cancelled: "bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300",
    returned:
      "bg-stone-200 text-stone-800 dark:bg-stone-800 dark:text-stone-200"
  };
  return (
    <span
      className={cn(
        "inline-flex rounded-full px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.08em]",
        styles[status] ?? "bg-muted"
      )}
    >
      {status.replace("_", " ")}
    </span>
  );
}

export function AdminTable({ children }: { children: React.ReactNode }) {
  return (
    <div className="overflow-x-auto rounded-xl border bg-card">
      <table className="w-full min-w-[760px] text-left text-sm">{children}</table>
    </div>
  );
}

export function AdminFormCard({
  title,
  description,
  children
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border bg-card p-5 sm:p-6">
      <h2 className="font-display text-xl font-semibold">{title}</h2>
      {description && (
        <p className="mt-1 text-xs leading-5 text-muted-foreground">
          {description}
        </p>
      )}
      <div className="mt-5">{children}</div>
    </div>
  );
}
