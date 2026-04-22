import { useState } from "react";

export interface BakeStep {
  id: string;
  label: string;
  note: string;
  done: boolean;
  timerMinutes?: number;
}

export interface BakeSession {
  starterMass: number;
  flourMass: number;
  waterMass: number;
  saltMass: number;
  steps: BakeStep[];
  startedAt: string;
}

const STORAGE_KEY = "sourdough-bake-session";

function buildSteps(): BakeStep[] {
  const steps: Array<{ label: string; note: string; timerMinutes?: number }> = [
    { label: "Autolyse", note: "Mix flour + water, rest 45 min", timerMinutes: 45 },
    { label: "Add starter + salt", note: "Mix thoroughly until fully incorporated" },
    { label: "Stretch & fold — set 1", note: "30 min after mixing", timerMinutes: 30 },
    { label: "Stretch & fold — set 2", note: "30 min later", timerMinutes: 30 },
    { label: "Stretch & fold — set 3", note: "30 min later", timerMinutes: 30 },
    { label: "Stretch & fold — set 4", note: "30 min later", timerMinutes: 30 },
    { label: "Bulk fermentation", note: "Rest until dough has doubled, ~3–4 h" },
    { label: "Pre-shape & bench rest", note: "Shape loosely, rest 20 min", timerMinutes: 20 },
    { label: "Final shape", note: "Shape tightly into a boule or batard" },
    { label: "Proof", note: "Cold proof overnight 8–16 h, or warm proof 2–3 h" },
    { label: "Preheat oven", note: "250 °C / 480 °F with Dutch oven inside, 30–45 min", timerMinutes: 40 },
    { label: "Score & bake covered", note: "20 min at 250 °C with lid on", timerMinutes: 20 },
    { label: "Bake uncovered", note: "20–25 min at 230 °C until deep golden", timerMinutes: 22 },
    { label: "Cool on rack", note: "At least 1 h before slicing", timerMinutes: 60 },
  ];
  return steps.map((s, i) => ({
    id: String(i + 1),
    label: s.label,
    note: s.note,
    done: false,
    ...(s.timerMinutes !== undefined ? { timerMinutes: s.timerMinutes } : {}),
  }));
}

function calcRecipe(starterMass: number) {
  const flourMass = Math.round(starterMass * 4);
  const waterMass = Math.round(flourMass * 0.72);
  const saltMass = Math.round(flourMass * 0.02);
  return { flourMass, waterMass, saltMass };
}

function load(): BakeSession | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as BakeSession) : null;
  } catch {
    return null;
  }
}

function save(session: BakeSession) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
}

export function useBakeSession() {
  const [session, setSession] = useState<BakeSession | null>(() => load());

  const startBake = (starterMass: number) => {
    const { flourMass, waterMass, saltMass } = calcRecipe(starterMass);
    const newSession: BakeSession = {
      starterMass,
      flourMass,
      waterMass,
      saltMass,
      steps: buildSteps(),
      startedAt: new Date().toISOString(),
    };
    save(newSession);
    setSession(newSession);
  };

  const toggleStep = (stepId: string) => {
    if (!session) return;
    const updated: BakeSession = {
      ...session,
      steps: session.steps.map((s) =>
        s.id === stepId ? { ...s, done: !s.done } : s
      ),
    };
    save(updated);
    setSession(updated);
  };

  const completeBake = () => {
    localStorage.removeItem(STORAGE_KEY);
    setSession(null);
  };

  return { session, startBake, toggleStep, completeBake };
}
