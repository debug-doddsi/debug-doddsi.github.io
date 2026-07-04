import { useState } from "react";

const CRUST = "#8a5210";
const CRUST_MID = "#a86b18";

const RATIOS = {
  water: 0.75, // 75% hydration relative to flour
  salt: 0.02, // 2% of flour weight
};

// Starter = 20% of flour weight, so flour = starter / 0.20
function calculate(starter: number) {
  const flour = starter / 0.2;
  const water = flour * RATIOS.water;
  const salt = flour * RATIOS.salt;
  const total = starter + flour + water + salt;
  return { flour, water, salt, total };
}

function fmt(n: number): string {
  return isNaN(n) || n === 0 ? "—" : String(Math.round(n));
}

export function QuickStartCalculator() {
  const [starterInput, setStarterInput] = useState("");
  const starterMass = Number(starterInput) || 0;
  const { flour, water, salt, total } = calculate(starterMass);

  const rows: { label: string; value?: string; highlight?: boolean }[] = [
    { label: "Starter (g)", highlight: true },
    { label: "Water (g)", value: fmt(water) },
    { label: "Flour (g)", value: fmt(flour) },
    { label: "Salt (g)", value: fmt(salt) },
    { label: "Total Mass (g)", value: fmt(total) },
  ];

  const ratioKey = [
    { label: "Hydration", val: "75%" },
    { label: "Starter", val: "20% of flour" },
    { label: "Salt", val: "2% of flour" },
  ];

  return (
    <div className="flex flex-col gap-4 py-4 px-5">
      <p className="text-xs text-center" style={{ color: CRUST_MID }}>
        Enter how much starter you have, everything else is worked out for you.
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
                {row.value}
              </span>
            )}
          </div>
        ))}

        {/* Ratio key */}
        <div className="flex flex-wrap justify-center gap-x-4 gap-y-1 px-3 py-2.5 bg-amber-50/80 border-t border-amber-200/40">
          {ratioKey.map(({ label, val }) => (
            <span key={label} className="text-[11px]" style={{ color: CRUST_MID }}>
              <span className="font-bold" style={{ color: CRUST }}>
                {label}:
              </span>{" "}
              {val}
            </span>
          ))}
        </div>
      </div>

      <p className="text-[10px] text-center px-2" style={{ color: "rgba(168,107,24,0.55)" }}>
        Based on a classic sourdough formula. Adjust hydration to taste, wetter doughs yield a more open crumb.
      </p>
    </div>
  );
}
