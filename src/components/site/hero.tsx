"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useAppSelector } from "@/store/hooks";
import { selectSiteContent } from "@/store/site-content-slice";

export function Hero() {
  const { hero } = useAppSelector(selectSiteContent);
  const slides = hero.slides?.length
    ? hero.slides
    : [{ id: "hero-1", image: hero.image, href: hero.href, alt: hero.alt }];
  const [index, setIndex] = useState(0);
  const multi = slides.length > 1;

  useEffect(() => {
    setIndex(0);
  }, [slides.length, slides[0]?.image]);

  useEffect(() => {
    if (!multi || !hero.autoplay) return;
    const timer = window.setInterval(() => {
      setIndex((i) => (i + 1) % slides.length);
    }, hero.intervalMs || 5000);
    return () => window.clearInterval(timer);
  }, [multi, hero.autoplay, hero.intervalMs, slides.length]);

  function go(next: number) {
    setIndex((next + slides.length) % slides.length);
  }

  const current = slides[index] ?? slides[0]!;

  return (
    <section
      aria-label={current.alt || "Homepage hero"}
      className="relative overflow-hidden bg-[#f7f3ef]"
    >
      <div className="relative w-full">
        {slides.map((slide, i) => {
          const active = i === index;
          const fade = hero.effect !== "slide";
          return (
            <div
              key={slide.id}
              className={`${
                active ? "relative z-[1]" : "pointer-events-none absolute inset-0 z-0"
              } ${
                fade
                  ? `transition-opacity duration-700 ease-out ${
                      active ? "opacity-100" : "opacity-0"
                    }`
                  : `transition-transform duration-700 ease-out ${
                      active
                        ? "translate-x-0"
                        : i < index
                          ? "-translate-x-full"
                          : "translate-x-full"
                    }`
              }`}
              aria-hidden={!active}
            >
              <Link href={slide.href || "/shop"} className="block">
                <Image
                  src={slide.image}
                  alt={slide.alt}
                  width={1920}
                  height={840}
                  priority={i === 0}
                  sizes="100vw"
                  className="h-auto w-full"
                  unoptimized={slide.image.startsWith("http")}
                />
              </Link>
            </div>
          );
        })}
      </div>

      {multi && hero.showArrows ? (
        <>
          <button
            type="button"
            aria-label="Previous banner"
            onClick={() => go(index - 1)}
            className="absolute left-3 top-1/2 z-[2] flex size-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/75 text-ink shadow-sm backdrop-blur transition hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-salmon/50 sm:left-5"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="size-4"
              aria-hidden="true"
            >
              <path d="M15 18l-6-6 6-6" />
            </svg>
          </button>
          <button
            type="button"
            aria-label="Next banner"
            onClick={() => go(index + 1)}
            className="absolute right-3 top-1/2 z-[2] flex size-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/75 text-ink shadow-sm backdrop-blur transition hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-salmon/50 sm:right-5"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="size-4"
              aria-hidden="true"
            >
              <path d="M9 6l6 6-6 6" />
            </svg>
          </button>
        </>
      ) : null}

      {multi && hero.showDots ? (
        <div className="absolute bottom-4 left-1/2 z-[2] flex -translate-x-1/2 gap-2">
          {slides.map((slide, i) => (
            <button
              key={slide.id}
              type="button"
              aria-label={`Go to banner ${i + 1}`}
              aria-current={i === index}
              onClick={() => setIndex(i)}
              className={`h-2.5 rounded-full transition-all ${
                i === index ? "w-6 bg-salmon" : "w-2.5 bg-white/80 hover:bg-white"
              }`}
            />
          ))}
        </div>
      ) : null}
    </section>
  );
}
