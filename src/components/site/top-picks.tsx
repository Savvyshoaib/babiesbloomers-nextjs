"use client";

import { useMemo } from "react";
import { topPicks as staticTopPicks } from "@/lib/site-data";
import { useAppSelector } from "@/store/hooks";
import { selectLatestProducts } from "@/store/catalog-slice";
import { PickCard } from "./product-card";

const TOP_PICKS_LIMIT = 10;

export function TopPicks() {
  const latest = useAppSelector(selectLatestProducts(TOP_PICKS_LIMIT));

  const products = useMemo(() => {
    if (latest.length > 0) {
      return latest.map((p) => ({
        title: p.title,
        image: p.image,
        oldPrice: p.oldPrice,
        price: p.price,
        badge: p.badge,
        slug: p.slug as string | undefined,
      }));
    }
    return staticTopPicks.slice(0, TOP_PICKS_LIMIT).map((p) => ({
      ...p,
      slug: undefined as string | undefined,
    }));
  }, [latest]);

  return (
    <section
      className="my-[80px] max-[880px]:my-[50px]"
      aria-labelledby="top-picks-heading"
    >
      <div className="shell">
        <h2
          id="top-picks-heading"
          className="text-center font-fredoka text-[28px] font-semibold capitalize leading-[38px] text-ink sm:text-[32px] lg:text-[38px] lg:leading-[48px]"
        >
          Top Picks
        </h2>

        <div className="mt-[24px] grid grid-cols-2 gap-3 sm:mt-[30px] sm:grid-cols-3 sm:gap-[16px] md:grid-cols-4 xl:grid-cols-5">
          {products.map((product) => (
            <PickCard
              key={product.slug ?? product.title}
              product={product}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
