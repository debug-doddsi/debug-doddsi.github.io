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
    "hidden lg:block p-2 rounded-full bg-neutral-900/40 hover:bg-neutral-800 border border-neutral-700 text-neutral-100 transition-colors focus:outline-none focus:ring-2 focus:ring-accent";

  // Small in-flow prev/next buttons shown next to the title on mobile, where
  // there's no room to float full-size arrows outside the card.
  const mobileNavButtonClasses =
    "lg:hidden p-1 rounded-full bg-neutral-900/40 hover:bg-neutral-800 border border-neutral-700 text-neutral-100 transition-colors focus:outline-none focus:ring-2 focus:ring-accent";

  return (
    // `-mx-12` cancels the page shell's fixed `px-12` so the card can reach
    // the screen edges below `lg`; `lg:mx-0` restores it for the desktop layout.
    <div className="relative flex flex-col gap-4 -mx-12 rounded-2xl border border-[#faf3e4]/70 bg-[#faf3e4]/60 p-4 backdrop-blur-md shadow-[0_8px_30px_rgba(0,0,0,0.06)] lg:mx-0 lg:h-[22rem] lg:flex-row lg:justify-center lg:gap-0 lg:space-x-10 lg:p-8">
      {items.length > 1 && (
        <>
          <button
            onClick={goPrev}
            className={cn(
              navButtonClasses,
              "absolute -left-6 top-1/2 -translate-y-1/2 z-10",
            )}
            aria-label="Previous"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={goNext}
            className={cn(
              navButtonClasses,
              "absolute -right-6 top-1/2 -translate-y-1/2 z-10",
            )}
            aria-label="Next"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </>
      )}

      <div
        key={index}
        className={cn(
          "order-1 w-full shrink-0 lg:order-2 lg:w-56 lg:self-center",
          contentClassName,
        )}
      >
        {item.content ?? null}
      </div>

      <div className="relative order-2 flex w-full flex-col px-0 lg:order-1 lg:max-w-2xl lg:px-4">
        <AnimatePresence mode="wait">
          <motion.div
            key={index}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <div className="flex items-center justify-between gap-3">
              <h2 className="font-display text-xl text-neutral-100">
                {item.title}
              </h2>
              {items.length > 1 && (
                <div className="flex shrink-0 items-center gap-2 lg:hidden">
                  <button
                    onClick={goPrev}
                    className={mobileNavButtonClasses}
                    aria-label="Previous"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    onClick={goNext}
                    className={mobileNavButtonClasses}
                    aria-label="Next"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
            <p className="font-body text-xs mt-2 max-w-sm leading-relaxed text-neutral-400">
              {item.description}
            </p>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

export default PagedReveal;
