import { ChefHat } from "lucide-react";
import { PageShell } from "../components/ui/PageShell";
import { SourdoughSouschef } from "../components/ui/SourdoughSouschef";

export function KitchenPage() {
  return (
    <PageShell
      icon={<ChefHat size={22} />}
      title="Kitchen"
      subtitle="sourdough tracker & baking guide"
    >
      <SourdoughSouschef />
    </PageShell>
  );
}
