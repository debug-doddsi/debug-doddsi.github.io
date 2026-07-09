import { useEffect, useMemo, useState, type RefObject } from "react";
import { StickerPeel } from "../StickerPeel";
import { placeStickers } from "../../../lib/stickers";
import {
  getStickerPositionPct,
  setStickerPositionPct,
} from "../../../lib/stickerPositions";

interface StickerFieldProps {
  containerRef: RefObject<HTMLElement | null>;
}

interface ContainerSize {
  width: number;
  height: number;
}

export function StickerField({ containerRef }: StickerFieldProps) {
  const [size, setSize] = useState<ContainerSize | null>(null);

  // Track the container's actual rendered size (full page content, not just
  // viewport) so stickers can be re-derived from their stored *percentage*
  // position whenever it changes — this is what lets them land in the
  // equivalent spot after a resize instead of staying put in pixel terms.
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const measure = () =>
      setSize({ width: el.offsetWidth, height: el.scrollHeight });

    measure();

    const resizeObserver = new ResizeObserver(measure);
    resizeObserver.observe(el);
    window.addEventListener("resize", measure);

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, [containerRef]);

  const placements = useMemo(() => {
    if (!size || size.width === 0) return [];

    return placeStickers(size.width, size.height).map((sticker) => {
      const storedPct = getStickerPositionPct(sticker.id);
      const xPct = storedPct?.xPct ?? sticker.defaultX / size.width;
      const yPct = storedPct?.yPct ?? sticker.defaultY / size.height;
      return {
        ...sticker,
        position: { x: xPct * size.width, y: yPct * size.height },
      };
    });
  }, [size]);

  if (!size) return null;

  return (
    <div className="hidden sm:block absolute inset-0 z-40 pointer-events-none">
      <div className="relative w-full h-full pointer-events-none">
        {placements.map((sticker) => (
          <StickerPeel
            key={sticker.id}
            imageSrc={sticker.src}
            width={sticker.width}
            rotate={sticker.rotate}
            peelBackHoverPct={25}
            peelBackActivePct={35}
            initialPosition={sticker.position}
            onPositionChange={(pos) => {
              if (!size) return;
              setStickerPositionPct(sticker.id, {
                xPct: pos.x / size.width,
                yPct: pos.y / size.height,
              });
            }}
            className="pointer-events-auto"
          />
        ))}
      </div>
    </div>
  );
}
