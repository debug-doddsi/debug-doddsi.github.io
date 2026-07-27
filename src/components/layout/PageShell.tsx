import { CSSProperties, ReactNode } from "react";

interface SkeletonBlockProps {
  label?: string;
  height?: string;
}

export function SkeletonBlock({
  label = "Content coming soon",
  height = "h-32",
}: SkeletonBlockProps) {
  return (
    <div
      className={`${height} rounded-lg border border-[#faf3e4]/70 bg-[#faf3e4]/60 backdrop-blur-md flex items-center justify-center`}
    >
      <span className="font-mono text-neutral-500 text-xs uppercase tracking-widest">
        {label}
      </span>
    </div>
  );
}

interface PageShellProps {
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
  children?: React.ReactNode;
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

interface PageShellProps {
  title: string;
  subtitle?: string;
  icon?: ReactNode;
  children?: ReactNode;
  /** Opt-in decorative sparkles around the title. Off by default. */
  sparkles?: boolean;
}

export function PageShell({
  title,
  subtitle,
  children,
  sparkles = true,
}: PageShellProps) {
  return (
    <div className="mx-auto max-w-2xl">
      {/* Heading */}
      <div className="mb-10">
        <div className="relative inline-block">
          <h1 className="font-pixie text-8xl text-neutral-100 tracking-tight">
            {title}
          </h1>
          {sparkles &&
            SPARKLES.map((sparkle, i) => <Sparkle key={i} {...sparkle} />)}
        </div>
        {subtitle && (
          <p className="mt-2 font-mono text-neutral-500 text-xs leading-relaxed">
            {subtitle}
          </p>
        )}
      </div>

      {/* Slot for actual content */}
      {children ?? (
        <div className="space-y-4">
          <SkeletonBlock height="h-24" />
          <SkeletonBlock height="h-16" />
          <SkeletonBlock height="h-32" />
        </div>
      )}
    </div>
  );
}
