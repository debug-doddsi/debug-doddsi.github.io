import { ArrowRight } from "lucide-react";
import type { ReactNode } from "react";

interface LaunchCardProps {
  icon: ReactNode;
  title: string;
  subtitle: string;
  description: string;
  placeholder: ReactNode;
  ctaLabel?: string;
  onLaunch: () => void;
}

// Shared "launch tile" look - used by both the My Apps grid and the Case
// Studies grid so a card reads the same regardless of what it opens.
export function LaunchCard({
  icon,
  title,
  subtitle,
  description,
  placeholder,
  ctaLabel = "Open",
  onLaunch,
}: LaunchCardProps) {
  return (
    <div className="flex flex-col bg-[#faf3e4]/60 backdrop-blur-md border border-[#faf3e4]/70 rounded-2xl overflow-hidden w-72 shadow-[0_8px_30px_rgba(0,0,0,0.06)] hover:shadow-[0_14px_40px_rgba(0,0,0,0.08)] transition-shadow duration-300">
      <div className="relative h-52 w-full overflow-hidden">{placeholder}</div>

      {/* Card body */}
      <div className="flex flex-col gap-3 p-5">
        <div className="flex items-start gap-3">
          <div className="shrink-0 flex items-center justify-center w-9 h-9 rounded-xl bg-accent-soft">
            <span className="text-accent">{icon}</span>
          </div>
          <div className="min-w-0">
            <h2 className="font-display text-neutral-100 text-base leading-tight">
              {title}
            </h2>
            <p className="font-mono text-[9px] text-neutral-500 uppercase tracking-widest mt-0.5">
              {subtitle}
            </p>
          </div>
        </div>

        <p className="font-body text-xs text-neutral-400 leading-relaxed">
          {description}
        </p>

        <button
          onClick={onLaunch}
          className="flex items-center justify-center gap-1.5 w-full py-2 rounded-xl font-body text-xs font-medium text-white bg-accent transition-all duration-200 hover:brightness-110 active:scale-[0.98]"
        >
          {ctaLabel} <ArrowRight size={12} />
        </button>
      </div>
    </div>
  );
}
