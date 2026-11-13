import Hero from "@/components/home/hero";
import AboutUs from "@/components/home/aboutus";
import BusinessOpportunity from "@/components/home/business";
import Testimonial from "@/components/home/testimonial";
import { Footer } from "@/components/layout/footer";
import { AppHeader } from "@/components/layout/app-header";
// import prisma from "@/lib/prisma";
import FaqSection from "@/components/home/faq-section";
import BackToTop from "@/components/ui/back-top";
import { getShopCategories, getShopProducts } from "@/actions/shop";
import { ShopByCategory } from "@/components/home/ShopByCategory";

const Home = async () => {
  // const products = await prisma.product.findMany({
  //   where: {
  //     isActive: true,
  //   },
  //   take: 6,
  //     orderBy: { createdAt: "desc" },
  // });
  // const productsWithCategory = products.filter(p => p.categoryId);
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
      <AboutUs />
      <BusinessOpportunity />
      <Testimonial />
      <FaqSection />
      <BackToTop />
    </div>
  );
};

export default Home;
