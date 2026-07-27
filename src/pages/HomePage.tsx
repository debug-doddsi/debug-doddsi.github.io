import type { CSSProperties } from "react";
import { Sparkles, FolderGit2, Mail } from "lucide-react";
import { BentoGrid, BentoCard } from "../components/ui/bento-grid";
import { TechLoop } from "../components/about/TechLoop";
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
    <div className="bento-gradient-bg min-h-[calc(100vh-6rem)] rounded-3xl px-4 sm:px-8 py-10 sm:py-16">
      {/* Hero - full-size wordmark, sitting above the grid rather than
          inside a card. */}
      <div className="flex flex-col items-center text-center pb-14 sm:pb-20">
        <div className="relative inline-block">
          {SPARKLES.map((sparkle, i) => (
            <Sparkle key={i} {...sparkle} />
          ))}
          <h1 className="font-pixie text-7xl sm:text-8xl md:text-9xl lg:text-[10rem] text-neutral-100 tracking-tight leading-none">
            ionaKate.uk
          </h1>
        </div>

        <p className="font-body text-base sm:text-lg text-neutral-400 mt-8 max-w-md leading-relaxed mx-auto">
          Software Engineer with a Biomedical Engineering background, building
          thoughtful, well-crafted things just for fun.
        </p>

        <button
          onClick={() => onNavigate("about")}
          className="mt-10 px-8 py-3 rounded-full border border-accent text-accent font-mono text-xs uppercase tracking-widest hover:bg-accent hover:text-neutral-950 transition-all duration-300"
        >
          More about me
        </button>
      </div>

      {/* Bento grid */}
      <BentoGrid className="max-w-5xl mx-auto">
        {/* What I do */}
        <BentoCard
          name="What I Do"
          description="Projects and case studies from things I've shipped."
          Icon={FolderGit2}
          cta="See my work"
          onClick={() => onNavigate("caseStudies")}
        />

        {/* Tech stack */}
        <BentoCard
          name="My Tech Stack"
          Icon={Sparkles}
          content={<TechLoop />}
          className="overflow-hidden"
        />

        {/* Say hello */}
        <BentoCard
          name="Let's Talk!"
          description="Always happy to chat about a project or an idea."
          Icon={Mail}
          cta="hello@ionakate.uk"
          href="mailto:hello@ionakate.uk"
        />
      </BentoGrid>
    </div>
  );
}
