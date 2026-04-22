import { useState } from "react";
import { ArrowLeft, BookOpen, Flame } from "lucide-react";
import { FeedingTracker } from "./FeedingTracker";
import { BakingGuide } from "./BakingGuide";
import { BreadShell } from "./BreadShell";

type SouschefView = "home" | "track" | "bake";

const CRUST = "#8a5210";
const CRUST_MID = "#a86b18";

export function SourdoughSouschef() {
  const [view, setView] = useState<SouschefView>("home");

  // ── Track — FeedingTracker manages its own BreadShell internally ──────────
  if (view === "track") {
    return (
      <div className="space-y-3">
        <button
          onClick={() => setView("home")}
          className="flex items-center gap-1.5 text-sm text-neutral-400 hover:text-neutral-200 transition-colors"
        >
          <ArrowLeft size={14} /> Back
        </button>
        <FeedingTracker />
      </div>
    );
  }

  // ── Bake — BreadShell with "Let's Bake" dome, back strip + BakingGuide body
  if (view === "bake") {
    return (
      <BreadShell
        dome={
          <>
            <span className="font-display text-lg" style={{ color: CRUST }}>
              Let's Bake
            </span>
            <span className="text-xs mt-0.5" style={{ color: CRUST_MID }}>
              enter starter mass to begin
            </span>
          </>
        }
      >
        {/* back strip */}
        <div className="flex px-4 py-2 border-b border-amber-200/50">
          <button
            onClick={() => setView("home")}
            className="flex items-center gap-1 text-xs font-semibold text-amber-700 hover:text-amber-500 transition-colors"
          >
            <ArrowLeft size={13} /> Back
          </button>
        </div>
        <BakingGuide />
      </BreadShell>
    );
  }

  // ── Home — BreadShell with title in dome, Track/Bake buttons in body ──────
  return (
    <BreadShell
      dome={
        <>
          <h1 className="font-display text-xl tracking-tight" style={{ color: CRUST }}>
            Sourdough Souschef
          </h1>
          <p className="text-xs mt-1" style={{ color: CRUST_MID }}>
            What do you want to do?
          </p>
        </>
      }
    >
      <div className="flex justify-center gap-5 px-8 py-8">
        {/* Track */}
        <button
          onClick={() => setView("track")}
          className="group flex flex-col items-center gap-3 px-7 py-5 rounded-xl bg-amber-50/70 border-2 border-amber-300/50 hover:border-amber-500/70 hover:bg-amber-100/70 transition-all duration-200 shadow-sm"
        >
          <span className="w-10 h-10 rounded-lg bg-amber-200/60 border border-amber-400/40 flex items-center justify-center group-hover:bg-amber-200/90 transition-colors">
            <BookOpen size={20} style={{ color: CRUST }} />
          </span>
          <span className="text-sm font-bold" style={{ color: CRUST }}>
            Track
          </span>
          <span
            className="text-[11px] text-center max-w-[90px] leading-tight"
            style={{ color: CRUST_MID }}
          >
            Log starter feedings
          </span>
        </button>

        {/* Bake */}
        <button
          onClick={() => setView("bake")}
          className="group flex flex-col items-center gap-3 px-7 py-5 rounded-xl bg-amber-50/70 border-2 border-amber-300/50 hover:border-amber-600/70 hover:bg-amber-100/70 transition-all duration-200 shadow-sm"
        >
          <span className="w-10 h-10 rounded-lg bg-amber-200/60 border border-amber-400/40 flex items-center justify-center group-hover:bg-amber-200/90 transition-colors">
            <Flame size={20} style={{ color: CRUST }} />
          </span>
          <span className="text-sm font-bold" style={{ color: CRUST }}>
            Bake
          </span>
          <span
            className="text-[11px] text-center max-w-[90px] leading-tight"
            style={{ color: CRUST_MID }}
          >
            Recipe + timeline
          </span>
        </button>
      </div>
    </BreadShell>
  );
}
