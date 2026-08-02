"use client";
import React, { useRef, useState } from "react";
import { useMotionValueEvent, useScroll } from "motion/react";
import { motion } from "motion/react";
import { cn } from "@/lib/utils";

export const StickyScroll = ({
  content,
  contentClassName,
}: {
  content: {
    title: string;
    description: string;
    content?: React.ReactNode;
  }[];
  contentClassName?: string;
}) => {
  const [activeCard, setActiveCard] = useState(0);
  const ref = useRef<HTMLDivElement | null>(null);
  const { scrollYProgress } = useScroll({
    // uncomment line 22 and comment line 23 if you DONT want the overflow container and want to have it change on the entire page scroll
    // target: ref
    container: ref,
    offset: ["start start", "end end"],
  });
  const cardLength = content.length;

  useMotionValueEvent(scrollYProgress, "change", (latest) => {
    const cardsBreakpoints = content.map((_, index) => index / cardLength);
    const closestBreakpointIndex = cardsBreakpoints.reduce(
      (acc, breakpoint, index) => {
        const distance = Math.abs(latest - breakpoint);
        if (distance < Math.abs(latest - cardsBreakpoints[acc])) {
          return index;
        }
        return acc;
      },
      0,
    );
    setActiveCard(closestBreakpointIndex);
  });

  return (
    <div className="relative flex h-[22rem] justify-center space-x-10 rounded-2xl border border-[#faf3e4]/70 bg-[#faf3e4]/60 p-8 backdrop-blur-md shadow-[0_8px_30px_rgba(0,0,0,0.06)]">
      <div
        ref={ref}
        dir="rtl"
        className="journey-scroll-thin div relative flex items-start px-4 overflow-y-auto"
      >
        <div dir="ltr" className="max-w-2xl">
          {content.map((item, index) => (
            <div key={item.title + index} className="my-4">
              <motion.h2
                initial={{
                  opacity: 0,
                }}
                animate={{
                  opacity: activeCard === index ? 1 : 0.3,
                }}
                className="font-display text-lg text-neutral-100"
              >
                {item.title}
              </motion.h2>
              <motion.p
                initial={{
                  opacity: 0,
                }}
                animate={{
                  opacity: activeCard === index ? 1 : 0.3,
                }}
                className="font-body text-xs mt-2 max-w-sm leading-relaxed text-neutral-400"
              >
                {item.description}
              </motion.p>
            </div>
          ))}
          <div className="h-4" />
        </div>
      </div>
      <div
        className={cn(
          "hidden w-56 shrink-0 self-center lg:block",
          contentClassName,
        )}
      >
        {content[activeCard].content ?? null}
      </div>
    </div>
  );
};
