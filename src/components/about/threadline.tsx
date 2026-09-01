import React, {
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";

export type ThreadlineSide = "left" | "right";

export interface ThreadlineProps {
  /** Number of direction changes in the auto-generated serpentine path. Ignored when `path` is set, except that it still sizes the default node count. */
  turns?: number;
  /** Which side the auto serpentine starts on. */
  startSide?: ThreadlineSide;
  /** Paste your own SVG path `d` string for full control over the route. Overrides the auto serpentine. */
  path?: string;
  /** Coordinate space a custom `path` was authored in, e.g. "0 0 1000 1000". Defaults to the container's measured pixel size (used for the auto serpentine). */
  viewBox?: string;
  preserveAspectRatio?: string;
  /** Number of pop-in nodes, evenly spaced by arc length along the line. Defaults to turns + 1. */
  nodeCount?: number;
  color?: string;
  thickness?: number;
  lineCap?: "round" | "butt" | "square";
  nodeSize?: number;
  nodeFill?: string;
  nodeBorderColor?: string;
  nodeBorderWidth?: number;
  /** Keep the line fully drawn instead of tying it to scroll - handy for static previews. */
  previewFullyDrawn?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

interface Point {
  x: number;
  y: number;
  /** Fraction (0-1) of the total path length this point sits at. */
  t: number;
}

const cx = (...parts: Array<string | false | null | undefined>) =>
  parts.filter(Boolean).join(" ");

function buildSerpentinePath(
  width: number,
  height: number,
  turns: number,
  startSide: ThreadlineSide,
): string {
  const marginX = width * 0.16;
  const leftX = marginX;
  const rightX = width - marginX;

  if (turns <= 0) {
    const midX = width / 2;
    return `M ${midX} 0 L ${midX} ${height}`;
  }

  // Each waypoint sits at the row's horizontal extreme (left or right) - that
  // extreme is exactly where the line reverses direction, i.e. a "turn".
  const rows = turns + 1;
  const rowHeight = height / rows;
  const waypoints: { x: number; y: number }[] = Array.from(
    { length: rows },
    (_, i) => {
      const onLeft = startSide === "left" ? i % 2 === 0 : i % 2 === 1;
      return { x: onLeft ? leftX : rightX, y: (i + 0.5) * rowHeight };
    },
  );

  let d = `M ${waypoints[0].x} ${waypoints[0].y}`;
  for (let i = 0; i < waypoints.length - 1; i++) {
    const p0 = waypoints[i];
    const p1 = waypoints[i + 1];
    const c1y = p0.y + rowHeight / 2;
    const c2y = p1.y - rowHeight / 2;
    d += ` C ${p0.x} ${c1y}, ${p1.x} ${c2y}, ${p1.x} ${p1.y}`;
  }
  return d;
}

function usePrefersReducedMotion(): boolean {
  const [reduced, setReduced] = useState(
    () =>
      typeof window !== "undefined" &&
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches,
  );

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const handler = (e: MediaQueryListEvent) => setReduced(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  return reduced;
}

export const Threadline: React.FC<ThreadlineProps> = ({
  turns = 4,
  startSide = "left",
  path,
  viewBox,
  preserveAspectRatio = "none",
  nodeCount,
  color = "var(--accent)",
  thickness = 3,
  lineCap = "round",
  nodeSize = 14,
  nodeFill,
  nodeBorderColor = "#fff",
  nodeBorderWidth = 2,
  previewFullyDrawn = false,
  className,
  style,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const pathRef = useRef<SVGPathElement>(null);

  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });
  const [pathLength, setPathLength] = useState(0);
  const [nodePoints, setNodePoints] = useState<Point[]>([]);
  const [progress, setProgress] = useState(0);

  const prefersReducedMotion = usePrefersReducedMotion();
  const drawnFully = previewFullyDrawn || prefersReducedMotion;

  useLayoutEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const update = () =>
      setContainerSize({ width: el.clientWidth, height: el.clientHeight });
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const d = useMemo(() => {
    if (path) return path;
    if (!containerSize.width || !containerSize.height) return "";
    return buildSerpentinePath(
      containerSize.width,
      containerSize.height,
      Math.max(0, Math.floor(turns)),
      startSide,
    );
  }, [path, containerSize, turns, startSide]);

  useLayoutEffect(() => {
    const pathEl = pathRef.current;
    if (!pathEl || !d) return;
    const total = pathEl.getTotalLength();
    setPathLength(total);

    const n = Math.max(2, nodeCount ?? Math.max(0, Math.floor(turns)) + 1);
    const fractions = Array.from({ length: n }, (_, i) => i / (n - 1));
    setNodePoints(
      fractions.map((t) => {
        const pt = pathEl.getPointAtLength(t * total);
        return { x: pt.x, y: pt.y, t };
      }),
    );
  }, [d, nodeCount, turns]);

  useEffect(() => {
    if (drawnFully) {
      setProgress(1);
      return;
    }

    const el = containerRef.current;
    if (!el) return;

    let ticking = false;
    const update = () => {
      ticking = false;
      const rect = el.getBoundingClientRect();
      // 0 as the section enters from the bottom of the viewport, 1 once its
      // own bottom edge has scrolled up to the bottom of the viewport - i.e.
      // the moment the whole thing has been revealed.
      const p =
        rect.height > 0 ? (window.innerHeight - rect.top) / rect.height : 0;
      setProgress(Math.min(1, Math.max(0, p)));
    };
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [drawnFully]);

  const resolvedNodeFill = nodeFill ?? color;
  const resolvedViewBox =
    viewBox ?? `0 0 ${containerSize.width || 0} ${containerSize.height || 0}`;

  return (
    <div
      ref={containerRef}
      aria-hidden="true"
      className={cx("pointer-events-none absolute inset-0", className)}
      style={style}
    >
      <svg
        className="block h-full w-full overflow-visible"
        viewBox={resolvedViewBox}
        preserveAspectRatio={preserveAspectRatio}
      >
        <path
          ref={pathRef}
          d={d}
          fill="none"
          stroke={color}
          strokeWidth={thickness}
          strokeLinecap={lineCap}
          strokeDasharray={pathLength || undefined}
          strokeDashoffset={
            pathLength ? pathLength * (1 - progress) : undefined
          }
          style={
            drawnFully
              ? undefined
              : { transition: "stroke-dashoffset 80ms linear" }
          }
        />
        {nodePoints.map((pt, i) => (
          <circle
            key={i}
            cx={pt.x}
            cy={pt.y}
            r={nodeSize / 2}
            fill={resolvedNodeFill}
            stroke={nodeBorderColor}
            strokeWidth={nodeBorderWidth}
            style={{
              transformOrigin: `${pt.x}px ${pt.y}px`,
              transform: progress >= pt.t - 0.001 ? "scale(1)" : "scale(0)",
              transition: drawnFully
                ? "none"
                : "transform 320ms cubic-bezier(0.34, 1.56, 0.64, 1)",
            }}
          />
        ))}
      </svg>
    </div>
  );
};

export default Threadline;
