import type { Metadata } from "next";
import Image from "next/image";
import { BookHeart, Compass, HeartHandshake } from "lucide-react";

export const metadata: Metadata = { title: "Our story" };

export default function AboutPage() {
  return (
    <>
      <section className="container py-8 sm:py-12">
        <div className="relative h-[68vh] min-h-[520px] max-h-[760px] overflow-hidden rounded-[28px] bg-primary">
          <Image
            src="https://images.unsplash.com/photo-1526243741027-444d633d7365?auto=format&fit=crop&w=1800&q=88"
            alt="A carefully arranged collection of books"
            fill
            priority
            sizes="100vw"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-primary via-primary/35 to-transparent" />
          <div className="absolute inset-x-0 bottom-0 max-w-4xl p-7 text-white sm:p-14">
            <p className="text-xs font-black uppercase tracking-[0.18em] text-white/65">
              Our story
            </p>
            <h1 className="font-display text-balance mt-4 text-5xl font-semibold leading-tight sm:text-7xl">
              A small bookstore with room for big ideas.
            </h1>
          </div>
        </div>
      </section>
      <section className="container grid gap-12 py-16 lg:grid-cols-[0.8fr_1.2fr]">
        <h2 className="font-display text-4xl font-semibold sm:text-5xl">
          Built for readers who choose with care.
        </h2>
        <div className="space-y-6 text-base leading-8 text-muted-foreground">
          <p>
            Mini Book Cottage began with a simple belief: an online bookstore
            can be convenient without becoming impersonal. Our shelves are
            edited, our prices are clear, and our service is human.
          </p>
          <p>
            We bring together fiction, ideas, children’s books, history,
            religion, science, and essential Bangla voices, then deliver them
            thoughtfully across Bangladesh.
          </p>
        </div>
      </section>
      <section className="border-y bg-card">
        <div className="container grid gap-px bg-border md:grid-cols-3">
          {[
            [Compass, "Curated", "Less noise, better discovery."],
            [BookHeart, "Reader-led", "Books selected for lasting value."],
            [HeartHandshake, "Personal", "Clear, attentive support."]
          ].map(([Icon, title, copy]) => {
            const ItemIcon = Icon as typeof Compass;
            return (
              <div key={title as string} className="bg-card p-9">
                <ItemIcon className="size-6 text-accent" />
                <h3 className="font-display mt-5 text-2xl font-semibold">
                  {title as string}
                </h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  {copy as string}
                </p>
              </div>
            );
          })}
        </div>
      </section>
    </>
  );
}
