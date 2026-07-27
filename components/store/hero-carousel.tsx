"use client";

import Autoplay from "embla-carousel-autoplay";
import useEmblaCarousel from "embla-carousel-react";
import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { HeroBanner } from "@/lib/types";
import { cn } from "@/lib/utils";

export function HeroCarousel({ banners }: { banners: HeroBanner[] }) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [emblaRef, emblaApi] = useEmblaCarousel(
    { loop: true, direction: "ltr" },
    [Autoplay({ delay: 6000, stopOnInteraction: false })]
  );

  const onSelect = useCallback(() => {
    if (emblaApi) setSelectedIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    onSelect();
    emblaApi.on("select", onSelect);
    emblaApi.on("reInit", onSelect);
    return () => {
      emblaApi.off("select", onSelect);
      emblaApi.off("reInit", onSelect);
    };
  }, [emblaApi, onSelect]);

  if (!banners.length) return null;

  return (
    <section className="container pt-5 sm:pt-7">
      <div
        ref={emblaRef}
        className="relative overflow-hidden rounded-[28px] bg-primary"
      >
        <div className="flex">
          {banners.map((banner) => (
            <div
              key={banner.id}
              className="relative min-w-0 flex-[0_0_100%] overflow-hidden"
            >
              <div className="relative h-[560px] sm:h-[580px] lg:h-[620px]">
                <Image
                  src={banner.image_url}
                  alt=""
                  fill
                  priority={banner.sort_order === 1}
                  sizes="(max-width: 768px) 100vw, 1400px"
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(9,35,27,.88)_0%,rgba(9,35,27,.67)_42%,rgba(9,35,27,.1)_75%)] max-md:bg-[linear-gradient(0deg,rgba(9,35,27,.92)_5%,rgba(9,35,27,.28)_80%)]" />
                <div className="absolute inset-0 flex items-end px-6 pb-20 sm:px-12 lg:items-center lg:px-20 lg:pb-0">
                  <div className="min-w-0 max-w-2xl text-white">
                    <p className="mb-5 text-xs font-bold uppercase tracking-[0.2em] text-white/70">
                      Mini Book Cottage · Curated reading
                    </p>
                    <h1 className="font-display text-balance max-w-full break-words text-[38px] font-semibold leading-[1.04] sm:text-6xl lg:text-7xl">
                      {banner.title}
                    </h1>
                    {banner.subtitle && (
                      <p className="mt-6 max-w-xl text-base leading-7 text-white/78 sm:text-lg">
                        {banner.subtitle}
                      </p>
                    )}
                    {banner.button_text && banner.button_url && (
                      <Button
                        asChild
                        size="lg"
                        className="mt-8 bg-white text-primary hover:bg-white/90"
                      >
                        <Link href={banner.button_url}>
                          {banner.button_text}
                          <ArrowRight className="size-4" />
                        </Link>
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="absolute bottom-6 left-6 right-6 flex items-center justify-between sm:left-12 sm:right-12">
          <div className="flex items-center gap-2">
            {banners.map((banner, index) => (
              <button
                key={banner.id}
                onClick={() => emblaApi?.scrollTo(index)}
                className={cn(
                  "h-1.5 rounded-full bg-white/40 transition-all",
                  selectedIndex === index ? "w-8 bg-white" : "w-2"
                )}
                aria-label={`Go to banner ${index + 1}`}
              />
            ))}
          </div>
          <div className="hidden gap-2 sm:flex">
            <button
              onClick={() => emblaApi?.scrollPrev()}
              className="grid size-11 place-items-center rounded-full border border-white/30 bg-black/10 text-white backdrop-blur hover:bg-white hover:text-primary"
              aria-label="Previous banner"
            >
              <ArrowLeft className="size-4" />
            </button>
            <button
              onClick={() => emblaApi?.scrollNext()}
              className="grid size-11 place-items-center rounded-full border border-white/30 bg-black/10 text-white backdrop-blur hover:bg-white hover:text-primary"
              aria-label="Next banner"
            >
              <ArrowRight className="size-4" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
