"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Search,
  Leaf,
  Heart,
  Sparkles,
  ShieldCheck,
  Activity,
  Brain,
  Flower2,
  Dumbbell,
  Apple,
  Droplets,
  CircleHelp,
} from "lucide-react";
import { AppHeader } from "@/components/layout/app-header";
import { Footer } from "@/components/layout/footer";

const categories = [
  {
    id: "wellness",
    name: "Daily Wellness",
    description: "Everyday essentials for your wellness routine.",
    count: "Explore products",
    image:
      "https://images.unsplash.com/photo-1547887538-e3a2f32cb1cc?w=900&q=85",
    icon: Heart,
    color: "bg-[#e9f0e5]",
  },
  {
    id: "immunity",
    name: "Immunity Care",
    description: "Discover products for your daily self-care routine.",
    count: "Explore products",
    image:
      "https://images.unsplash.com/photo-1611080626919-7cf5a9dbab5b?w=900&q=85",
    icon: ShieldCheck,
    color: "bg-[#f5eee1]",
  },
  {
    id: "hair-care",
    name: "Hair Care",
    description: "Explore hair care and nourishment essentials.",
    count: "Explore products",
    image:
      "https://images.unsplash.com/photo-1527799820374-dcf8d9d4a388?w=900&q=85",
    icon: Sparkles,
    color: "bg-[#f1e9e4]",
  },
  {
    id: "skin-care",
    name: "Skin Care",
    description: "Thoughtfully selected skincare essentials.",
    count: "Explore products",
    image:
      "https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?w=900&q=85",
    icon: Flower2,
    color: "bg-[#f4e9e9]",
  },
  {
    id: "digestive-care",
    name: "Digestive Care",
    description: "Explore products for your daily digestive wellness.",
    count: "Explore products",
    image:
      "https://images.unsplash.com/photo-1547592180-85f173990554?w=900&q=85",
    icon: Activity,
    color: "bg-[#e9eee6]",
  },
  {
    id: "fitness",
    name: "Fitness & Energy",
    description: "Products to complement an active lifestyle.",
    count: "Explore products",
    image:
      "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=900&q=85",
    icon: Dumbbell,
    color: "bg-[#eee9df]",
  },
  {
    id: "nutrition",
    name: "Nutrition",
    description: "Explore everyday nutrition and lifestyle products.",
    count: "Explore products",
    image:
      "https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=900&q=85",
    icon: Apple,
    color: "bg-[#e8eee8]",
  },
  {
    id: "personal-care",
    name: "Personal Care",
    description: "Everyday personal care and hygiene essentials.",
    count: "Explore products",
    image:
      "https://images.unsplash.com/photo-1601049541289-9b1b7bbbfe19?w=900&q=85",
    icon: Droplets,
    color: "bg-[#e9edf1]",
  },
];

const benefits = [
  {
    icon: Leaf,
    title: "Nature Inspired",
    description: "Explore products inspired by traditional wellness practices.",
  },
  {
    icon: ShieldCheck,
    title: "Quality Focused",
    description: "Discover products with a focus on quality and care.",
  },
  {
    icon: Sparkles,
    title: "Everyday Wellness",
    description: "Find options to complement your daily routine.",
  },
];

