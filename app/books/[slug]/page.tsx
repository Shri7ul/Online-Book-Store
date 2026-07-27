import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  BadgeCheck,
  ChevronRight,
  PackageCheck,
  RotateCcw,
  Star,
  Truck
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { BookActions } from "@/components/store/book-actions";
import { BookShelf } from "@/components/store/book-shelf";
import { PreviewDialog } from "@/components/store/preview-dialog";
import { discountPercent, formatPrice } from "@/lib/utils";
import { getBookBySlug, getBooks } from "@/lib/repositories/catalog";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const book = await getBookBySlug(slug);
  if (!book) return { title: "Book not found" };
  return {
    title: book.seo_title ?? book.name,
    description: book.seo_description ?? book.description.slice(0, 155),
    openGraph: {
      title: book.name,
      description: book.description.slice(0, 155),
      images: book.cover_url ? [book.cover_url] : []
    }
  };
}

export default async function BookPage({ params }: Props) {
  const { slug } = await params;
  const book = await getBookBySlug(slug);
  if (!book) notFound();
  const related = await getBooks({
    category: book.category?.slug,
    limit: 7
  });
  const discount = discountPercent(book.regular_price, book.discount_price);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Book",
    name: book.name,
    author: { "@type": "Person", name: book.writer?.name },
    isbn: book.isbn,
    image: book.cover_url,
    offers: {
      "@type": "Offer",
      priceCurrency: "BDT",
      price: book.discount_price ?? book.regular_price,
      availability:
        book.stock > 0
          ? "https://schema.org/InStock"
          : "https://schema.org/OutOfStock"
    }
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="container py-8 sm:py-12">
        <nav className="mb-8 flex items-center gap-2 overflow-hidden text-xs text-muted-foreground">
          <Link href="/">Home</Link>
          <ChevronRight className="size-3" />
          <Link href="/shop">Shop</Link>
          <ChevronRight className="size-3" />
          <span className="truncate text-foreground">{book.name}</span>
        </nav>

        <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:gap-16">
          <div className="grid gap-4 sm:grid-cols-[88px_1fr]">
            <div className="order-2 flex gap-3 sm:order-1 sm:flex-col">
              {[book.cover_url, ...(book.gallery ?? []).map((item) => item.url)]
                .filter(Boolean)
                .slice(0, 4)
                .map((image, index) => (
                  <div
                    key={`${image}-${index}`}
                    className="relative aspect-[3/4] w-16 overflow-hidden rounded-md border bg-muted sm:w-full"
                  >
                    <Image
                      src={image!}
                      alt=""
                      fill
                      sizes="88px"
                      className="object-cover"
                    />
                  </div>
                ))}
            </div>
            <div className="relative order-1 aspect-[3/4] overflow-hidden rounded-xl bg-muted shadow-soft sm:order-2">
              {book.cover_url && (
                <Image
                  src={book.cover_url}
                  alt={book.name}
                  fill
                  priority
                  sizes="(max-width: 1024px) 90vw, 480px"
                  className="object-cover"
                />
              )}
              {discount > 0 && (
                <Badge className="absolute left-4 top-4">
                  Save {discount}%
                </Badge>
              )}
            </div>
          </div>

          <div className="lg:py-5">
            <p className="text-xs font-black uppercase tracking-[0.14em] text-accent-foreground">
              {book.category?.name}
            </p>
            <h1 className="font-display text-balance mt-3 text-4xl font-semibold leading-tight sm:text-6xl">
              {book.name}
            </h1>
            <p className="mt-4 text-sm">
              by{" "}
              <Link
                href={`/writer/${book.writer?.slug}`}
                className="font-bold underline decoration-border underline-offset-4"
              >
                {book.writer?.name}
              </Link>
            </p>
            <div className="mt-5 flex items-center gap-3 text-sm">
              <span className="flex items-center gap-1 font-bold">
                <Star className="size-4 fill-accent text-accent" />
                {(book.rating ?? 4.8).toFixed(1)}
              </span>
              <span className="text-muted-foreground">
                {book.review_count ?? 0} reviews
              </span>
              <span className="text-border">|</span>
              <span
                className={
                  book.stock > 0 ? "text-primary" : "text-destructive"
                }
              >
                {book.stock > 0 ? `${book.stock} in stock` : "Out of stock"}
              </span>
            </div>

            <div className="mt-7 flex items-baseline gap-3 border-y py-6">
              <span className="font-display text-4xl font-semibold text-primary">
                {formatPrice(book.discount_price ?? book.regular_price)}
              </span>
              {book.discount_price && (
                <span className="text-base text-muted-foreground line-through">
                  {formatPrice(book.regular_price)}
                </span>
              )}
            </div>

            <p className="mt-7 text-sm leading-7 text-muted-foreground">
              {book.description}
            </p>

            <BookActions book={book} />
            <PreviewDialog previews={book.previews ?? []} />

            <dl className="mt-9 grid grid-cols-2 gap-x-8 gap-y-5 border-t pt-7 text-sm sm:grid-cols-3">
              {[
                ["Publisher", book.publisher],
                ["Language", book.language],
                ["Pages", book.pages],
                ["Edition", book.edition],
                ["ISBN", book.isbn],
                ["Category", book.category?.name]
              ].map(([label, value]) => (
                <div key={label}>
                  <dt className="text-xs text-muted-foreground">{label}</dt>
                  <dd className="mt-1 font-semibold">{value || "—"}</dd>
                </div>
              ))}
            </dl>

            <div className="mt-8 grid gap-3 rounded-xl bg-muted p-5 sm:grid-cols-3">
              {[
                [Truck, "Nationwide delivery"],
                [PackageCheck, "Careful packaging"],
                [RotateCcw, "Support after delivery"]
              ].map(([Icon, label]) => {
                const Component = Icon as typeof BadgeCheck;
                return (
                  <div
                    key={label as string}
                    className="flex items-center gap-3 text-xs font-semibold"
                  >
                    <Component className="size-4 text-primary" />
                    {label as string}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
      <BookShelf
        title="More from this shelf."
        eyebrow="You may also like"
        books={related.books.filter((item) => item.id !== book.id)}
        href={`/category/${book.category?.slug}`}
      />
    </>
  );
}
