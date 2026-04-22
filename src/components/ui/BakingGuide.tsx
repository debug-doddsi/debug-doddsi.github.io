import { useState } from "react";
import { Check, PartyPopper } from "lucide-react";
import { useBakeSession } from "../../hooks/useBakeSession";

export function BakingGuide() {
  const { session, startBake, toggleStep, completeBake } = useBakeSession();
  const [starterInput, setStarterInput] = useState("");
  const [inputError, setInputError] = useState("");

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
      <div className="flex flex-col items-center justify-center py-10 px-6 gap-5">
        <p className="text-sm font-medium text-neutral-700 text-center">
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
            className="w-28 rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-800 focus:outline-none focus:ring-2 focus:ring-amber-400/50 text-center"
          />
          <span className="text-sm text-neutral-500">g</span>
        </div>
        {inputError && (
          <p className="text-xs text-red-500">{inputError}</p>
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
    <div className="flex flex-col gap-4 py-4 px-5">
      {/* recipe card */}
      <div className="rounded-xl bg-amber-50 border border-amber-200/60 p-4">
        <p className="text-[10px] font-semibold uppercase tracking-widest text-amber-700/60 mb-3">
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
        <p className="mt-3 text-[10px] text-neutral-500 text-center">
          Started {new Date(session.startedAt).toLocaleString("en-GB")}
        </p>
      </div>

      {/* checklist */}
      <div className="flex flex-col gap-1 overflow-y-auto max-h-72">
        {session.steps.map((step, i) => (
          <button
            key={step.id}
            onClick={() => toggleStep(step.id)}
            className={`flex items-start gap-3 px-3 py-2.5 rounded-lg text-left transition-colors ${
              step.done
                ? "bg-amber-100/60 border border-amber-200/50"
                : "bg-white/60 border border-neutral-200/60 hover:border-amber-200"
            }`}
          >
            <span
              className={`mt-0.5 shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
                step.done
                  ? "bg-amber-600 border-amber-600"
                  : "border-neutral-300"
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
              <p className="text-[10px] text-neutral-500 mt-0.5">{step.note}</p>
            </div>
          </button>
        ))}
      </div>

      {/* completion */}
      {allDone && (
        <div className="flex flex-col items-center gap-3 bg-amber-50 border border-amber-300/60 rounded-xl px-5 py-4 text-center">
          <PartyPopper size={24} className="text-amber-600" />
          <p className="text-sm font-semibold text-neutral-800">
            Bake complete! Let it cool.
          </p>
          <p className="text-xs text-neutral-500">
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
    </div>
  );
}
