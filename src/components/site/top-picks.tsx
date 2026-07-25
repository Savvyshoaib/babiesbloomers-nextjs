import { topPicks } from "@/lib/site-data";
import { PickCard } from "./product-card";

export function TopPicks() {
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

        <div className="mt-[30px] grid grid-cols-2 gap-[16px] sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5">
          {topPicks.map((product) => (
            <PickCard key={product.title} product={product} />
          ))}
        </div>
      </div>
    </section>
  );
}
