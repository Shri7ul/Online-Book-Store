import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  BadgeCheck,
  BookHeart,
  Headphones,
  Quote,
  ShieldCheck,
  Sparkles,
  Star,
  Truck
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { Category, Writer } from "@/lib/types";
import { subscribeNewsletterAction } from "@/lib/actions/public";

export function CategoryGrid({ categories }: { categories: Category[] }) {
  return (
    <section className="container py-16 sm:py-20">
      <div className="mb-8 max-w-xl">
        <p className="mb-3 text-xs font-black uppercase tracking-[0.16em] text-accent-foreground">
          Browse your way
        </p>
        <h2 className="font-display text-3xl font-semibold sm:text-4xl">
          A shelf for every curiosity.
        </h2>
      </div>
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4 lg:gap-5">
        {categories.slice(0, 8).map((category, index) => (
          <Link
            href={`/category/${category.slug}`}
            key={category.id}
            className="group relative min-w-0 aspect-[1.05/1] overflow-hidden rounded-xl bg-primary sm:aspect-[1.2/1]"
          >
            {category.image_url && (
              <Image
                src={category.image_url}
                alt=""
                fill
                sizes="(max-width: 768px) 50vw, 25vw"
                className="object-cover opacity-75 transition duration-700 group-hover:scale-105 group-hover:opacity-60"
              />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-primary via-primary/25 to-transparent" />
            <div className="absolute inset-x-0 bottom-0 p-4 text-white sm:p-6">
              <p className="font-display break-words text-[17px] font-semibold leading-tight sm:text-2xl">
                {category.name}
              </p>
              <p className="mt-1 text-[11px] text-white/65">
                {category.book_count ?? 0} books
              </p>
            </div>
            <span className="absolute right-4 top-4 grid size-9 translate-x-1 place-items-center rounded-full bg-white text-primary opacity-0 transition group-hover:translate-x-0 group-hover:opacity-100">
              <ArrowRight className="size-4" />
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}

export function WriterStrip({ writers }: { writers: Writer[] }) {
  return (
    <section className="bg-primary py-16 text-primary-foreground sm:py-20">
      <div className="container">
        <div className="mb-9 flex items-end justify-between gap-5">
          <div>
            <p className="mb-3 text-xs font-black uppercase tracking-[0.16em] text-primary-foreground/60">
              Meet the minds
            </p>
            <h2 className="font-display text-3xl font-semibold sm:text-4xl">
              Writers readers return to.
            </h2>
          </div>
          <Button
            asChild
            variant="outline"
            className="hidden border-white/25 bg-transparent text-white hover:bg-white hover:text-primary sm:flex"
          >
            <Link href="/writers">All writers</Link>
          </Button>
        </div>
        <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-6">
          {writers.map((writer) => (
            <Link
              href={`/writer/${writer.slug}`}
              key={writer.id}
              className="group text-center"
            >
              <div className="relative mx-auto aspect-square w-full max-w-44 overflow-hidden rounded-full border-4 border-white/10 bg-white/10">
                {writer.photo_url && (
                  <Image
                    src={writer.photo_url}
                    alt={writer.name}
                    fill
                    sizes="180px"
                    className="object-cover grayscale transition duration-500 group-hover:scale-105 group-hover:grayscale-0"
                  />
                )}
              </div>
              <h3 className="font-display mt-4 text-lg font-semibold">
                {writer.name}
              </h3>
              <p className="mt-1 text-xs text-primary-foreground/55">
                {writer.book_count ?? 0} books
              </p>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

export function WhyChooseUs() {
  const items = [
    {
      icon: BookHeart,
      title: "Thoughtfully selected",
      copy: "Every title earns its place on our shelves."
    },
    {
      icon: BadgeCheck,
      title: "Authentic editions",
      copy: "Quality books from publishers we trust."
    },
    {
      icon: Truck,
      title: "Nationwide delivery",
      copy: "Reliable delivery throughout Bangladesh."
    },
    {
      icon: Headphones,
      title: "Human support",
      copy: "Real help before and after your order."
    }
  ];

  return (
    <section className="container py-16 sm:py-24">
      <div className="grid items-center gap-12 lg:grid-cols-[0.9fr_1.1fr]">
        <div>
          <span className="inline-flex items-center gap-2 rounded-full bg-muted px-3 py-1.5 text-xs font-bold">
            <Sparkles className="size-3.5 text-accent" /> The Cottage promise
          </span>
          <h2 className="font-display text-balance mt-5 text-4xl font-semibold leading-tight sm:text-5xl">
            Buying books online should still feel personal.
          </h2>
          <p className="mt-5 max-w-lg text-base leading-8 text-muted-foreground">
            We pair a carefully edited catalog with clear pricing and attentive
            service, so choosing your next read never feels like sorting through
            a warehouse.
          </p>
          <div className="mt-8 flex items-center gap-3 text-sm font-semibold">
            <ShieldCheck className="size-5 text-primary" />
            Secure checkout · transparent delivery fees
          </div>
        </div>
        <div className="grid gap-px overflow-hidden rounded-2xl border bg-border sm:grid-cols-2">
          {items.map(({ icon: Icon, title, copy }) => (
            <div key={title} className="bg-card p-7 sm:p-9">
              <span className="grid size-11 place-items-center rounded-xl bg-muted text-primary">
                <Icon className="size-5" />
              </span>
              <h3 className="font-display mt-5 text-xl font-semibold">
                {title}
              </h3>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                {copy}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function Reviews() {
  const reviews = [
    {
      name: "Nusrat Jahan",
      location: "Dhanmondi",
      copy: "The packaging was careful, the edition was exactly as described, and the whole experience felt considered."
    },
    {
      name: "Mahin Islam",
      location: "Chattogram",
      copy: "I found three books I had been searching for. Delivery updates were clear and support replied quickly."
    },
    {
      name: "Sadia Karim",
      location: "Uttara",
      copy: "A refreshing bookstore. The selection feels curated instead of endless, which makes choosing much easier."
    }
  ];

  return (
    <section className="border-y bg-card py-16 sm:py-20">
      <div className="container">
        <div className="mx-auto mb-10 max-w-2xl text-center">
          <p className="mb-3 text-xs font-black uppercase tracking-[0.16em] text-accent-foreground">
            Reader notes
          </p>
          <h2 className="font-display text-3xl font-semibold sm:text-4xl">
            Trusted by readers across Bangladesh.
          </h2>
        </div>
        <div className="grid gap-5 md:grid-cols-3">
          {reviews.map((review) => (
            <article key={review.name} className="rounded-xl border p-7">
              <Quote className="size-7 text-accent" />
              <div className="mt-5 flex gap-1 text-accent">
                {Array.from({ length: 5 }).map((_, index) => (
                  <Star key={index} className="size-4 fill-current" />
                ))}
              </div>
              <p className="mt-5 text-sm leading-7">{review.copy}</p>
              <div className="mt-7 border-t pt-5">
                <p className="font-display font-semibold">{review.name}</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {review.location}
                </p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

export function Newsletter() {
  return (
    <section className="container py-16 sm:py-24">
      <div className="paper-grid overflow-hidden rounded-2xl border bg-muted px-6 py-14 text-center sm:px-12">
        <p className="text-xs font-black uppercase tracking-[0.16em] text-accent-foreground">
          The Cottage Letter
        </p>
        <h2 className="font-display mx-auto mt-4 max-w-2xl text-balance text-3xl font-semibold sm:text-5xl">
          New books, quiet recommendations, useful offers.
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-sm leading-7 text-muted-foreground">
          One thoughtful email at a time. No noise, no daily promotions.
        </p>
        <form
          action={subscribeNewsletterAction}
          className="mx-auto mt-8 flex max-w-lg flex-col gap-3 sm:flex-row"
        >
          <Input
            type="email"
            name="email"
            required
            placeholder="Email address"
            className="h-12 bg-background"
          />
          <Button type="submit" className="h-12 shrink-0">
            Join the list
          </Button>
        </form>
      </div>
    </section>
  );
}
