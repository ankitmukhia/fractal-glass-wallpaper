// next refactoring and optimize, figure our what making range slower/laggie.

import { useEffect, useRef } from "react";
import { drawBlobShape } from "@/lib/utils/shape";
import { useStore } from "@/stores/fractal-store";
import { vertexShaderSource, fragmentShaderSource } from "@/lib/shaders";

// import { applyGrainEffect } from "@/lib/utils/grain-effects";

/*
 * 1. Define two shders(vertex, fragment)
 * 2. Pass them to webgl/creates a shader of the given type
 * 3. Compile theme
 * 4. Link them together
 *
 * Uniforms: are similar to js global variables
 * Uniform locations: help connect js to webgl program
 * getAttribLocation: get location of the uniform
 * setUniform: send data to the uniform / setter
 * Buffer: buffers are used to transfer data from JavaScript to the GPU for processing shaders.
 */

/*
 * Optimize webgl
 * 1. use useMemo to prevent unwanted calculation.
 * 2. memo to prevent unwant component re-render.
 * 3. use webgl performance features such as requestAnimationFrame
 */

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
  gl.shaderSource(shader, shaderSource); // stores in gpu memory/send it to shader object
  gl.compileShader(shader); // compile shader program

  // see it if compiles successfully
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    console.error("Shader compile error:", gl.getShaderInfoLog(shader));
    gl.deleteShader(shader); // clean shader if err
    return null;
  }
  return shader;
};

const createProgram = (
  gl: WebGL2RenderingContext,
  vertexShaderSource: string,
  fragmentShaderSource: string,
) => {
  // compile both shaders
  const vertexShader = compileShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
  const fragmentShader = compileShader(
    gl,
    gl.FRAGMENT_SHADER,
    fragmentShaderSource,
  );

  if (!vertexShader || !fragmentShader) return null;

  // create the shader program
  const program = gl.createProgram();
  if (!program) {
    console.error("Failed to create program");
    return null;
  }
  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);
  gl.linkProgram(program); // join into one usable gpu program/linking

  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    console.error("Program link error:", gl.getProgramInfoLog(program));
    gl.deleteProgram(program);
    return null;
  }

  // clear indivicual shader files. it already  already merged
  gl.detachShader(program, vertexShader);
  gl.detachShader(program, fragmentShader);
  gl.deleteShader(vertexShader);
  gl.deleteShader(fragmentShader);
  return program;
};

