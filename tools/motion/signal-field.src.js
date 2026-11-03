/*
 * Signal field — the hero's decorative Three.js layer.
 *
 * "From messy signals to systems you can interrogate": scattered points resolve,
 * left to right, into one ordered surface. A pink ridge and a single yellow
 * "selected" point reuse the site's colour grammar. The pointer can interrogate
 * the surface locally. It is decoration, not data: it is aria-hidden and carries
 * no values.
 *
 * Rendering is on demand. There is no perpetual loop: a frame is drawn only while
 * a GSAP tween (intro, pointer, scroll) is changing a uniform. Reduced motion
 * renders the resolved surface once and ignores pointer and scroll.
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
  WebGLRenderer,
} from "three";

const COLS = 58;
const ROWS = 30;
const WIDTH = 6.4;
const DEPTH = 4.4;

const vertexShader = /* glsl */ `
  uniform float uProgress;
  uniform float uPointerStrength;
  uniform float uPixelRatio;
  uniform float uSize;
  uniform float uAspect;
  uniform vec2 uPointer;
  attribute vec3 aNoise;
  attribute float aSweep;
  attribute float aTone;
  attribute float aScale;
  varying float vAlpha;
  varying float vTone;
  varying float vLift;

  float easeOut(float t) { return 1.0 - pow(1.0 - t, 4.0); }

  void main() {
    // Each point resolves on its own short window, sweeping left to right.
    float t = easeOut(clamp(uProgress * 1.7 - aSweep * 0.7, 0.0, 1.0));
    vec3 p = mix(aNoise, position, t);
    vec4 mv = modelViewMatrix * vec4(p, 1.0);

    // Interrogate: points near the pointer lift toward the viewer and part.
    vec4 clip = projectionMatrix * mv;
    vec2 d = (clip.xy / clip.w - uPointer) * vec2(uAspect, 1.0);
    float lift = exp(-dot(d, d) * 7.0) * uPointerStrength * t;
    mv.xy += normalize(d + 1e-5) * lift * 0.22;
    mv.z += lift * 0.9;

    gl_Position = projectionMatrix * mv;
    gl_PointSize = uSize * aScale * uPixelRatio * (1.0 + lift * 0.9) / -mv.z;
    vAlpha = mix(0.22, 1.0, t) * smoothstep(-15.0, -6.5, mv.z);
    vTone = aTone;
    vLift = lift;
  }
`;

const fragmentShader = /* glsl */ `
  uniform vec3 uInk;
  uniform vec3 uPink;
  uniform vec3 uYellow;
  uniform float uOpacity;
  varying float vAlpha;
  varying float vTone;
  varying float vLift;

  void main() {
    float r = length(gl_PointCoord - 0.5);
    if (r > 0.5) discard;
    float edge = smoothstep(0.5, 0.4, r);
    vec3 color = mix(uInk, uPink, max(vTone, clamp(vLift * 1.4, 0.0, 0.85)));
    float strength = vTone > 0.5 ? 1.0 : 0.78;
    if (vTone > 1.5) {
      // The selected observation: yellow fill with an ink ring, as in the charts.
      color = mix(uYellow, uInk, smoothstep(0.3, 0.36, r));
      strength = 1.0;
    }
    gl_FragColor = vec4(color, edge * max(vAlpha, step(1.5, vTone) * 0.9) * strength * uOpacity);
  }
`;

// A deterministic generator keeps the composition identical between visits.
const random = (() => {
  let seed = 20261103;
  return () => {
    seed = (seed * 1664525 + 1013904223) >>> 0;
    return seed / 4294967296;
  };
})();
const gaussian = () => (random() + random() + random() - 1.5) / 1.5;

const surface = (x, z) => 0.34 * Math.sin(x * 0.85 + z * 0.55) + 0.18 * Math.sin(z * 1.35 - x * 0.4);
const ridge = (x) => 0.6 * Math.sin(x * 0.62 + 0.4) + 0.35;

