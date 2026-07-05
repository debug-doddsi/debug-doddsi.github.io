import { ChefHat, ArrowLeft } from "lucide-react";
import { PageShell } from "../components/ui/PageShell";
import { SourdoughSouschef } from "../components/ui/kitchen/SourdoughSouschef";

interface KitchenPageProps {
  onBack: () => void;
}

export function KitchenPage({ onBack }: KitchenPageProps) {
  return (
    <div className="flex flex-col gap-6">
      <button
        onClick={onBack}
        className="flex items-center gap-1.5 self-start font-body text-xs text-neutral-500 hover:text-accent transition-colors duration-150"
      >
        <ArrowLeft size={13} /> Back to My Apps
      </button>
      <PageShell icon={<ChefHat size={22} />} title="Kitchen" subtitle="sourdough tracker & baking guide">
        <SourdoughSouschef />
      </PageShell>
    </div>
  );
}
