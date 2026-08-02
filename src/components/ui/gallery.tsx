"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, PanInfo } from "motion/react";
import { cn } from "../../lib/utils";

export interface GalleryCard {
  id: string | number;
  imageUrl: string;
  title: string;
}

interface IconProps {
  className?: string;
}

interface BadgeProps {
  children: React.ReactNode;
  className?: string;
}

interface CardProps {
  card: GalleryCard;
  index: number;
  activeIndex: number;
  totalCards: number;
}

// ---------------------------------------------------------------------------
// Default icons, used only when the caller doesn't pass their own via the
// `badgeIcon` / arrow props below.
// ---------------------------------------------------------------------------
const SparklesIcon: React.FC<IconProps> = ({ className }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M9.93 2.25 12 7.5l2.07-5.25a.5.5 0 0 1 .9 0L17.25 8.5l4.16.34a.5.5 0 0 1 .29.88l-3.2 3.1.95 4.5a.5.5 0 0 1-.73.53L12 14.5l-3.72 2.33a.5.5 0 0 1-.73-.53l.95-4.5-3.2-3.1a.5.5 0 0 1 .29-.88l4.16-.34Z" />
  </svg>
);

const ChevronLeftIcon: React.FC<IconProps> = ({ className }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="m15 18-6-6 6-6" />
  </svg>
);

const ChevronRightIcon: React.FC<IconProps> = ({ className }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="m9 18 6-6-6-6" />
  </svg>
);

const Badge: React.FC<BadgeProps> = ({ children, className }) => (
  <div
    className={cn(
      "inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm font-medium",
      className,
    )}
  >
    {children}
  </div>
);

export interface GalleryProps {
  /** Cards to display. Nothing is hard-coded — pass your own images/titles. */
  cards: GalleryCard[];
  /** Optional pill badge shown top-left. Omit to hide it entirely. */
  badgeLabel?: string;
  badgeIcon?: React.ReactNode;
  /** Autoplay interval in ms. Set to 0 to disable autoplay. */
  autoplayDelay?: number;
  className?: string;
}

