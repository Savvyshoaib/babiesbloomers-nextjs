import { BrandLogos } from "@/components/site/brand-logos";
import { Dreamwear } from "@/components/site/dreamwear";
import { Footer } from "@/components/site/footer";
import { Header } from "@/components/site/header";
import { Hero } from "@/components/site/hero";
import { NewArrivals } from "@/components/site/new-arrivals";
import { PromoBanners } from "@/components/site/promo-banners";
import { Testimonials } from "@/components/site/testimonials";
import { TopPicks } from "@/components/site/top-picks";
import { Vision } from "@/components/site/vision";

export default function Home() {
  return (
    <>
      <Header />
      <main>
        <Hero />
        <PromoBanners />
        <NewArrivals />
        <Dreamwear />
        <TopPicks />
        <Vision />
        <Testimonials />
        <BrandLogos />
      </main>
      <Footer />
    </>
  );
}
