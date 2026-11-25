/* Slat field fragment shader (moved from tools/motion/lab-scene.src.js). One full-screen
   plane; every capsule's brightness is computed here from the bench state. */
export const fragmentShader = /* glsl */ `
  precision highp float;
  uniform vec2 uRes;        // drawing-buffer pixels
  uniform float uPR;        // device pixel ratio
  uniform float uTime;
  uniform vec3 uMix;        // research, applications, systems
  uniform float uNoise;     // 0..1 from the selected privacy budget
  uniform float uRanked;    // 0 random order .. 1 model ranking
  uniform float uStep;      // 0..3 lifecycle step (fractional while moving)
  uniform vec2 uPointer;    // css px, origin bottom-left
  uniform vec4 uRipple;     // xy css px, z start time, w strength
  uniform vec3 uInk;
  uniform vec3 uPink;
  uniform vec2 uCell;       // slat pitch in css px

  float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123); }
  float noise(vec2 p) {
    vec2 i = floor(p), f = fract(p);
    vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x),
               mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x), u.y);
  }

  void main() {
    vec2 px = gl_FragCoord.xy / uPR;
    vec2 size = uRes / uPR;
    vec2 id = floor(px / uCell);
    vec2 grid = floor(size / uCell);
    vec2 uv = (id + 0.5) / grid;

    // Capsule inside its cell.
    vec2 c = mod(px, uCell) - uCell * 0.5;
    float radius = uCell.x * 0.26;
    float halfLen = uCell.y * 0.36;
    vec2 q = vec2(c.x, max(abs(c.y) - (halfLen - radius), 0.0));
    float shape = 1.0 - smoothstep(-0.7, 0.7, length(q) - radius);

    // Research: a drifting field with privacy noise on top.
    float field = noise(id * vec2(0.11, 0.2) + vec2(uTime * 0.12, -uTime * 0.07));
    field = 0.5 * field + 0.5 * noise(id * vec2(0.04, 0.08) - uTime * 0.05);
    float flicker = hash(id + floor(uTime * (3.0 + 11.0 * uNoise)) * 0.137);
    float research = clamp(0.12 + 0.75 * field * field + (flicker - 0.5) * 0.85 * uNoise, 0.0, 1.0);
    float researchPink = step(0.975 - 0.05 * uNoise, flicker) * step(0.25, research);

    // Applications: the review queue sorts from random order into the ranking.
    float shuffled = hash(id * 1.731);
    float ranked = pow(1.0 - uv.x, 1.6) * (0.85 + 0.15 * hash(id * 9.1));
    float apps = mix(shuffled * 0.7, ranked, uRanked);
    apps *= 0.85 + 0.15 * sin(uTime * 0.8 + uv.y * 5.0 + uv.x * 3.0);
    float top = 1.0 - step(0.1, uv.x);
    float threshold = mix(0.30, mix(0.25, 0.75, top), uRanked);
    float appsPink = 1.0 - step(threshold, hash(id * 3.17));

    // Systems: four lifecycle bands.
    float band = floor(uv.x * 4.0);
    float current = 1.0 - smoothstep(0.35, 0.65, abs(band - uStep));
    float passed = 1.0 - smoothstep(-0.2, 0.2, band - uStep - 0.5);
    float reach = (uStep + 1.0) / 4.0;
    float sweep = exp(-pow((uv.x - fract(uTime * 0.22) * reach) * 14.0, 2.0)) * passed;
    float gutter = smoothstep(0.0, 0.02, abs(fract(uv.x * 4.0) - 0.5) - 0.47);
    float systems = (0.08 + 0.18 * passed + 0.55 * current * (0.65 + 0.35 * sin(uTime * 2.4 - uv.y * 9.0)) + 0.4 * sweep) * (1.0 - gutter * 0.9);
    float critical = current * (1.0 - smoothstep(0.3, 0.7, abs(uStep - 2.0)));
    float systemsPink = critical * step(0.35, hash(id * 5.3));

    float value = research * uMix.x + apps * uMix.y + systems * uMix.z;
    float pink = researchPink * uMix.x + appsPink * uMix.y * step(0.08, apps) + systemsPink * uMix.z;

    // Pointer lens and click ripple (css px).
    vec2 centre = (id + 0.5) * uCell;
    float lens = exp(-dot(centre - uPointer, centre - uPointer) / (2.0 * 70.0 * 70.0));
    float age = uTime - uRipple.z;
    float ring = exp(-pow((length(centre - uRipple.xy) - age * 520.0) / 46.0, 2.0)) * exp(-age * 1.3) * uRipple.w;
    value = clamp(value + lens * 0.55 + ring * 0.8, 0.0, 1.0);

    // Soft edges so the field sits in the page rather than on it.
    float edge = smoothstep(0.0, 0.06, uv.x) * smoothstep(1.0, 0.94, uv.x)
               * smoothstep(0.0, 0.1, uv.y) * smoothstep(1.0, 0.9, uv.y);

    vec3 grey = mix(vec3(0.13), uInk, value * value);
    vec3 colour = mix(grey, uPink, pink);
    float alpha = shape * edge * mix(0.35 + 0.65 * value, 0.95, pink);
    gl_FragColor = vec4(colour * alpha, alpha);
  }
`;

export const vertexShader = /* glsl */ `
  void main() { gl_Position = vec4(position.xy, 0.0, 1.0); }
`;
