import { useEffect, useRef } from "react";
import { drawWaveShape } from "@/lib/utils/shape";
import { gradientShapePalettes, backgroundGradientPalettes } from "@/lib/constants";
import { useStore } from "@/stores/fractal-store";

interface BgImageProps {
	src: string;
	withImage: boolean;
}

interface FluttedGlassProps {
	size: number;
	sizeRef: any;
	distortion: number;
	distortionRef: any;
	fractalMargin: number;
	fractalMarginRef: any;
	fractalShadow: any;
	fractalShadowRef: any;
	bgImage: BgImageProps;
}

export const FluttedGlass = ({
	size,
	sizeRef,
	distortion,
	distortionRef,
	fractalMargin,
	fractalMarginRef,
	fractalShadow,
	fractalShadowRef,
	bgImage,
}: FluttedGlassProps) => {
	const store = useStore();
	const canvasRef = useRef<HTMLCanvasElement | null>(null);
	const programRef = useRef<WebGLProgram | null>(null);
	const glRef = useRef<WebGL2RenderingContext | null>(null);
	const texRef = useRef<WebGLTexture | null>(null);
	const uniformsRef = useRef<any>(null);
	const renderRef = useRef<() => void>(() => { });

	const RESOLUTION_WIDTH = store.resolution.width;
	const RESOLUTION_HEIGHT = store.resolution.height;

	const shift = 0.0;
	const isGradient = true;

	useEffect(() => {
		const canvas = canvasRef.current!;
		if (!canvas) return;

		const gl = canvas.getContext("webgl2", { premultipliedAlpha: false })!;
		if (!gl) {
			console.error("WebGL2 not supported");
			return;
		}
		glRef.current = gl;

		const vertexSource = `#version 300 es
    precision highp float;
    in vec2 a_position;
    out vec2 v_uv;

    void main() {
      v_uv = a_position * 0.5 + 0.5;
      gl_Position = vec4(a_position, 0.0, 1.0);
    }`;

		const fragmentSource = `#version 300 es
    precision highp float;

    in vec2 v_uv;
    out vec4 fragColor;

    uniform sampler2D u_image;
    uniform float u_imageAspect;
    uniform vec2 u_resolution;
    uniform float u_size;
    uniform float u_distortion;
    uniform float u_shift;
    uniform float u_margin;
    uniform float u_shadow;

    vec2 coverUV(vec2 uv) {
      float imgRatio = u_imageAspect;
      float screenRatio = u_resolution.x / u_resolution.y;
      vec2 outUV = uv;
      if (imgRatio > screenRatio) {
        float sx = screenRatio / imgRatio;

        outUV.x = (uv.x - 0.5) * sx + 0.5;
      } else {
        float sy = imgRatio / screenRatio;
        outUV.y = (uv.y - 0.5) * sy + 0.5;
      }
      return outUV;
    }

    void main() {
      vec2 imgUV = coverUV(v_uv);

      float m = clamp(u_margin, 0.0, 0.49);
      if (v_uv.x < m || v_uv.x > 1.0 - m || v_uv.y < m || v_uv.y > 1.0 - m) {
        fragColor = texture(u_image, imgUV);
        return;
      }

      float effectSize = 1.0 / pow(0.7 * (u_size + 0.5), 6.0);
      float stripeCount = effectSize;

      float coord = imgUV.x * stripeCount;
      float stripeIndex = floor(coord);
      float fracInStripe = fract(coord);

      float base = -pow(1.5 * fracInStripe, 3.0) + (0.5 + u_shift);
			float xDist = 0.5 + (base - 0.5) * u_distortion;

      float sampledX = (stripeIndex + xDist) / stripeCount;
      sampledX = clamp(sampledX, 0.0, 1.0);

      vec2 sampledUV = vec2(sampledX, imgUV.y);
      vec4 color = texture(u_image, sampledUV);;

			float shadowStrength = abs(base - 0.5) * (u_shadow * 0.3);
			color.rgb *= (1.0 - shadowStrength);

			fragColor = color;
    }`;

		function compileShader(shaderType: number, shaderSource: string) {
			const shader = gl.createShader(shaderType)!;
			gl.shaderSource(shader, shaderSource); // stores in gpu memory
			gl.compileShader(shader); // compile it
			if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
				console.error("Shader compile error:", gl.getShaderInfoLog(shader));
				gl.deleteShader(shader); // clean shader if err
				return null;
			}
			return shader;
		}

		function createProgram(
			vertexShaderSource: string,
			fragmentShaderSource: string,
		) {
			// compile both shaders
			const vertexShader = compileShader(gl.VERTEX_SHADER, vertexShaderSource);
			const fragmentShader = compileShader(
				gl.FRAGMENT_SHADER,
				fragmentShaderSource,
			);

			if (!vertexShader || !fragmentShader) return null;

			const program = gl.createProgram()!; // container holds both vertex and fragment
			gl.attachShader(program, vertexShader);
			gl.attachShader(program, fragmentShader);
			gl.linkProgram(program); // join into one usable gpu program
			if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
				console.error("Program link error:", gl.getProgramInfoLog(program));
				gl.deleteProgram(program);
				return null;
			}

			// clear indivicual shader files. already merged
			gl.detachShader(program, vertexShader);
			gl.detachShader(program, fragmentShader);
			gl.deleteShader(vertexShader);
			gl.deleteShader(fragmentShader);
			return program;
		}

		const program = createProgram(vertexSource, fragmentSource);
		if (!program) {
			console.error("Failed to create program");
			return;
		}
		programRef.current = program; // store accross re-render

		// Full-screen triangle
		const quadVerts = new Float32Array([-1, -1, 3, -1, -1, 3]);
		const vao = gl.createVertexArray()!;
		gl.bindVertexArray(vao);

		const posBuf = gl.createBuffer()!;

		gl.bindBuffer(gl.ARRAY_BUFFER, posBuf);
		gl.bufferData(gl.ARRAY_BUFFER, quadVerts, gl.STATIC_DRAW);

		const posLoc = gl.getAttribLocation(program, "a_position");
		gl.enableVertexAttribArray(posLoc);
		gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 0, 0);

		gl.bindVertexArray(null);

		gl.bindBuffer(gl.ARRAY_BUFFER, null);

		// Create texture placeholder
		const texture = gl.createTexture()!;
		texRef.current = texture;
		gl.bindTexture(gl.TEXTURE_2D, texture);

		if (bgImage.withImage) {
			// placeholder texture before image loads
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
			// gradient texture
			const gradCanvas = document.createElement("canvas");
			const ctx = gradCanvas.getContext("2d")!;

			if (isGradient) {
				const backgroundGradient = ctx.createLinearGradient(
					0,
					0,
					RESOLUTION_WIDTH,
					0
				);

				backgroundGradientPalettes.forEach((palette) => {
					palette.colors.forEach((color, index) => {
						const stop = index / (palette.colors.length - 1);
						const hex = `#${color}`;
						backgroundGradient.addColorStop(stop, hex);
					});
				});

				ctx.fillStyle = backgroundGradient;
				ctx.filter = "none";
			} else {
				ctx.fillStyle = "#5A9690"
			}
			
			// Work on direction of blur
			const filter = [
				`blur(${store.backgroundGradientFilters.blur / 8}px) `,
				`brightness(${store.backgroundGradientFilters.brightness}%) `,
				`contrast(${store.backgroundGradientFilters.contrast}%)`,
				`saturate(${store.backgroundGradientFilters.saturation}%)`
			].filter(Boolean).join(" ");

			ctx.filter = filter;
			ctx.fillRect(0, 0, RESOLUTION_WIDTH, RESOLUTION_WIDTH);
			ctx.filter = "none";

			// random wave shape on gradCanvas
			const ctxShapes = gradCanvas.getContext("2d")!;

			/* gradientShapePalettes.forEach((palette) => {
				drawWaveShape(ctxShapes, {
					x: Math.random() * 100,
					y: Math.random() * 100,
					palette: palette,
				});
			}); */

			// Upload gradient as WebGL texture
			gl.texImage2D(
				gl.TEXTURE_2D,
				0,
				gl.RGBA,

				gl.RGBA,
				gl.UNSIGNED_BYTE,

				gradCanvas,
			);
		}

		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
		gl.bindTexture(gl.TEXTURE_2D, null);

		// refrence to shader var
		const uniforms = {
			u_image: gl.getUniformLocation(program, "u_image"),
			u_imageAspect: gl.getUniformLocation(program, "u_imageAspect"),
			u_resolution: gl.getUniformLocation(program, "u_resolution"),
			u_size: gl.getUniformLocation(program, "u_size"),
			u_distortion: gl.getUniformLocation(program, "u_distortion"),
			u_shift: gl.getUniformLocation(program, "u_shift"),
			u_margin: gl.getUniformLocation(program, "u_margin"),
			u_shadow: gl.getUniformLocation(program, "u_shadow"),
		};
		uniformsRef.current = uniforms; // store accross re-render for later use

		function resizeCanvasToDisplaySize() {
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
		}

		function render() {
			if (!gl || !program) return;
			resizeCanvasToDisplaySize();

			gl.clearColor(0, 0, 0, 0);
			gl.clear(gl.COLOR_BUFFER_BIT);

			gl.useProgram(program); // activate gpu program
			gl.bindVertexArray(vao);

			gl.activeTexture(gl.TEXTURE0);
			gl.bindTexture(gl.TEXTURE_2D, texture);
			gl.uniform1i(uniforms.u_image, 0);

			// send dynamic value to shaders
			gl.uniform2f(uniforms.u_resolution, RESOLUTION_WIDTH, RESOLUTION_HEIGHT);
			gl.uniform1f(uniforms.u_size, sizeRef.current);
			gl.uniform1f(uniforms.u_distortion, distortionRef.current);
			gl.uniform1f(uniforms.u_shift, shift);
			gl.uniform1f(uniforms.u_margin, fractalMarginRef.current);
			gl.uniform1f(uniforms.u_shadow, fractalShadowRef.current);

			// default aspect ratio
			/* gl.uniform1f(uniforms.u_imageAspect, 1.0); */
			const screenAspect = RESOLUTION_WIDTH / RESOLUTION_HEIGHT;
			gl.uniform1f(uniforms.u_imageAspect, screenAspect);

			gl.drawArrays(gl.TRIANGLES, 0, 3);

			gl.bindVertexArray(null);
			gl.useProgram(null);
		}
		renderRef.current = render;

		// Load image only if withImage = true
		if (bgImage.withImage) {
			const img = new Image();
			img.crossOrigin = "anonymous";
			img.src = bgImage.src;
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

				if (programRef.current) glRef.current.deleteProgram(programRef.current);
				glRef.current = null;
			}
		};
	}, [
		bgImage.withImage,
		bgImage.src,
		RESOLUTION_WIDTH,
		RESOLUTION_HEIGHT,

		store.backgroundGradientFilters.blur,
		store.backgroundGradientFilters.brightness,
		store.backgroundGradientFilters.contrast,
		store.backgroundGradientFilters.saturation,

		store.shapeGradientFilters.blur,
		store.shapeGradientFilters.brightness,
		store.shapeGradientFilters.contrast,
		store.shapeGradientFilters.saturation
	]);

	// re-render shader when size change
	useEffect(() => {
		const gl = glRef.current;
		const program = programRef.current;
		const uniforms = uniformsRef.current;
		const render = renderRef.current;

		if (gl && program && uniforms) {
			gl.useProgram(program);
			gl.uniform1f(uniforms.u_size, size);
			gl.uniform1f(uniforms.u_distortion, distortion);
			gl.uniform1f(uniforms.u_margin, fractalMargin);
			gl.uniform1f(uniforms.u_shadow, fractalShadow);
			render();
		}
	});

	return (
		<canvas
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
