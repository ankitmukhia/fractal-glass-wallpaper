import { useEffect, useRef, useMemo } from "react";
import { drawBlobShape } from "@/lib/utils/shape";
import { useStore } from "@/stores/fractal-store";
import { vertexShaderSource, fragmentShaderSource } from "@/lib/shaders";

interface UniformTypes {
	u_image: WebGLUniformLocation | null;
	u_grainTexture: WebGLUniformLocation | null;
	u_imageAspect: WebGLUniformLocation | null;
	u_resolution: WebGLUniformLocation | null;
	u_size: WebGLUniformLocation | null;
	u_distortion: WebGLUniformLocation | null;
	u_shift: WebGLUniformLocation | null;
	u_margin: WebGLUniformLocation | null;
	u_shadow: WebGLUniformLocation | null;
	u_grainIntensity: WebGLUniformLocation | null;
	u_stretch: WebGLUniformLocation | null;
	u_blur: WebGLUniformLocation | null;
}

const compileShader = (
	gl: WebGL2RenderingContext,
	shaderType: number,
	shaderSource: string,
) => {
	const shader = gl.createShader(shaderType)!;
	gl.shaderSource(shader, shaderSource);
	gl.compileShader(shader);

	if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
		console.error("Shader compile error:", gl.getShaderInfoLog(shader));
		gl.deleteShader(shader);
		return null;
	}
	return shader;
};

const createProgram = (
	gl: WebGL2RenderingContext,
	vertexShaderSource: string,
	fragmentShaderSource: string,
) => {
	const vertexShader = compileShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
	const fragmentShader = compileShader(
		gl,
		gl.FRAGMENT_SHADER,
		fragmentShaderSource,
	);

	if (!vertexShader || !fragmentShader) return null;

	const program = gl.createProgram();
	if (!program) {
		console.error("Failed to create program");
		return null;
	}
	gl.attachShader(program, vertexShader);
	gl.attachShader(program, fragmentShader);
	gl.linkProgram(program);

	if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
		console.error("Program link error:", gl.getProgramInfoLog(program));
		gl.deleteProgram(program);
		return null;
	}

	gl.detachShader(program, vertexShader);
	gl.detachShader(program, fragmentShader);
	gl.deleteShader(vertexShader);

	gl.deleteShader(fragmentShader);
	return program;
};

// Create grain texture once, reuse across renders
const createGrainTexture = (
	gl: WebGL2RenderingContext,
	width: number,

	height: number,
): WebGLTexture | null => {
	const grainCanvas = document.createElement("canvas");
	grainCanvas.width = width;
	grainCanvas.height = height;
	const grainCtx = grainCanvas.getContext("2d", { willReadFrequently: true });
	if (!grainCtx) return null;

	const grainImageData = grainCtx.createImageData(width, height);
	const grainData = grainImageData.data;

	for (let i = 0; i < grainData.length; i += 4) {
		const noise = Math.random() * 255;
		grainData[i] = noise;
		grainData[i + 1] = noise;
		grainData[i + 2] = noise;
		grainData[i + 3] = 255;
	}

	grainCtx.putImageData(grainImageData, 0, 0);

	const grainTexture = gl.createTexture();
	if (!grainTexture) return null;

	gl.bindTexture(gl.TEXTURE_2D, grainTexture);
	gl.texImage2D(
		gl.TEXTURE_2D,

		0,
		gl.RGBA,
		gl.RGBA,
		gl.UNSIGNED_BYTE,
		grainCanvas,
	);

	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
	gl.bindTexture(gl.TEXTURE_2D, null);

	return grainTexture;
};

