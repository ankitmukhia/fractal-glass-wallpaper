"use client";

import { useRef, useEffect } from "react";
import { gradientPalettes } from "@/lib/constants";
import { drawWaveShape } from "@/lib/utils/shape";

export default function Home() {
	const canvasRef = useRef<HTMLCanvasElement | null>(null);

	useEffect(() => {
		const canvas = canvasRef.current;
		if (!canvas) return;

		const ctx = canvas.getContext("2d");
		if (!ctx) return;

		// Set canvas dimensions
		canvas.width = window.innerWidth;
		canvas.height = window.innerHeight;

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
		ctx.globalCompositeOperation = "source-over";

		const step = 40; // CSS variable --step value
		const patternCanvas = document.createElement("canvas");
		const patternCtx = patternCanvas.getContext("2d");

		if (!patternCtx) return

		// Set pattern canvas to one repeat cycle
		patternCanvas.width = step;
		patternCanvas.height = step * 2;

		// Create vertical gradient for the pattern
		const gradient = patternCtx.createLinearGradient(0, 0, step * 2, 0)
		gradient.addColorStop(0, "rgba(0, 0, 0, 0.1)")
		gradient.addColorStop(0.5, "rgba(255, 255, 255, 0.2)")
		gradient.addColorStop(1, "rgba(0, 0, 0, 0.1)")

		// Fill pattern canvas with gradient
		patternCtx.fillStyle = gradient
		patternCtx.fillRect(0, 0, step, step * 2)

		// Create repeating pattern from the pattern canvas
		const pattern = ctx.createPattern(patternCanvas, "repeat")
		if (!pattern) return;

		// Fill main canvas with the repeating pattern
		ctx.fillStyle = "#000";
		ctx.fillStyle = pattern;
		ctx.fillRect(0, 0, 1920, 1080);
	}, [])

	return (
		<div className="flex items-center justify-center h-dvh">
			<div
				style={{
					width: "1200px",
					height: "800px"
				}}
			>
				<canvas
					id="fractal-wallpepper"
					width={1920}
					height={1080}
					ref={canvasRef}
					style={{
						width: "100%",
						height: "100%",
						borderRadius: "16px"
					}}
				/>
			</div>
		</div>
	);
}

/* <div className="background" />
<div className="backdropShape" /> */
