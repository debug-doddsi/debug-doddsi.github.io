import { useMemo } from "react";
import { Smile } from "lucide-react";
import { PageShell } from "../components/ui/PageShell";
import { Interests } from "../components/ui/about/Interests";
import { Bio } from "../components/ui/about/Bio";
import { StickerPeel } from "../components/ui/StickerPeel";
import { getStickerPosition, setStickerPosition } from "../lib/stickerPositions";
import { placeStickers } from "../lib/stickers";

export function AboutPage() {
  // Computed once per mount (not on every re-render, e.g. pink-mode toggles)
  // so the stickers don't snap back to their default spots. Falls back to
  // each one's last dragged-to position if the page was visited before.
  const stickers = useMemo(() => {
    return placeStickers(window.innerWidth).map((sticker) => ({
      ...sticker,
      initialPosition: getStickerPosition(sticker.id) ?? {
        x: sticker.defaultX,
        y: sticker.defaultY,
      },
    }));
  }, []);

  return (
    <div className="relative">
      {/* Stickers — hidden on mobile, shown at every larger size.
          Bounds span the full viewport so each can be dragged anywhere on the page. */}
      <div className="hidden sm:block top-0 left-0 z-40 fixed w-full h-full pointer-events-none">
        <div className="relative w-full h-full pointer-events-none">
          {stickers.map((sticker) => (
            <StickerPeel
              key={sticker.id}
              imageSrc={sticker.src}
              width={sticker.width}
              rotate={sticker.rotate}
              peelBackHoverPct={25}
              peelBackActivePct={35}
              initialPosition={sticker.initialPosition}
              onPositionChange={(pos) => setStickerPosition(sticker.id, pos)}
              className="pointer-events-auto"
            />
          ))}
        </div>
      </div>

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

            {/* Portrait floated right so text wraps around it */}
            <div className="float-right ml-6 mb-4">
              <div className="border border-accent p-2 rounded-lg bg-accent-soft inline-block">
                <img
                  src="/stardew.png"
                  alt="Iona, in Stardew Valley style"
                  className="h-40 w-auto object-contain rounded"
                  style={{ imageRendering: "pixelated" }}
                />
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
