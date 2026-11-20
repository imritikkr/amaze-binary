import BusinessOpportunity from "@/components/home/business";
import Hero from "@/components/home/hero";
import Testimonial from "@/components/home/testimonial";
import { getShopCategories, getShopProducts } from "@/actions/shop";
import FaqSection from "@/components/home/faq-section";
import { ShopByCategory } from "@/components/home/ShopByCategory";
import BackToTop from "@/components/ui/back-top";

const Home = async () => {
  const [productsRes, categoriesRes] = await Promise.all([
    getShopProducts({ limit: 5, inStockOnly: true }),
    getShopCategories(),
  ]);

  return (
    <div className="min-h-screen bg-white">
      <Hero
        featuredProducts={productsRes.products}
        categories={categoriesRes.data}
      />
      <ShopByCategory categories={categoriesRes.data} />
      {/* <FeaturedProducts initialProducts={productsWithCategory} /> */}
      {/* <AboutUs /> */}
      <BusinessOpportunity />
      <Testimonial />
      <FaqSection />
      <BackToTop />
    </div>
  );
};

export default Home;
