import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

export interface ScrapbookProject {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  tech: string[];
  year: string;
  imageColor?: string;
  imageUrl?: string;
  link?: string;
  notes?: string;
  polaroidRotation?: number;
}

interface Props {
  projects: ScrapbookProject[];
}

const COIL_COUNT = 15;

export function ScrapbookProjects({ projects }: Props) {
  const [current, setCurrent] = useState(0);
  const [animKey, setAnimKey] = useState(0);
  const [flipDir, setFlipDir] = useState<"next" | "prev">("next");

  const project = projects[current];
  const rot = project.polaroidRotation ?? -3;

  const navigate = (dir: "next" | "prev") => {
    setFlipDir(dir);
    setCurrent((i: number) =>
      dir === "next"
        ? (i + 1) % projects.length
        : (i - 1 + projects.length) % projects.length
    );
    setAnimKey((k: number) => k + 1);
  };

  const goTo = (i: number) => {
    if (i === current) return;
    setFlipDir(i > current ? "next" : "prev");
    setCurrent(i);
    setAnimKey((k: number) => k + 1);
  };

  return (
    <div className="scrapbook-wrapper">
      <div className="scrapbook-book">
        {/* ── Left page ── */}
        <div className="scrapbook-page scrapbook-page-left">
          {/* Lined paper overlay */}
          <div className="notebook-rule absolute inset-0 pointer-events-none opacity-50" />
          {/* Red margin rule */}
          <div
            className="absolute top-0 bottom-0 left-10 w-px pointer-events-none opacity-25"
            style={{ backgroundColor: "#e05555" }}
          />

          {/* Animated content */}
          <div
            key={`l-${animKey}`}
            className={`scrapbook-flip-${flipDir} relative h-full flex items-center justify-center`}
          >
            {/* Gold star stickers scattered around the polaroid */}
            <span className="scrapbook-star" style={{ top: "12%", left: "7%" }}>★</span>
            <span className="scrapbook-star scrapbook-star-sm" style={{ top: "8%", left: "22%" }}>✦</span>
            <span className="scrapbook-star scrapbook-star-lg" style={{ top: "17%", right: "5%" }}>★</span>
            <span className="scrapbook-star scrapbook-star-sm" style={{ top: "30%", left: "4%" }}>✧</span>
            <span className="scrapbook-star scrapbook-star-sm" style={{ bottom: "18%", left: "9%" }}>✦</span>
            <span className="scrapbook-star" style={{ bottom: "12%", right: "7%" }}>★</span>
            <span className="scrapbook-star scrapbook-star-sm" style={{ bottom: "8%", right: "22%" }}>✧</span>

            {/* Polaroid */}
            <div
              className="scrapbook-polaroid"
              style={{ transform: `rotate(${rot}deg)` }}
            >
              <div
                className="scrapbook-photo"
                style={{ backgroundColor: project.imageColor ?? "#c8b8d8" }}
              >
                {project.imageUrl ? (
                  <img
                    src={project.imageUrl}
                    alt={project.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="scrapbook-photo-glyph">✦</span>
                )}
              </div>
              <p className="scrapbook-polaroid-caption">{project.title}</p>
            </div>
          </div>

          <span className="scrapbook-page-num" style={{ left: 12, bottom: 8 }}>
            pg. {current * 2 + 1}
          </span>
        </div>

        {/* ── Spiral binding ── */}
        <div className="scrapbook-binding" aria-hidden="true">
          {Array.from({ length: COIL_COUNT }).map((_, i) => (
            <div key={i} className="scrapbook-coil" />
          ))}
        </div>

        {/* ── Right page ── */}
        <div className="scrapbook-page scrapbook-page-right">
          <div className="notebook-rule absolute inset-0 pointer-events-none opacity-50" />

          {/* Scrollable content area (stays within overflow:hidden page) */}
          <div className="absolute inset-0 overflow-y-auto">
            <div
              key={`r-${animKey}`}
              className={`scrapbook-flip-${flipDir} p-5 pt-6 pb-10`}
            >
              <p className="scrapbook-year">{project.year}</p>
              <h3 className="scrapbook-title">✦ {project.title}</h3>
              <p className="scrapbook-subtitle">{project.subtitle}</p>
              <p className="scrapbook-wavy">∼ ∼ ∼ ∼ ∼</p>
              <p className="scrapbook-desc">{project.description}</p>

              {project.notes && (
                <p className="scrapbook-notes">{project.notes}</p>
              )}

              <div className="flex flex-wrap gap-1 mt-3 mb-3">
                {project.tech.map((t) => (
                  <span key={t} className="scrapbook-tech-tag">
                    {t}
                  </span>
                ))}
              </div>

              {project.link && (
                <a
                  href={project.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="scrapbook-link"
                >
                  view project →
                </a>
              )}
            </div>
          </div>

          <span
            className="scrapbook-page-num"
            style={{ right: 12, bottom: 8, zIndex: 2 }}
          >
            pg. {current * 2 + 2}
          </span>
        </div>
      </div>

      {/* ── Navigation ── */}
      {projects.length > 1 && (
        <nav className="scrapbook-nav" aria-label="Project navigation">
          <button
            onClick={() => navigate("prev")}
            className="scrapbook-nav-btn"
            aria-label="Previous project"
          >
            <ChevronLeft size={14} />
            <span>prev</span>
          </button>

          <div className="flex items-center gap-1.5" role="list">
            {projects.map((p, i) => (
              <button
                key={p.id}
                onClick={() => goTo(i)}
                aria-label={`Go to ${p.title}`}
                aria-current={i === current ? "true" : undefined}
                className={`scrapbook-dot${i === current ? " active" : ""}`}
              />
            ))}
          </div>

          <button
            onClick={() => navigate("next")}
            className="scrapbook-nav-btn"
            aria-label="Next project"
          >
            <span>next</span>
            <ChevronRight size={14} />
          </button>
        </nav>
      )}
    </div>
  );
}
