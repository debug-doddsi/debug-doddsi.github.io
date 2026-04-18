const TECH_ITEMS = [
  "React",
  "TypeScript",
  "Vite",
  "Tailwind",
  "shadcn/ui",
  "pnpm",
  "Turbo",
  "Figma",
  "TanStack",
  "Git",
  "Storybook",
  "Node.js",
  "C++",
  "Embedded Software",
  "DAL-C",
  "DAL-D",
  "RTOS",
  "Firmware",
  "I2C",
  "CMake",
  "Jenkins",
  "Bitbucket",
  "Debugging",
];

export function TechTicker() {
  // Duplicate items so it loops seamlessly
  const items = [...TECH_ITEMS, ...TECH_ITEMS];

  return (
    <div className="overflow-hidden relative">
      {/* Fade edges */}
      <div className="absolute left-0 top-0 bottom-0 w-12 z-10 bg-gradient-to-r from-[var(--bg-base)] to-transparent" />
      <div className="absolute right-0 top-0 bottom-0 w-12 z-10 bg-gradient-to-l from-[var(--bg-base)] to-transparent" />

      <div className="flex gap-6 animate-ticker w-max">
        {items.map((item, i) => (
          <div key={i} className="flex items-center gap-2 shrink-0">
            <span className="text-accent text-xs">✦</span>
            <span className="font-mono text-xs text-neutral-400 uppercase tracking-widest whitespace-nowrap">
              {item}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
