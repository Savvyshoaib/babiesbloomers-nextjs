import Image from "next/image";
import Link from "next/link";

const banners = [
  {
    href: "/shop",
    src: "/images/small-banner-1.jpg",
    alt: "Kids wear sale — visit our shop and get up to 35% off",
    width: 560,
    height: 250,
  },
  {
    href: "/shop",
    src: "/images/small-banner-2.jpg",
    alt: "New summer collection — good style for kids",
    width: 850,
    height: 250,
  },
];

export function PromoBanners() {
  return (
    <section
      className="mb-[80px] mt-[70px] max-[880px]:mb-[50px] max-[880px]:mt-0"
      aria-label="Featured collections"
    >
      <div className="shell">
        <div className="grid gap-[20px] md:grid-cols-[558fr_852fr] md:gap-[30px]">
          {banners.map((banner) => (
            <Link
              key={banner.src}
              href={banner.href}
              className="block overflow-hidden rounded-[15px]"
            >
              <Image
                src={banner.src}
                alt={banner.alt}
                width={banner.width}
                height={banner.height}
                sizes="(max-width: 768px) 100vw, (max-width: 1470px) 50vw, 852px"
                className="h-auto w-full"
              />
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