export const FluttedGlass = () => {
	const store = useStore();
	const canvasRef = useRef<HTMLCanvasElement | null>(null);
	const programRef = useRef<WebGLProgram | null>(null);
	const glRef = useRef<WebGL2RenderingContext | null>(null);
	const texRef = useRef<WebGLTexture | null>(null);

	const uniformsRef = useRef<UniformTypes>(null);
	const grainTextureRef = useRef<WebGLTexture | null>(null);
	const vaoRef = useRef<WebGLVertexArrayObject | null>(null);

	const RESOLUTION_WIDTH = store.resolution.width!;
	const RESOLUTION_HEIGHT = store.resolution.height!;

	// Memoize filter string to avoid recalculation
	const filterString = useMemo(() => {
		return [
			store.backgroundGradientFilters.blur > 0 &&
			`blur(${store.backgroundGradientFilters.blur}px)`,
			`brightness(${store.backgroundGradientFilters.brightness}%)`,
			`contrast(${store.backgroundGradientFilters.contrast}%)`,
			`saturate(${store.backgroundGradientFilters.saturation}%)`,
		]
			.filter(Boolean)
			.join(" ");
	}, [
		store.backgroundGradientFilters.blur,
		store.backgroundGradientFilters.brightness,
		store.backgroundGradientFilters.contrast,
		store.backgroundGradientFilters.saturation,
	]);

	const shapeFilterString = useMemo(() => {
		return [
			store.shapeGradientFilters.blur > 0 &&
			`blur(${store.shapeGradientFilters.blur}px)`,
			`brightness(${store.shapeGradientFilters.brightness}%)`,
			`contrast(${store.shapeGradientFilters.contrast}%)`,
			`saturate(${store.shapeGradientFilters.saturation}%)`,
		]
			.filter(Boolean)
			.join(" ");
	}, [
		store.shapeGradientFilters.blur,
		store.shapeGradientFilters.brightness,
		store.shapeGradientFilters.contrast,
		store.shapeGradientFilters.saturation,
	]);

	// Real-time uniform updates - renders immediately for smooth interaction
	useEffect(() => {
		const gl = glRef.current;
		const program = programRef.current;
		const uniforms = uniformsRef.current;
		const vao = vaoRef.current;
		const texture = texRef.current;
		const grainTexture = grainTextureRef.current;

		if (!gl || !program || !uniforms || !vao || !texture || !grainTexture)
			return;

		// Immediate render for real-time feedback
		gl.clearColor(0, 0, 0, 0);

		gl.clear(gl.COLOR_BUFFER_BIT);

		gl.useProgram(program);
		gl.bindVertexArray(vao);

		// Bind textures
		gl.activeTexture(gl.TEXTURE0);

		gl.bindTexture(gl.TEXTURE_2D, texture);
		gl.uniform1i(uniforms.u_image, 0);

		gl.activeTexture(gl.TEXTURE1);

		gl.bindTexture(gl.TEXTURE_2D, grainTexture);

		gl.uniform1i(uniforms.u_grainTexture, 1);

		// Update only the changed uniforms
		const screenAspect = RESOLUTION_WIDTH / RESOLUTION_HEIGHT;
		gl.uniform1f(uniforms.u_imageAspect, screenAspect);
		gl.uniform2f(uniforms.u_resolution, RESOLUTION_WIDTH, RESOLUTION_HEIGHT);
		gl.uniform1f(uniforms.u_size, store.fractalSize);
		gl.uniform1f(uniforms.u_distortion, store.distortion);
		gl.uniform1f(uniforms.u_shift, 0.0);
		gl.uniform1f(uniforms.u_margin, store.fractalMargin);
		gl.uniform1f(uniforms.u_shadow, store.fractalShadow);
		gl.uniform1f(uniforms.u_grainIntensity, store.grainIntensity / 100);
		gl.uniform1f(uniforms.u_blur, store.fractalBlur);
		gl.uniform2f(uniforms.u_stretch, 1.0, store.stretch);

		gl.drawArrays(gl.TRIANGLES, 0, 3);
		gl.bindVertexArray(null);
		gl.useProgram(null);
	}, [
		RESOLUTION_WIDTH,
		RESOLUTION_HEIGHT,
		store.fractalSize,

		store.distortion,

		store.fractalMargin,
		store.fractalShadow,

		store.grainIntensity,

		store.stretch,
		store.fractalBlur,
	]);

	// Main initialization effect
	useEffect(() => {
		const canvas = canvasRef.current;
		if (!canvas) return;

		const gl = canvas.getContext("webgl2", {
			premultipliedAlpha: false,
			preserveDrawingBuffer: true,
			antialias: false, // Disable if not needed for performance

			powerPreference: "high-performance",
		});

		if (!gl) {
			console.error("WebGL2 not supported");
			return;
		}
		glRef.current = gl;

		const program = createProgram(gl, vertexShaderSource, fragmentShaderSource);
		if (!program) {
			console.error("Failed to create program");
			return;
		}
		programRef.current = program;

		const vao = gl.createVertexArray();
		if (!vao) {
			console.error("Failed to create VAO");
			return;
		}
		vaoRef.current = vao;

		gl.bindVertexArray(vao);

		const posBuf = gl.createBuffer();
		if (!posBuf) {
			console.error("Failed to create position buffer");
			return;
		}

		gl.bindBuffer(gl.ARRAY_BUFFER, posBuf);
		const quadVerts = new Float32Array([-1, -1, 3, -1, -1, 3]);
		gl.bufferData(gl.ARRAY_BUFFER, quadVerts, gl.STATIC_DRAW);

		const posLoc = gl.getAttribLocation(program, "a_position");
		gl.enableVertexAttribArray(posLoc);
		gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 0, 0);

		gl.bindVertexArray(null);
		gl.bindBuffer(gl.ARRAY_BUFFER, null);

		// Create main texture
		const texture = gl.createTexture();

		if (!texture) {
			console.log("Failed to create main texture");
			return;
		}
		texRef.current = texture;
		gl.bindTexture(gl.TEXTURE_2D, texture);

		if (store.withImage) {
			gl.texImage2D(
				gl.TEXTURE_2D,
				0,
				gl.RGBA,
				1,
				1,
				0,
				gl.RGBA,
				gl.UNSIGNED_BYTE,
				new Uint8Array([0, 0, 0, 255]),
			);
		} else {
			const gradientCanvas = document.createElement("canvas");
			gradientCanvas.width = RESOLUTION_WIDTH;

			gradientCanvas.height = RESOLUTION_HEIGHT;
			const ctx = gradientCanvas.getContext("2d");

			if (!ctx) return;

			if (store.isGradient) {
				const backgroundGradient = ctx.createLinearGradient(
					0,
					0,
					RESOLUTION_WIDTH,
					0,
				);

				store.newBackgroundGradient
					.filter((palette) => palette.name === store.currentPalette)
					.forEach((palette) => {
						palette.colors.forEach(({ color }, index) => {
							const stop = index / (palette.colors.length - 1);
							const hex = `#${color}`;
							backgroundGradient.addColorStop(stop, hex);
						});
					});

				ctx.fillStyle = backgroundGradient;
			} else {
				ctx.fillStyle = `#${store.backgroundSolid}`;
			}

			ctx.filter = filterString;
			ctx.fillRect(0, 0, RESOLUTION_WIDTH, RESOLUTION_HEIGHT);

			store.newShape.forEach((shape) => {
				drawBlobShape(ctx, shape, shapeFilterString);
			});

			gl.texImage2D(
				gl.TEXTURE_2D,
				0,
				gl.RGBA,
				gl.RGBA,
				gl.UNSIGNED_BYTE,
				gradientCanvas,
			);
		}

		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
		gl.bindTexture(gl.TEXTURE_2D, null);

		// Create grain texture
		const grainTexture = createGrainTexture(
			gl,
			RESOLUTION_WIDTH,
			RESOLUTION_HEIGHT,
		);
		if (!grainTexture) return;
		grainTextureRef.current = grainTexture;

		// Get uniform locations
		const uniforms = {
			u_image: gl.getUniformLocation(program, "u_image"),
			u_grainTexture: gl.getUniformLocation(program, "u_grainTexture"),
			u_imageAspect: gl.getUniformLocation(program, "u_imageAspect"),
			u_resolution: gl.getUniformLocation(program, "u_resolution"),
			u_size: gl.getUniformLocation(program, "u_size"),
			u_distortion: gl.getUniformLocation(program, "u_distortion"),
			u_shift: gl.getUniformLocation(program, "u_shift"),
			u_margin: gl.getUniformLocation(program, "u_margin"),
			u_shadow: gl.getUniformLocation(program, "u_shadow"),
			u_stretch: gl.getUniformLocation(program, "u_stretch"),
			u_blur: gl.getUniformLocation(program, "u_blur"),
			u_grainIntensity: gl.getUniformLocation(program, "u_grainIntensity"),
		};
		uniformsRef.current = uniforms;

		const resizeCanvasToDisplaySize = () => {
			if (
				canvas.width !== RESOLUTION_WIDTH ||
				canvas.height !== RESOLUTION_HEIGHT
			) {
				canvas.width = RESOLUTION_WIDTH;
				canvas.height = RESOLUTION_HEIGHT;
				canvas.style.width = `${RESOLUTION_WIDTH}px`;
				canvas.style.height = `${RESOLUTION_HEIGHT}px`;
			}

			gl.viewport(0, 0, canvas.width, canvas.height);
		};

		const render = () => {
			if (!gl || !program || !vao) return;

			gl.clearColor(0, 0, 0, 0);
			gl.clear(gl.COLOR_BUFFER_BIT);

			gl.useProgram(program);
			gl.bindVertexArray(vao);

			// Bind textures

			gl.activeTexture(gl.TEXTURE0);
			gl.bindTexture(gl.TEXTURE_2D, texture);
			gl.uniform1i(uniforms.u_image, 0);

			gl.activeTexture(gl.TEXTURE1);
			gl.bindTexture(gl.TEXTURE_2D, grainTexture);
			gl.uniform1i(uniforms.u_grainTexture, 1);

			// Update uniforms
			gl.uniform2f(uniforms.u_resolution, RESOLUTION_WIDTH, RESOLUTION_HEIGHT);
			gl.uniform1f(uniforms.u_size, store.fractalSize);
			gl.uniform1f(uniforms.u_distortion, store.distortion);
			gl.uniform1f(uniforms.u_shift, 0.0);
			gl.uniform1f(uniforms.u_margin, store.fractalMargin);
			gl.uniform1f(uniforms.u_shadow, store.fractalShadow);
			gl.uniform2f(uniforms.u_stretch, 1.0, store.stretch);
			gl.uniform1f(uniforms.u_blur, store.fractalBlur);
			gl.uniform1f(uniforms.u_grainIntensity, store.grainIntensity / 100);

			const screenAspect = RESOLUTION_WIDTH / RESOLUTION_HEIGHT;
			gl.uniform1f(uniforms.u_imageAspect, screenAspect);

			gl.drawArrays(gl.TRIANGLES, 0, 3);

			gl.bindVertexArray(null);
			gl.useProgram(null);
		};

		resizeCanvasToDisplaySize();

		// Load image if needed
		if (store.withImage) {
			const img = new Image();
			img.crossOrigin = "anonymous";
			img.src = store.backgroundImage.src;
			img.onload = () => {
				if (!gl) return;
				gl.bindTexture(gl.TEXTURE_2D, texture);

				gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1);
				gl.texImage2D(
					gl.TEXTURE_2D,
					0,
					gl.RGBA,
					gl.RGBA,
					gl.UNSIGNED_BYTE,
					img,
				);

				const aspect = img.width / img.height;
				gl.useProgram(program);
				gl.uniform1f(uniforms.u_imageAspect, aspect);
				gl.useProgram(null);

				gl.bindTexture(gl.TEXTURE_2D, null);
				render();
			};
			img.onerror = (e) => {
				console.error("Failed to load image", e);
			};
		} else {
			render();
		}

		const handleResize = () => {
			resizeCanvasToDisplaySize();
			render();
		};
		window.addEventListener("resize", handleResize);

		return () => {
			window.removeEventListener("resize", handleResize);
			if (glRef.current) {
				if (texRef.current) glRef.current.deleteTexture(texRef.current);

				if (grainTextureRef.current)
					glRef.current.deleteTexture(grainTextureRef.current);
				if (vaoRef.current) glRef.current.deleteVertexArray(vaoRef.current);
				if (programRef.current) glRef.current.deleteProgram(programRef.current);
				glRef.current = null;
			}
		};
	}, [
		RESOLUTION_WIDTH,
		RESOLUTION_HEIGHT,

		filterString,
		shapeFilterString,
		store.newShape,
		store.newBackgroundGradient,
		store.currentPalette,
		store.backgroundSolid,
		store.isGradient,
		store.backgroundImage.src,
		store.withImage,
	]);

	return (
		<canvas
			id="fractal-canvas"
			ref={canvasRef}
			width={store.resolution.width}
			height={store.resolution.height}
			style={{
				width: "100%",
				height: "100%",
				boxShadow: "0 8px 24px rgba(0,0,0,0.15)",
				borderRadius: 55,
			}}
		/>
	);
};
