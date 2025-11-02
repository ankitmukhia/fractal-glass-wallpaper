export function drawWaveShape(
	ctx: CanvasRenderingContext2D,
	position: { x: number; y: number; palette: { colors: Array<{ r: number; g: number; b: number; }> } }
) {
	const path = new Path2D();

	const fullWidth = ctx.canvas.width;
	const fullHeight = ctx.canvas.height;

	const direction = Math.random() > 0.5 ? 1 : -1; // left→right or right→left
	const xStart = direction === 1 ? 0 : fullWidth;
	const xEnd = direction === 1 ? fullWidth : 0;
	const yBase = (position.y / 100) * fullHeight;


	// random gentle tilt
	const rotation = ((Math.random() - 0.5) * 20 * Math.PI) / 180;
	ctx.save();
	ctx.translate(fullWidth / 2, yBase);
	ctx.rotate(rotation);
	ctx.translate(-fullWidth / 2, -yBase);

	// --- dramatic curvature control ---
	const midYShift = (Math.random() - 0.5) * fullHeight * 0.9;   // huge sweep in the middle
	const endYShift = (Math.random() - 0.5) * fullHeight * 0.8;   // final bend
	const curveStrength = 1.8 + Math.random() * 0.6;              // exaggeration multiplier

	// --- thickness profile ---
	const bottomShift = fullHeight * (0.25 + Math.random() * 0.15); // thicker
	const topOffset = 0; // top follows the curve

	const endThicknessBoost = 1.5 + Math.random() * 1.0;

	// --- Top curve (major swoop) ---
	path.moveTo(xStart, yBase + topOffset);

	const cp1x = xStart + (fullWidth / 3) * direction;

	const cp1y = yBase - midYShift * 1.6 * curveStrength; // huge bend upward/downward

	const cp2x = xStart + (2 * fullWidth) / 3 * direction;
	const cp2y = yBase + midYShift * 1.9 * curveStrength + endYShift * 0.9;

	path.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, xEnd, yBase + endYShift);

	// --- Bottom curve (mirrors but thicker, exaggerated offset) ---
	const bcp1x = xStart + (2 * fullWidth) / 3 * direction;
	const bcp1y = yBase + bottomShift * endThicknessBoost + midYShift * 1.3 * curveStrength;

	const bcp2x = xStart + (fullWidth / 3) * direction;
	const bcp2y = yBase + bottomShift * 0.8 + midYShift * 0.8 * curveStrength;

	path.bezierCurveTo(bcp1x, bcp1y, bcp2x, bcp2y, xStart, yBase + bottomShift * endThicknessBoost);

	const gradient = ctx.createLinearGradient(0, yBase - fullHeight / 3, fullWidth, yBase + fullHeight / 3);

	position.palette.colors.forEach((color, index) => {
		const stop = index / (position.palette.colors.length - 1)
		const rgba = `rgba(${color.r}, ${color.g}, ${color.b})`
		gradient.addColorStop(stop, rgba)
	})

	path.closePath();
	ctx.globalCompositeOperation = "lighten";
	ctx.filter = "blur(45px)";
	ctx.fillStyle = gradient;
	ctx.fill(path);
	ctx.restore();
}
