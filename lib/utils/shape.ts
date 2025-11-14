// have a feature to add/positning shape as user please.
import { useStore } from "@/stores/fractal-store";

export function drawBlobShape(
  ctx: CanvasRenderingContext2D,
  position: {
    x: number;
    y: number;
    color: string;
  },
) {
  const { width, height } = ctx.canvas;
  const numBlobs = 1; // Only 1 blob per color
  const blobs: {
    x: number;
    y: number;
    radius: number;
    stretchY: number;
    rotation: number;
  }[] = [];

  // --- Generate 1 blob (no overlap logic needed if only 1 blob per draw) ---
  const baseRadius = 100 + Math.random() * 120;
  const stretchY = 1.8 + Math.random() * 1.2;
  const rotation = ((Math.random() - 0.5) * 80 * Math.PI) / 180;

  const safeMarginX = baseRadius * 2;
  const safeMarginY = baseRadius * stretchY * 2;
  const x = safeMarginX + Math.random() * (width - safeMarginX * 2);
  const y = safeMarginY + Math.random() * (height - safeMarginY * 2);

  blobs.push({ x, y, radius: baseRadius, stretchY, rotation });

  // --- Apply store filters ---

  const filters = useStore.getState().shapeGradientFilters;
  ctx.filter = [
    `blur(${filters.blur}px)`,
    `brightness(${filters.brightness}%)`,
    `contrast(${filters.contrast}%)`,
    `saturate(${filters.saturation}%)`,
  ].join(" ");

  // --- Draw blob with a single solid color ---
  blobs.forEach((blob) => {
    ctx.save();
    ctx.translate(blob.x, blob.y);

    ctx.rotate(blob.rotation);

    const path = new Path2D();
    const points: { x: number; y: number }[] = [];
    const numPoints = 12 + Math.floor(Math.random() * 4);
    const angleStep = (Math.PI * 2) / numPoints;

    for (let i = 0; i < numPoints; i++) {
      const angle = i * angleStep;
      const radiusJitter = blob.radius * (0.7 + Math.random() * 0.6);
      const px = Math.cos(angle) * radiusJitter;
      const py = Math.sin(angle) * radiusJitter * blob.stretchY;
      points.push({ x: px, y: py });
    }

    for (let i = 0; i < points.length; i++) {
      const p0 = points[(i - 1 + points.length) % points.length];
      const p1 = points[i];
      const p2 = points[(i + 1) % points.length];
      const p3 = points[(i + 2) % points.length];

      if (i === 0) path.moveTo(p1.x, p1.y);

      const cp1x = p1.x + (p2.x - p0.x) / 6;
      const cp1y = p1.y + (p2.y - p0.y) / 6;
      const cp2x = p2.x - (p3.x - p1.x) / 6;

      const cp2y = p2.y - (p3.y - p1.y) / 6;

      path.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, p2.x, p2.y);
    }
    path.closePath();

    ctx.fillStyle = `#${position.color}`;

    ctx.fill(path);

    ctx.restore();
  });

  ctx.filter = "none";
}

export function getRangeStep(
  max: number,
  min: number,
  step: number,
  size: number,
) {
  const totalStops = Math.round((max - min) / step);
  const dots = Array.from({ length: totalStops + 1 }, (_, i) => min + i * step);
  const percentage = ((size - min) / (max - min)) * 100;

  return {
    dots,
    percentage,
  };
}
