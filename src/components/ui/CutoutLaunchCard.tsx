import type { ReactNode } from "react";
import { ArrowRight, ExternalLink } from "lucide-react";
import { motion } from "motion/react";
import {
  CutoutCard,
  CutoutCardMedia,
  CutoutCardOverlay,
  CutoutCardPin,
  CutoutCardContent,
  CutoutCorner,
} from "./cutout-card";
import { useCutoutContentStaggerVariants } from "./cutout-card-shared";

interface CutoutLaunchCardProps {
  icon: ReactNode;
  title: string;
  description: string;
  placeholder: ReactNode;
  /** Primary CTA - the case study writeup. */
  ctaLabel?: string;
  onLaunch: () => void;
  /** Secondary CTA - the live app/site itself. Provide either a click
   *  handler (in-app navigation) or an href (external link). */
  secondaryLabel: string;
  onSecondaryLaunch?: () => void;
  secondaryHref?: string;
}

// Shared "launch tile" for the Projects grid, built on cult-ui's CutoutCard:
// a top-right icon pin stitched into the media with concave CutoutCorner
// accents (coloured to match whatever it sits on) instead of a plain
// rectangle photo, plus a pair of always-visible CTAs (case study + live
// app/site) so they're reachable without hover on touch devices.
export function CutoutLaunchCard({
  icon,
  title,
  description,
  placeholder,
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

          {/* Top-right icon pin, coloured as itself so the corner accents
              extend its own silhouette into the media rather than cutting
              into it. */}
          <CutoutCardPin className="top-0 right-0 flex h-11 w-11 items-center justify-center rounded-bl-[16px] bg-accent text-white shadow-md">
            {icon}
            <CutoutCorner
              size={20}
              className="absolute top-0 -left-[19px] -rotate-90 text-accent"
            />
            <CutoutCorner
              size={20}
              className="absolute right-0 -bottom-[19px] -rotate-90 text-accent"
            />
          </CutoutCardPin>
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
