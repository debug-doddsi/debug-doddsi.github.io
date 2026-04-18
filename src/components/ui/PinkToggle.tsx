export function PinkToggle({ isPink, onToggle }: PinkToggleProps) {
  return (
    <button
      onClick={onToggle}
      aria-label="Toggle pink mode"
      title={
        isPink
          ? "Click for a Professional colour palette"
          : "Click for Iona's preferred colour palette"
      }
      className="flex items-center gap-2 group"
    >
      <span className="text-xs">💼</span>

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

      <span className="text-xs">🎀</span>
    </button>
  );
}
