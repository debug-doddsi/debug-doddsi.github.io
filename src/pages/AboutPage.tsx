import { lazy, Suspense, useRef } from "react";
import { Smile } from "lucide-react";
import { PageShell } from "../components/ui/PageShell";
import { Interests } from "../components/ui/about/Interests";
import { Bio } from "../components/ui/about/Bio";
import { StickerField } from "../components/ui/about/StickerField";

// Lazy-loaded: three.js + rapier physics + drei pull in several MB, and
// only the About page needs them — keeps that weight off every other page.
const Lanyard = lazy(() => import("../components/ui/Lanyard"));

export function AboutPage() {
  const rootRef = useRef<HTMLDivElement>(null);

  return (
    <div className="relative" ref={rootRef}>
      {/* Stickers — hidden on mobile, shown at every larger size. Positioned
          relative to this full-page container (not the viewport) so they're
          distributed down the whole page and scroll with the content. */}
      <StickerField containerRef={rootRef} />

      <PageShell
        title="Hello, I'm Iona."
        subtitle="I'm a Software Engineer from Scotland. Welcome to my website!"
        icon={<Smile size={28} />}
      >
        <div className="space-y-8">
          <div>
            <h2 className="font-display text-xl text-neutral-100 mb-4">
              About Me
            </h2>

            {/* Lanyard badge, floated right so text wraps around it. Taller
                than the badge itself so there's a gap above for the lanyard
                strap to hang through without covering the text below — the
                card settles near the bottom of this box, roughly where the
                old static portrait sat. */}
            <div className="float-right ml-2 mb-4 w-56 h-80 relative">
              <Suspense fallback={null}>
                <Lanyard
                  position={[0, 0, 36]}
                  gravity={[0, -40, 0]}
                  fov={20}
                  transparent
                  frontImage="/stardew.png"
                  imageFit="contain"
                />
              </Suspense>
            </div>

            <Bio />

            {/* Clear the float so subsequent sections sit below */}
            <div className="clear-both" />
          </div>

          <div>
            <h2 className="font-display text-xl text-neutral-100 mb-4">
              Interests
            </h2>
            <Interests />
          </div>
        </div>
      </PageShell>
    </div>
  );
}
