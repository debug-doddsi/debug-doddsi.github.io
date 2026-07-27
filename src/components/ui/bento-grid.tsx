import type { ReactNode } from "react";
import { ArrowRight, type LucideIcon } from "lucide-react";

interface BentoGridProps {
  children: ReactNode;
  className?: string;
}

export function BentoGrid({ children, className = "" }: BentoGridProps) {
  return (
    <div
      className={`grid w-full grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 ${className}`}
    >
      {children}
    </div>
  );
}

export type BentoSize = "sm" | "wide" | "tall" | "lg" | "full";

// Span presets, applied at the lg breakpoint (the grid is single/2-column
// below that, so span classes only matter once there's room for them).
// "sm" is the default 1x1 tile - every other size is relative to that.
const SIZE_CLASSES: Record<BentoSize, string> = {
  sm: "lg:col-span-1 lg:row-span-1",
  wide: "lg:col-span-2 lg:row-span-1",
  tall: "lg:col-span-1 lg:row-span-2",
  lg: "lg:col-span-2 lg:row-span-2",
  full: "lg:col-span-3 lg:row-span-1",
};

interface BentoCardProps {
  name: string;
  description?: string;
  Icon?: LucideIcon;
  cta?: string;
  href?: string;
  onClick?: () => void;
  /** Tile span preset. Defaults to a standard 1x1 card. Combine with
   *  className (e.g. "lg:col-start-3") if you need to pin its position too. */
  size?: BentoSize;
  /** Drop any component into the card body - sits below the name/description,
   *  above the cta, while keeping the standard Icon/name layout. Use this
   *  instead of `children` whenever you just need to embed something like a
   *  ticker or widget without rebuilding the icon/heading markup by hand. */
  content?: ReactNode;
  className?: string;
  /** Full custom content - overrides the entire default layout (Icon, name,
   *  description, content, cta) when you need something completely bespoke. */
  children?: ReactNode;
}

export function BentoCard({
  name,
  description,
  Icon,
  cta,
  href,
  onClick,
  size = "sm",
  content,
  className = "",
  children,
}: BentoCardProps) {
  const action = (
    <span className="inline-flex items-center gap-1 font-mono text-[10px] text-accent uppercase tracking-widest hover:underline">
      {cta}
      <ArrowRight size={12} />
    </span>
  );

  return (
    <div
      className={`group relative flex min-h-40 flex-col justify-between overflow-hidden rounded-2xl p-6
        bg-[#faf3e4]/60 backdrop-blur-md border border-[#faf3e4]/70
        shadow-[0_8px_30px_rgba(0,0,0,0.06)]
        transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_14px_40px_rgba(0,0,0,0.08)]
        ${SIZE_CLASSES[size]} ${className}`}
    >
      {children ?? (
        <>
          {Icon && <Icon size={20} className="text-accent shrink-0" />}
          <div>
            <h3 className="font-display text-lg text-neutral-100 mb-1">
              {name}
            </h3>
            {description && (
              <p className="font-body text-xs text-neutral-400 leading-relaxed mb-3">
                {description}
              </p>
            )}
            {content && <div className="mb-3">{content}</div>}
            {cta &&
              (href ? (
                <a href={href}>{action}</a>
              ) : onClick ? (
                <button onClick={onClick}>{action}</button>
              ) : (
                action
              ))}
          </div>
        </>
      )}
    </div>
  );
}
