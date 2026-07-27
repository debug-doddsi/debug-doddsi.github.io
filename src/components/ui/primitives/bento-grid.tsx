import type { ReactNode } from "react";
import { ArrowRight, type LucideIcon } from "lucide-react";

interface BentoGridProps {
  children: ReactNode;
  className?: string;
}

export function BentoGrid({ children, className = "" }: BentoGridProps) {
  return (
    <div
      className={`grid w-full grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 lg:auto-rows-[170px] ${className}`}
    >
      {children}
    </div>
  );
}

interface BentoCardProps {
  name: string;
  description?: string;
  Icon?: LucideIcon;
  cta?: string;
  href?: string;
  onClick?: () => void;
  className?: string;
  /** Full custom content — if provided, overrides the default Icon/name/description layout. */
  children?: ReactNode;
}

export function BentoCard({
  name,
  description,
  Icon,
  cta,
  href,
  onClick,
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
      className={`group relative flex flex-col justify-between overflow-hidden rounded-2xl p-6
        bg-white/55 backdrop-blur-md border border-white/60
        shadow-[0_8px_30px_rgba(0,0,0,0.06)]
        transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_14px_40px_rgba(0,0,0,0.08)]
        ${className}`}
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
