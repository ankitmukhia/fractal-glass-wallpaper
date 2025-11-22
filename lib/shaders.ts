/*
 * Vertex is a point where two or more line meets.
 * Each time a shape is rendered, the vertex shader is run for each vertex in the shape.
 */
export const vertexShaderSource = `#version 300 es
    precision highp float;
    in vec2 a_position;
    out vec2 v_uv;

    void main() {
      v_uv = a_position * 0.5 + 0.5;
      gl_Position = vec4(a_position, 0.0, 1.0);
    }`;

/*
 * The fragment shader is called once for every pixel on each shape to be drawn.
 * Its job is to determine the color of that pixel by figuring out which texel (that is, the pixel from within the shape's texture) to apply to the pixel.
 * */
export const fragmentShaderSource = `#version 300 es
    precision highp float;

    in vec2 v_uv;
    out vec4 fragColor;

    uniform sampler2D u_image;
		uniform sampler2D u_grainTexture;
    uniform float u_imageAspect;
    uniform vec2 u_resolution;
    uniform float u_size;
    uniform float u_distortion;
    uniform float u_shift;
    uniform float u_margin;
    uniform float u_shadow;
		uniform float u_grainIntensity;
		uniform vec2 u_stretch;
		uniform float u_blur;

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

		vec4 blur(sampler2D tex, vec2 uv, float amount) {
      if (amount <= 0.0) {
        return texture(tex, uv);
      }

      vec4 color = vec4(0.0);
      float blurSize = amount * 0.01; // Scale blur amount
      
      // 9-tap box blur
      float total = 0.0;
      for (float x = -1.0; x <= 1.0; x += 1.0) {
        for (float y = -1.0; y <= 1.0; y += 1.0) {
          vec2 offset = vec2(x, y) * blurSize;
          color += texture(tex, uv + offset);

          total += 1.0;
        }

      }
      
      return color / total;
    }

    void main() {
      vec2 imgUV = coverUV(v_uv);

      float m = clamp(u_margin, 0.0, 0.49);

			// margin areas - no distortion effect
			if (v_uv.x < m || v_uv.x > 1.0 - m || v_uv.y < m || v_uv.y > 1.0 - m) {
        vec4 color = texture(u_image, imgUV);
        
        // Apply grain to margin areas
        if (u_grainIntensity > 0.0) {
          float grainValue = texture(u_grainTexture, v_uv).r;
          float grain = (grainValue - 0.5) * u_grainIntensity;
          color.rgb += grain;
        }
        
        fragColor = color;

        return;
      }

			// Apply stretch to the UV coordinates
      vec2 stretchedUV = v_uv;
      stretchedUV.y = (v_uv.y - 0.5) / (1.0 + u_stretch.y) + 0.5;
      
      // Recalculate imgUV with stretch applied
      imgUV = coverUV(stretchedUV);

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

			// Apply blur if enabled
		  vec4 color;
      if (u_blur > 0.0) {
        color = blur(u_image, sampledUV, u_blur * 7.0);
      } else {
        color = texture(u_image, sampledUV);
      }

			float shadowStrength = abs(base - 0.5) * (u_shadow * 0.3);
			color.rgb *= (1.0 - shadowStrength);

			// Apply grain on top of everything
      if (u_grainIntensity > 0.0) {
        float grainValue = texture(u_grainTexture, v_uv).r;
        float grain = (grainValue - 0.5) * u_grainIntensity;
        color.rgb += grain;
      }

			fragColor = color;
    }`;
