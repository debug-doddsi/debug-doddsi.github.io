import { SkeletonBlock } from "./PageShell";
import { Badge } from "@/components/ui/badge";

const TECH_STACK = [
  "React",
  "TypeScript",
  "Vite",
  "Tailwind CSS",
  "shadcn/ui",
  "pnpm",
  "Turborepo",
  "Figma",
  "TanStack",
  "Git",
  "Storybook",
  "Node.js",
];

export function Bio() {
  return (
    <div className="space-y-8">
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
          device design — bridging engineering and healthcare. Specialised in
          electronics, software and instrumentation electives — covering
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
        <div className="flex flex-wrap gap-2">
          {TECH_STACK.map((tech) => (
            <Badge
              key={tech}
              variant="outline"
              className="border-accent text-accent bg-accent-soft px-3 py-1 text-xs font-body cursor-default"
            >
              {tech}
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
