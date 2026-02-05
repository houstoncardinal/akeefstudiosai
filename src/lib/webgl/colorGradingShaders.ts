// WebGL2 GLSL shaders for real-time color grading

export const VERTEX_SHADER = `#version 300 es
in vec2 aPosition;
in vec2 aTexCoord;
out vec2 vTexCoord;

void main() {
  gl_Position = vec4(aPosition, 0.0, 1.0);
  vTexCoord = aTexCoord;
}
`;

export const FRAGMENT_SHADER = `#version 300 es
precision highp float;

in vec2 vTexCoord;
out vec4 fragColor;

uniform sampler2D uVideoTexture;

// Color grading
uniform float uContrast;
uniform float uSaturation;
uniform float uTemperature;
uniform float uTint;
uniform float uShadows;
uniform float uHighlights;
uniform vec3 uLift;
uniform vec3 uGamma;
uniform vec3 uGain;

// Effects
uniform float uGrainAmount;
uniform float uGrainSize;
uniform float uTime;
uniform float uVignetteAmount;
uniform float uVignetteMidpoint;
uniform float uVignetteFeather;

// Split view
uniform float uSplitPosition; // negative = disabled

uniform vec2 uResolution;

// --- Noise for film grain ---
float hash(vec2 p) {
  vec3 p3 = fract(vec3(p.xyx) * 0.1031);
  p3 += dot(p3, p3.yzx + 33.33);
  return fract((p3.x + p3.y) * p3.z);
}

float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  float a = hash(i);
  float b = hash(i + vec2(1.0, 0.0));
  float c = hash(i + vec2(0.0, 1.0));
  float d = hash(i + vec2(1.0, 1.0));
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(a, b, u.x) + (c - a) * u.y * (1.0 - u.x) + (d - b) * u.x * u.y;
}

// --- Color pipeline ---
vec3 applyLiftGammaGain(vec3 color, vec3 lift, vec3 gamma, vec3 gain) {
  vec3 liftAdjust = lift * (1.0 - color);
  vec3 result = gain * (liftAdjust + color);
  vec3 safeGamma = max(gamma, vec3(0.01));
  result = pow(max(result, vec3(0.0)), 1.0 / safeGamma);
  return clamp(result, 0.0, 1.0);
}

vec3 applyContrast(vec3 color, float contrast) {
  return clamp((color - 0.5) * contrast + 0.5, 0.0, 1.0);
}

vec3 applySaturation(vec3 color, float saturation) {
  float luma = dot(color, vec3(0.2126, 0.7152, 0.0722));
  return clamp(mix(vec3(luma), color, saturation), 0.0, 1.0);
}

vec3 applyTemperatureTint(vec3 color, float temperature, float tint) {
  float tempFactor = temperature / 100.0;
  color.r += tempFactor * 0.1;
  color.b -= tempFactor * 0.1;
  float tintFactor = tint / 100.0;
  color.g -= tintFactor * 0.1;
  return clamp(color, 0.0, 1.0);
}

vec3 applyShadowsHighlights(vec3 color, float shadows, float highlights) {
  float luma = dot(color, vec3(0.2126, 0.7152, 0.0722));
  float shadowMask = 1.0 - smoothstep(0.0, 0.5, luma);
  float highlightMask = smoothstep(0.5, 1.0, luma);
  float shadowAdjust = shadows / 100.0;
  float highlightAdjust = highlights / 100.0;
  color += shadowAdjust * shadowMask * 0.3;
  color += highlightAdjust * highlightMask * 0.3;
  return clamp(color, 0.0, 1.0);
}

float applyVignette(vec2 uv, float amount, float midpoint, float feather) {
  vec2 center = uv - 0.5;
  float dist = length(center) * 2.0;
  float mid = midpoint / 100.0;
  float feath = max(feather / 100.0, 0.01);
  float vig = smoothstep(mid - feath, mid + feath, dist);
  return 1.0 - vig * amount;
}

void main() {
  vec2 uv = vTexCoord;
  vec4 texColor = texture(uVideoTexture, uv);
  vec3 original = texColor.rgb;
  vec3 color = original;

  // Full color pipeline
  color = applyLiftGammaGain(color, uLift, uGamma, uGain);
  color = applyContrast(color, uContrast);
  color = applySaturation(color, uSaturation);
  color = applyTemperatureTint(color, uTemperature, uTint);
  color = applyShadowsHighlights(color, uShadows, uHighlights);

  // Film grain
  if (uGrainAmount > 0.001) {
    float grainScale = uResolution.x / max(uGrainSize, 0.1);
    float n = noise(uv * grainScale + vec2(uTime * 1000.0)) - 0.5;
    color += n * uGrainAmount * 0.15;
    color = clamp(color, 0.0, 1.0);
  }

  // Vignette
  if (uVignetteAmount > 0.001) {
    float vig = applyVignette(uv, uVignetteAmount, uVignetteMidpoint, uVignetteFeather);
    color *= vig;
  }

  // Split view: original on left
  if (uSplitPosition >= 0.0 && uv.x < uSplitPosition) {
    color = original;
  }

  fragColor = vec4(color, 1.0);
}
`;
