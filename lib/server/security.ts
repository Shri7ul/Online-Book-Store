import { headers } from "next/headers";

const attempts = new Map<string, { count: number; resetAt: number }>();

export async function enforceSameOrigin() {
  const headerStore = await headers();
  const origin = headerStore.get("origin");
  const host = headerStore.get("host");
  if (origin && host && new URL(origin).host !== host) {
    throw new Error("Invalid request origin.");
  }
}

export async function rateLimit(key: string, max = 12, windowMs = 60_000) {
  const headerStore = await headers();
  const ip =
    headerStore.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  const id = `${key}:${ip}`;
  const now = Date.now();
  const current = attempts.get(id);
  if (!current || current.resetAt < now) {
    attempts.set(id, { count: 1, resetAt: now + windowMs });
    return;
  }
  if (current.count >= max) throw new Error("Too many requests. Try again soon.");
  current.count += 1;
}
