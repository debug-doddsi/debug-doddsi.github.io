export interface StickerDef {
  id: string;
  src: string;
  width: number;
  rotate: number;
}

// Add new stickers here as they're dropped into public/stickers.
// Sides are assigned automatically below (alternating right/left) so the
// set stays balanced — an odd count is fine, it just leaves one side with
// one extra sticker.
export const STICKERS: StickerDef[] = [
  { id: "sylv-family", src: "/stickers/sylv_family.png", width: 160, rotate: 20 },
  {
    id: "sonny-angel-strawberry",
    src: "/stickers/sonny_angel_strawberry.png",
    width: 150,
    rotate: 12,
  },
  { id: "muji-pen", src: "/stickers/muji_pen.png", width: 190, rotate: -8 },
  { id: "tenner", src: "/stickers/tenner.png", width: 170, rotate: 10 },
  { id: "receipt", src: "/stickers/receipt.png", width: 150, rotate: -12 },
  { id: "lipbalm", src: "/stickers/lipbalm.png", width: 130, rotate: 18 },
];

export type StickerSide = "left" | "right";

export interface PlacedSticker extends StickerDef {
  side: StickerSide;
  defaultX: number;
  defaultY: number;
}

const EDGE_MARGIN = 24;
// How far into the page each side's placement zone can wander horizontally —
// keeps things away from the centered text column while still feeling loose.
const HORIZONTAL_JITTER = 60;
// Clears the fixed topbar (~67px tall) with room to spare, even at the
// largest possible upward jitter.
const TOP_MARGIN = 130;
// Vertical room given to each sticker's "slot" before jitter is applied.
const VERTICAL_SLOT = 260;
// Minimum gap enforced between two stickers' bounding boxes so defaults
// never touch, even after random placement.
const MIN_GAP = 28;
const MAX_PLACEMENT_ATTEMPTS = 60;

// Deterministic PRNG (mulberry32) seeded from the sticker id, so "random"
// placement is stable across re-renders/remounts (tab switches, pink-mode
// toggles) instead of reshuffling every time — a real drag still overrides
// it via the position store.
function hashStringToSeed(str: string): number {
  let h = 1779033703 ^ str.length;
  for (let i = 0; i < str.length; i++) {
    h = Math.imul(h ^ str.charCodeAt(i), 3432918353);
    h = (h << 13) | (h >>> 19);
  }
  return h >>> 0;
}

function mulberry32(seed: number) {
  let state = seed;
  return function random() {
    state = (state + 0x6d2b79f5) | 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

interface Box {
  x: number;
  y: number;
  size: number;
}

function boxesOverlap(a: Box, b: Box, margin: number): boolean {
  return !(
    a.x + a.size + margin <= b.x ||
    b.x + b.size + margin <= a.x ||
    a.y + a.size + margin <= b.y ||
    b.y + b.size + margin <= a.y
  );
}

export function placeStickers(viewportWidth: number): PlacedSticker[] {
  const slotsUsed: Record<StickerSide, number> = { left: 0, right: 0 };
  const placedBoxes: Record<StickerSide, Box[]> = { left: [], right: [] };

  return STICKERS.map((sticker, index) => {
    // Alternate sides, starting on the right, so a lone sticker keeps
    // landing beside the text column like before.
    const side: StickerSide = index % 2 === 0 ? "right" : "left";
    const slot = slotsUsed[side]++;
    const rand = mulberry32(hashStringToSeed(sticker.id));

    // Conservative square footprint for collision checks — some stickers
    // (like the tenner) render wider than tall, so this over-estimates
    // rather than risking an overlap.
    const size = sticker.width;

    const baseX =
      side === "right"
        ? viewportWidth - size - EDGE_MARGIN - HORIZONTAL_JITTER
        : EDGE_MARGIN;
    const baseY = TOP_MARGIN + slot * VERTICAL_SLOT;

    let chosen: Box | null = null;
    for (let attempt = 0; attempt < MAX_PLACEMENT_ATTEMPTS; attempt++) {
      const candidate: Box = {
        x: baseX + rand() * HORIZONTAL_JITTER,
        y: baseY + (rand() - 0.5) * (VERTICAL_SLOT - size - MIN_GAP),
        size,
      };
      const collides = placedBoxes[side].some((box) =>
        boxesOverlap(candidate, box, MIN_GAP)
      );
      if (!collides) {
        chosen = candidate;
        break;
      }
    }

    // Fall back to the plain stacked slot if we couldn't find a free spot —
    // guaranteed not to touch anything already placed above it.
    const finalBox = chosen ?? { x: baseX, y: baseY, size };
    placedBoxes[side].push(finalBox);

    return { ...sticker, side, defaultX: finalBox.x, defaultY: finalBox.y };
  });
}
