"use client";

import { useEffect, useRef, useState } from "react";

const imageUrl =
  "https://images.unsplash.com/photo-1761846532727-2313b72dfe23?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=1470";

export const FluttedGlass = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const programRef = useRef<WebGLProgram | null>(null);
  const glRef = useRef<WebGL2RenderingContext | null>(null);
  const texRef = useRef<WebGLTexture | null>(null);
  const uniformsRef = useRef<any>(null);
  const renderRef = useRef<() => void>(() => {});

  // Desired CSS size (fixed)
  const CSS_WIDTH = 1200;
  const CSS_HEIGHT = 800;

  const distortion = 0.5;
  const shift = 0.0;
  const margin = 0.0;

  // default size changed to 0.29 per request
  const [size, setSize] = useState<number>(0.24);
  const sizeRef = useRef<number>(size);
  sizeRef.current = size;

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

    // fragment shader updated to compute effectSize exactly like the original shader
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

    // cover mapping (same as original)
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

      // use the original shader's non-linear mapping
      float effectSize = 1.0 / pow(0.7 * (u_size + 0.5), 6.0);

      // effectSize behaves like stripeCount (number of ribs across)
      float stripeCount = effectSize;

      // coordinates within the tiled grid
      float coord = imgUV.x * stripeCount;
      float stripeIndex = floor(coord);
      float fracInStripe = fract(coord);

      // "lines" distortion profile (original)
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

    // full-screen triangle
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

    // create texture placeholder
    const texture = gl.createTexture()!;
    texRef.current = texture;
    gl.bindTexture(gl.TEXTURE_2D, texture);
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

    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = imageUrl;
    img.onload = () => {
      if (!gl) return;
      gl.bindTexture(gl.TEXTURE_2D, texture);

      // flip Y so image appears upright
      gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1);

      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);
      gl.bindTexture(gl.TEXTURE_2D, null);
      render();
    };
    img.onerror = (e) => {
      console.error("Failed to load image", e);
    };

    function resizeCanvasToDisplaySize() {
      const width = CSS_WIDTH;
      const height = CSS_HEIGHT;
      if (canvas.width !== width || canvas.height !== height) {
        canvas.width = width;
        canvas.height = height;
        canvas.style.width = `${CSS_WIDTH}px`;
        canvas.style.height = `${CSS_HEIGHT}px`;
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

      // pass CSS dimensions as resolution
      gl.uniform2f(uniforms.u_resolution, CSS_WIDTH, CSS_HEIGHT);
      // supply u_size from slider
      gl.uniform1f(uniforms.u_size, sizeRef.current);
      gl.uniform1f(uniforms.u_distortion, distortion);
      gl.uniform1f(uniforms.u_shift, shift);
      gl.uniform1f(uniforms.u_margin, margin);

      if (img.naturalHeight > 0) {
        gl.uniform1f(
          uniforms.u_imageAspect,
          img.naturalWidth / img.naturalHeight,
        );
      } else {
        gl.uniform1f(uniforms.u_imageAspect, 1.0);
      }

      gl.drawArrays(gl.TRIANGLES, 0, 3);

      gl.bindVertexArray(null);
      gl.useProgram(null);
    }

    renderRef.current = render;

    resizeCanvasToDisplaySize();
    if (img.complete && img.naturalWidth) {
      gl.bindTexture(gl.TEXTURE_2D, texture);
      gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);
      gl.bindTexture(gl.TEXTURE_2D, null);
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

  // Slider handler: update size ref & uniform directly and re-render
  function handleSizeChange(e: React.ChangeEvent<HTMLInputElement>) {
    const v = parseFloat(e.target.value);
    setSize(v);
    sizeRef.current = v;

    const gl = glRef.current;
    const program = programRef.current;
    const uniforms = uniformsRef.current;
    const render = renderRef.current;

    if (gl && program && uniforms) {
      gl.useProgram(program);
      gl.uniform1f(uniforms.u_size, v);
      render();
    }
  }

  return (
    // fixed full-viewport wrapper to guarantee centering; slider placed below canvas
    <div
      style={{
        position: "fixed",
        inset: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "transparent",
        flexDirection: "column",
        gap: 16,
      }}
    >
      <canvas
        ref={canvasRef}
        width={CSS_WIDTH}
        height={CSS_HEIGHT}
        style={{
          display: "block",
          width: `${CSS_WIDTH}px`,
          height: `${CSS_HEIGHT}px`,
          boxShadow: "0 8px 24px rgba(0,0,0,0.15)",
          borderRadius: 8,
          background: "white",
        }}
      />
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <label style={{ fontSize: 13, color: "#222" }}>size</label>
        <input
          aria-label="Fluted glass size"
          type="range"
          min={0.01}
          max={1.0}
          step={0.01}
          value={size}
          onChange={handleSizeChange}
          style={{ width: 300 }}
        />
        <div
          style={{ minWidth: 44, textAlign: "right", fontFamily: "monospace" }}
        >
          {Number(size).toFixed(2)}
        </div>
      </div>
    </div>
  );
};
