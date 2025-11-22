// Types for blob data
export type BlobData = {
  x: number;
  y: number;
  radius: number;
  stretchY: number;
  rotation: number;
  points: { x: number; y: number }[];
};

export type ShapeWithBlob = {
  color: string;
  blobData?: BlobData; // Store pre-generated blob data
};

// Generate blob data once - call this when creating/shuffling shapes
export function generateBlobData(
  canvasWidth: number,
  canvasHeight: number,
): BlobData {
  const baseRadius = 100 + Math.random() * 120;
  const stretchY = 1.8 + Math.random() * 1.2;
  const rotation = ((Math.random() - 0.5) * 80 * Math.PI) / 180;

  const safeMarginX = baseRadius * 2;
  const safeMarginY = baseRadius * stretchY * 2;
  const x = safeMarginX + Math.random() * (canvasWidth - safeMarginX * 2);

  const y = safeMarginY + Math.random() * (canvasHeight - safeMarginY * 2);

  // Generate shape points
  const numPoints = 12 + Math.floor(Math.random() * 4);
  const angleStep = (Math.PI * 2) / numPoints;

  const points: { x: number; y: number }[] = [];

  for (let i = 0; i < numPoints; i++) {
    const angle = i * angleStep;
    const radiusJitter = baseRadius * (0.7 + Math.random() * 0.6);

    const px = Math.cos(angle) * radiusJitter;
    const py = Math.sin(angle) * radiusJitter * stretchY;
    points.push({ x: px, y: py });
  }

  return { x, y, radius: baseRadius, stretchY, rotation, points };
}

// Draw blob using pre-generated data
export function drawBlobShape(
  ctx: CanvasRenderingContext2D,
  shape: ShapeWithBlob,
  shapeFilterStrings: string,
) {
  // if no blob data exists, generate it
  if (!shape.blobData) {
    shape.blobData = generateBlobData(ctx.canvas.width, ctx.canvas.height);
  }

  const blob = shape.blobData;

  // Apply filters
  ctx.filter = shapeFilterStrings;
  ctx.save();
  ctx.translate(blob.x, blob.y);
  ctx.rotate(blob.rotation);

  const path = new Path2D();
  const points = blob.points;

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

  ctx.fillStyle = `#${shape.color}`;
  ctx.fill(path);
  ctx.restore();

  ctx.filter = "none";
}

// Helper function to shuffle/regenerate all blobs
export function shuffleBlobs(
  shapes: ShapeWithBlob[],
  canvasWidth: number,
  canvasHeight: number,
): ShapeWithBlob[] {
  return shapes.map((shape) => ({
    ...shape,
    blobData: generateBlobData(canvasWidth, canvasHeight),
  }));
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
