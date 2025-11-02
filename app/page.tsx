"use client";

import { useRef, useEffect } from "react";
import { backgroundGradientPalettes, gradientPalettes } from "@/lib/constants";
import { drawWaveShape } from "@/lib/utils/shape";

export default function Home() {
	const canvasRef = useRef<HTMLCanvasElement | null>(null);
	const resolution = { width: 900, height: 600 }

	useEffect(() => {
		const canvas = canvasRef.current;
		if (!canvas) return;

		// first layer, bg color layer
		const layer2ctx = canvas.getContext("2d");
		if (!layer2ctx) return;

		// second layer, shape layer
		const ctx = canvas.getContext("2d");
		if (!ctx) return;


		// third layer, pattern layer
		const patternCanvas = document.createElement("canvas");
		const patternCtx = patternCanvas.getContext("2d");
		if (!patternCtx) return

		// Set canvas dimensions
		canvas.width = resolution.width
		canvas.height = resolution.height

		/* canvas.width = window.innerWidth
		canvas.height = window.innerHeight */

		const backgroundGradient = ctx.createLinearGradient(0, 0, resolution.width, resolution.height);

		backgroundGradientPalettes.forEach((palette) => {
			palette.colors.forEach((color, index) => {
				const stop = index / (palette.colors.length - 1);

				const rgba = `rgba(${color.r}, ${color.g}, ${color.b})`
				backgroundGradient.addColorStop(stop, rgba)
			})
		})

		ctx.fillStyle = backgroundGradient;
		ctx.globalCompositeOperation = "destination-atop";
		ctx.fillRect(0, 0, resolution.width, resolution.height);

		// Draw gradient shapes
		gradientPalettes.forEach((palette) => {
			drawWaveShape(ctx,
				{
					x: Math.random() * 100,
					y: Math.random() * 100,
					palette: palette,
				}
			);
		});

		// Reset filters and compositing before drawing the pattern
		ctx.filter = "none";
		ctx.globalCompositeOperation = "darken";

		const step = 35; // CSS variable --step value
		// Set pattern canvas to one repeat cycle
		patternCanvas.width = step;
		patternCanvas.height = step * 2;

		// Create vertical gradient for the pattern
		const gradient = patternCtx.createLinearGradient(0, 0, step * 2, 0)
		gradient.addColorStop(0, "rgba(0, 0, 0, 0.1)")
		gradient.addColorStop(0.5, "rgba(255, 255, 200, 0.2)")
		gradient.addColorStop(1, "rgba(0, 0, 0, 0.1)")

		// Fill pattern canvas with gradient
		patternCtx.fillStyle = gradient
		patternCtx.fillRect(0, 0, step, step * 2)

		// Create repeating pattern from the pattern canvas
		const pattern = ctx.createPattern(patternCanvas, "repeat")
		if (!pattern) return;

		// Fill main canvas with the repeating pattern
		layer2ctx.fillStyle = pattern;
		layer2ctx.fillRect(0, 0, 1920, 1080);
	}, [])

	return (
		<div className="flex items-center justify-center h-dvh">
			<div
				style={{
					width: `${resolution.width}px`,
					height: `${resolution.height}px`
				}}
			>
				<canvas
					id="fractal-wallpepper"
					width={resolution.width}
					height={resolution.height}
					ref={canvasRef}
					style={{
						width: "100%",
						height: "100%",
						objectFit: "contain",
						borderRadius: "16px"
					}}
				/>
			</div>
		</div>
	);
}

/* <div className="background" />
<div className="backdropShape" /> */
