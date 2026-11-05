/*
 * Signal field — the hero's decorative Three.js layer.
 *
 * "From messy signals to systems you can interrogate": scattered points resolve,
 * left to right, into one ordered surface that keeps moving. Slow travelling waves
 * run across it, a pink signal pulse sweeps through it, and a single yellow
 * "selected" point breathes on the ridge. The pointer lifts nearby points and
 * leaves ripples. Scrolling away scatters the surface back toward noise.
 *
 * It is decoration, not data: aria-hidden, no labels, no values.
 *
 * Rendering runs on the GSAP ticker only while the field is on screen, the tab is
 * visible and reduced motion is off. Reduced motion renders one still frame of the
 * resolved surface and ignores pointer and scroll.
 *
 * Built by tools/motion/build.mjs into assets/js/signal-field.js.
 */
import {
  BufferAttribute,
  BufferGeometry,
  Color,
  Group,
  NormalBlending,
  PerspectiveCamera,
  Points,
  Scene,
  ShaderMaterial,
  Vector2,
  Vector4,
  WebGLRenderer,
} from "three";

const WIDTH = 6.4;
const DEPTH = 4.4;

const vertexShader = /* glsl */ `
  uniform float uTime;
  uniform float uProgress;
  uniform float uScatter;
  uniform float uPointerStrength;
  uniform float uPixelRatio;
  uniform float uSize;
  uniform float uAspect;
  uniform vec2 uPointer;
  uniform vec4 uRipple;      // xy: origin (NDC), z: start time, w: strength
  attribute vec3 aNoise;
  attribute float aSweep;
  attribute float aTone;
  attribute float aScale;
  attribute float aSeed;
  varying float vAlpha;
  varying float vTone;
  varying float vHeat;

  float easeOut(float t) { return 1.0 - pow(1.0 - t, 4.0); }

  float surface(vec2 q, float t) {
    return 0.34 * sin(q.x * 0.85 + q.y * 0.55 + t * 0.55)
         + 0.18 * sin(q.y * 1.35 - q.x * 0.40 - t * 0.42)
         + 0.07 * sin(length(q - vec2(1.2, 0.4)) * 2.6 - t * 1.25);
  }

  void main() {
    vec2 q = position.xz;
    vec3 ordered = vec3(q.x, surface(q, uTime), q.y);

    // Messy signal: the noise cloud itself drifts slowly.
    vec3 noisy = aNoise + 0.18 * vec3(sin(uTime * 0.7 + aSeed * 6.28), cos(uTime * 0.5 + aSeed * 9.1), sin(uTime * 0.6 + aSeed * 3.7));

    // Each point resolves on its own short window, sweeping left to right.
    float t = easeOut(clamp(uProgress * 1.7 - aSweep * 0.7, 0.0, 1.0));
    t *= 1.0 - uScatter * (0.55 + 0.45 * aSeed);
    vec3 p = mix(noisy, ordered, t);

    // A pink pulse travels across the surface every ~9s: a signal passing through.
    float scan = fract(uTime * 0.11) * 1.6 - 0.3;
    float heat = exp(-pow((aSweep - scan) * 9.0, 2.0)) * t;
    p.y += heat * 0.12;

    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    vec4 clip = projectionMatrix * mv;
    vec2 ndc = clip.xy / clip.w;

    // Interrogate: points near the pointer lift toward the viewer and part.
    vec2 d = (ndc - uPointer) * vec2(uAspect, 1.0);
    float lift = exp(-dot(d, d) * 16.0) * uPointerStrength * t;
    mv.xy += normalize(d + 1e-5) * lift * 0.2;
    mv.z += lift * 0.6;

    // Ripple: a ring expanding from the last place the pointer pressed or entered.
    float age = uTime - uRipple.z;
    float ring = length((ndc - uRipple.xy) * vec2(uAspect, 1.0));
    float wave = exp(-pow((ring - age * 0.9) * 7.0, 2.0)) * exp(-age * 1.4) * uRipple.w * step(0.0, age);
    mv.y += wave * 0.32 * t;

    gl_Position = projectionMatrix * mv;
    float breathe = aTone > 1.5 ? 1.0 + 0.18 * sin(uTime * 2.1) : 1.0;
    gl_PointSize = uSize * aScale * breathe * uPixelRatio * (1.0 + lift * 0.6 + heat * 0.45) / -mv.z;
    vAlpha = mix(0.25, 1.0, t) * smoothstep(-15.0, -6.5, mv.z);
    vTone = aTone;
    vHeat = clamp(max(heat, lift * 1.4) + wave * 0.8, 0.0, 1.0);
  }
`;

