import { Sparkles } from "lucide-react";

interface PinkToggleProps {
  isPink: boolean;
  onToggle: () => void;
}

export function PinkToggle({ isPink, onToggle }: PinkToggleProps) {
  return (
    <button
      onClick={onToggle}
      aria-label="Toggle pink mode"
      className="flex items-center gap-2 group"
    >
      {/* Track */}
      <div
        className={`
          relative w-10 h-5 rounded-full transition-all duration-300
          border border-neutral-700 group-hover:border-accent
          ${isPink ? "bg-accent" : "bg-neutral-800"}
        `}
      >
        {/* Thumb */}
        <div
          className={`
            absolute top-0.5 w-4 h-4 rounded-full transition-all duration-300
            bg-white shadow-sm
            ${isPink ? "left-5" : "left-0.5"}
          `}
        />
      </div>

      {/* Icon */}
      <Sparkles
        size={13}
        className={`transition-all duration-300 ${isPink ? "text-accent opacity-100" : "text-neutral-600 opacity-60 group-hover:opacity-100 group-hover:text-accent"}`}
      />
    </button>
  );
}
