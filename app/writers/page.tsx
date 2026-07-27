import Image from "next/image";
import Link from "next/link";
import { getWriters } from "@/lib/repositories/catalog";

export const dynamic = "force-dynamic";

export default async function WritersPage() {
  const writers = await getWriters();
  return (
    <div className="container py-12">
      <div className="mb-12 max-w-2xl">
        <p className="text-xs font-black uppercase tracking-[0.16em] text-accent-foreground">
          Authors & thinkers
        </p>
        <h1 className="font-display mt-3 text-5xl font-semibold sm:text-7xl">
          Meet the writers.
        </h1>
      </div>
      <div className="grid grid-cols-2 gap-x-5 gap-y-10 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
        {writers.map((writer) => (
          <Link
            key={writer.id}
            href={`/writer/${writer.slug}`}
            className="group text-center"
          >
            <div className="relative aspect-square overflow-hidden rounded-full bg-muted">
              {writer.photo_url && (
                <Image
                  src={writer.photo_url}
                  alt={writer.name}
                  fill
                  sizes="220px"
                  className="object-cover grayscale transition duration-500 group-hover:scale-105 group-hover:grayscale-0"
                />
              )}
            </div>
            <h2 className="font-display mt-5 text-xl font-semibold">
              {writer.name}
            </h2>
            <p className="mt-1 text-xs text-muted-foreground">
              {writer.book_count} books
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
}
