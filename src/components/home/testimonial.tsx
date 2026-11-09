"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  MapPin,
  Quote,
  Star,
  Leaf,
  Sparkles,
} from "lucide-react";

const testimonials = [
  {
    name: "Rajesh Kumar",
    rank: "Diamond Member",
    location: "Patna, Bihar",
    image:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=500&q=85",
    text: "Joining Amaze Ayurveda changed my life. Within 6 months, I grew a team of 200+ and achieved financial independence while promoting wellness.",
    rating: 5,
    number: "01",
  },
  {
    name: "Priya Sharma",
    rank: "Star Diamond",
    location: "Lucknow, UP",
    image:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=500&q=85",
    text: "The 15-level plan is truly revolutionary. The transparency in payouts and the quality of Ayurvedic products make it so easy to share with others.",
    rating: 5,
    number: "02",
  },
  {
    name: "Amit Patel",
    rank: "Super Star",
    location: "Surat, Gujarat",
    image:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=500&q=85",
    text: "I started with just a ₹499 purchase. Today, my passive income covers all my monthly expenses. The support system here is incredible.",
    rating: 5,
    number: "03",
  },
];

const ease = [0.22, 1, 0.36, 1] as const;

export default function SuccessStories() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  const active = testimonials[activeIndex];

  const next = () => {
    setActiveIndex((current) => (current + 1) % testimonials.length);
  };

  const previous = () => {
    setActiveIndex(
      (current) => (current - 1 + testimonials.length) % testimonials.length,
    );
  };

  useEffect(() => {
    if (paused) return;

    const timer = setInterval(() => {
      setActiveIndex((current) => (current + 1) % testimonials.length);
    }, 8000);

    return () => clearInterval(timer);
  }, [paused]);

  return (
    <section
      className="relative overflow-hidden bg-[#192f20] py-20 sm:py-24 lg:py-28"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* Background decoration */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-40 top-0 h-[450px] w-[450px] rounded-full bg-[#e8a020]/10 blur-[120px]" />
        <div className="absolute -bottom-40 -right-20 h-[500px] w-[500px] rounded-full bg-emerald-400/10 blur-[130px]" />

        <div
          className="absolute inset-0 opacity-[0.035]"
          style={{
            backgroundImage:
              "linear-gradient(#fff 1px,transparent 1px),linear-gradient(90deg,#fff 1px,transparent 1px)",
            backgroundSize: "55px 55px",
          }}
        />

        <Leaf className="absolute right-[8%] top-16 h-24 w-24 rotate-[-25deg] text-white/[0.07]" />
        <Leaf className="absolute bottom-20 left-[5%] h-32 w-32 rotate-45 text-white/[0.06]" />

        <span className="absolute -left-5 top-16 select-none  text-[15rem] font-bold leading-none text-white/[0.025]">
          99
        </span>
      </div>

      <div className="relative mx-auto max-w-7xl px-5 sm:px-8">
        {/* Section heading */}
        <div className="mb-14 grid gap-8 md:grid-cols-[1fr_auto] md:items-end lg:mb-16">
          <motion.div
            initial={{ opacity: 0, y: 25 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, ease }}
          >
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-[#e8a020]/25 bg-[#e8a020]/10 px-4 py-2">
              <Sparkles className="h-3.5 w-3.5 text-[#e8a020]" />
              <span className="text-[10px] font-bold uppercase tracking-[0.22em] text-[#e8a020]">
                Voices of Our Community
              </span>
            </div>

            <h2 className="max-w-2xl  text-4xl font-medium leading-[1.1] text-white sm:text-5xl lg:text-6xl">
              Every journey has
              <br />a story worth{" "}
              <span className="italic text-[#e8a020]">sharing.</span>
            </h2>

            <p className="mt-5 max-w-xl text-sm leading-7 text-white/55 sm:text-base">
              Meet the people who are part of the Amaze Ayurveda community.
              Discover their experiences and personal journeys.
            </p>
          </motion.div>

          {/* Carousel controls */}
          <div className="flex items-center gap-3">
            <span className="mr-3 text-xs font-medium tracking-widest text-white/35">
              STORIES
            </span>

            <button
              type="button"
              onClick={previous}
              aria-label="Previous testimonial"
              className="flex h-12 w-12 items-center justify-center rounded-full border border-white/15 text-white transition hover:border-[#e8a020] hover:bg-[#e8a020] hover:text-[#192f20]"
            >
              <ArrowLeft size={18} />
            </button>

            <button
              type="button"
              onClick={next}
              aria-label="Next testimonial"
              className="flex h-12 w-12 items-center justify-center rounded-full bg-[#e8a020] text-[#192f20] transition hover:bg-[#f2b747]"
            >
              <ArrowRight size={18} />
            </button>
          </div>
        </div>

        {/* Featured testimonial */}
        <div className="grid overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.045] lg:grid-cols-[0.85fr_1.15fr]">
          {/* Profile panel */}
          <div className="relative flex min-h-[380px] flex-col justify-between overflow-hidden bg-[#243e2a] p-7 sm:p-10 lg:p-12">
            <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full border border-white/10" />
            <div className="absolute -right-10 -top-10 h-44 w-44 rounded-full border border-white/10" />

            <div className="relative">
              <div className="mb-8 flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-[0.2em] text-[#e8a020]">
                  Featured Story
                </span>
                <span className=" text-5xl text-white/10">{active.number}</span>
              </div>

              <AnimatePresence mode="wait">
                <motion.div
                  key={active.image}
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 1.02 }}
                  transition={{ duration: 0.45, ease }}
                  className="relative mx-auto w-fit"
                >
                  <div className="absolute -inset-3 rounded-full border border-[#e8a020]/30" />
                  <div className="h-40 w-40 overflow-hidden rounded-full border-4 border-[#e8a020]/60 sm:h-48 sm:w-48">
                    <img
                      src={active.image}
                      alt={active.name}
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div className="absolute bottom-2 right-0 flex h-11 w-11 items-center justify-center rounded-full bg-[#e8a020] text-[#192f20] shadow-lg">
                    <Quote size={19} fill="currentColor" />
                  </div>
                </motion.div>
              </AnimatePresence>

              <AnimatePresence mode="wait">
                <motion.div
                  key={active.name}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                  transition={{ duration: 0.35, ease }}
                  className="mt-8 text-center"
                >
                  <h3 className=" text-2xl font-semibold text-white sm:text-3xl">
                    {active.name}
                  </h3>

                  <div className="mt-3 inline-flex items-center gap-2 rounded-full border border-[#e8a020]/25 bg-[#e8a020]/10 px-4 py-2">
                    <Star size={13} className="fill-[#e8a020] text-[#e8a020]" />
                    <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#e8a020]">
                      {active.rank}
                    </span>
                  </div>

                  <div className="mt-4 flex items-center justify-center gap-2 text-xs text-white/45">
                    <MapPin size={13} />
                    {active.location}
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>

            <div className="relative mt-8 flex items-center justify-center gap-2 border-t border-white/10 pt-6">
              <Leaf size={15} className="text-[#e8a020]" />
              <span className="text-[10px] font-medium uppercase tracking-[0.2em] text-white/40">
                Amaze Ayurveda Community
              </span>
            </div>
          </div>

          {/* Testimonial content */}
          <div className="flex flex-col justify-center p-7 sm:p-10 lg:p-14">
            <div className="mb-8 flex items-center gap-1.5">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  size={17}
                  className={
                    i < active.rating
                      ? "fill-[#e8a020] text-[#e8a020]"
                      : "text-white/20"
                  }
                />
              ))}
              <span className="ml-3 text-xs text-white/35">
                Community experience
              </span>
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={active.text}
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -18 }}
                transition={{ duration: 0.4, ease }}
              >
                <Quote
                  size={48}
                  className="mb-5 text-[#e8a020]/35"
                  fill="currentColor"
                />

                <blockquote className=" text-2xl leading-[1.45] text-white sm:text-3xl lg:text-[2.15rem]">
                  “{active.text}”
                </blockquote>

                <div className="mt-9 h-px w-20 bg-[#e8a020]" />

                <div className="mt-7 flex flex-wrap items-center justify-between gap-5">
                  <div>
                    <p className="text-sm font-semibold text-white">
                      {active.name}
                    </p>
                    <p className="mt-1 text-xs text-white/40">
                      {active.rank} · {active.location}
                    </p>
                  </div>

                  <span className="rounded-full border border-white/10 px-4 py-2 text-[10px] font-semibold uppercase tracking-widest text-white/45">
                    Member Story
                  </span>
                </div>
              </motion.div>
            </AnimatePresence>

            {/* Story indicators */}
            <div className="mt-12 flex items-center gap-3 border-t border-white/10 pt-7">
              <div className="flex flex-1 items-center gap-2">
                {testimonials.map((item, i) => (
                  <button
                    key={item.number}
                    type="button"
                    aria-label={`Show story ${i + 1}`}
                    aria-current={activeIndex === i}
                    onClick={() => setActiveIndex(i)}
                    className={`h-1.5 rounded-full transition-all duration-300 ${
                      activeIndex === i
                        ? "w-12 bg-[#e8a020]"
                        : "w-5 bg-white/20 hover:bg-white/40"
                    }`}
                  />
                ))}
              </div>

              <span className="text-xs font-medium tabular-nums text-white/40">
                0{activeIndex + 1} / 0{testimonials.length}
              </span>
            </div>
          </div>
        </div>

        {/* Bottom note */}
        <div className="mt-8 flex flex-col items-center justify-between gap-3 text-center sm:flex-row sm:text-left">
          <p className="text-xs leading-5 text-white/35">
            Every journey is unique. Individual experiences and results may
            vary.
          </p>

          <div className="flex items-center gap-2 text-xs text-[#e8a020]">
            <Leaf size={14} />
            <span className="font-medium">
              Ancient Wisdom. Modern Wellness.
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
