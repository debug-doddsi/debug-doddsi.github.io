"use client";
import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

export interface PagedRevealItem {
  title: string;
  description: string;
  content?: React.ReactNode;
}

export interface PagedRevealProps {
  items: PagedRevealItem[];
  contentClassName?: string;
}

// Simple click-through pager: one item (title + description + side content)
// shown at a time, navigated with arrow buttons/dots - no scroll-position
// tracking, so there's nothing to desync or jump around.
export function PagedReveal({ items, contentClassName }: PagedRevealProps) {
  const [index, setIndex] = useState(0);
  const item = items[index];

  const goPrev = () => setIndex((i) => (i - 1 + items.length) % items.length);
  const goNext = () => setIndex((i) => (i + 1) % items.length);

  const navButtonClasses =
    "p-2 rounded-full bg-neutral-900/40 hover:bg-neutral-800 border border-neutral-700 text-neutral-100 transition-colors focus:outline-none focus:ring-2 focus:ring-accent";

  return (
    <div className="relative flex h-[22rem] justify-center space-x-10 rounded-2xl border border-[#faf3e4]/70 bg-[#faf3e4]/60 p-8 backdrop-blur-md shadow-[0_8px_30px_rgba(0,0,0,0.06)]">
      <div className="relative flex w-full max-w-2xl flex-col justify-between px-4">
        <AnimatePresence mode="wait">
          <motion.div
            key={index}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <h2 className="font-display text-xl text-neutral-100">
              {item.title}
            </h2>
            <p className="font-body text-xs mt-2 max-w-sm leading-relaxed text-neutral-400">
              {item.description}
            </p>
          </motion.div>
        </AnimatePresence>

        {items.length > 1 && (
          <div className="flex items-center gap-3 mt-4">
            <button
              onClick={goPrev}
              className={navButtonClasses}
              aria-label="Previous"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-1.5">
              {items.map((navItem, i) => (
                <button
                  key={navItem.title}
                  onClick={() => setIndex(i)}
                  className={cn(
                    "h-1.5 rounded-full transition-all duration-300 focus:outline-none",
                    i === index
                      ? "w-5 bg-accent"
                      : "w-1.5 bg-neutral-700 hover:bg-neutral-500",
                  )}
                  aria-label={`Go to ${navItem.title}`}
                />
              ))}
            </div>

            <button
              onClick={goNext}
              className={navButtonClasses}
              aria-label="Next"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        )}
      </div>

      <div
        key={index}
        className={cn(
          "hidden w-56 shrink-0 self-center lg:block",
          contentClassName,
        )}
      >
        {item.content ?? null}
      </div>
    </div>
  );
}

export default PagedReveal;
