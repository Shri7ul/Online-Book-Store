import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { BookCard } from "@/components/store/book-card";
import { getCategoryBySlug } from "@/lib/repositories/catalog";

export const dynamic = "force-dynamic";
type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const { category } = await getCategoryBySlug(slug);
  return {
    title: category?.name ?? "Category",
    description: category?.description
  };
}

export default async function CategoryPage({ params }: Props) {
  const { slug } = await params;
  const { category, books } = await getCategoryBySlug(slug);
  if (!category) notFound();
  return (
    <div className="container py-12">
      <div className="mb-12 max-w-3xl">
        <p className="text-xs font-black uppercase tracking-[0.16em] text-accent-foreground">
          Book category
        </p>
        <h1 className="font-display mt-3 text-5xl font-semibold sm:text-7xl">
          {category.name}
        </h1>
        <p className="mt-5 text-base leading-8 text-muted-foreground">
          {category.description}
        </p>
      </div>
      <div className="grid grid-cols-2 gap-x-4 gap-y-10 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 lg:gap-6">
        {books.map((book) => (
          <BookCard key={book.id} book={book} />
        ))}
      </div>
    </div>
  );
}
