import { useState } from "react";
import { ArrowLeft, BookOpen, Flame } from "lucide-react";
import { FeedingTracker } from "./FeedingTracker";
import { BakingGuide } from "./BakingGuide";

type SouschefView = "home" | "track" | "bake";

export function SourdoughSouschef() {
  const [view, setView] = useState<SouschefView>("home");

  if (view === "track") {
    return (
      <div className="space-y-4">
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

  if (view === "bake") {
    return (
      <div className="space-y-4">
        <button
          onClick={() => setView("home")}
          className="flex items-center gap-1.5 text-sm text-neutral-400 hover:text-neutral-200 transition-colors"
        >
          <ArrowLeft size={14} /> Back
        </button>
        <div className="max-w-lg mx-auto rounded-2xl bg-neutral-900 border border-neutral-800 overflow-hidden shadow-xl">
          <div className="border-b border-neutral-800 px-6 py-4">
            <h2 className="font-display text-lg text-neutral-100">Let's Bake</h2>
            <p className="text-xs text-neutral-500 mt-0.5">
              Enter your starter mass and I'll calculate the recipe
            </p>
          </div>
          <BakingGuide />
        </div>
      </div>
    );
  }

  // home
  return (
    <div className="flex flex-col items-center justify-center gap-8 py-10">
      <div className="text-center space-y-2">
        <h1 className="font-display text-3xl text-neutral-100 tracking-tight">
          Sourdough Souschef
        </h1>
        <p className="text-neutral-400 text-sm">What do you want to do?</p>
      </div>

      <div className="flex gap-4">
        <button
          onClick={() => setView("track")}
          className="group flex flex-col items-center gap-3 px-8 py-6 rounded-2xl bg-neutral-900 border border-neutral-800 hover:border-amber-700/50 hover:bg-amber-950/30 transition-all duration-200 shadow-lg"
        >
          <span className="w-12 h-12 rounded-xl bg-amber-800/20 border border-amber-700/30 flex items-center justify-center group-hover:bg-amber-800/30 transition-colors">
            <BookOpen size={22} className="text-amber-500" />
          </span>
          <span className="text-sm font-semibold text-neutral-200">Track</span>
          <span className="text-[11px] text-neutral-500 text-center max-w-[100px]">
            Log starter feedings
          </span>
        </button>

        <button
          onClick={() => setView("bake")}
          className="group flex flex-col items-center gap-3 px-8 py-6 rounded-2xl bg-neutral-900 border border-neutral-800 hover:border-orange-700/50 hover:bg-orange-950/30 transition-all duration-200 shadow-lg"
        >
          <span className="w-12 h-12 rounded-xl bg-orange-800/20 border border-orange-700/30 flex items-center justify-center group-hover:bg-orange-800/30 transition-colors">
            <Flame size={22} className="text-orange-500" />
          </span>
          <span className="text-sm font-semibold text-neutral-200">Bake</span>
          <span className="text-[11px] text-neutral-500 text-center max-w-[100px]">
            Recipe + timeline
          </span>
        </button>
      </div>
    </div>
  );
}