const fragmentShader = /* glsl */ `
  uniform vec3 uInk;
  uniform vec3 uPink;
  uniform vec3 uYellow;
  uniform float uOpacity;
  varying float vAlpha;
  varying float vTone;
  varying float vHeat;

  void main() {
    float r = length(gl_PointCoord - 0.5);
    if (r > 0.5) discard;
    float edge = smoothstep(0.5, 0.4, r);
    vec3 color = mix(uInk, uPink, max(vTone * 0.9, vHeat * 0.9));
    float strength = vTone > 0.5 ? 1.0 : 0.82 + vHeat * 0.18;
    if (vTone > 1.5) {
      // The selected observation: yellow fill with an ink ring, as in the charts.
      color = mix(uYellow, uInk, smoothstep(0.3, 0.36, r));
      strength = 1.0;
    }
    gl_FragColor = vec4(color, edge * max(vAlpha, step(1.5, vTone) * 0.9) * strength * uOpacity);
  }
`;

// A deterministic generator keeps the composition identical between visits.
const makeRandom = () => {
  let seed = 20261103;
  return () => {
    seed = (seed * 1664525 + 1013904223) >>> 0;
    return seed / 4294967296;
  };
};

const surfaceAtRest = (x, z) => 0.34 * Math.sin(x * 0.85 + z * 0.55) + 0.18 * Math.sin(z * 1.35 - x * 0.4);
const ridge = (x) => 0.6 * Math.sin(x * 0.62 + 0.4) + 0.35;

function buildGeometry(cols, rows) {
  const random = makeRandom();
  const gaussian = () => (random() + random() + random() - 1.5) / 1.5;
  const count = cols * rows;
  const position = new Float32Array(count * 3);
  const noise = new Float32Array(count * 3);
  const sweep = new Float32Array(count);
  const tone = new Float32Array(count);
  const scale = new Float32Array(count);
  const seed = new Float32Array(count);
  let selected = 0;
  let selectedScore = -Infinity;

  for (let row = 0, i = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++, i++) {
      const x = (col / (cols - 1) - 0.5) * WIDTH;
      const z = (row / (rows - 1) - 0.5) * DEPTH;
      const y = surfaceAtRest(x, z);
      position.set([x, 0, z], i * 3);
      noise.set([x * 1.25 + gaussian() * 1.6, y + gaussian() * 1.9, z + gaussian() * 2.2], i * 3);
      sweep[i] = col / (cols - 1) * 0.85 + random() * 0.15;
      seed[i] = random();

      const onRidge = Math.abs(z - ridge(x)) < DEPTH / rows * 0.8;
      tone[i] = onRidge ? 1 : 0;
      scale[i] = onRidge ? 1.25 : 0.9 + random() * 0.2;
      const score = onRidge ? y - Math.abs(x - 1.6) * 0.3 : -Infinity;
      if (score > selectedScore) { selectedScore = score; selected = i; }
    }
  }
  tone[selected] = 2;
  scale[selected] = 3.6;

  const geometry = new BufferGeometry();
  geometry.setAttribute("position", new BufferAttribute(position, 3));
  geometry.setAttribute("aNoise", new BufferAttribute(noise, 3));
  geometry.setAttribute("aSweep", new BufferAttribute(sweep, 1));
  geometry.setAttribute("aTone", new BufferAttribute(tone, 1));
  geometry.setAttribute("aScale", new BufferAttribute(scale, 1));
  geometry.setAttribute("aSeed", new BufferAttribute(seed, 1));
  return geometry;
}

/**
 * Mount the field into `container`.
 * @param {HTMLElement} container decorative, aria-hidden host
 * @param {{ gsap: any, ScrollTrigger?: any, reduced: MediaQueryList, intro: boolean, surface: HTMLElement, compact?: boolean }} options
 */