export function Gallery({
  cards,
  badgeLabel,
  badgeIcon,
  autoplayDelay = 3000,
  className,
}: GalleryProps) {
  const [activeIndex, setActiveIndex] = useState(
    Math.floor(cards.length / 2)
  );
  const [isPaused, setIsPaused] = useState(false);
  const autoplayIntervalRef = useRef<ReturnType<typeof setInterval> | null>(
    null
  );

  const goToNext = () => {
    setActiveIndex((prev) => (prev + 1) % cards.length);
  };

  useEffect(() => {
    if (!isPaused && autoplayDelay > 0 && cards.length > 1) {
      autoplayIntervalRef.current = setInterval(goToNext, autoplayDelay);
    }
    return () => {
      if (autoplayIntervalRef.current) {
        clearInterval(autoplayIntervalRef.current);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isPaused, activeIndex, autoplayDelay, cards.length]);

  const changeSlide = (newIndex: number) => {
    const newSafeIndex = (newIndex + cards.length) % cards.length;
    setActiveIndex(newSafeIndex);
    if (autoplayIntervalRef.current) {
      clearInterval(autoplayIntervalRef.current);
    }
    if (!isPaused && autoplayDelay > 0 && cards.length > 1) {
      autoplayIntervalRef.current = setInterval(goToNext, autoplayDelay);
    }
  };

  const onDragEnd = (
    _event: MouseEvent | TouchEvent | PointerEvent,
    info: PanInfo
  ) => {
    const dragThreshold = 75;
    const dragOffset = info.offset.x;
    if (dragOffset > dragThreshold) {
      changeSlide(activeIndex - 1);
    } else if (dragOffset < -dragThreshold) {
      changeSlide(activeIndex + 1);
    }
  };

  if (cards.length === 0) {
    return null;
  }

  return (
    <section
      className={cn(
        "w-full flex-col items-center justify-center font-sans overflow-hidden",
        className
      )}
    >
      <div
        className="w-full max-w-5xl mx-auto p-4"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        <div className="relative flex w-full flex-col rounded-3xl border border-neutral-800 bg-neutral-900 p-4 pt-6 md:p-6">
          {badgeLabel && (
            <Badge className="absolute left-4 top-6 rounded-xl border border-neutral-700 text-base text-neutral-100 bg-neutral-900/40 backdrop-blur-sm md:left-6">
              {badgeIcon ?? (
                <SparklesIcon className="fill-accent-soft stroke-1 text-accent h-5 w-5 mr-1" />
              )}
              {badgeLabel}
            </Badge>
          )}

          <div
            className={cn(
              "relative w-full h-[280px] md:h-[400px] flex items-center justify-center overflow-hidden",
              badgeLabel && "pt-12"
            )}
          >
            <motion.div
              className="w-full h-full flex items-center justify-center"
              drag="x"
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={0.2}
              onDragEnd={onDragEnd}
            >
              {cards.map((card, index) => (
                <Card
                  key={card.id}
                  card={card}
                  index={index}
                  activeIndex={activeIndex}
                  totalCards={cards.length}
                />
              ))}
            </motion.div>
          </div>

          {cards.length > 1 && (
            <div className="flex items-center justify-center gap-6 mt-6">
              <button
                onClick={() => changeSlide(activeIndex - 1)}
                className="p-2 rounded-full bg-neutral-900/40 hover:bg-neutral-800 border border-neutral-700 text-neutral-100 transition-colors focus:outline-none focus:ring-2 focus:ring-accent"
                aria-label="Previous"
              >
                <ChevronLeftIcon className="w-6 h-6" />
              </button>

              <div className="flex items-center justify-center gap-2">
                {cards.map((card, index) => (
                  <button
                    key={card.id}
                    onClick={() => changeSlide(index)}
                    className={cn(
                      "h-2 rounded-full transition-all duration-300 focus:outline-none",
                      activeIndex === index
                        ? "w-6 bg-accent"
                        : "w-2 bg-neutral-700 hover:bg-neutral-500"
                    )}
                    aria-label={`Go to slide ${index + 1}`}
                  />
                ))}
              </div>

              <button
                onClick={() => changeSlide(activeIndex + 1)}
                className="p-2 rounded-full bg-neutral-900/40 hover:bg-neutral-800 border border-neutral-700 text-neutral-100 transition-colors focus:outline-none focus:ring-2 focus:ring-accent"
                aria-label="Next"
              >
                <ChevronRightIcon className="w-6 h-6" />
              </button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

function Card({ card, index, activeIndex, totalCards }: CardProps) {
  let offset = index - activeIndex;
  if (offset > totalCards / 2) {
    offset -= totalCards;
  } else if (offset < -totalCards / 2) {
    offset += totalCards;
  }

  const isVisible = Math.abs(offset) <= 1;

  const animate = {
    x: `${offset * 50}%`,
    scale: offset === 0 ? 1 : 0.8,
    zIndex: totalCards - Math.abs(offset),
    opacity: isVisible ? 1 : 0,
    transition: { type: "spring" as const, stiffness: 260, damping: 30 },
  };

  return (
    <motion.div
      className="absolute w-1/2 md:w-1/3 h-[95%]"
      style={{
        transformStyle: "preserve-3d",
      }}
      animate={animate}
      initial={false}
    >
      <div className="relative w-full h-full rounded-3xl shadow-2xl overflow-hidden bg-neutral-800">
        <img
          src={card.imageUrl}
          alt={card.title}
          className="w-full h-full object-cover pointer-events-none"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.onerror = null;
            target.src =
              "https://placehold.co/400x600/1e1e1e/ffffff?text=Image+Missing";
          }}
        />
        <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/70 to-transparent">
          <h4 className="text-white text-lg font-semibold">{card.title}</h4>
        </div>
      </div>
    </motion.div>
  );
}

export default Gallery;
