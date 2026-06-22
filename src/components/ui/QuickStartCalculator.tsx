import { useState } from "react";

const CRUST = "#8a5210";
const CRUST_MID = "#a86b18";

function calcFromStarter(starterMass: number) {
  const flourMass = Math.round(starterMass * 4);
  const waterMass = Math.round(flourMass * 0.72);
  const saltMass = Math.round(flourMass * 0.02);
  const totalMass = starterMass + flourMass + waterMass + saltMass;
  return { flourMass, waterMass, saltMass, totalMass };
}

export function QuickStartCalculator() {
  const [starterInput, setStarterInput] = useState("");
  const starterMass = Number(starterInput) || 0;
  const { flourMass, waterMass, saltMass, totalMass } = calcFromStarter(starterMass);

  const rows: { label: string; value: number; highlight?: boolean }[] = [
    { label: "Starter (g)", value: starterMass, highlight: true },
    { label: "Water (g)", value: waterMass },
    { label: "Flour (g)", value: flourMass },
    { label: "Salt (g)", value: saltMass },
    { label: "Total Mass (g)", value: totalMass },
  ];

  return (
    <div className="flex flex-col gap-4 py-4 px-5">
      <p className="text-xs text-center" style={{ color: CRUST_MID }}>
        Enter how much starter you have — everything else is worked out for you.
      </p>

      <div className="rounded-xl border border-amber-300/60 overflow-hidden">
        {rows.map((row) => (
          <div
            key={row.label}
            className={`flex items-center justify-between px-4 py-3 border-b border-amber-200/40 last:border-b-0 ${
              row.highlight ? "bg-amber-200/50" : "bg-amber-50/50"
            }`}
          >
            <span
              className={`text-sm ${row.highlight ? "font-bold" : "font-medium"}`}
              style={{ color: CRUST }}
            >
              {row.label}
            </span>
            {row.highlight ? (
              <input
                type="number"
                min={0}
                value={starterInput}
                onChange={(e) => setStarterInput(e.target.value)}
                placeholder="0"
                autoFocus
                className="w-20 rounded-lg border-2 border-amber-500/60 bg-white px-2 py-1 text-sm text-right font-bold focus:outline-none focus:ring-2 focus:ring-amber-400/50"
                style={{ color: CRUST }}
              />
            ) : (
              <span className="text-sm font-semibold" style={{ color: CRUST }}>
                {starterMass > 0 ? row.value : "—"}
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