export const FluttedGlass = () => {
  const store = useStore();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const programRef = useRef<WebGLProgram | null>(null);
  const glRef = useRef<WebGL2RenderingContext | null>(null);

  const texRef = useRef<WebGLTexture | null>(null);
  const uniformsRef = useRef<UniformTypes>(null);
  const grainTextureRef = useRef<WebGLTexture | null>(null);
  const renderRef = useRef<() => void>(() => {});

  const RESOLUTION_WIDTH = store.resolution.width!;
  const RESOLUTION_HEIGHT = store.resolution.height!;

  useEffect(() => {
    const canvas = canvasRef.current!;
    if (!canvas) return;

    const gl = canvas.getContext("webgl2", {
      premultipliedAlpha: false,
    })!;

    if (!gl) {
      console.error("WebGL2 not supported");
      return;
    }
    glRef.current = gl;

    // create the shader program
    const program = createProgram(gl, vertexShaderSource, fragmentShaderSource);
    if (!program) {
      console.error("Failed to create program");
      return;
    }
    programRef.current = program; // store accross re-render

    const vao = gl.createVertexArray();
    if (!vao) {
      console.error("Failed to create VAO");
      return;
    }
    gl.bindVertexArray(vao);

    // create buffer for triangle's positions/storing vertex data etc.
    const posBuf = gl.createBuffer();
    if (!posBuf) {
      console.error("Failed to create position buffer");
      return;
    }

    // posBuf buffer will be responsible for providing vertex data
    gl.bindBuffer(gl.ARRAY_BUFFER, posBuf);

    // Array of position for each vertex of triangle/shaape.
    const quadVerts = new Float32Array([-1, -1, 3, -1, -1, 3]);

    // fill the current buffer with positions and pass into webgl to build the shape
    gl.bufferData(gl.ARRAY_BUFFER, quadVerts, gl.STATIC_DRAW);

    const posLoc = gl.getAttribLocation(program, "a_position");
    gl.enableVertexAttribArray(posLoc);
    gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 0, 0);

    gl.bindVertexArray(null);
    gl.bindBuffer(gl.ARRAY_BUFFER, null);

    // Create main textture placeholder
    const texture = gl.createTexture();
    if (!texture) {
      console.log("Failed to create main texture");
      return;
    }
    texRef.current = texture;
    gl.bindTexture(gl.TEXTURE_2D, texture);

    if (store.withImage) {
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

        ctx.filter = "none";
        ctx.fillStyle = backgroundGradient;
      } else {
        ctx.fillStyle = `#${store.backgroundSolid}`;
      }

      // Work on direction of blur
      const filter = [
        store.backgroundGradientFilters.blur > 0 &&
          `blur(${store.backgroundGradientFilters.blur}px)`,
        `brightness(${store.backgroundGradientFilters.brightness}%) `,
        `contrast(${store.backgroundGradientFilters.contrast}%)`,
        `saturate(${store.backgroundGradientFilters.saturation}%)`,
      ]
        .filter(Boolean)
        .join(" ");

      ctx.filter = filter;
      ctx.fillRect(0, 0, RESOLUTION_WIDTH, RESOLUTION_HEIGHT);

      store.newShape.forEach((color) => {
        drawBlobShape(ctx, color, "");
      });

      // Upload gradient as WebGL texture
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
    const grainCanvas = document.createElement("canvas");
    grainCanvas.width = RESOLUTION_WIDTH;
    grainCanvas.height = RESOLUTION_HEIGHT;
    const grainCtx = grainCanvas.getContext("2d");
    if (!grainCtx) return;

    const grainImageData = grainCtx.createImageData(
      RESOLUTION_WIDTH,
      RESOLUTION_HEIGHT,
    );
    const grainData = grainImageData.data;

    // Generate random noise for grain
    for (let i = 0; i < grainData.length; i += 4) {
      const noise = Math.random() * 255;
      grainData[i] = noise; // R
      grainData[i + 1] = noise; // G
      grainData[i + 2] = noise; // B
      grainData[i + 3] = 255; // A
    }

    grainCtx.putImageData(grainImageData, 0, 0);

    const grainTexture = gl.createTexture()!;
    grainTextureRef.current = grainTexture;
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

    // refrence to shader var
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
      u_grainIntensity: gl.getUniformLocation(program, "u_grainIntensity"),
      u_stretch: gl.getUniformLocation(program, "u_stretch"),
      u_blur: gl.getUniformLocation(program, "u_blur"),
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

      // Bind main texture to TEXTURE0
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, texture);
      gl.uniform1i(uniforms.u_image, 0);

      // Bind grain texture to TEXTURE1
      gl.activeTexture(gl.TEXTURE1);
      gl.bindTexture(gl.TEXTURE_2D, grainTexture);
      gl.uniform1i(uniforms.u_grainTexture, 1);

      // send dynamic value to shaders
      gl.uniform1i(uniforms.u_image, 0);
      gl.uniform2f(uniforms.u_resolution, RESOLUTION_WIDTH, RESOLUTION_HEIGHT);
      gl.uniform1f(uniforms.u_size, store.fractalSize);
      gl.uniform1f(uniforms.u_distortion, store.distortion);
      gl.uniform1f(uniforms.u_shift, 0.0);
      gl.uniform1f(uniforms.u_margin, store.fractalMargin);
      gl.uniform1f(uniforms.u_shadow, store.fractalShadow);
      gl.uniform1f(uniforms.u_grainIntensity, store.grainIntensity / 100);
      gl.uniform2f(uniforms.u_stretch, 1.0, store.stretch);
      gl.uniform1f(uniforms.u_blur, store.fractalBlur);

      // default aspect ratio
      /* gl.uniform1f(uniforms.u_imageAspect, 1.0); */
      const screenAspect = RESOLUTION_WIDTH / RESOLUTION_HEIGHT;
      gl.uniform1f(uniforms.u_imageAspect, screenAspect);

      gl.drawArrays(gl.TRIANGLES, 0, 3); // execute shader on gpu

      gl.bindVertexArray(null);
      gl.useProgram(null);
    }
    renderRef.current = render;

    // Load image only if withImage = true
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

        if (programRef.current) glRef.current.deleteProgram(programRef.current);
        glRef.current = null;
      }
    };
  }, [
    RESOLUTION_WIDTH,
    RESOLUTION_HEIGHT,

    store.fractalSize,
    store.distortion,
    store.fractalMargin,
    store.fractalShadow,

    store.backgroundGradientFilters.blur,
    store.backgroundGradientFilters.brightness,
    store.backgroundGradientFilters.contrast,
    store.backgroundGradientFilters.saturation,

    store.shapeGradientFilters.blur,
    store.shapeGradientFilters.brightness,
    store.shapeGradientFilters.contrast,
    store.shapeGradientFilters.saturation,

    store.shapeGradient,
    store.newShape,
    store.newBackgroundGradient,
    store.currentPalette,
    store.grainIntensity,

    store.backgroundSolid,
    store.isGradient,
    store.backgroundImage.src,
    store.withImage,
  ]);

  // re-render shader when size change
  /* useEffect(() => {
		const gl = glRef.current;
		const program = programRef.current;
		const uniforms = uniformsRef.current;
		const render = renderRef.current;

		if (gl && program && uniforms) {
			gl.useProgram(program);
			gl.uniform1f(uniforms.u_size, store.fractalSize);
			gl.uniform1f(uniforms.u_distortion, store.distortion);
			gl.uniform1f(uniforms.u_margin, store.fractalMargin);
			gl.uniform1f(uniforms.u_shadow, store.fractalShadow);
			render();
		}
	}, [store.distortion]); */

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
