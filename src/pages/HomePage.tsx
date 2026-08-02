import type { CSSProperties } from "react";
import { FolderGit2, Mail, Heart, Pen } from "lucide-react";
import { BentoGrid, BentoCard } from "../components/ui/bento-grid";
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
      <div className="flex flex-col items-start text-left pb-14 sm:pb-20">
        <p className="font-mono text-sm sm:text-base lowercase tracking-[0.3em] text-neutral-400">
          Hi, I'm
        </p>
        <div className="flex flex-col md:flex-row md:items-center gap-4 md:gap-32">
          <div className="relative inline-block shrink-0">
            {SPARKLES.map((sparkle, i) => (
              <Sparkle key={i} {...sparkle} />
            ))}
            <h1 className="font-pixie text-7xl sm:text-8xl md:text-9xl lg:text-[10rem] text-neutral-100 tracking-tight leading-none">
              iona kate
            </h1>

            <div className="flex w-full gap-4 mt-10">
              <button
                onClick={() => onNavigate("about")}
                className="flex-1 px-8 py-3 rounded-full border border-accent text-accent font-mono text-xs uppercase tracking-widest hover:bg-accent hover:text-neutral-950 transition-all duration-300"
              >
                More about me
              </button>
              <button className="flex-1 px-8 py-3 rounded-full border border-accent text-accent font-mono text-xs uppercase tracking-widest hover:bg-accent hover:text-neutral-950 transition-all duration-300">
                Placeholder
              </button>
            </div>
          </div>

          <div className="flex flex-col max-w-xs">
            <p className="font-mono text-base sm:text-lg text-neutral-400 leading-relaxed">
              Software Engineer
              <br /> & UX Designer.
              <br />I build apps engineers actually want to use.
            </p>
          </div>
        </div>
      </div>

      {/* Bento grid */}
      <BentoGrid className="max-w-5xl mx-auto">
        {/* What I do */}
        <BentoCard
          size="wide"
          name="What I Do"
          description="Where I've been and what I've been up to since graduation!"
          Icon={FolderGit2}
          cta="Have a nosey"
          onClick={() => onNavigate("work")}
        />

        <BentoCard
          size="sm"
          name="My Current Project "
          description="My hobby outside of work! I am creating a website for my husband's business."
          Icon={Pen}
          cta="See my work"
          onClick={() => onNavigate("persevere")}
        />

        {/* Contact */}
        <BentoCard
          name="Let's Talk!"
          description="Always happy to chat about a project or an idea."
          Icon={Mail}
          cta="Get in touch"
          onClick={() => onNavigate("contact")}
        />

        <BentoCard
          size="wide"
          name="Placeholder"
          description="Placeholder"
          Icon={Heart}
          cta="Placeholder"
          href="Placeholder"
        />

        <BentoCard
          size="full"
          name="Placeholder"
          description="Placeholder"
          Icon={Heart}
          cta="Placeholder"
          href="Placeholder"
        />
      </BentoGrid>
    </div>
  );
}
