"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useMemo } from "react";
import { newArrivals as staticNewArrivals } from "@/lib/site-data";
import { useAppSelector } from "@/store/hooks";
import {
  selectActiveProducts,
  selectNewArrivals,
} from "@/store/catalog-slice";
import { selectSiteContent } from "@/store/site-content-slice";
import { ArrivalCard } from "./product-card";
import { SectionHeading } from "./section-heading";

const HOME_NEW_ARRIVALS_LIMIT = 6;

const sectionLinks = [
  { label: "Home", href: "/" },
  { label: "Shop", href: "/shop" },
  { label: "New Arrivals", href: "/new-arrivals" },
  { label: "Contact", href: "/contact" },
] as const;

export function NewArrivals() {
  const pathname = usePathname();
  const catalogArrivals = useAppSelector(selectNewArrivals);
  const activeProducts = useAppSelector(selectActiveProducts);
  const categories = useAppSelector((s) => s.catalog.categories);
  const { newArrivalsBanner } = useAppSelector(selectSiteContent);

  const products = useMemo(() => {
    // Prefer new-arrival tagged products; otherwise latest active products
    // from the newest categories in the catalog.
    let list =
      catalogArrivals.length > 0 ? catalogArrivals : activeProducts;

    if (list.length === 0) {
      return staticNewArrivals.slice(0, HOME_NEW_ARRIVALS_LIMIT).map((p) => ({
        ...p,
        slug: undefined as string | undefined,
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

    return list.slice(0, HOME_NEW_ARRIVALS_LIMIT).map((p) => ({
      title: p.title,
      image: p.image,
      oldPrice: p.oldPrice,
      price: p.price,
      badge: p.badge,
      slug: p.slug,
      averageRating: p.averageRating,
      reviewsCount: p.reviewsCount,
    }));
  }, [catalogArrivals, activeProducts, categories]);

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
            <nav
              aria-label="Quick links"
              className="-mx-1 mb-5 flex flex-wrap items-center gap-2 overflow-x-auto px-1 pb-1 sm:mb-[30px] sm:gap-[15px]"
            >
              {sectionLinks.map((link) => {
                const isActive =
                  link.href === "/"
                    ? pathname === "/"
                    : pathname === link.href ||
                      pathname.startsWith(`${link.href}/`);
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`shrink-0 rounded-[30px] px-3 py-1.5 font-poppins text-[14px] font-medium leading-6 transition-colors sm:px-[15px] sm:py-[5px] sm:text-[16px] ${
                      isActive
                        ? "bg-salmon-soft text-white"
                        : "text-steel hover:bg-salmon-soft/15"
                    }`}
                  >
                    {link.label}
                  </Link>
                );
              })}
            </nav>

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
                No new arrivals yet. Check back soon.
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
