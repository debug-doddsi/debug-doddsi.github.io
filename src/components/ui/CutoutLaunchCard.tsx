import type { ReactNode } from "react";
import { ArrowRight, ExternalLink } from "lucide-react";
import { motion } from "motion/react";
import {
  CutoutCard,
  CutoutCardMedia,
  CutoutCardOverlay,
  CutoutCardContent,
} from "./cutout-card";
import { useCutoutContentStaggerVariants } from "./cutout-card-shared";
import type { ProjectTag } from "../../types";
import { PROJECT_TAG_LABELS } from "../../types";

interface CutoutLaunchCardProps {
  title: string;
  description: string;
  placeholder: ReactNode;
  /** Professional / fun labels shown on the card and used for filtering. */
  tags: ProjectTag[];
  /** Primary CTA - the case study writeup. */
  ctaLabel?: string;
  onLaunch: () => void;
  /** Secondary CTA - the live app/site itself. Provide either a click
   *  handler (in-app navigation) or an href (external link). */
  secondaryLabel: string;
  onSecondaryLaunch?: () => void;
  secondaryHref?: string;
}

// Shared "launch tile" for the Projects grid, built on cult-ui's CutoutCard,
// with a pair of always-visible CTAs (case study + live app/site) so they're
// reachable without hover on touch devices.
export function CutoutLaunchCard({
  title,
  description,
  placeholder,
  tags,
  ctaLabel = "View Case Study",
  onLaunch,
  secondaryLabel,
  onSecondaryLaunch,
  secondaryHref,
}: CutoutLaunchCardProps) {
  const stagger = useCutoutContentStaggerVariants();

  return (
    <CutoutCard className="group/cutout relative flex h-[28rem] w-72 flex-col overflow-hidden rounded-[28px] border border-[#faf3e4]/70 bg-[#faf3e4]/60 backdrop-blur-md shadow-[0_8px_30px_rgba(0,0,0,0.06)] hover:shadow-[0_14px_40px_rgba(0,0,0,0.08)] transition-shadow duration-300">
      <button
        type="button"
        onClick={onLaunch}
        className="block w-full text-left"
      >
        <CutoutCardMedia className="h-52 w-full">
          {placeholder}
          <CutoutCardOverlay className="from-[#241914]/30" />
        </CutoutCardMedia>
      </button>

      <motion.div
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.4 }}
        variants={stagger.container}
        className="flex flex-1 flex-col"
      >
        <CutoutCardContent className="flex flex-1 flex-col gap-2 p-5">
          <motion.h2
            variants={stagger.item}
            className="font-display text-neutral-100 text-lg leading-snug"
          >
            {title}
          </motion.h2>
          <motion.div
            variants={stagger.item}
            className="flex flex-wrap gap-1.5"
          >
            {tags.map((tag) => (
              <span
                key={tag}
                className="rounded-full bg-accent-soft px-2 py-0.5 font-mono text-[10px] uppercase tracking-widest text-accent"
              >
                {PROJECT_TAG_LABELS[tag]}
              </span>
            ))}
          </motion.div>
          <motion.p
            variants={stagger.item}
            className="font-body text-xs text-neutral-400 leading-relaxed"
          >
            {description}
          </motion.p>

          <motion.div
            variants={stagger.item}
            className="mt-auto flex flex-wrap gap-2 pt-3"
          >
            <button
              type="button"
              onClick={onLaunch}
              className="flex items-center gap-1.5 rounded-full bg-accent px-4 py-2 font-body text-xs font-medium text-white shadow-md transition-transform duration-150 hover:-translate-y-0.5"
            >
              {ctaLabel} <ArrowRight size={12} />
            </button>

            {secondaryHref ? (
              <a
                href={secondaryHref}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 rounded-full bg-accent px-4 py-2 font-body text-xs font-medium text-white shadow-md transition-transform duration-150 hover:-translate-y-0.5"
              >
                {secondaryLabel} <ExternalLink size={12} />
              </a>
            ) : (
              <button
                type="button"
                onClick={onSecondaryLaunch}
                className="flex items-center gap-1.5 rounded-full bg-accent px-4 py-2 font-body text-xs font-medium text-white shadow-md transition-transform duration-150 hover:-translate-y-0.5"
              >
                {secondaryLabel} <ArrowRight size={12} />
              </button>
            )}
          </motion.div>
        </CutoutCardContent>
      </motion.div>
    </CutoutCard>
  );
}
