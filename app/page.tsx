import { BookShelf } from "@/components/store/book-shelf";
import {
  CategoryGrid,
  Newsletter,
  Reviews,
  WhyChooseUs,
  WriterStrip
} from "@/components/store/home-sections";
import { HeroCarousel } from "@/components/store/hero-carousel";
import { getHomeData } from "@/lib/repositories/catalog";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const data = await getHomeData();

  return (
    <>
      <HeroCarousel banners={data.banners} />
      <CategoryGrid categories={data.categories} />
      <BookShelf
        title="The Cottage selection."
        eyebrow="Featured books"
        books={data.featured}
        href="/shop"
      />
      <WriterStrip writers={data.writers} />
      <BookShelf
        title="Just arrived."
        eyebrow="Fresh on the shelf"
        books={data.newArrivals}
        href="/shop?new=true"
      />
      <BookShelf
        title="Reader favourites."
        eyebrow="Best sellers"
        books={data.bestSellers}
        href="/shop?best=true"
      />
      <WhyChooseUs />
      <BookShelf
        title="Worth talking about."
        eyebrow="Trending now"
        books={data.trending}
        href="/shop?sort=popular"
      />
      <Reviews />
      <BookShelf
        title="Good books, better prices."
        eyebrow="Current offers"
        books={data.discounts}
        href="/shop?discount=true"
      />
      <Newsletter />
    </>
  );
}
