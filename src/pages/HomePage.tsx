import type { CSSProperties } from "react";
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

export function HomePage({ onNavigate }: HomePageProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] px-6 sm:px-8 text-center">
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
        thoughtful, well-crafted things at the intersection of science and code.
      </p>

      <button
        onClick={() => onNavigate("about")}
        className="mt-10 px-8 py-3 rounded-full border border-accent text-accent font-mono text-xs uppercase tracking-widest hover:bg-accent hover:text-neutral-950 transition-all duration-300"
      >
        More about me
      </button>
    </div>
  );
}
