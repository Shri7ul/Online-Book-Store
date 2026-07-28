import { NextResponse } from "next/server";
import { getBooks } from "@/lib/repositories/catalog";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const noStoreHeaders = {
  "Cache-Control": "private, no-cache, no-store, max-age=0, must-revalidate",
  "CDN-Cache-Control": "no-store",
  "Netlify-CDN-Cache-Control": "no-store"
};

export async function GET(request: Request) {
  const query = new URL(request.url).searchParams.get("q")?.trim() ?? "";
  if (!query) {
    return NextResponse.json({ books: [] }, { headers: noStoreHeaders });
  }

  const { books } = await getBooks({ search: query, limit: 8 });
  return NextResponse.json({ books }, { headers: noStoreHeaders });
}
