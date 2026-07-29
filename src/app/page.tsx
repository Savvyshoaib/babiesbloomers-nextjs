import {
  getApprovedHomepageReviews,
  getReviewsSliderSettings,
} from "@/app/actions/reviews";
import { BrandLogos } from "@/components/site/brand-logos";
import { CustomersSaying } from "@/components/site/customers-saying";
import { Dreamwear } from "@/components/site/dreamwear";
import { Footer } from "@/components/site/footer";
import { Header } from "@/components/site/header";
import { Hero } from "@/components/site/hero";
import { NewArrivals } from "@/components/site/new-arrivals";
import { PromoBanners } from "@/components/site/promo-banners";
import { TopPicks } from "@/components/site/top-picks";
import { Vision } from "@/components/site/vision";

export const revalidate = 60;

export default async function Home() {
  const [reviews, sliderSettings] = await Promise.all([
    getApprovedHomepageReviews(24),
    getReviewsSliderSettings(),
  ]);

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
        <CustomersSaying reviews={reviews} settings={sliderSettings} />
        {/* <BrandLogos /> */}
      </main>
      <Footer />
    </>
  );
}