export default function CategoriesPage() {
  const [search, setSearch] = useState("");

  const filteredCategories = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) return categories;

    return categories.filter(
      (category) =>
        category.name.toLowerCase().includes(query) ||
        category.description.toLowerCase().includes(query),
    );
  }, [search]);

  return (
    <>
      <AppHeader />

      <main className="min-h-screen bg-[#faf9f5] text-[#243526]">
        {/* HERO */}
        <section className="relative overflow-hidden bg-[#1c3324]">
          <div className="absolute -right-32 -top-32 h-96 w-96 rounded-full bg-[#e8a020]/10 blur-3xl" />
          <div className="absolute -bottom-40 -left-20 h-96 w-96 rounded-full bg-white/5 blur-3xl" />

          <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-5 py-16 sm:px-8 md:grid-cols-2 md:py-24">
            <motion.div
              initial={{ opacity: 0, y: 25 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-xs font-medium tracking-wide text-[#f2c36c]">
                <Leaf size={14} />
                EXPLORE AMAZE AYURVEDA
              </div>

              <h1 className="max-w-xl text-4xl font-semibold leading-tight tracking-tight text-white sm:text-5xl lg:text-6xl">
                Discover your path to{" "}
                <span className="font-serif italic text-[#e8a020]">
                  everyday wellness.
                </span>
              </h1>

              <p className="mt-6 max-w-lg text-sm leading-7 text-white/70 sm:text-base">
                Explore our collection of Ayurveda-inspired wellness and
                personal care categories. Find products that fit your lifestyle.
              </p>

              <div className="mt-9 flex flex-wrap gap-3">
                <a
                  href="#all-categories"
                  className="inline-flex items-center gap-2 rounded-full bg-[#e8a020] px-6 py-3.5 text-sm font-semibold text-[#1c3324] transition hover:bg-[#f3b947]"
                >
                  Explore Categories
                  <ArrowRight size={17} />
                </a>

                <Link
                  href="/shop"
                  className="rounded-full border border-white/25 px-6 py-3.5 text-sm font-medium text-white transition hover:bg-white/10"
                >
                  View All Products
                </Link>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.7 }}
              className="relative mx-auto w-full max-w-lg"
            >
              <div className="relative aspect-[5/4] overflow-hidden rounded-[2rem]">
                <Image
                  src="https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?w=1200&q=90"
                  alt="Natural wellness and botanical skincare products"
                  fill
                  priority
                  sizes="(max-width: 768px) 100vw, 50vw"
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#15281c]/70 via-transparent to-transparent" />

                <div className="absolute bottom-6 left-6 right-6">
                  <p className="text-xs font-medium uppercase tracking-[0.2em] text-[#f2c36c]">
                    Ancient Wisdom. Modern Wellness.
                  </p>
                  <p className="mt-2 max-w-xs text-2xl font-semibold text-white">
                    A thoughtful approach to everyday living.
                  </p>
                </div>
              </div>

              <div className="absolute -bottom-5 -left-5 hidden rounded-2xl bg-[#faf9f5] p-4 shadow-xl sm:block">
                <div className="flex items-center gap-3">
                  <div className="rounded-xl bg-[#e8eee5] p-3 text-[#315b37]">
                    <Leaf size={23} />
                  </div>
                  <div>
                    <p className="text-sm font-semibold">Explore Naturally</p>
                    <p className="text-xs text-gray-500">Find your category</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* CATEGORY INTRO + SEARCH */}
        <section
          id="all-categories"
          className="mx-auto max-w-7xl scroll-mt-24 px-5 pb-16 pt-20 sm:px-8"
        >
          <div className="flex flex-col justify-between gap-7 md:flex-row md:items-end">
            <div>
              <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-[#b47b20]">
                FIND WHAT YOU NEED
              </p>
              <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
                Explore Our Categories
              </h2>
              <p className="mt-3 max-w-xl text-sm leading-7 text-gray-500">
                Browse our collections and discover products for different
                aspects of your everyday lifestyle.
              </p>
            </div>

            <div className="relative w-full md:max-w-sm">
              <Search
                size={19}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <input
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search categories..."
                className="w-full rounded-full border border-[#e6e5dd] bg-white py-3.5 pl-12 pr-5 text-sm outline-none transition placeholder:text-gray-400 focus:border-[#315b37] focus:ring-2 focus:ring-[#315b37]/10"
              />
            </div>
          </div>

          {/* CATEGORY GRID */}
          {filteredCategories.length > 0 ? (
            <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {filteredCategories.map((category, index) => {
                const Icon = category.icon;

                return (
                  <motion.div
                    key={category.id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: index * 0.05 }}
                  >
                    <Link
                      href={`/shop?category=${category.id}`}
                      className="group block overflow-hidden rounded-3xl border border-[#eae9e1] bg-white transition duration-300 hover:-translate-y-1 hover:border-[#c9d4c5] hover:shadow-xl hover:shadow-[#1c3324]/10"
                    >
                      <div className="relative aspect-[4/3] overflow-hidden">
                        <Image
                          src={category.image}
                          alt={category.name}
                          fill
                          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                          className="object-cover transition duration-700 group-hover:scale-110"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-70" />

                        <div className="absolute left-4 top-4 rounded-full bg-white/90 p-3 text-[#315b37] backdrop-blur">
                          <Icon size={19} />
                        </div>

                        <div className="absolute bottom-4 right-4 flex h-10 w-10 items-center justify-center rounded-full bg-white text-[#1c3324] transition duration-300 group-hover:bg-[#e8a020]">
                          <ArrowRight
                            size={18}
                            className="transition-transform group-hover:-rotate-45"
                          />
                        </div>
                      </div>

                      <div className="p-5">
                        <h3 className="text-lg font-semibold tracking-tight text-[#243526] transition group-hover:text-[#527b46]">
                          {category.name}
                        </h3>
                        <p className="mt-2 min-h-10 text-sm leading-5 text-gray-500">
                          {category.description}
                        </p>

                        <div className="mt-5 flex items-center justify-between border-t border-[#eeeee8] pt-4">
                          <span className="text-xs font-medium text-[#527b46]">
                            {category.count}
                          </span>
                          <ArrowRight
                            size={16}
                            className="text-[#527b46] transition-transform group-hover:translate-x-1"
                          />
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                );
              })}
            </div>
          ) : (
            <div className="mt-10 rounded-3xl border border-dashed border-[#d9ded4] bg-white px-5 py-16 text-center">
              <CircleHelp className="mx-auto text-gray-400" size={34} />
              <h3 className="mt-4 text-lg font-semibold">
                No categories found
              </h3>
              <p className="mt-2 text-sm text-gray-500">
                Try searching with a different category name.
              </p>
              <button
                onClick={() => setSearch("")}
                className="mt-5 rounded-full bg-[#1c3324] px-5 py-2.5 text-sm font-medium text-white hover:bg-[#315b37]"
              >
                Clear Search
              </button>
            </div>
          )}
        </section>

        {/* BRAND VALUES */}
        <section className="border-y border-[#eae9e1] bg-[#f2f3ec]">
          <div className="mx-auto max-w-7xl px-5 py-16 sm:px-8">
            <div className="mx-auto max-w-2xl text-center">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#b47b20]">
                THE AMAZE APPROACH
              </p>
              <h2 className="mt-3 text-3xl font-semibold tracking-tight">
                Wellness begins with thoughtful choices.
              </h2>
              <p className="mt-4 text-sm leading-7 text-gray-500">
                Explore our collections with a focus on quality, everyday care,
                and a connection to nature-inspired wellness.
              </p>
            </div>

            <div className="mt-12 grid gap-8 md:grid-cols-3">
              {benefits.map((benefit, index) => {
                const Icon = benefit.icon;

                return (
                  <div key={benefit.title} className="text-center">
                    <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-[#315b37] shadow-sm">
                      <Icon size={25} />
                    </div>
                    <h3 className="mt-5 font-semibold">{benefit.title}</h3>
                    <p className="mx-auto mt-2 max-w-xs text-sm leading-6 text-gray-500">
                      {benefit.description}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="px-5 py-16 sm:px-8">
          <div className="relative mx-auto max-w-7xl overflow-hidden rounded-[2rem] bg-[#1c3324] px-6 py-14 text-center sm:px-12 sm:py-16">
            <div className="absolute -right-16 -top-24 h-72 w-72 rounded-full bg-[#e8a020]/10 blur-3xl" />
            <div className="absolute -bottom-24 -left-16 h-72 w-72 rounded-full bg-white/5 blur-3xl" />

            <div className="relative">
              <Leaf className="mx-auto text-[#e8a020]" size={30} />
              <h2 className="mx-auto mt-5 max-w-2xl text-3xl font-semibold text-white sm:text-4xl">
                Your wellness journey starts here.
              </h2>
              <p className="mx-auto mt-4 max-w-lg text-sm leading-7 text-white/65">
                Discover the Amaze Ayurveda collection and explore products
                suited to your everyday lifestyle.
              </p>

              <Link
                href="/shop"
                className="mt-8 inline-flex items-center gap-2 rounded-full bg-[#e8a020] px-7 py-3.5 text-sm font-semibold text-[#1c3324] transition hover:bg-[#f3b947]"
              >
                Explore Products
                <ArrowRight size={17} />
              </Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
