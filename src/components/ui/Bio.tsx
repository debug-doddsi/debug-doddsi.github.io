import { SkeletonBlock } from "./PageShell";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";

type Category = "all" | "frontend" | "embedded";

interface TechItem {
  label: string;
  category: "frontend" | "embedded";
}

const TECH: TechItem[] = [
  // Frontend
  { label: "React", category: "frontend" },
  { label: "TypeScript", category: "frontend" },
  { label: "Vite", category: "frontend" },
  { label: "Tailwind CSS", category: "frontend" },
  { label: "shadcn/ui", category: "frontend" },
  { label: "pnpm", category: "frontend" },
  { label: "Turborepo", category: "frontend" },
  { label: "Figma", category: "frontend" },
  { label: "TanStack", category: "frontend" },
  { label: "Git", category: "frontend" },
  { label: "Storybook", category: "frontend" },
  { label: "Node.js", category: "frontend" },
  { label: "Full-Stack Development", category: "frontend" },

  // Embedded
  { label: "C++", category: "embedded" },
  { label: "Embedded Software", category: "embedded" },
  { label: "Safety Critical Software", category: "embedded" },
  { label: "Real-Time Operating Systems (RTOS)", category: "embedded" },
  { label: "Firmware", category: "embedded" },
  { label: "I2C", category: "embedded" },
  { label: "CMake", category: "embedded" },
  { label: "Jenkins", category: "embedded" },
  { label: "Bitbucket", category: "embedded" },
  { label: "Software Design", category: "embedded" },
  { label: "Software Requirements", category: "embedded" },
  { label: "Software Documentation", category: "embedded" },
  { label: "Code Coverage", category: "embedded" },
  { label: "Agile Methodologies", category: "embedded" },
  { label: "Debugging", category: "embedded" },
  { label: "Software Troubleshooting", category: "embedded" },
  { label: "Teamwork", category: "embedded" },
  { label: "SDLC", category: "embedded" },
  { label: "Engineering", category: "embedded" },
];

const FILTERS: { label: string; value: Category }[] = [
  { label: "All", value: "all" },
  { label: "Frontend", value: "frontend" },
  { label: "Embedded", value: "embedded" },
];

export function Bio() {
  const [active, setActive] = useState<Category>("all");

  const filtered = TECH.filter((t) =>
    active === "all" ? true : t.category === active,
  ).sort((a, b) => a.label.localeCompare(b.label));

  return (
    <div className="space-y-8">
      <p className="font-body text-xs text-neutral-400 mt-1 leading-relaxed">
        After graduating with an MEng in Biomedical Engineering, I joined a
        large company as a Systems Engineer. I enjoyed the high-level
        perspective of the engineering work I was undertaking, but I missed
        coding. Driven by a desire to return to hands-on development, I sought
        out every software opportunity available and successfully transitioned
        into the Software team. Through the graduate scheme at my company, I
        built a strong technical foundation, grew in confidence, and embraced
        every challenge that came my way.
        <br />
        <br />
        I am an enthusiastic person with passion and curiosity at the core of
        everything I do. I am personable, creative and determined to produce
        high-quality and exciting work that people will love to use. Whenever
        possible, I engage in STEM events to show the next generation how
        exciting science can be.
        <br />
        <br />
        When I'm not at my desk, I'm usually baking, gaming, reading or annoying
        my husband.
      </p>

      <div className="bg-gradient-to-r from-accent to-transparent mt-4 w-24 h-px" />

      {/* Education */}
      <div>
        <h3 className="font-display text-lg text-neutral-100 mb-3">
          Education
        </h3>
        <div className="flex flex-col gap-0.5">
          <div className="flex items-center gap-2">
            <a
              href="https://www.strath.ac.uk/courses/undergraduate/biomedicalengineeringmeng/"
              target="_blank"
              rel="noopener noreferrer"
              className="font-body text-sm text-neutral-100 font-medium hover:text-accent hover:underline transition-colors"
            >
              MEng Biomedical Engineering
            </a>
            <img
              src="/strath.png"
              alt="University of Strathclyde"
              className="h-4 w-auto object-contain"
            />
          </div>
          <p className="font-body text-xs text-accent">
            Master of Engineering with Distinction
          </p>
          <p className="font-mono text-xs text-neutral-500">
            University of Strathclyde, 2017–2022
          </p>
        </div>
        <p className="font-body text-xs text-neutral-400 mt-1 leading-relaxed">
          A five-year integrated masters degree covering biomechanics,
          biomedical materials, electronics, anatomy & physiology, and medical
          device design, bridging engineering and healthcare. Specialised in
          electronics, software and instrumentation electives, covering
          microcontrollers, digital signal processing, image processing, control
          systems and biomedical electronics. This is where my love of tech
          began.
        </p>
      </div>

      {/* Experience */}
      <div>
        <h3 className="font-display text-lg text-neutral-100 mb-3">
          Experience
        </h3>
        <SkeletonBlock label="TODO: Previous role 1" height="h-20" />
        <div className="mt-3">
          <SkeletonBlock label="TODO: Previous role 2" height="h-20" />
        </div>
      </div>

      {/* Tech Stack */}
      <div>
        <h3 className="font-display text-lg text-neutral-100 mb-3">
          Tech Stack
        </h3>

        {/* Filters */}
        <div className="flex gap-2 mb-4">
          {FILTERS.map((f) => (
            <button
              key={f.value}
              onClick={() => setActive(f.value)}
              className={`
                px-3 py-1 rounded-full text-xs font-mono tracking-widest uppercase
                transition-all duration-200 border
                ${
                  active === f.value
                    ? "bg-accent text-neutral-950 border-accent"
                    : "border-accent text-accent hover:bg-accent-soft"
                }
              `}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Badges */}
        <div className="flex flex-wrap gap-2">
          {filtered.map((tech) => (
            <Badge
              key={tech.label}
              variant="outline"
              className="border-accent text-accent bg-accent-soft px-3 py-1 text-xs font-body cursor-default"
            >
              {tech.label}
            </Badge>
          ))}
        </div>
      </div>

      {/* Currently Learning */}
      <div>
        <h3 className="font-display text-lg text-neutral-100 mb-3">
          Currently Learning
        </h3>
        <SkeletonBlock label="TODO: Currently learning" height="h-20" />
      </div>
    </div>
  );
}
