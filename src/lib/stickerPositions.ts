// Positions are stored as fractions of the container's current width/height
// (not raw pixels) so a dragged sticker can be restored to the equivalent
// spot when the window is resized, rather than staying at a stale pixel
// offset or just getting clamped back into view.
export interface StickerPositionPct {
  xPct: number;
  yPct: number;
}

const positions = new Map<string, StickerPositionPct>();

export function getStickerPositionPct(id: string): StickerPositionPct | undefined {
  return positions.get(id);
}

export function setStickerPositionPct(id: string, position: StickerPositionPct): void {
  positions.set(id, position);
}
