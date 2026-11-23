/*
 * Slat field — the hero instrument (Three.js, one full-screen shader).
 *
 * A grid of small capsules ("slats") on black. Each slat's brightness is set
 * per mode by the bench beside it:
 *
 *   research      a slow noise field plus flicker. Flicker rate and strength
 *                 follow the selected privacy budget: lower epsilon, stronger
 *                 privacy, more noise. A few slats light fuchsia.
 *   applications  columns are the review queue, left to right. In random order
 *                 30% of slats in every column are fuchsia (labelled prevalence);
 *                 under the model's ranking the field sorts bright-to-dark and the
 *                 leftmost tenth is 75% fuchsia (prevalence x Lift@10% 2.5), the
 *                 rest 25%, so the overall share stays 30%.
 *   systems       four vertical bands, one per order-lifecycle step. Steps already
 *                 passed hold a dim light, the active one pulses, a signal sweeps
 *                 through what has happened. The webhook step (03) is fuchsia.
 *
 * The pointer lifts slats under it; a click sends a ripple. It illustrates the
 * bench, it is not data: aria-hidden, no labels. Rendering stops off screen, in
 * hidden tabs and under reduced motion (one still frame per state change).
 *
 * Built by tools/motion/build.mjs into assets/js/lab-scene.js.
 */
import {
  Color,
  Mesh,
  OrthographicCamera,
  PlaneGeometry,
  Scene,
  ShaderMaterial,
  Vector2,
  Vector3,
  Vector4,
  WebGLRenderer,
} from "three";

const vertexShader = /* glsl */ `
  void main() { gl_Position = vec4(position.xy, 0.0, 1.0); }
`;

const fragmentShader = /* glsl */ `
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

const MODES = {
  research: [1, 0, 0],
  applications: [0, 1, 0],
  systems: [0, 0, 1],
};

export function mountLabScene(host, { gsap, reduced, compact = false } = {}) {
  let renderer;
  try {
    renderer = new WebGLRenderer({ antialias: false, alpha: true, powerPreference: "high-performance" });
  } catch {
    return null;
  }
  if (!renderer.getContext()) return null;
  const canvas = renderer.domElement;
  canvas.setAttribute("aria-hidden", "true");
  host.prepend(canvas);
  renderer.setClearColor(0x000000, 0);
  const pixelRatio = Math.min(window.devicePixelRatio || 1, compact ? 1.5 : 2);
  renderer.setPixelRatio(pixelRatio);

  const scene = new Scene();
  const camera = new OrthographicCamera(-1, 1, 1, -1, 0, 1);
  const uniforms = {
    uRes: { value: new Vector2(1, 1) },
    uPR: { value: pixelRatio },
    uTime: { value: 0 },
    uMix: { value: new Vector3(...MODES.research) },
    uNoise: { value: 1 },
    uRanked: { value: 1 },
    uStep: { value: 0 },
    uPointer: { value: new Vector2(-9999, -9999) },
    uRipple: { value: new Vector4(0, 0, -99, 0) },
    uInk: { value: new Color("#f2f0ec") },
    uPink: { value: new Color("#ff3d9a") },
    uCell: { value: new Vector2(compact ? 10 : 12, compact ? 26 : 30) },
  };
  const plane = new Mesh(new PlaneGeometry(2, 2), new ShaderMaterial({ vertexShader, fragmentShader, uniforms, transparent: true }));
  plane.frustumCulled = false;
  scene.add(plane);

  const draw = () => renderer.render(scene, camera);
  const resize = () => {
    const { width, height } = host.getBoundingClientRect();
    if (!width || !height) return;
    renderer.setSize(width, height, false);
    renderer.getDrawingBufferSize(uniforms.uRes.value);
    draw();
  };

  /* ---- pointer ---- */
  const target = new Vector2(-9999, -9999);
  const local = (event) => {
    const rect = host.getBoundingClientRect();
    return [event.clientX - rect.left, rect.height - (event.clientY - rect.top)];
  };
  const onMove = (event) => { if (event.pointerType !== "touch") target.set(...local(event)); };
  const onLeave = () => target.set(-9999, -9999);
  const onDown = (event) => {
    const [x, y] = local(event);
    uniforms.uRipple.value.set(x, y, uniforms.uTime.value, 1);
    if (!running) draw();
  };
  const surface = host.closest("[data-lab]") || host;
  surface.addEventListener("pointermove", onMove, { passive: true });
  surface.addEventListener("pointerleave", onLeave);
  host.addEventListener("pointerdown", onDown);

  /* ---- loop ---- */
  let visible = true;
  let running = false;
  let last = performance.now();
  const live = () => visible && !document.hidden && !reduced.matches;
  function frame(now) {
    if (!running) return;
    const dt = Math.min((now - last) / 1000, 0.05);
    last = now;
    uniforms.uTime.value += dt;
    const pointer = uniforms.uPointer.value;
    if (target.x < -999) pointer.copy(target);
    else if (pointer.x < -999) pointer.copy(target);
    else pointer.lerp(target, 0.18);
    draw();
    requestAnimationFrame(frame);
  }
  const sync = () => {
    if (live() && !running) {
      running = true;
      last = performance.now();
      requestAnimationFrame(frame);
    } else if (!live()) {
      running = false;
      uniforms.uPointer.value.set(-9999, -9999);
      draw();
    }
  };
  const observer = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; sync(); });
  observer.observe(host);
  document.addEventListener("visibilitychange", sync);
  reduced.addEventListener?.("change", sync);
  const resizeObserver = new ResizeObserver(resize);
  resizeObserver.observe(host);

  /* ---- state ---- */
  const tweenTo = (object, vars, duration = 1.1) => {
    if (!gsap || reduced.matches) {
      Object.assign(object, vars);
      draw();
      return;
    }
    gsap.to(object, { ...vars, duration, ease: "power3.inOut", overwrite: "auto", onUpdate: () => { if (!running) draw(); } });
  };

  let mode = "research";
  const api = {
    setMode(next) {
      if (!MODES[next] || next === mode) return;
      mode = next;
      const [x, y, z] = MODES[next];
      tweenTo(uniforms.uMix.value, { x, y, z }, 1.2);
    },
    setNoise(value) { tweenTo(uniforms.uNoise, { value }, 0.8); },
    setRanked(ranked) { tweenTo(uniforms.uRanked, { value: ranked ? 1 : 0 }, 1.4); },
    setStep(step) { tweenTo(uniforms.uStep, { value: step }, 0.8); },
    dispose() {
      running = false;
      observer.disconnect();
      resizeObserver.disconnect();
      document.removeEventListener("visibilitychange", sync);
      reduced.removeEventListener?.("change", sync);
      surface.removeEventListener("pointermove", onMove);
      surface.removeEventListener("pointerleave", onLeave);
      host.removeEventListener("pointerdown", onDown);
      plane.geometry.dispose();
      plane.material.dispose();
      renderer.dispose();
      canvas.remove();
    },
  };

  resize();
  sync();
  return api;
}
