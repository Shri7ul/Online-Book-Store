import { NextResponse } from "next/server";
import { getBooks } from "@/lib/repositories/catalog";

export async function GET(request: Request) {
  const query = new URL(request.url).searchParams.get("q")?.trim() ?? "";
  if (query.length < 2) return NextResponse.json({ books: [] });

  const { books } = await getBooks({ search: query, limit: 8 });
  return NextResponse.json(
    { books },
    {
      headers: {
        "Cache-Control": "public, s-maxage=30, stale-while-revalidate=120"
      }
    }
  );
}
