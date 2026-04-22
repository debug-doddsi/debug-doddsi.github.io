import { ChefHat } from "lucide-react";
import { SourdoughSouschef } from "../components/ui/SourdoughSouschef";

const CRUST = "#8a5210";

export function KitchenPage() {
  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-10">
        <div className="opacity-80 mb-3" style={{ color: CRUST }}>
          <ChefHat size={22} />
        </div>
        <h1 className="font-display text-neutral-100 text-4xl tracking-tight">
          Kitchen
        </h1>
        <p className="mt-2 font-mono text-neutral-500 text-xs leading-relaxed">
          sourdough tracker & baking guide
        </p>
        <div
          className="mt-4 w-24 h-px"
          style={{ background: `linear-gradient(to right, ${CRUST}, transparent)` }}
        />
      </div>
      <SourdoughSouschef />
    </div>
  );
}
