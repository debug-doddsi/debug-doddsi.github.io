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

      <div className="flex items-center animate-ticker w-max">
        {items.map((item, i) => (
          <div key={i} className="flex items-center shrink-0">
            <span className="font-mono text-xs text-neutral-400 uppercase tracking-widest whitespace-nowrap px-6">
              {item}
            </span>
            <svg
              width="15"
              height="15"
              viewBox="0 0 15 15"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="shrink-0"
            >
              <path
                d="M7.5 0 L8.8 5.7 L14.5 7.5 L8.8 9.3 L7.5 15 L6.2 9.3 L0.5 7.5 L6.2 5.7 Z"
                fill="var(--accent)"
              />
            </svg>{" "}
          </div>
        ))}
      </div>
    </div>
  );
}
