import { useEffect, useRef, useState, type CSSProperties } from "react";
import { ChevronDown } from "lucide-react";
import type { TabId } from "../types";

interface HomePageProps {
  onNavigate: (id: TabId) => void;
}

interface SparklePlacement {
  top?: string;
  bottom?: string;
  left?: string;
  right?: string;
  size: number;
  delay: string;
}

// Positions are percentages relative to the wordmark's own bounding box, so
// they scale with it at every breakpoint instead of needing separate mobile
// coordinates. Kept modest (nothing past ±8%) so they never push past the
// page's own horizontal padding on narrow screens.
const SPARKLES: SparklePlacement[] = [
  { top: "-6%", left: "-2%", size: 16, delay: "0s" },
  { top: "10%", left: "-8%", size: 10, delay: "0.7s" },
  { bottom: "12%", left: "-6%", size: 12, delay: "1.3s" },
  { top: "-8%", right: "0%", size: 14, delay: "0.4s" },
  { top: "22%", right: "-7%", size: 9, delay: "1.6s" },
  { bottom: "6%", right: "-3%", size: 13, delay: "1s" },
];

function Sparkle({ top, bottom, left, right, size, delay }: SparklePlacement) {
  const style: CSSProperties = {
    top,
    bottom,
    left,
    right,
    width: size,
    height: size,
    animationDelay: delay,
  };

  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className="absolute text-neutral-100 sparkle-twinkle pointer-events-none select-none"
      style={style}
      aria-hidden="true"
    >
      <path d="M12 0 L14.3 9.7 L24 12 L14.3 14.3 L12 24 L9.7 14.3 L0 12 L9.7 9.7 Z" />
    </svg>
  );
}

// Fires once when the element scrolls into view, then disconnects — cards
// stay revealed rather than re-hiding if the user scrolls back up past them.
function useRevealOnScroll<T extends HTMLElement>() {
  const ref = useRef<T | null>(null);
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setRevealed(true);
          observer.disconnect();
        }
      },
      { threshold: 0.3 },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return { ref, revealed };
}

interface RevealCardProps {
  eyebrow: string;
  title: string;
  description: string;
  buttonLabel: string;
  onClick: () => void;
}

function RevealCard({
  eyebrow,
  title,
  description,
  buttonLabel,
  onClick,
}: RevealCardProps) {
  const { ref, revealed } = useRevealOnScroll<HTMLDivElement>();

  return (
    <div
      ref={ref}
      className={`w-full max-w-sm rounded-2xl border border-accent/30 bg-accent-soft px-8 py-10 text-center transition-all duration-700 ease-out ${
        revealed ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
      }`}
    >
      <p className="font-mono text-[10px] text-accent uppercase tracking-widest mb-3">
        {eyebrow}
      </p>
      <h2 className="font-display text-2xl text-neutral-100 mb-3">{title}</h2>
      <p className="font-body text-sm text-neutral-400 leading-relaxed mb-6">
        {description}
      </p>
      <button
        onClick={onClick}
        className="px-6 py-2.5 rounded-full border border-accent text-accent font-mono text-xs uppercase tracking-widest hover:bg-accent hover:text-neutral-950 transition-all duration-300"
      >
        {buttonLabel}
      </button>
    </div>
  );
}

export function HomePage({ onNavigate }: HomePageProps) {
  return (
    <div className="flex flex-col items-center px-6 sm:px-8">
      {/* Hero */}
      <div className="flex flex-col items-center justify-center min-h-[70vh] text-center">
        <div className="relative inline-block">
          {SPARKLES.map((sparkle, i) => (
            <Sparkle key={i} {...sparkle} />
          ))}

          <h1 className="font-pixie text-6xl sm:text-7xl md:text-8xl lg:text-9xl text-neutral-100 tracking-tight leading-none">
            ionaKate.uk
          </h1>
        </div>

        <p className="font-body text-base sm:text-lg text-neutral-400 mt-8 max-w-md leading-relaxed mx-auto">
          Software Engineer with a Biomedical Engineering background, building
          thoughtful, well-crafted things at the intersection of science and
          code.
        </p>

        <button
          onClick={() => onNavigate("about")}
          className="mt-10 px-8 py-3 rounded-full border border-accent text-accent font-mono text-xs uppercase tracking-widest hover:bg-accent hover:text-neutral-950 transition-all duration-300"
        >
          More about me
        </button>

        <ChevronDown
          size={20}
          className="mt-16 text-neutral-400 animate-bounce"
          aria-hidden="true"
        />
      </div>

      {/* Scroll-reveal identity cards */}
      <div className="flex flex-col sm:flex-row gap-6 sm:gap-8 pb-24 sm:pb-32 w-full items-center justify-center">
        <RevealCard
          eyebrow="Start here"
          title="Who am I?"
          description="Scientifically trained, creatively driven, and a little bit sparkly. Here's the full story."
          buttonLabel="About me"
          onClick={() => onNavigate("about")}
        />
        <RevealCard
          eyebrow="The work"
          title="What do I do?"
          description="A look at the projects and case studies I've shipped, and the problems they solved."
          buttonLabel="Case studies"
          onClick={() => onNavigate("caseStudies")}
        />
      </div>
    </div>
  );
}
