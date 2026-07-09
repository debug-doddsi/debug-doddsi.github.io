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

            {/* Lanyard badge. The float box reserves text-wrap space at
                roughly the card's own footprint (same spot the old static
                portrait sat), while the actual canvas is a much larger
                absolutely positioned overlay (pulled up and widened well past
                that box) so the strap starts near the top of the page and the
                card has plenty of room to swing/drag over the surrounding
                text without ever being clipped by its own canvas edge. */}
            <div className="float-right ml-2 mb-4 w-80 h-80 relative">
              <div className="absolute right-0 -top-[340px] w-[950px] max-w-[90vw] h-[950px] pointer-events-none">
                <Suspense fallback={null}>
                  <Lanyard
                    position={[0, 0, 16]}
                    gravity={[0, -40, 0]}
                    fov={20}
                    transparent
                    frontImage="/stardew.png"
                    imageFit="contain"
                    className="pointer-events-auto"
                  />
                </Suspense>
              </div>
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
