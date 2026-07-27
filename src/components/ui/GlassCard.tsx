import type { ReactNode } from "react";
import { cn } from "../../lib/utils";

interface GlassCardProps {
  children: ReactNode;
  className?: string;
}

// The same semi-transparent cream/ivory "glass" surface used for the bento
// cards on the home page, factored out so every other card/placeholder on
// the site can share the exact same look.
export function GlassCard({ children, className = "" }: GlassCardProps) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-[#faf3e4]/70 bg-[#faf3e4]/60 backdrop-blur-md shadow-[0_8px_30px_rgba(0,0,0,0.06)] p-6",
        className,
      )}
    >
      {children}
    </div>
  );
}
