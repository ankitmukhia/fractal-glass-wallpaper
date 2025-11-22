"use client";

import { useState, useEffect } from "react";
import { Desktop } from "@/components/responsive-component/desktop";
import { Mobile } from "@/components/responsive-component/mobile";

enum ImageFormat {
	PNG = "png",
	JPG = "jpg",
	WEBP = "webp",
}

export default function Home() {
	const [isMobile, setIsMobile] = useState(false);

	useEffect(() => {
		const detectMobileScreenSize = () => {
			const screentWidth =
				window.innerWidth ||
				document.documentElement.clientWidth ||
				document.body.clientWidth;
			return screentWidth < 768 ? setIsMobile(true) : setIsMobile(false);
		};
		detectMobileScreenSize();

		window.addEventListener("resize", detectMobileScreenSize);
		return () => {
			window.removeEventListener("resize", detectMobileScreenSize);
		};
	}, []);

	const exportAsImage = async () => {
		const fractalCanvas = document.querySelector(
			"#fractal-canvas",
		) as HTMLCanvasElement;
		if (!fractalCanvas) return;

		const blob = await canvasToBlob(fractalCanvas, ImageFormat.PNG);
		if (!blob) {
			return;
		}

		triggerDownload(blob);
	};

	const canvasToBlob = (
		canvas: HTMLCanvasElement,
		format: ImageFormat,
	): Promise<Blob | null> => {
		return new Promise((resolve) => {
			console.log("format ; ", format);
			const type = `image/${format}`;
			canvas.toBlob((blob) => resolve(blob), type);
		});
	};

	const triggerDownload = (blob: Blob) => {
		const url = URL.createObjectURL(blob);
		const link = document.createElement("a");
		link.href = url;
		link.download = `fractal-image`;
		document.body.appendChild(link);
		link.click();
		document.body.removeChild(link);
		URL.revokeObjectURL(url);
	};

	const AppComponent = isMobile ? Mobile : Desktop;

	return <AppComponent exportAsImageAction={exportAsImage} />;
}