export function mountSignalField(container, { gsap, ScrollTrigger, reduced, intro, surface: pointerSurface, compact = false }) {
  let renderer;
  try {
    renderer = new WebGLRenderer({ alpha: true, antialias: false, powerPreference: "low-power", premultipliedAlpha: false });
  } catch {
    return null;
  }
  renderer.setClearColor(0x000000, 0);
  const canvas = renderer.domElement;
  canvas.setAttribute("aria-hidden", "true");
  container.append(canvas);

  const scene = new Scene();
  const camera = new PerspectiveCamera(30, 1, 0.1, 60);
  const baseZ = compact ? 9.4 : 8.6;
  camera.position.set(0, 6.4, baseZ);
  camera.lookAt(0, compact ? 0.15 : 0.55, 0.35);

  const uniforms = {
    uTime: { value: 0 },
    uProgress: { value: intro && !reduced.matches ? 0 : 1 },
    uScatter: { value: 0 },
    uPointer: { value: new Vector2(9, 9) },
    uPointerStrength: { value: 0 },
    uRipple: { value: new Vector4(9, 9, -10, 0) },
    uPixelRatio: { value: 1 },
    uSize: { value: 52 },
    uAspect: { value: 1 },
    uOpacity: { value: 1 },
    uInk: { value: new Color("#102449") },
    uPink: { value: new Color("#bd005f") },
    uYellow: { value: new Color("#ffd137") },
  };
  const material = new ShaderMaterial({
    uniforms, vertexShader, fragmentShader,
    transparent: true, depthWrite: false, depthTest: false, blending: NormalBlending,
  });
  const geometry = compact ? buildGeometry(40, 22) : buildGeometry(62, 32);
  const group = new Group();
  group.add(new Points(geometry, material));
  group.rotation.set(0.04, -0.28, 0);
  scene.add(group);

  // ---- Rendering -------------------------------------------------------------
  let frames = 0;
  let width = 0;
  let height = 0;
  let onScreen = true;
  let pending = 0;
  const draw = () => {
    pending = 0;
    if (!width || !height || document.hidden) return;
    renderer.render(scene, camera);
    frames++;
  };
  // One-off frame (reduced motion, resize while paused).
  const invalidate = () => { if (!pending) pending = requestAnimationFrame(draw); };

  // Continuous loop, only while it can be seen and motion is welcome.
  let clock = 0;
  let looping = false;
  const tick = (_time, deltaMs) => {
    clock += Math.min(deltaMs, 50) / 1000;
    uniforms.uTime.value = clock;
    draw();
  };
  const shouldLoop = () => onScreen && !document.hidden && !reduced.matches;
  const syncLoop = () => {
    const next = shouldLoop();
    if (next === looping) return;
    looping = next;
    if (looping) gsap.ticker.add(tick);
    else { gsap.ticker.remove(tick); invalidate(); }
  };

  const resize = () => {
    const rect = container.getBoundingClientRect();
    width = Math.round(rect.width);
    height = Math.round(rect.height);
    if (!width || !height) return;
    const ratio = Math.min(window.devicePixelRatio || 1, compact ? 1.5 : 2);
    renderer.setPixelRatio(ratio);
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    camera.position.z = baseZ * Math.max(1, 1.05 / camera.aspect);
    camera.updateProjectionMatrix();
    uniforms.uPixelRatio.value = ratio;
    uniforms.uAspect.value = camera.aspect;
    uniforms.uSize.value = 52 * Math.min(1.2, Math.max(compact ? 0.7 : 0.8, width / 520));
    invalidate();
  };
  const resizeObserver = new ResizeObserver(resize);
  resizeObserver.observe(container);
  resize();

  const visibility = new IntersectionObserver(([entry]) => { onScreen = entry.isIntersecting; syncLoop(); });
  visibility.observe(container);

  const tweens = new Set();
  const track = (tween) => { tweens.add(tween); tween.then(() => tweens.delete(tween)); return tween; };

  // ---- Arrival: noise resolves into the system --------------------------------
  if (reduced.matches) gsap.set(container, { autoAlpha: 1 });
  else track(gsap.fromTo(container, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.9, ease: "power2.out" }));
  if (uniforms.uProgress.value < 1) {
    track(gsap.to(uniforms.uProgress, { value: 1, duration: 2.6, delay: 0.15, ease: "portfolio-in-out", onUpdate: invalidate }));
  }

  // ---- Interrogation: pointer lens, ripples and parallax tilt -----------------
  const pointer = { x: 9, y: 9, strength: 0, tiltX: 0, tiltY: 0 };
  const apply = () => {
    uniforms.uPointer.value.set(pointer.x, pointer.y);
    uniforms.uPointerStrength.value = pointer.strength;
    group.rotation.x = 0.04 + pointer.tiltY;
    group.rotation.y = -0.28 + pointer.tiltX;
    if (!looping) invalidate();
  };
  const to = (key, duration) => gsap.quickTo(pointer, key, { duration, ease: "power3.out", onUpdate: apply });
  const moveX = to("x", 0.5), moveY = to("y", 0.5), strength = to("strength", 0.6);
  const tiltX = to("tiltX", 1.2), tiltY = to("tiltY", 1.2);
  const fine = matchMedia("(hover: hover) and (pointer: fine)");
  const local = (event) => {
    const rect = container.getBoundingClientRect();
    return rect.width ? [((event.clientX - rect.left) / rect.width) * 2 - 1, -(((event.clientY - rect.top) / rect.height) * 2 - 1)] : null;
  };
  let wasInside = false;
  const ripple = (x, y, power) => {
    uniforms.uRipple.value.set(x, y, clock, power);
  };
  const onMove = (event) => {
    if (reduced.matches || !fine.matches) return;
    const at = local(event);
    if (!at) return;
    const [nx, ny] = at;
    const inside = Math.abs(nx) < 1.1 && Math.abs(ny) < 1.1;
    if (inside && !wasInside) { pointer.x = nx; pointer.y = ny; ripple(nx, ny, 0.8); }
    wasInside = inside;
    moveX(nx); moveY(ny);
    strength(inside ? 1 : 0.25);
    tiltX(((event.clientX / innerWidth) * 2 - 1) * 0.12);
    tiltY(((event.clientY / innerHeight) * 2 - 1) * 0.06);
  };
  const onDown = (event) => {
    if (reduced.matches) return;
    const at = local(event);
    if (at && Math.abs(at[0]) < 1.1 && Math.abs(at[1]) < 1.1) ripple(at[0], at[1], 1.4);
  };
  const onLeave = () => { wasInside = false; strength(0); tiltX(0); tiltY(0); };
  pointerSurface.addEventListener("pointermove", onMove, { passive: true });
  pointerSurface.addEventListener("pointerdown", onDown, { passive: true });
  pointerSurface.addEventListener("pointerleave", onLeave, { passive: true });

  // ---- Scroll: the system scatters back toward noise as the evidence takes over -
  let scrollTrigger = null;
  if (ScrollTrigger) {
    scrollTrigger = ScrollTrigger.create({
      trigger: pointerSurface, start: "top top", end: "bottom top", scrub: 0.8,
      onUpdate: (self) => {
        if (reduced.matches) return;
        uniforms.uScatter.value = self.progress * 0.8;
        group.position.y = self.progress * 0.6;
        group.rotation.z = self.progress * -0.12;
        uniforms.uOpacity.value = 1 - self.progress * 0.5;
        if (!looping) invalidate();
      },
    });
  }

  // ---- Preferences, visibility and teardown -----------------------------------
  const settle = () => {
    if (reduced.matches) {
      tweens.forEach((tween) => tween.progress(1));
      uniforms.uProgress.value = 1;
      uniforms.uTime.value = 0;
      uniforms.uScatter.value = 0;
      uniforms.uRipple.value.w = 0;
      pointer.strength = 0; uniforms.uPointerStrength.value = 0;
      group.rotation.set(0.04, -0.28, 0); group.rotation.z = 0; group.position.y = 0; uniforms.uOpacity.value = 1;
      scrollTrigger?.disable(false);
    } else scrollTrigger?.enable();
    syncLoop();
    invalidate();
  };
  reduced.addEventListener("change", settle);
  const onVisibility = () => { if (document.hidden) tweens.forEach((tween) => tween.progress(1)); syncLoop(); };
  document.addEventListener("visibilitychange", onVisibility);
  canvas.addEventListener("webglcontextlost", (event) => { event.preventDefault(); destroy(); });
  if (reduced.matches) scrollTrigger?.disable(false);
  syncLoop();

  function destroy() {
    gsap.ticker.remove(tick);
    cancelAnimationFrame(pending);
    tweens.forEach((tween) => tween.kill());
    scrollTrigger?.kill();
    resizeObserver.disconnect();
    visibility.disconnect();
    reduced.removeEventListener("change", settle);
    document.removeEventListener("visibilitychange", onVisibility);
    pointerSurface.removeEventListener("pointermove", onMove);
    pointerSurface.removeEventListener("pointerdown", onDown);
    pointerSurface.removeEventListener("pointerleave", onLeave);
    geometry.dispose();
    material.dispose();
    renderer.dispose();
    container.remove();
  }
  // `frames` and `looping` let the browser regression check when it renders.
  return { destroy, invalidate, uniforms, get frames() { return frames; }, get looping() { return looping; } };
}
