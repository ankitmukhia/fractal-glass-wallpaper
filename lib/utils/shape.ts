// have a feature to add/positning shape as user please.
import { useStore } from "@/stores/fractal-store";

export function drawBlobShape(
  ctx: CanvasRenderingContext2D,
  position: {
    x: number;
    y: number;
    palette: { colors: Array<string> };
  },
) {
  const { width, height } = ctx.canvas;
  const numBlobs = Math.floor(Math.random() * 5) + 1; // 1–5 blobs
  const blobs: { x: number; y: number; radius: number }[] = [];

  // Helper: prevent overlapping
  function overlaps(x: number, y: number, r: number) {
    return blobs.some((b) => {
      const dx = x - b.x;
      const dy = y - b.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      return dist < r + b.radius + 30; // 30px buffer to keep them apart
    });
  }

  // Generate blobs (largest first)
  let tries = 0;
  while (blobs.length < numBlobs && tries < 1500) {
    tries++;
    const baseRadius = 100 + Math.random() * 120;
    const largestBoost = blobs.length === 0 ? 2.3 : 1; // biggest one larger
    const radius = baseRadius * largestBoost;

    const safeMargin = radius + 20;
    const x = safeMargin + Math.random() * (width - safeMargin * 2);
    const y = safeMargin + Math.random() * (height - safeMargin * 2);

    if (!overlaps(x, y, radius)) {
      blobs.push({ x, y, radius });
    }
  }

  // Gradient
  const gradient = ctx.createLinearGradient(0, 0, width, height);
  position.palette.colors.forEach((hex, i) =>
    gradient.addColorStop(i / (position.palette.colors.length - 1), `#${hex}`),
  );

  const filters = useStore.getState().shapeGradientFilters;
  ctx.filter = [
    `blur(${filters.blur}px)`,
    `brightness(${filters.brightness}%)`,
    `contrast(${filters.contrast}%)`,
    `saturate(${filters.saturation}%)`,
  ].join(" ");
  ctx.fillStyle = gradient;

  // --- Draw each blob ---
  blobs.forEach((blob) => {
    const path = new Path2D();

    const points: { x: number; y: number }[] = [];
    const numPoints = 10 + Math.floor(Math.random() * 6); // 10–15 control points
    const angleStep = (Math.PI * 2) / numPoints;

    // create random circular points
    for (let i = 0; i < numPoints; i++) {
      const angle = i * angleStep;
      const radiusJitter = blob.radius * (0.7 + Math.random() * 0.6); // smooth but random radius
      points.push({
        x: blob.x + Math.cos(angle) * radiusJitter,
        y: blob.y + Math.sin(angle) * radiusJitter,
      });
    }

    // --- Use smooth Bézier curve between points ---
    for (let i = 0; i < points.length; i++) {
      const p0 = points[(i - 1 + points.length) % points.length];
      const p1 = points[i];

      const p2 = points[(i + 1) % points.length];

      const p3 = points[(i + 2) % points.length];

      if (i === 0) path.moveTo(p1.x, p1.y);

      // Catmull–Rom to Bézier conversion for smoothness

      const cp1x = p1.x + (p2.x - p0.x) / 6;
      const cp1y = p1.y + (p2.y - p0.y) / 6;
      const cp2x = p2.x - (p3.x - p1.x) / 6;
      const cp2y = p2.y - (p3.y - p1.y) / 6;

      path.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, p2.x, p2.y);
    }

    path.closePath();
    ctx.fill(path);
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
