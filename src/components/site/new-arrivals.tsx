"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import {
  newArrivals as staticNewArrivals,
  newArrivalTabs,
  type NewArrivalTab,
} from "@/lib/site-data";
import { useAppSelector } from "@/store/hooks";
import {
  selectActiveProducts,
  selectNewArrivals,
} from "@/store/catalog-slice";
import { selectSiteContent } from "@/store/site-content-slice";
import { ArrivalCard } from "./product-card";
import { SectionHeading } from "./section-heading";

const HOME_NEW_ARRIVALS_LIMIT = 6;

export function NewArrivals() {
  const [activeTab, setActiveTab] = useState<NewArrivalTab>("All");
  const catalogArrivals = useAppSelector(selectNewArrivals);
  const activeProducts = useAppSelector(selectActiveProducts);
  const categories = useAppSelector((s) => s.catalog.categories);
  const { newArrivalsBanner } = useAppSelector(selectSiteContent);

  const source = useMemo(() => {
    // Prefer new-arrival tagged products; otherwise latest active products
    // from the newest categories in the catalog.
    let list =
      catalogArrivals.length > 0 ? catalogArrivals : activeProducts;

    if (list.length === 0) {
      return staticNewArrivals.slice(0, HOME_NEW_ARRIVALS_LIMIT).map((p) => ({
        ...p,
        slug: undefined as string | undefined,
        tabs: p.tabs,
      }));
    }

    // When using full active list (no new-arrival flags), prefer products
    // that belong to the latest categories (highest sort order first).
    if (catalogArrivals.length === 0 && categories.length > 0) {
      const latestCategorySlugs = [...categories]
        .sort((a, b) => b.sortOrder - a.sortOrder)
        .slice(0, 4)
        .map((c) => c.slug);

      const inLatest = list.filter((p) =>
        p.categories.some((c) => latestCategorySlugs.includes(c)),
      );
      if (inLatest.length > 0) list = inLatest;
    }

    return list.map((p) => ({
      title: p.title,
      image: p.image,
      oldPrice: p.oldPrice,
      price: p.price,
      badge: p.badge,
      slug: p.slug,
      tabs: [
        "All",
        ...p.tabs.filter((t): t is NewArrivalTab =>
          (newArrivalTabs as readonly string[]).includes(t),
        ),
      ] as NewArrivalTab[],
    }));
  }, [catalogArrivals, activeProducts, categories]);

  const products = useMemo(() => {
    const filtered =
      activeTab === "All"
        ? source
        : source.filter((product) => product.tabs.includes(activeTab));
    return filtered.slice(0, HOME_NEW_ARRIVALS_LIMIT);
  }, [source, activeTab]);

  return (
    <section
      className="mt-[48px] bg-no-repeat sm:mt-[60px] lg:mt-[80px]"
      style={{
        backgroundImage:
          "url('/images/vector-1.png'), url('/images/vector-2.png')",
        backgroundPosition: "7% 93%, 95% 80%",
      }}
      aria-labelledby="new-arrivals-heading"
    >
      <div className="shell">
        <div className="grid gap-y-8 lg:grid-cols-[558fr_852fr] lg:gap-x-[30px]">
          <div className="lg:pt-[60px]">
            <SectionHeading
              align="center"
              separator="pink"
              className="lg:items-end"
              headingClassName="lg:whitespace-nowrap"
            >
              <span id="new-arrivals-heading">New Arrivals</span>
            </SectionHeading>

            <Image
              src={newArrivalsBanner.image}
              alt={newArrivalsBanner.alt}
              width={558}
              height={654}
              sizes="(max-width: 1024px) 100vw, 558px"
              className="mt-[20px] hidden h-auto w-full rounded-[15px] sm:mt-[30px] lg:mt-[40px] lg:block"
              unoptimized={newArrivalsBanner.image.startsWith("http")}
            />
          </div>

          <div className="min-w-0">
            <div
              role="tablist"
              aria-label="Filter new arrivals"
              className="-mx-1 mb-5 flex flex-wrap items-center gap-2 overflow-x-auto px-1 pb-1 sm:mb-[30px] sm:gap-[15px]"
            >
              {newArrivalTabs.map((tab) => {
                const isActive = tab === activeTab;
                return (
                  <button
                    key={tab}
                    type="button"
                    role="tab"
                    aria-selected={isActive}
                    onClick={() => setActiveTab(tab)}
                    className={`shrink-0 cursor-pointer rounded-[30px] px-3 py-1.5 font-poppins text-[14px] font-medium leading-6 transition-colors sm:px-[15px] sm:py-[5px] sm:text-[16px] ${
                      isActive
                        ? "bg-salmon-soft text-white"
                        : "text-steel hover:bg-salmon-soft/15"
                    }`}
                  >
                    {tab}
                  </button>
                );
              })}
            </div>

            {products.length > 0 ? (
              <div className="grid grid-cols-2 gap-x-3 gap-y-5 pb-5 sm:gap-x-[30px] sm:gap-y-[20px] sm:grid-cols-3 sm:pb-[20px]">
                {products.map((product) => (
                  <ArrivalCard
                    key={product.slug ?? product.title}
                    product={product}
                  />
                ))}
              </div>
            ) : (
              <p className="py-16 text-center text-[16px] text-body">
                No products in this category yet. Try another filter.
              </p>
            )}

            {/* Mobile lifestyle banner under products */}
            <Image
              src={newArrivalsBanner.image}
              alt={newArrivalsBanner.alt}
              width={558}
              height={654}
              sizes="100vw"
              className="mt-6 h-auto w-full rounded-[15px] lg:hidden"
              unoptimized={newArrivalsBanner.image.startsWith("http")}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
