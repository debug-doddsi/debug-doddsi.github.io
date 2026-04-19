import { useState } from "react";

export interface NotebookChapter {
  numeral: string;
  label: string;
  subtitle: string;
  tabTop: string;
  items: string[];
}

interface NotebookProps {
  chapters: NotebookChapter[];
  footerLabel?: string;
}

export function Notebook({
  chapters,
  footerLabel = "ionakate.uk",
}: NotebookProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [animKey, setAnimKey] = useState(0);

  const active = chapters[activeIndex];

  const handleSwitch = (index: number) => {
    if (index === activeIndex) return;
    setActiveIndex(index);
    setAnimKey((k) => k + 1);
  };

  return (
    <div className="flex items-stretch">
      {/* ── Notebook body ── */}
      <div className="flex-1 notebook-paper border border-r-0 border-neutral-300 rounded-l-lg overflow-hidden relative">
        {/* Margin line */}
        <div
          className="absolute left-9 top-0 bottom-0 w-px opacity-25 pointer-events-none"
          style={{ backgroundColor: "var(--accent)" }}
        />

        {/* Chapter header */}
        <div className="relative px-5 py-4 pl-14 border-b border-dashed border-neutral-200">
          <p className="font-mono text-[9px] uppercase tracking-[0.2em] notebook-muted">
            Chapter {active.numeral}
          </p>
          <p className="font-display text-xl notebook-header mt-0.5 leading-tight">
            {active.label}
          </p>
          <p className="font-body text-xs notebook-muted mt-0.5 italic">
            {active.subtitle}
          </p>
        </div>

        {/* Items */}
        <div
          key={animKey}
          className="notebook-rule relative px-5 py-2 pl-14 columns-1 sm:columns-2 gap-x-6"
        >
          {active.items.map((item, i) => (
            <div
              key={item}
              className="notebook-item flex items-center gap-2 h-8 break-inside-avoid"
              style={{ animationDelay: `${i * 18}ms` }}
            >
              <span
                className="text-xs shrink-0"
                style={{ color: "var(--accent)" }}
              >
                —
              </span>
              <span className="text-sm notebook-text leading-none">{item}</span>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="relative px-5 py-3 pl-14 border-t border-neutral-200 flex justify-between items-center">
          <span className="font-mono text-[9px] notebook-muted uppercase tracking-widest">
            {footerLabel}
          </span>
          <span className="font-mono text-[10px] notebook-muted">
            {active.numeral}
          </span>
        </div>
      </div>

      {/* ── Book spine: page-edge texture + index tabs ── */}
      <div className="relative flex-shrink-0" style={{ width: "28px" }}>
        {/* Page-edge texture */}
        <div className="absolute inset-0 book-edge border-t border-r border-b border-neutral-300 rounded-tr-lg rounded-br-lg" />

        {/* Index tabs */}
        {chapters.map((c, i) => {
          const isActive = i === activeIndex;
          return (
            <button
              key={c.numeral}
              onClick={() => handleSwitch(i)}
              title={c.label}
              className="absolute flex items-center justify-center transition-all duration-200"
              style={{
                top: c.tabTop,
                left: 0,
                right: "-10px",
                height: "72px",
                borderRadius: "0 4px 4px 0",
                background: isActive
                  ? "var(--accent)"
                  : "rgba(80, 70, 60, 0.5)",
                boxShadow: isActive
                  ? "inset -1px 0 0 rgba(255,255,255,0.15), 3px 0 8px rgba(var(--accent-rgb), 0.35)"
                  : "inset -1px 0 0 rgba(255,255,255,0.1), 2px 0 5px rgba(0,0,0,0.2)",
              }}
            >
              <span
                className={`font-mono text-[9px] font-bold select-none tracking-wider ${
                  isActive ? "text-neutral-950 opacity-80" : "text-neutral-200"
                }`}
                style={{
                  writingMode: "vertical-lr",
                  transform: "rotate(180deg)",
                }}
              >
                {c.numeral}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
