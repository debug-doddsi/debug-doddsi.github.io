import { Badge } from "@/components/ui/badge";

interface Job {
  title: string;
  period: string;
  location: string;
  description: string;
  tags: string[];
}

const JOBS: Job[] = [
  {
    title: "Software Engineer - Frontend",
    period: "Apr 2026 - Present",
    location: "Edinburgh",
    description: "TODO: Description",
    tags: ["React", "TypeScript", "Node.js"],
  },
  {
    title: "Software Engineer - Embedded",
    period: "Feb 2024 - Apr 2026",
    location: "Edinburgh",
    description: "TODO: Description",
    tags: ["Embedded C", "C++", "RTOS", "CMake"],
  },
  {
    title: "Graduate Software Engineer",
    period: "Sep 2022 - Feb 2024",
    location: "Edinburgh",
    description: "TODO: Description",
    tags: ["Embedded Software", "Teamwork", "Agile"],
  },
  {
    title: "Graduate Systems Engineer",
    period: "Jul 2022 - Sep 2022",
    location: "Edinburgh",
    description: "TODO: Description",
    tags: ["Engineering", "Systems Design"],
  },
];

export function Experience() {
  return (
    <div className="relative">
      {/* Timeline line */}
      <div className="absolute left-[7px] top-2 bottom-2 w-px bg-accent-soft" />

      <div className="space-y-8">
        {JOBS.map((job, index) => (
          <div key={index} className="relative pl-8">
            {/* Timeline star */}
            <div className="absolute -left-[3px] top-0.5">
              <svg
                width="20"
                height="20"
                viewBox="0 0 15 15"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M7.5 0 L8.8 5.7 L14.5 7.5 L8.8 9.3 L7.5 15 L6.2 9.3 L0.5 7.5 L6.2 5.7 Z"
                  fill="var(--accent)"
                />
              </svg>
            </div>

            {/* Card */}
            <div className="space-y-1.5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="font-body text-sm text-neutral-100 font-medium">
                    {job.title}
                  </p>
                  <p className="font-mono text-xs text-accent">{job.company}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="font-mono text-[10px] text-neutral-500 uppercase tracking-widest">
                    {job.period}
                  </p>
                  <p className="font-mono text-[10px] text-neutral-600 uppercase tracking-widest">
                    {job.location}
                  </p>
                </div>
              </div>

              <p className="font-body text-xs text-neutral-400 leading-relaxed">
                {job.description}
              </p>

              <div className="flex flex-wrap gap-1.5 pt-1">
                {job.tags.map((tag) => (
                  <Badge
                    key={tag}
                    variant="outline"
                    className="border-accent text-accent bg-accent-soft px-2 py-0.5 text-[10px] font-body cursor-default"
                  >
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
