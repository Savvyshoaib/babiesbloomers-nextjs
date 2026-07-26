"use client";

import Image from "next/image";
import Link from "next/link";
import { useAppSelector } from "@/store/hooks";
import { selectSiteContent } from "@/store/site-content-slice";

export function PromoBanners() {
  const { promoBanners } = useAppSelector(selectSiteContent);

  return (
    <section
      className="mb-[48px] mt-5 sm:mb-[60px] sm:mt-8 lg:mb-[80px] lg:mt-[70px]"
      aria-label="Featured collections"
    >
      <div className="shell">
        <div className="grid gap-4 sm:gap-5 md:grid-cols-[558fr_852fr] md:gap-[30px]">
          {promoBanners.map((banner, index) => (
            <Link
              key={`${banner.src}-${index}`}
              href={banner.href || "/shop"}
              className="block min-w-0 overflow-hidden rounded-[12px] sm:rounded-[15px]"
            >
              <Image
                src={banner.src}
                alt={banner.alt}
                width={index === 0 ? 560 : 850}
                height={250}
                sizes="(max-width: 768px) 100vw, (max-width: 1470px) 50vw, 852px"
                className="h-auto w-full"
                unoptimized={banner.src.startsWith("http")}
              />
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
