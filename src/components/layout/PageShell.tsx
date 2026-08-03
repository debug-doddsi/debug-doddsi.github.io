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

interface SparklePlacement {
  top?: string;
  bottom?: string;
  left?: string;
  right?: string;
  size: number;
  delay: string;
}

// Fixed sparkle arrangement around the title. Alternates left/right so
// sparkles don't cluster on one side, and keeps offsets within roughly ±10%
// so they never push past the title's own padding on narrow screens.
const SPARKLE_PLACEMENTS: SparklePlacement[] = [
  { left: "-8%", top: "-8%", size: 14, delay: "0s" },
  { right: "-6%", top: "5%", size: 10, delay: "0.3s" },
  { left: "-4%", bottom: "-6%", size: 12, delay: "0.9s" },
  { right: "-9%", bottom: "10%", size: 16, delay: "1.4s" },
  { left: "-9%", top: "18%", size: 9, delay: "0.6s" },
  { right: "-3%", top: "-9%", size: 11, delay: "1.7s" },
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
  /** Opt-in decorative sparkles around the title. On by default. */
  sparkles?: boolean;
  /** Override the default `max-w-2xl` container width, e.g. for pages
   *  that need room for a wider grid of cards. */
  maxWidthClassName?: string;
}

export function PageShell({
  title,
  subtitle,
  children,
  sparkles = true,
  maxWidthClassName = "max-w-2xl",
}: PageShellProps) {
  return (
    <div>
      {/* Heading - always pinned to the same width/position as every other
          page, even when `maxWidthClassName` widens the content below it
          for a bigger grid. */}
      <div className="mx-auto max-w-2xl mb-10">
        <div className="relative inline-block">
          <h1 className="font-pixie text-8xl text-neutral-100 tracking-tight">
            {title}
          </h1>
          {sparkles &&
            SPARKLE_PLACEMENTS.map((sparkle, i) => (
              <Sparkle key={i} {...sparkle} />
            ))}
        </div>
        {subtitle && (
          <p className="mt-5 font-mono text-neutral-500 text-sm leading-relaxed">
            {subtitle}
          </p>
        )}
      </div>

      {/* Slot for actual content */}
      <div className={`mx-auto ${maxWidthClassName}`}>
        {children ?? (
          <div className="space-y-4">
            <SkeletonBlock height="h-24" />
            <SkeletonBlock height="h-16" />
            <SkeletonBlock height="h-32" />
          </div>
        )}
      </div>
    </div>
  );
}
