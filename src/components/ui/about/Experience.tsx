import { Badge } from "@/components/ui/primitives/badge";

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
    location: "Hybrid, Edinburgh",
    description:
      "Seeking a change in career and a new challenge, I moved into a frontend software engineering role. I develop a range of customer-facing products. I am the Design Authority in my team for the frontend codebase, and I am responsible for ensuring that the code is maintainable, scalable and aesthetically pleasing.",
    tags: [
      "React",
      "TypeScript",
      "Node.js",
      "Tailwind",
      "Vite",
      "TanStack",
      "Figma",
      "Git",
      "Storybook",
      "Colour Theory",
      "UX Design",
      "Componentisation",
      "Documentation",
    ],
  },
  {
    title: "Software Engineer - Embedded",
    period: "Feb 2024 - Apr 2026",
    location: "Onsite, Edinburgh",
    description:
      "After completing my graduate scheme, I was offered a permanent role as a Software Engineer.I worked on a variety of embedded software projects, including developing new features for existing products and creating new products from scratch.",
    tags: [
      "Embedded Software",
      "Teamwork",
      "Agile",
      "C++",
      "CMake",
      "RTOS",
      "I2C",
      "Git",
      "Jenkins",
      "Bitbucket",
      "DAL-C",
      "DAL-D",
    ],
  },
  {
    title: "Graduate Software Engineer",
    period: "Sep 2022 - Feb 2024",
    location: "Onsite, Edinburgh",
    description:
      "I moved into this role after a few months of asking to be involved in coding work as a systems engineer. I was trained practically from the ground up in C++ development.",
    tags: [
      "Embedded Software",
      "Teamwork",
      "Agile",
      "C++",
      "CMake",
      "RTOS",
      "I2C",
      "Git",
      "Jenkins",
      "Bitbucket",
      "DAL-C",
      "DAL-D",
    ],
  },
  {
    title: "Graduate Systems Engineer",
    period: "Jul 2022 - Sep 2022",
    location: "Onsite, Edinburgh",
    description:
      "Fresh out of university, I joined a large company as a Systems Engineer through a Graduate Scheme. It provided me with time and opportunities to adjust to the workplace and learn the ropes of the company, while also providing me with a high-level perspective of the engineering work I was undertaking.",
    tags: [
      "Systems Design",
      "Cameo",
      "UML",
      "Requirements",
      "Model-Based Systems Engineering",
    ],
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
                xmlns="http://www.w3.org/2000/svg" // XML namespace declaration
                className="star-pulse"
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
