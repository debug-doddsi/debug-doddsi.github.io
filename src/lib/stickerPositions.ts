export interface StickerPosition {
  x: number;
  y: number;
}

const positions = new Map<string, StickerPosition>();

export function getStickerPosition(id: string): StickerPosition | undefined {
  return positions.get(id);
}

export function setStickerPosition(id: string, position: StickerPosition): void {
  positions.set(id, position);
}
