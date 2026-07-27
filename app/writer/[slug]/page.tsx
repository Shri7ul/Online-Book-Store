import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { BookCard } from "@/components/store/book-card";
import { getWriterBySlug } from "@/lib/repositories/catalog";

export const dynamic = "force-dynamic";
type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const { writer } = await getWriterBySlug(slug);
  return { title: writer?.name ?? "Writer", description: writer?.biography };
}

export default async function WriterPage({ params }: Props) {
  const { slug } = await params;
  const { writer, books } = await getWriterBySlug(slug);
  if (!writer) notFound();
  return (
    <div className="container py-12">
      <div className="mb-14 grid items-center gap-8 border-b pb-12 md:grid-cols-[180px_1fr]">
        <div className="relative aspect-square overflow-hidden rounded-full bg-muted">
          {writer.photo_url && (
            <Image
              src={writer.photo_url}
              alt={writer.name}
              fill
              priority
              sizes="180px"
              className="object-cover"
            />
          )}
        </div>
        <div className="max-w-3xl">
          <p className="text-xs font-black uppercase tracking-[0.16em] text-accent-foreground">
            Featured writer
          </p>
          <h1 className="font-display mt-3 text-5xl font-semibold sm:text-7xl">
            {writer.name}
          </h1>
          <p className="mt-5 text-base leading-8 text-muted-foreground">
            {writer.biography}
          </p>
        </div>
      </div>
      <h2 className="font-display mb-8 text-3xl font-semibold">
        Books by {writer.name}
      </h2>
      <div className="grid grid-cols-2 gap-x-4 gap-y-10 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 lg:gap-6">
        {books.map((book) => (
          <BookCard key={book.id} book={book} />
        ))}
      </div>
    </div>
  );
}
