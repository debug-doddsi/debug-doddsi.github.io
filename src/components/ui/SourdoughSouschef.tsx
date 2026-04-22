import { useState } from "react";
import { ArrowLeft, BookOpen, Flame } from "lucide-react";
import { FeedingTracker } from "./FeedingTracker";
import { BakingGuide } from "./BakingGuide";

type SouschefView = "home" | "track" | "bake";

// Crust brown used throughout so Track/Bake labels are legible on cream bread
const CRUST_BROWN = "#8a5210";

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

  // ── home ── bread slice with title in dome, buttons in body ──────────────
  return (
    <div className="relative w-full max-w-lg mx-auto pt-10">
      {/* steam wisps */}
      <div className="absolute left-1/2 -translate-x-1/2 top-0 w-16 flex justify-around pointer-events-none">
        <span className="steam-wisp" style={{ animationDelay: "0s" }} />
        <span className="steam-wisp" style={{ animationDelay: "0.7s" }} />
        <span className="steam-wisp" style={{ animationDelay: "1.4s" }} />
      </div>

      <div className="bread-crust">
        <div className="bread-inner">
          {/* dome — title centred in the curved crown */}
          <div className="bread-dome">
            <h1
              className="font-display text-xl tracking-tight"
              style={{ color: CRUST_BROWN }}
            >
              Sourdough Souschef
            </h1>
            <p className="text-xs mt-1" style={{ color: "#a86b18" }}>
              What do you want to do?
            </p>
          </div>

          {/* body — buttons in the straight rectangular section */}
          <div className="flex justify-center gap-5 px-8 py-6">
            {/* Track */}
            <button
              onClick={() => setView("track")}
              className="group flex flex-col items-center gap-3 px-7 py-5 rounded-xl bg-amber-50/70 border-2 border-amber-300/50 hover:border-amber-500/70 hover:bg-amber-100/70 transition-all duration-200 shadow-sm"
            >
              <span className="w-10 h-10 rounded-lg bg-amber-200/60 border border-amber-400/40 flex items-center justify-center group-hover:bg-amber-200/90 transition-colors">
                <BookOpen size={20} style={{ color: CRUST_BROWN }} />
              </span>
              <span
                className="text-sm font-bold"
                style={{ color: CRUST_BROWN }}
              >
                Track
              </span>
              <span
                className="text-[11px] text-center max-w-[90px] leading-tight"
                style={{ color: "#a86b18" }}
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
                <Flame size={20} style={{ color: CRUST_BROWN }} />
              </span>
              <span
                className="text-sm font-bold"
                style={{ color: CRUST_BROWN }}
              >
                Bake
              </span>
              <span
                className="text-[11px] text-center max-w-[90px] leading-tight"
                style={{ color: "#a86b18" }}
              >
                Recipe + timeline
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
