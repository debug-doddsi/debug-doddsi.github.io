import { useState } from "react";
import { Check, PartyPopper } from "lucide-react";
import { type BakeSession } from "../../hooks/useBakeSession";

interface BakingGuideProps {
  session: BakeSession | null;
  startBake: (starterMass: number) => void;
  toggleStep: (stepId: string) => void;
  completeBake: () => void;
}

export function BakingGuide({ session, startBake, toggleStep, completeBake }: BakingGuideProps) {
  const [starterInput, setStarterInput] = useState("");
  const [inputError, setInputError] = useState("");
  const [confirmStop, setConfirmStop] = useState(false);

  const handleStart = () => {
    const n = Number(starterInput);
    if (!n || n <= 0) {
      setInputError("Please enter a starter mass greater than 0");
      return;
    }
    setInputError("");
    startBake(n);
  };

  const allDone = session?.steps.every((s) => s.done) ?? false;

  if (!session) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-5 px-6 py-10">
        <p className="text-sm font-medium text-amber-900 text-center">
          How much starter do you want to use?
        </p>
        <div className="flex items-center gap-2">
          <input
            type="number"
            min={1}
            value={starterInput}
            onChange={(e) => setStarterInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleStart()}
            placeholder="e.g. 100"
            className="bread-input w-28 text-center"
          />
          <span className="text-sm text-amber-800">g</span>
        </div>
        {inputError && (
          <p className="text-xs text-red-600">{inputError}</p>
        )}
        <button
          onClick={handleStart}
          className="px-6 py-2.5 rounded-xl bg-amber-700 hover:bg-amber-800 text-white text-sm font-semibold transition-colors shadow-sm"
        >
          Start Bake
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3 py-3 px-4">
      {/* recipe card */}
      <div className="rounded-xl bg-amber-100/60 border border-amber-200/60 p-3">
        <p className="text-[10px] font-semibold uppercase tracking-widest text-amber-700/60 mb-2">
          Recipe
        </p>
        <div className="grid grid-cols-4 gap-2 text-center">
          {[
            { label: "Starter", value: session.starterMass },
            { label: "Flour", value: session.flourMass },
            { label: "Water", value: session.waterMass },
            { label: "Salt", value: session.saltMass },
          ].map(({ label, value }) => (
            <div key={label}>
              <p className="text-[9px] font-semibold uppercase tracking-widest text-amber-700/60">
                {label}
              </p>
              <p className="text-base font-bold text-neutral-800">{value}g</p>
            </div>
          ))}
        </div>
        <p className="mt-2 text-[10px] text-amber-700/50 text-center">
          Started {new Date(session.startedAt).toLocaleString("en-GB")}
        </p>
      </div>

      {/* checklist */}
      <div className="flex flex-col gap-1">
        {session.steps.map((step, i) => (
          <button
            key={step.id}
            onClick={() => toggleStep(step.id)}
            className={`flex items-start gap-3 px-3 py-2 rounded-lg text-left transition-colors ${
              step.done
                ? "bg-amber-200/50 border border-amber-300/50"
                : "bg-amber-50/60 border border-amber-200/40 hover:border-amber-300"
            }`}
          >
            <span
              className={`mt-0.5 shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
                step.done
                  ? "bg-amber-600 border-amber-600"
                  : "border-amber-400/60"
              }`}
            >
              {step.done && <Check size={11} className="text-white" />}
            </span>
            <div className="flex-1 min-w-0">
              <p
                className={`text-sm font-medium ${
                  step.done ? "line-through text-neutral-400" : "text-neutral-800"
                }`}
              >
                <span className="text-amber-700 mr-1">{i + 1}.</span>
                {step.label}
              </p>
              <p className="text-[10px] text-amber-700/60 mt-0.5">{step.note}</p>
            </div>
          </button>
        ))}
      </div>

      {/* completion */}
      {allDone && (
        <div className="flex flex-col items-center gap-3 bg-amber-100/80 border border-amber-400/50 rounded-xl px-5 py-4 text-center">
          <PartyPopper size={24} className="text-amber-700" />
          <p className="text-sm font-semibold text-neutral-800">
            Bake complete! Let it cool.
          </p>
          <p className="text-xs text-amber-800/70">
            Resist the urge to slice for at least an hour — the crumb is still setting!
          </p>
          <button
            onClick={completeBake}
            className="mt-1 px-5 py-2 rounded-lg bg-amber-700 hover:bg-amber-800 text-white text-xs font-semibold transition-colors"
          >
            Complete Bake
          </button>
        </div>
      )}

      {/* stop bake */}
      {!allDone && (
        <div className="pt-1 pb-2">
          {!confirmStop ? (
            <button
              onClick={() => setConfirmStop(true)}
              className="w-full py-2 rounded-lg border border-amber-300/60 text-amber-800/70 hover:border-amber-400 hover:text-amber-900 text-xs font-medium transition-colors"
            >
              Stop Bake
            </button>
          ) : (
            <div className="flex flex-col items-center gap-2 rounded-lg border border-red-200 bg-red-50/50 px-4 py-3">
              <p className="text-xs font-semibold text-red-700">
                Are you sure? This will discard the current bake.
              </p>
              <div className="flex gap-2">
                <button
                  onClick={completeBake}
                  className="px-4 py-1.5 rounded-md bg-red-500 hover:bg-red-600 text-white text-xs font-semibold transition-colors"
                >
                  Yes, stop
                </button>
                <button
                  onClick={() => setConfirmStop(false)}
                  className="px-4 py-1.5 rounded-md border border-neutral-300 text-neutral-700 hover:bg-neutral-50 text-xs font-semibold transition-colors"
                >
                  Keep going
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
