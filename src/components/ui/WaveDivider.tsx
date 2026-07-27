interface WaveDividerProps {
  /** Visible width of the divider, e.g. "6rem", "100%", 96 (px). */
  length?: number | string;
  /** Height of the wave's motion (peak-to-trough). */
  height?: number;
  /** Stroke colour at the start of the divider; fades to transparent. */
  color?: string;
  /** How long one full wiggle cycle takes. */
  duration?: string;
  className?: string;
}

// One wave period is 20 SVG units wide. The path below draws two periods
// (40 units) so the strip can loop seamlessly: animating it left by exactly
// one period (-50%) lands back on an identical frame.
const WAVE_PERIOD = 20;

export function WaveDivider({
  length = "6rem",
  height = 6,
  color = "var(--accent)",
  duration = "2.5s",
  className = "",
}: WaveDividerProps) {
  const width = typeof length === "number" ? `${length}px` : length;

  return (
    <div
      className={`overflow-hidden ${className}`}
      style={{
        width,
        height,
        // Fade lives on the container (not the animated path) so it stays
        // pinned to the divider's edges while the wave wiggles underneath it.
        maskImage: "linear-gradient(to right, black, transparent)",
        WebkitMaskImage: "linear-gradient(to right, black, transparent)",
      }}
      aria-hidden="true"
    >
      <svg
        viewBox={`0 0 ${WAVE_PERIOD * 2} 10`}
        preserveAspectRatio="none"
        className="wave-divider-wiggle h-full"
        style={{ width: "200%", animationDuration: duration }}
      >
        <path
          d="M0,5 Q5,0 10,5 T20,5 T30,5 T40,5"
          fill="none"
          stroke={color}
          strokeWidth="1.5"
          strokeLinecap="round"
        />
      </svg>
    </div>
  );
}
