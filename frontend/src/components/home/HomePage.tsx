import { HOME_CONTENT } from "@/lib/home-content";
import {
  getActiveOffers,
  getBestSellingBooks,
  getCategories,
  getFeaturedBooks,
  getNewArrivals,
  getPopularSearches,
  getTestimonials,
  getTopSellers,
  getUsedBooks,
} from "@/lib/services/catalog";
import { BestSellingBooks } from "./books/BestSellingBooks";
import { FeaturedBooks } from "./books/FeaturedBooks";
import { NewArrivals } from "./books/NewArrivals";
import { UsedBooks } from "./books/UsedBooks";
import { PopularCategories } from "./categories/PopularCategories";
import { FinalCTA } from "./cta/FinalCTA";
import { HeroSection } from "./hero/HeroSection";
import { HowItWorks } from "./information/HowItWorks";
import { WhyChooseBookHand } from "./information/WhyChooseBookHand";
import { NewsletterSection } from "./newsletter/NewsletterSection";
import { SpecialOffers } from "./offers/SpecialOffers";
import { TopSellers } from "./sellers/TopSellers";
import { Testimonials } from "./testimonials/Testimonials";

export async function HomePage() {
  const [
    categories,
    featuredBooks,
    bestSellingBooks,
    newArrivals,
    usedBooks,
    topSellers,
    offers,
    testimonials,
    popularSearches,
  ] = await Promise.all([
    getCategories(),
    getFeaturedBooks(8),
    getBestSellingBooks(4),
    getNewArrivals(4),
    getUsedBooks(4),
    getTopSellers(6),
    getActiveOffers(),
    getTestimonials(),
    getPopularSearches(),
  ]);

  return (
    <div className="flex flex-col">
      <HeroSection
        content={HOME_CONTENT.hero}
        featuredBooks={featuredBooks.slice(0, 3)}
        popularSearches={popularSearches}
      />

      <PopularCategories categories={categories} />

      <FeaturedBooks books={featuredBooks} />

      <BestSellingBooks books={bestSellingBooks} />

      <NewArrivals books={newArrivals} />

      <SpecialOffers offer={offers[0]} />

      <TopSellers sellers={topSellers} />

      <UsedBooks books={usedBooks} />

      <HowItWorks content={HOME_CONTENT.howItWorks} />

      <WhyChooseBookHand features={HOME_CONTENT.features} />

      <Testimonials testimonials={testimonials} />

      <NewsletterSection />

      <FinalCTA content={HOME_CONTENT.finalCta} />
    </div>
  );
}
