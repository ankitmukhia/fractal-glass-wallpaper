import { useEffect, useRef } from "react";
import { drawWaveShape } from "@/lib/utils/shape";
import { gradientPalettes, backgroundGradientPalettes } from "@/lib/constants";
import { useStore } from "@/stores/fractal-store";

const imageUrl =
	"https://images.unsplash.com/photo-1750593693963-94991e151e77?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=1170";

export const FluttedGlass = ({ size, sizeRef }: {
	size: number,
	sizeRef: any
}) => {
	const store = useStore();
	const canvasRef = useRef<HTMLCanvasElement | null>(null);
	const programRef = useRef<WebGLProgram | null>(null);
	const glRef = useRef<WebGL2RenderingContext | null>(null);
	const texRef = useRef<WebGLTexture | null>(null);
	const uniformsRef = useRef<any>(null);
	const renderRef = useRef<() => void>(() => { });

	const RESOLUTION_WIDTH = store.resolution.width;
	const RESOLUTION_HEIGHT = store.resolution.height;

	// Toggle between image and solid color
	const withImage = false;

	const distortion = 1.0;
	const shift = 0.0;
	const margin = 0.0;

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
      fragColor = texture(u_image, sampledUV);
    }`;

		function compileShader(type: number, source: string) {
			const s = gl.createShader(type)!;
			gl.shaderSource(s, source);
			gl.compileShader(s);
			if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
				console.error("Shader compile error:", gl.getShaderInfoLog(s));
				gl.deleteShader(s);
				return null;
			}
			return s;
		}


		function createProgram(vsSource: string, fsSource: string) {
			const vs = compileShader(gl.VERTEX_SHADER, vsSource);
			const fs = compileShader(gl.FRAGMENT_SHADER, fsSource);

			if (!vs || !fs) return null;
			const p = gl.createProgram()!;
			gl.attachShader(p, vs);
			gl.attachShader(p, fs);
			gl.linkProgram(p);
			if (!gl.getProgramParameter(p, gl.LINK_STATUS)) {
				console.error("Program link error:", gl.getProgramInfoLog(p));
				gl.deleteProgram(p);
				return null;
			}
			gl.detachShader(p, vs);
			gl.detachShader(p, fs);
			gl.deleteShader(vs);
			gl.deleteShader(fs);
			return p;
		}

		const program = createProgram(vertexSource, fragmentSource);
		if (!program) {
			console.error("Failed to create program");
			return;
		}
		programRef.current = program;

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


		if (withImage) {
			// placeholder magenta texture before image loads
			gl.texImage2D(
				gl.TEXTURE_2D,
				0,
				gl.RGBA,
				1,
				1,
				0,
				gl.RGBA,
				gl.UNSIGNED_BYTE,
				new Uint8Array([255, 0, 255, 255]),
			);
		} else {
			// gradient texture
			const gradCanvas = document.createElement("canvas");
			const ctx = gradCanvas.getContext("2d")!;

			const backgroundGradient = ctx.createLinearGradient(0, 0, RESOLUTION_WIDTH, RESOLUTION_HEIGHT);

			backgroundGradientPalettes.forEach((palette) => {
				palette.colors.forEach((color, index) => {
					const stop = index / (palette.colors.length - 1);

					const rgba = `rgba(${color.r}, ${color.g}, ${color.b})`
					backgroundGradient.addColorStop(stop, rgba)
				})
			})

			ctx.fillStyle = backgroundGradient;
			ctx.filter = `blur(50px) brightness(100%) contrast(100%) saturate(100%)`;
			ctx.fillRect(0, 0, RESOLUTION_WIDTH, RESOLUTION_WIDTH);
			ctx.filter = "none"

			// random wave shape on gradCanvas 
			const ctxShapes = gradCanvas.getContext("2d")!;

			gradientPalettes.forEach((palette) => {
				drawWaveShape(ctxShapes,
					{
						x: Math.random() * 100,
						y: Math.random() * 100,
						palette: palette,
					}
				);
			});

			// Upload gradient as WebGL texture
			gl.texImage2D(
				gl.TEXTURE_2D,
				0,
				gl.RGBA,

				gl.RGBA,
				gl.UNSIGNED_BYTE,

				gradCanvas
			);
		}

		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
		gl.bindTexture(gl.TEXTURE_2D, null);

		const uniforms = {
			u_image: gl.getUniformLocation(program, "u_image"),
			u_imageAspect: gl.getUniformLocation(program, "u_imageAspect"),
			u_resolution: gl.getUniformLocation(program, "u_resolution"),
			u_size: gl.getUniformLocation(program, "u_size"),
			u_distortion: gl.getUniformLocation(program, "u_distortion"),
			u_shift: gl.getUniformLocation(program, "u_shift"),

			u_margin: gl.getUniformLocation(program, "u_margin"),
		};
		uniformsRef.current = uniforms;

		function resizeCanvasToDisplaySize() {
			if (canvas.width !== RESOLUTION_WIDTH || canvas.height !== RESOLUTION_HEIGHT) {
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

			gl.useProgram(program);
			gl.bindVertexArray(vao);

			gl.activeTexture(gl.TEXTURE0);
			gl.bindTexture(gl.TEXTURE_2D, texture);
			gl.uniform1i(uniforms.u_image, 0);

			gl.uniform2f(uniforms.u_resolution, RESOLUTION_WIDTH, RESOLUTION_HEIGHT);
			gl.uniform1f(uniforms.u_size, sizeRef.current);
			gl.uniform1f(uniforms.u_distortion, distortion);
			gl.uniform1f(uniforms.u_shift, shift);
			gl.uniform1f(uniforms.u_margin, margin);

			if (withImage) {
				gl.uniform1f(uniforms.u_imageAspect, 1.0);
			} else {
				gl.uniform1f(uniforms.u_imageAspect, 1.0);
			}

			gl.drawArrays(gl.TRIANGLES, 0, 3);

			gl.bindVertexArray(null);
			gl.useProgram(null);
		}

		renderRef.current = render;

		// Load image only if withImage = true
		if (withImage) {
			const img = new Image();
			img.crossOrigin = "anonymous";
			img.src = imageUrl;
			img.onload = () => {
				if (!gl) return;
				gl.bindTexture(gl.TEXTURE_2D, texture);
				gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1);
				gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);

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
	}, []);

	// re-render shader when size change
	useEffect(() => {
		const gl = glRef.current;
		const program = programRef.current;
		const uniforms = uniformsRef.current;
		const render = renderRef.current;

		if (gl && program && uniforms) {
			gl.useProgram(program);
			gl.uniform1f(uniforms.u_size, size);
			render();
		}
	})

	return (
		<canvas
			ref={canvasRef}
			width={store.resolution.width}
			height={store.resolution.height}
			style={{
				width: "100%",
				height: "100%",
				boxShadow: "0 8px 24px rgba(0,0,0,0.15)",
				borderRadius: 50,
			}}
		/>
	);
};
