function drawSparklyPink(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  { speckleCount, glintCount }: { speckleCount: number; glintCount: number }
): void {
  const gradient = ctx.createLinearGradient(0, 0, width, height);
  gradient.addColorStop(0, "#ff8fc9");
  gradient.addColorStop(0.5, "#ff4fa8");
  gradient.addColorStop(1, "#ff8fc9");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);

  // Fine glitter speckle
  for (let i = 0; i < speckleCount; i++) {
    const x = Math.random() * width;
    const y = Math.random() * height;
    const r = Math.random() * (width / 140) + 0.2;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(255,255,255,${(Math.random() * 0.6 + 0.35).toFixed(2)})`;
    ctx.fill();
  }

  // A handful of brighter star-glint sparkles
  for (let i = 0; i < glintCount; i++) {
    const x = Math.random() * width;
    const y = Math.random() * height;
    const size = (Math.random() * 1.6 + 1.2) * (width / 128);
    ctx.save();
    ctx.translate(x, y);
    ctx.strokeStyle = "rgba(255,255,255,0.95)";
    ctx.lineWidth = 0.35 * (width / 128);
    ctx.beginPath();
    ctx.moveTo(-size, 0);
    ctx.lineTo(size, 0);
    ctx.moveTo(0, -size);
    ctx.lineTo(0, size);
    ctx.stroke();
    ctx.restore();
  }
}

// Procedurally draws a small tileable pink glitter pattern for the lanyard
// strap texture, returned as a data URL so it can be handed straight to
// Lanyard's `lanyardImage` prop (no extra asset file needed). Deliberately a
// thin wide strip to match the band's own aspect ratio.
export function createSparklyLanyardTexture(): string {
  const width = 128;
  const height = 32;
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) return "";
  drawSparklyPink(ctx, width, height, { speckleCount: 260, glintCount: 18 });
  return canvas.toDataURL();
}

// Same pink glitter look, but sized to the card face's own portrait aspect
// ratio (frontImage / backImage) — the lanyard's thin strip texture would
// otherwise get sliced down to a near-solid band by the "cover" fit, and a
// plain square leaves gaps top/bottom instead of covering edge-to-edge.
export function createSparklyCardTexture(): string {
  const width = 400;
  const height = 600;
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) return "";
  drawSparklyPink(ctx, width, height, { speckleCount: 900, glintCount: 45 });
  return canvas.toDataURL();
}
