import Image from "next/image";
import { brandLogos } from "@/lib/site-data";

export function BrandLogos() {
  return (
    <section
      className="mb-[80px] max-[880px]:mb-[50px]"
      aria-label="Brands we work with"
    >
      <div className="shell">
        <ul className="grid grid-cols-2 gap-[20px] sm:grid-cols-4 lg:grid-cols-7">
          {brandLogos.map((logo) => (
            <li key={logo.src} className="flex items-center justify-center">
              <Image
                src={logo.src}
                alt={logo.alt}
                width={189}
                height={121}
                className="h-auto w-full rounded-[15px] border border-[#d6d6d6]"
              />
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
