import {
  ProfessionalTimeline,
  type TimelineItemData,
} from "../ui/timeline";

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

const TIMELINE_ITEMS: TimelineItemData[] = JOBS.map((job, index) => ({
  id: `job-${index}`,
  title: job.title,
  type: job.location,
  duration: job.period,
  responsibilities: [job.description],
  skills: job.tags,
}));

export function Experience() {
  return (
    <ProfessionalTimeline items={TIMELINE_ITEMS} defaultExpandedIds={[]} />
  );
}
