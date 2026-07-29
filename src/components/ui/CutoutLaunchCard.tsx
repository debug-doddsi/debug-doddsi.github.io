import type { ReactNode } from "react";
import { ArrowRight } from "lucide-react";
import { motion } from "motion/react";
import {
  CutoutCard,
  CutoutCardMedia,
  CutoutCardOverlay,
  CutoutCardInsetLabel,
  CutoutCardPin,
  CutoutCardContent,
  CutoutCorner,
  CutoutCardAction,
  useCutoutContentStaggerVariants,
} from "./cutout-card";

interface CutoutLaunchCardProps {
  icon: ReactNode;
  title: string;
  subtitle: string;
  description: string;
  placeholder: ReactNode;
  ctaLabel?: string;
  onLaunch: () => void;
}

// Shared "launch tile" for both the My Apps grid and the Case Studies grid,
// built on cult-ui's CutoutCard: a bottom-left inset label and a top-right
// icon pin, each stitched into the media with concave CutoutCorner accents
// (coloured to match whatever they sit on) instead of a plain rectangle
// photo, plus a hover-reveal CTA floating over the card corner.
export function CutoutLaunchCard({
  icon,
  title,
  subtitle,
  description,
  placeholder,
  ctaLabel = "Open",
  onLaunch,
}: CutoutLaunchCardProps) {
  const stagger = useCutoutContentStaggerVariants();

  return (
    <CutoutCard
      onClick={onLaunch}
      className="group/cutout relative w-72 overflow-hidden rounded-[28px] border border-[#faf3e4]/70 bg-[#faf3e4]/60 backdrop-blur-md shadow-[0_8px_30px_rgba(0,0,0,0.06)] hover:shadow-[0_14px_40px_rgba(0,0,0,0.08)] transition-shadow duration-300"
    >
      <CutoutCardMedia className="h-52 w-full">
        {placeholder}
        <CutoutCardOverlay className="from-[#241914]/30" />

        {/* Bottom-left tag, cut into the media with two corner accents
            coloured as the card surface it's flush with. */}
        <CutoutCardInsetLabel className="bottom-0 left-0 rounded-tr-[20px] bg-[#faf3e4] px-4 py-2">
          <span className="font-mono text-[9px] text-neutral-500 uppercase tracking-widest">
            {subtitle}
          </span>
          <CutoutCorner
            size={24}
            className="absolute -right-[23px] -bottom-px rotate-90 text-[#faf3e4]"
          />
          <CutoutCorner
            size={24}
            className="absolute -top-[23px] -left-px rotate-90 text-[#faf3e4]"
          />
        </CutoutCardInsetLabel>

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

      <motion.div
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.4 }}
        variants={stagger.container}
      >
        <CutoutCardContent className="flex flex-col gap-2 p-5 pb-14">
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
        </CutoutCardContent>
      </motion.div>

      <CutoutCardAction className="right-5 bottom-5">
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onLaunch();
          }}
          className="flex items-center gap-1.5 rounded-full bg-accent px-4 py-2 font-body text-xs font-medium text-white shadow-md transition-transform duration-150 active:scale-[0.97]"
        >
          {ctaLabel} <ArrowRight size={12} />
        </button>
      </CutoutCardAction>
    </CutoutCard>
  );
}
