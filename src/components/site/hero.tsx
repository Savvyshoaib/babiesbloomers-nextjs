"use client";

import Image from "next/image";
import Link from "next/link";
import { useAppSelector } from "@/store/hooks";
import { selectSiteContent } from "@/store/site-content-slice";

export function Hero() {
  const { hero } = useAppSelector(selectSiteContent);

  return (
    <section aria-label={hero.alt || "Homepage hero"}>
      <Link href={hero.href || "/shop"} className="block">
        <Image
          src={hero.image}
          alt={hero.alt}
          width={1920}
          height={840}
          priority
          sizes="100vw"
          className="h-auto w-full"
          unoptimized={hero.image.startsWith("http")}
        />
      </Link>
    </section>
  );
}