function buildGeometry() {
  const count = COLS * ROWS;
  const position = new Float32Array(count * 3);
  const noise = new Float32Array(count * 3);
  const sweep = new Float32Array(count);
  const tone = new Float32Array(count);
  const scale = new Float32Array(count);
  let selected = 0;
  let selectedScore = -Infinity;

  for (let row = 0, i = 0; row < ROWS; row++) {
    for (let col = 0; col < COLS; col++, i++) {
      const x = (col / (COLS - 1) - 0.5) * WIDTH;
      const z = (row / (ROWS - 1) - 0.5) * DEPTH;
      const y = surface(x, z);
      position.set([x, y, z], i * 3);

      // Messy signal: wider, noisier and slightly streaked along x.
      noise.set([
        x * 1.25 + gaussian() * 1.6,
        y + gaussian() * 1.9,
        z + gaussian() * 2.2,
      ], i * 3);
      sweep[i] = col / (COLS - 1) * 0.85 + random() * 0.15;

      const onRidge = Math.abs(z - ridge(x)) < DEPTH / ROWS * 0.8;
      tone[i] = onRidge ? 1 : 0;
      scale[i] = onRidge ? 1.25 : 0.9 + random() * 0.2;

      // The selected observation: the ridge point nearest the right-hand crest.
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
  return geometry;
}

/**
 * Mount the field into `container`.
 * @param {HTMLElement} container decorative, aria-hidden host
 * @param {{ gsap: any, ScrollTrigger?: any, reduced: MediaQueryList, intro: boolean, surface: HTMLElement }} options
 * @returns {{ destroy(): void } | null}
 */
export function mountSignalField(container, { gsap, ScrollTrigger, reduced, intro, surface: pointerSurface }) {
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
  camera.position.set(0, 6.4, 8.6);
  camera.lookAt(0, 0.55, 0.35);

  const uniforms = {
    uProgress: { value: intro && !reduced.matches ? 0 : 1 },
    uPointer: { value: [9, 9] },
    uPointerStrength: { value: 0 },
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
    transparent: true, depthWrite: false, depthTest: false,
    blending: NormalBlending,
  });
  const geometry = buildGeometry();
  const group = new Group();
  group.add(new Points(geometry, material));
  group.rotation.set(0.04, -0.28, 0);
  scene.add(group);

  // ---- On-demand rendering --------------------------------------------------
  let frame = 0;
  let frames = 0;
  let width = 0;
  let height = 0;
  const draw = () => {
    frame = 0;
    if (!width || !height || document.hidden) return;
    renderer.render(scene, camera);
    frames++;
  };
  const invalidate = () => { if (!frame) frame = requestAnimationFrame(draw); };

  const resize = () => {
    const rect = container.getBoundingClientRect();
    width = Math.round(rect.width);
    height = Math.round(rect.height);
    if (!width || !height) return;
    const ratio = Math.min(window.devicePixelRatio || 1, 2);
    renderer.setPixelRatio(ratio);
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    // Keep the whole surface in frame for tall, narrow hosts.
    camera.position.z = 8.6 * Math.max(1, 1.05 / camera.aspect);
    camera.updateProjectionMatrix();
    uniforms.uPixelRatio.value = ratio;
    uniforms.uAspect.value = camera.aspect;
    uniforms.uSize.value = 52 * Math.min(1.15, Math.max(0.8, width / 520));
    invalidate();
  };
  const resizeObserver = new ResizeObserver(resize);
  resizeObserver.observe(container);
  resize();

  const tweens = new Set();
  const track = (tween) => { tweens.add(tween); tween.eventCallback("onInterrupt", () => tweens.delete(tween)); return tween; };

  // ---- Arrival: noise resolves into the system --------------------------------
  track(gsap.fromTo(container, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.9, ease: "power2.out" }));
  if (uniforms.uProgress.value < 1) {
    track(gsap.to(uniforms.uProgress, {
      value: 1, duration: 2.6, delay: 0.15, ease: "portfolio-in-out",
      onUpdate: invalidate,
    }));
  }

  // ---- Interrogation: pointer lens and a small parallax tilt ------------------
  const pointer = { x: 9, y: 9, strength: 0, tiltX: 0, tiltY: 0 };
  const to = (key, duration) => gsap.quickTo(pointer, key, { duration, ease: "power3.out", onUpdate: () => {
    uniforms.uPointer.value = [pointer.x, pointer.y];
    uniforms.uPointerStrength.value = pointer.strength;
    group.rotation.x = 0.04 + pointer.tiltY;
    group.rotation.y = -0.28 + pointer.tiltX;
    invalidate();
  } });
  const moveX = to("x", 0.55), moveY = to("y", 0.55), strength = to("strength", 0.7);
  const tiltX = to("tiltX", 1.1), tiltY = to("tiltY", 1.1);
  const fine = matchMedia("(hover: hover) and (pointer: fine)");
  const onMove = (event) => {
    if (reduced.matches || !fine.matches) return;
    const rect = container.getBoundingClientRect();
    if (!rect.width) return;
    const nx = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    const ny = -(((event.clientY - rect.top) / rect.height) * 2 - 1);
    const inside = Math.abs(nx) < 1.15 && Math.abs(ny) < 1.15;
    if (pointer.strength < 0.01 && inside) { pointer.x = nx; pointer.y = ny; }
    moveX(nx); moveY(ny);
    strength(inside ? 1 : 0);
    const sx = (event.clientX / innerWidth) * 2 - 1;
    const sy = (event.clientY / innerHeight) * 2 - 1;
    tiltX(sx * 0.07); tiltY(sy * 0.035);
  };
  const onLeave = () => { strength(0); tiltX(0); tiltY(0); };
  pointerSurface.addEventListener("pointermove", onMove, { passive: true });
  pointerSurface.addEventListener("pointerleave", onLeave, { passive: true });

  // ---- Scroll: the surface settles back as the evidence takes over ------------
  let scrollTrigger = null;
  if (ScrollTrigger) {
    scrollTrigger = ScrollTrigger.create({
      trigger: pointerSurface, start: "top top", end: "bottom top", scrub: 0.6,
      onUpdate: (self) => {
        if (reduced.matches) return;
        group.position.y = self.progress * 0.9;
        uniforms.uOpacity.value = 1 - self.progress * 0.75;
        invalidate();
      },
    });
  }

  // ---- Preferences, visibility and teardown -----------------------------------
  const settle = () => {
    if (!reduced.matches) return;
    tweens.forEach((tween) => tween.progress(1));
    uniforms.uProgress.value = 1;
    pointer.strength = 0; uniforms.uPointerStrength.value = 0;
    group.rotation.set(0.04, -0.28, 0); group.position.y = 0; uniforms.uOpacity.value = 1;
    invalidate();
  };
  reduced.addEventListener("change", settle);
  const onVisibility = () => {
    if (document.hidden) tweens.forEach((tween) => tween.progress(1));
    else invalidate();
  };
  document.addEventListener("visibilitychange", onVisibility);
  canvas.addEventListener("webglcontextlost", (event) => { event.preventDefault(); destroy(); });

  function destroy() {
    cancelAnimationFrame(frame);
    tweens.forEach((tween) => tween.kill());
    scrollTrigger?.kill();
    resizeObserver.disconnect();
    reduced.removeEventListener("change", settle);
    document.removeEventListener("visibilitychange", onVisibility);
    pointerSurface.removeEventListener("pointermove", onMove);
    pointerSurface.removeEventListener("pointerleave", onLeave);
    geometry.dispose();
    material.dispose();
    renderer.dispose();
    container.remove();
  }
  // `frames` lets the browser regression prove there is no perpetual render loop.
  return { destroy, invalidate, uniforms, get frames() { return frames; } };
}
