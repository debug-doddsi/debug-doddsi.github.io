import { useState } from "react";
import { BookOpen, Flame } from "lucide-react";
import { FeedingTracker } from "./FeedingTracker";
import { BakingGuide } from "./BakingGuide";
import { BreadShell } from "./BreadShell";
import { useBakeSession } from "../../hooks/useBakeSession";

type SouschefView = "home" | "track" | "bake";

const CRUST = "#8a5210";
const CRUST_MID = "#a86b18";

export function SourdoughSouschef() {
  const [view, setView] = useState<SouschefView>("home");
  const { session, startBake, toggleStep, completeBake } = useBakeSession();

  // ── Track ─────────────────────────────────────────────────────────────────
  if (view === "track") {
    return (
      <div className="bread-view-enter">
        <FeedingTracker
          onBack={() => setView("home")}
          onGoToBake={() => setView("bake")}
        />
      </div>
    );
  }

  // ── Bake — dome changes once session is active ─────────────────────────────
  if (view === "bake") {
    return (
      <div className="bread-view-enter">
        <BreadShell
          dome={
            session ? (
              <span className="font-display text-lg" style={{ color: CRUST }}>
                Let's Bake!
              </span>
            ) : (
              <span className="font-display text-lg" style={{ color: CRUST }}>
                Let's Bake
              </span>
            )
          }
        >
          <div className="flex px-4 py-2 border-b border-amber-200/50">
            <button
              onClick={() => setView("home")}
              className="flex items-center gap-1 text-xs font-semibold text-amber-700 hover:text-amber-500 transition-colors"
            >
              ← Back
            </button>
          </div>
          <BakingGuide
            session={session}
            startBake={startBake}
            toggleStep={toggleStep}
            completeBake={completeBake}
          />
        </BreadShell>
      </div>
    );
  }

  // ── Home — title in dome (same vertical position as tracker/bake titles) ──
  return (
    <div className="bread-view-enter">
      <BreadShell
        dome={
          <h1 className="font-display text-xl tracking-tight" style={{ color: CRUST }}>
            Sourdough Souschef
          </h1>
        }
      >
        <div className="flex flex-col items-center">
          <p className="text-xs pt-3 pb-1" style={{ color: CRUST_MID }}>
            What do you want to do?
          </p>

          <div className="flex justify-center gap-5 px-8 py-5">
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
              <span className="text-[11px] text-center max-w-[90px] leading-tight" style={{ color: CRUST_MID }}>
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
              <span className="text-[11px] text-center max-w-[90px] leading-tight" style={{ color: CRUST_MID }}>
                Recipe + timeline
              </span>
            </button>
          </div>

          <p className="text-[10px] pb-4" style={{ color: "rgba(168,107,24,0.4)" }}>
            designed with love by iona
          </p>
        </div>
      </BreadShell>
    </div>
  );
}
