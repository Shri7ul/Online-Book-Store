import { headers } from "next/headers";

const attempts = new Map<string, { count: number; resetAt: number }>();
const MAX_TRACKED_CLIENTS = 5000;

export class HttpError extends Error {
  constructor(
    message: string,
    public readonly status: number
  ) {
    super(message);
    this.name = "HttpError";
  }
}

export async function enforceSameOrigin() {
  const headerStore = await headers();
  const origin = headerStore.get("origin");
  const host = headerStore.get("host");
  if (origin && host && new URL(origin).host !== host) {
    throw new HttpError("Invalid request origin.", 403);
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
    if (attempts.size >= MAX_TRACKED_CLIENTS) {
      for (const [attemptId, attempt] of attempts) {
        if (attempt.resetAt < now) attempts.delete(attemptId);
      }
    }
    while (attempts.size >= MAX_TRACKED_CLIENTS) {
      const oldest = attempts.keys().next().value as string | undefined;
      if (!oldest) break;
      attempts.delete(oldest);
    }
    attempts.set(id, { count: 1, resetAt: now + windowMs });
    return;
  }
  if (current.count >= max)
    throw new HttpError("Too many requests. Try again soon.", 429);
  current.count += 1;
}
