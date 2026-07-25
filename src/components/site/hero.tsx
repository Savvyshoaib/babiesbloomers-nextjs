import Image from "next/image";
import Link from "next/link";

export function Hero() {
  return (
    <section aria-label="Flat 50% off on the entire website">
      <Link href="/shop" className="block">
        <Image
          src="/images/banner.jpg"
          alt="Flat 50% off on the entire website at Babies Bloomers"
          width={1920}
          height={840}
          priority
          sizes="100vw"
          className="h-auto w-full"
        />
      </Link>
    </section>
  );
}
