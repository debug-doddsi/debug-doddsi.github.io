import { useEffect, useRef } from "react";

interface Particle {
  x: number;
  y: number;
  dx: number;
  dy: number;
  size: number;
  opacity: number;
  decay: number;
  rotation: number;
  rotSpeed: number;
}

function drawStar(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  rotation: number
) {
  const points = 4;
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(rotation);
  ctx.beginPath();
  for (let i = 0; i < points * 2; i++) {
    const angle = (i / (points * 2)) * Math.PI * 2 - Math.PI / 2;
    const r = i % 2 === 0 ? size : size * 0.35;
    const px = Math.cos(angle) * r;
    const py = Math.sin(angle) * r;
    i === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py);
  }
  ctx.closePath();
  ctx.restore();
}

export function StarCursor() {
  const cursorRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (window.matchMedia("(pointer: coarse)").matches) return;

    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d")!;
    const cursor = cursorRef.current!;

    canvas.style.display = "block";
    cursor.style.display = "block";

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    let particles: Particle[] = [];
    let lastEmitPos = { x: -999, y: -999 };

    const getAccent = () =>
      getComputedStyle(document.documentElement)
        .getPropertyValue("--accent")
        .trim() || "#a690c4";

    const getAccentRgb = () =>
      getComputedStyle(document.documentElement)
        .getPropertyValue("--accent-rgb")
        .trim() || "166, 144, 196";

    const handleMouseMove = (e: MouseEvent) => {
      const { clientX: x, clientY: y } = e;

      cursor.style.transform = `translate(${x - 4}px, ${y - 4}px)`;

      const dist = Math.hypot(x - lastEmitPos.x, y - lastEmitPos.y);
      if (dist > 14) {
        lastEmitPos = { x, y };
        const count = Math.random() > 0.45 ? 2 : 1;
        for (let i = 0; i < count; i++) {
          particles.push({
            x: x + (Math.random() - 0.5) * 10,
            y: y + (Math.random() - 0.5) * 10,
            dx: (Math.random() - 0.5) * 1.4,
            dy: (Math.random() - 0.5) * 1.2 - 0.6,
            size: Math.random() * 2.5 + 1.5,
            opacity: 0.8 + Math.random() * 0.2,
            decay: 0.018 + Math.random() * 0.012,
            rotation: Math.random() * Math.PI * 2,
            rotSpeed: (Math.random() - 0.5) * 0.12,
          });
        }
      }
    };

    const handleMouseLeave = () => {
      cursor.style.opacity = "0";
    };
    const handleMouseEnter = () => {
      cursor.style.opacity = "1";
    };

    let rafId: number;
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const accent = getAccent();
      const accentRgb = getAccentRgb();

      particles = particles.filter((p) => p.opacity > 0.01);

      for (const p of particles) {
        p.x += p.dx;
        p.y += p.dy;
        p.dy += 0.028;
        p.opacity -= p.decay;
        p.rotation += p.rotSpeed;

        ctx.save();
        ctx.globalAlpha = Math.max(0, p.opacity);
        ctx.fillStyle = accent;
        ctx.shadowBlur = 6;
        ctx.shadowColor = `rgba(${accentRgb}, 0.8)`;
        drawStar(ctx, p.x, p.y, p.size, p.rotation);
        ctx.fill();
        ctx.restore();
      }

      rafId = requestAnimationFrame(animate);
    };

    animate();
    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseleave", handleMouseLeave);
    document.addEventListener("mouseenter", handleMouseEnter);

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseleave", handleMouseLeave);
      document.removeEventListener("mouseenter", handleMouseEnter);
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(rafId);
    };
  }, []);

  return (
    <>
      <canvas
        ref={canvasRef}
        style={{ display: "none" }}
        className="pointer-events-none fixed inset-0 z-[9998]"
      />
      <div
        ref={cursorRef}
        style={{
          display: "none",
          width: 8,
          height: 8,
          borderRadius: "50%",
          backgroundColor: "var(--accent)",
          boxShadow: "0 0 8px rgba(var(--accent-rgb), 0.9)",
          position: "fixed",
          top: 0,
          left: 0,
          willChange: "transform",
          zIndex: 9999,
          pointerEvents: "none",
          transition: "opacity 0.2s ease",
        }}
      />
    </>
  );
}
