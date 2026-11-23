/*
 * Lab sculpture — the hero's Three.js layer.
 *
 * One glossy, noise-displaced core inside a shell of ~14k points. The shell
 * morphs between three forms, one per lab mode:
 *
 *   research      a sphere of points under noise. Turbulence follows the selected
 *                 privacy budget: lower epsilon, stronger privacy, more noise.
 *   applications  ten tilted rings, one per decile of a ranked review queue. Pink
 *                 marks "actionable". At random order 30% of every ring is pink
 *                 (the labelled prevalence); under the model's ranking the top ring
 *                 is 75% pink (prevalence x Lift@10% of 2.5) and the rest 25%.
 *   systems       a lifecycle loop with four stations. A pulse travels to the
 *                 selected order-lifecycle step.
 *
 * It is an illustration driven by the panels beside it: aria-hidden, no labels.
 * Rendering stops when the stage is off screen, the tab is hidden, or reduced
 * motion is on (then one still frame is drawn per state change).
 *
 * Built by tools/motion/build.mjs into assets/js/lab-scene.js.
 */
import {
  AdditiveBlending,
  BufferAttribute,
  BufferGeometry,
  Color,
  Group,
  IcosahedronGeometry,
  Mesh,
  PerspectiveCamera,
  Points,
  Scene,
  ShaderMaterial,
  Vector2,
  Vector3,
  WebGLRenderer,
} from "three";

const NAVY = new Color("#102449");
const PINK = new Color("#f2569f");
const PINK_DEEP = new Color("#bd005f");
const BLUE = new Color("#435c85");
const PALE = new Color("#d8dfe9");
const IVORY = new Color("#fdfcfa");

/* Ashima/Stefan Gustavson 3D simplex noise (MIT). */
const noiseGLSL = /* glsl */ `
  vec3 mod289(vec3 x){return x-floor(x*(1.0/289.0))*289.0;}
  vec4 mod289(vec4 x){return x-floor(x*(1.0/289.0))*289.0;}
  vec4 permute(vec4 x){return mod289(((x*34.0)+1.0)*x);}
  vec4 taylorInvSqrt(vec4 r){return 1.79284291400159-0.85373472095314*r;}
  float snoise(vec3 v){
    const vec2 C=vec2(1.0/6.0,1.0/3.0);
    const vec4 D=vec4(0.0,0.5,1.0,2.0);
    vec3 i=floor(v+dot(v,C.yyy));
    vec3 x0=v-i+dot(i,C.xxx);
    vec3 g=step(x0.yzx,x0.xyz);
    vec3 l=1.0-g;
    vec3 i1=min(g.xyz,l.zxy);
    vec3 i2=max(g.xyz,l.zxy);
    vec3 x1=x0-i1+C.xxx;
    vec3 x2=x0-i2+C.yyy;
    vec3 x3=x0-D.yyy;
    i=mod289(i);
    vec4 p=permute(permute(permute(i.z+vec4(0.0,i1.z,i2.z,1.0))+i.y+vec4(0.0,i1.y,i2.y,1.0))+i.x+vec4(0.0,i1.x,i2.x,1.0));
    float n_=0.142857142857;
    vec3 ns=n_*D.wyz-D.xzx;
    vec4 j=p-49.0*floor(p*ns.z*ns.z);
    vec4 x_=floor(j*ns.z);
    vec4 y_=floor(j-7.0*x_);
    vec4 x=x_*ns.x+ns.yyyy;
    vec4 y=y_*ns.x+ns.yyyy;
    vec4 h=1.0-abs(x)-abs(y);
    vec4 b0=vec4(x.xy,y.xy);
    vec4 b1=vec4(x.zw,y.zw);
    vec4 s0=floor(b0)*2.0+1.0;
    vec4 s1=floor(b1)*2.0+1.0;
    vec4 sh=-step(h,vec4(0.0));
    vec4 a0=b0.xzyw+s0.xzyw*sh.xxyy;
    vec4 a1=b1.xzyw+s1.xzyw*sh.zzww;
    vec3 p0=vec3(a0.xy,h.x);
    vec3 p1=vec3(a0.zw,h.y);
    vec3 p2=vec3(a1.xy,h.z);
    vec3 p3=vec3(a1.zw,h.w);
    vec4 norm=taylorInvSqrt(vec4(dot(p0,p0),dot(p1,p1),dot(p2,p2),dot(p3,p3)));
    p0*=norm.x;p1*=norm.y;p2*=norm.z;p3*=norm.w;
    vec4 m=max(0.6-vec4(dot(x0,x0),dot(x1,x1),dot(x2,x2),dot(x3,x3)),0.0);
    m=m*m;
    return 42.0*dot(m*m,vec4(dot(p0,x0),dot(p1,x1),dot(p2,x2),dot(p3,x3)));
  }
`;

/* ---------------------------------------------------------------- core ---- */
const coreVertex = /* glsl */ `
  uniform float uTime;
  uniform float uAmp;
  uniform float uFreq;
  uniform float uFlow;
  varying vec3 vNormal;
  varying vec3 vView;
  varying float vRidge;
  ${noiseGLSL}
  float field(vec3 p){
    float n = snoise(p * uFreq + vec3(0.0, uTime * uFlow, uTime * 0.11));
    n += 0.45 * snoise(p * uFreq * 2.3 - vec3(uTime * 0.17, 0.0, 0.0));
    return n;
  }
  vec3 displaced(vec3 p){ return p + normalize(p) * field(normalize(p)) * uAmp; }
  void main(){
    vec3 p = displaced(position);
    // Normal from two displaced neighbours on the tangent plane.
    vec3 n = normalize(position);
    vec3 t = normalize(cross(n, abs(n.y) < 0.99 ? vec3(0.0,1.0,0.0) : vec3(1.0,0.0,0.0)));
    vec3 b = cross(n, t);
    float e = 0.012;
    vec3 pt = displaced(position + t * e);
    vec3 pb = displaced(position + b * e);
    vec3 nn = normalize(cross(pt - p, pb - p));
    vRidge = field(n);
    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    vView = normalize(-mv.xyz);
    vNormal = normalize(normalMatrix * nn);
    gl_Position = projectionMatrix * mv;
  }
`;

const coreFragment = /* glsl */ `
  uniform vec3 uNavy;
  uniform vec3 uPink;
  uniform vec3 uPinkDeep;
  uniform vec3 uBlue;
  uniform vec3 uPale;
  uniform float uHeat;
  uniform float uTime;
  varying vec3 vNormal;
  varying vec3 vView;
  varying float vRidge;
  void main(){
    vec3 n = normalize(vNormal);
    if (!gl_FrontFacing) n = -n;
    float fres = pow(1.0 - max(dot(n, vView), 0.0), 2.4);
    vec3 key = normalize(vec3(-0.55, 0.8, 0.6));
    vec3 fill = normalize(vec3(0.8, -0.3, 0.4));
    float diff = max(dot(n, key), 0.0);
    float spec = pow(max(dot(reflect(-key, n), vView), 0.0), 42.0);
    float spec2 = pow(max(dot(reflect(-fill, n), vView), 0.0), 18.0);
    // Thin bands across the ridges read as a lacquered, slightly iridescent skin.
    float band = 0.5 + 0.5 * sin(vRidge * 7.0 + uTime * 0.35);
    vec3 base = mix(uNavy * 1.25, uBlue, diff * 0.55);
    base = mix(base, uPinkDeep, smoothstep(0.35, 1.0, band) * 0.22 * uHeat);
    vec3 rim = mix(uBlue * 1.6, uPink, 0.35 + 0.55 * uHeat);
    vec3 col = base + rim * fres * 1.15 + uPale * spec * 0.85 + uPink * spec2 * 0.35 * uHeat;
    gl_FragColor = vec4(col, 1.0);
  }
`;

/* -------------------------------------------------------------- shell ---- */
const shellVertex = /* glsl */ `
  uniform float uTime;
  uniform vec3 uMix;         // research, applications, systems
  uniform float uNoise;      // 0..1, from the selected privacy budget
  uniform float uRanked;     // 0 random order, 1 model ranking
  uniform float uStep;       // 0..3 lifecycle station, fractional while travelling
  uniform float uPixelRatio;
  uniform float uSize;
  uniform vec2 uPointer;
  attribute vec3 aSphere;
  attribute vec3 aRing;
  attribute vec3 aLoop;
  attribute float aSeed;
  attribute float aRank;
  attribute float aAngle;
  varying float vPink;
  varying float vAlpha;
  ${noiseGLSL}

  mat2 rot(float a){ float c=cos(a), s=sin(a); return mat2(c,-s,s,c); }

  void main(){
    // Research: a sphere under noise.
    vec3 sp = aSphere;
    float wob = snoise(sp * 1.4 + vec3(uTime * 0.25));
    float jitter = snoise(vec3(aSeed * 91.0, uTime * (0.6 + 1.6 * uNoise), aSeed * 17.0));
    sp *= 1.0 + 0.05 * wob + jitter * (0.04 + 0.42 * uNoise) * (0.4 + aSeed);

    // Applications: ten decile rings, each turning at its own pace.
    vec3 rg = aRing;
    float decile = floor(aRank * 10.0);
    rg.xz = rot(uTime * (0.05 + decile * 0.012)) * rg.xz;
    rg.y += 0.03 * sin(uTime + aAngle * 3.0);

    // Systems: a lifecycle loop; points crowd toward the active station.
    vec3 lp = aLoop;
    float station = uStep * 1.5707963;
    float d = abs(atan(sin(aAngle - station), cos(aAngle - station)));
    float near = exp(-d * d * 18.0);
    lp *= 1.0 + near * 0.12 * (0.6 + 0.4 * sin(uTime * 3.0));

    vec3 p = sp * uMix.x + rg * uMix.y + lp * uMix.z;

    // Pointer: a gentle lens that pushes points away from the cursor ray.
    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    vec4 clip = projectionMatrix * mv;
    vec2 ndc = clip.xy / clip.w;
    float lens = exp(-dot(ndc - uPointer, ndc - uPointer) * 22.0);
    mv.xy += normalize(ndc - uPointer + 0.0001) * lens * 0.22;

    // Which points glow pink in each mode.
    float researchPink = step(0.84 - 0.18 * uNoise, aSeed);
    float top = 1.0 - step(0.1, aRank);
    float threshold = mix(0.30, mix(0.25, 0.75, top), uRanked);
    float appPink = 1.0 - step(threshold, aSeed);
    float systemPink = smoothstep(0.25, 0.9, near);
    vPink = researchPink * uMix.x + appPink * uMix.y + systemPink * uMix.z;

    float depth = clamp(1.0 - (-mv.z - 5.0) / 7.0, 0.15, 1.0);
    vAlpha = depth * (0.7 + 0.3 * aSeed);
    gl_PointSize = uSize * uPixelRatio * (0.55 + aSeed * 0.9 + vPink * 0.9) * (6.0 / -mv.z);
    gl_Position = projectionMatrix * mv;
  }
`;

const shellFragment = /* glsl */ `
  uniform vec3 uPink;
  uniform vec3 uPale;
  uniform vec3 uBlue;
  varying float vPink;
  varying float vAlpha;
  void main(){
    vec2 c = gl_PointCoord - 0.5;
    float r = length(c);
    if (r > 0.5) discard;
    float soft = smoothstep(0.5, 0.0, r);
    vec3 col = mix(mix(uBlue, uPale, 0.55), uPink, vPink);
    gl_FragColor = vec4(col, soft * vAlpha * (0.75 + 0.25 * vPink));
  }
`;

/* ---------------------------------------------------------------- dust ---- */
const dustVertex = /* glsl */ `
  uniform float uTime;
  uniform float uPixelRatio;
  uniform vec2 uParallax;
  attribute float aSeed;
  varying float vAlpha;
  void main(){
    vec3 p = position;
    p.y += mod(uTime * (0.03 + aSeed * 0.05) + aSeed * 20.0, 12.0) - 6.0;
    p.x += sin(uTime * 0.2 + aSeed * 40.0) * 0.15;
    p.xy += uParallax * (0.2 + aSeed * 0.6);
    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    vAlpha = 0.2 + 0.5 * aSeed;
    gl_PointSize = (1.0 + aSeed * 2.2) * uPixelRatio * (7.0 / -mv.z);
    gl_Position = projectionMatrix * mv;
  }
`;
const dustFragment = /* glsl */ `
  uniform vec3 uColor;
  varying float vAlpha;
  void main(){
    float r = length(gl_PointCoord - 0.5);
    if (r > 0.5) discard;
    gl_FragColor = vec4(uColor, smoothstep(0.5, 0.0, r) * vAlpha);
  }
`;

/* ------------------------------------------------------------ geometry ---- */
function seeded(seed) {
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function shellGeometry(count) {
  const random = seeded(20261123);
  const sphere = new Float32Array(count * 3);
  const ring = new Float32Array(count * 3);
  const loop = new Float32Array(count * 3);
  const seed = new Float32Array(count);
  const rank = new Float32Array(count);
  const angle = new Float32Array(count);
  const golden = Math.PI * (3 - Math.sqrt(5));
  for (let i = 0; i < count; i++) {
    // Fibonacci sphere, slightly thickened.
    const y = 1 - (i / (count - 1)) * 2;
    const radius = Math.sqrt(1 - y * y);
    const theta = golden * i;
    const r = 1.9 + (random() - 0.5) * 0.08;
    sphere.set([Math.cos(theta) * radius * r, y * r, Math.sin(theta) * radius * r], i * 3);

    // Ten decile rings: rank 0 is the top of the queue (outermost, highest).
    const k = random();
    rank[i] = k;
    const decile = Math.floor(k * 10);
    const a = random() * Math.PI * 2;
    const rr = 2.55 - decile * 0.15 + (random() - 0.5) * 0.04;
    const tilt = 1.12;
    const ry = (4.5 - decile) * 0.07;
    const x = Math.cos(a) * rr;
    const z = Math.sin(a) * rr;
    ring.set([x, ry + z * Math.sin(tilt), z * Math.cos(tilt)], i * 3);

    // Lifecycle loop: a torus, tilted towards the viewer.
    const u = random() * Math.PI * 2;
    const v = random() * Math.PI * 2;
    const R = 2.15;
    const tube = 0.16 + random() * 0.07;
    const lx = (R + tube * Math.cos(v)) * Math.cos(u);
    const lz = (R + tube * Math.cos(v)) * Math.sin(u);
    const ly = tube * Math.sin(v);
    const lt = 1.2;
    loop.set([lx, ly * Math.cos(lt) - lz * Math.sin(lt), ly * Math.sin(lt) + lz * Math.cos(lt)], i * 3);
    // Stations sit at 0, 90, 180, 270 degrees, starting at the top of the loop.
    angle[i] = (u + Math.PI / 2) % (Math.PI * 2);

    seed[i] = random();
  }
  const geometry = new BufferGeometry();
  geometry.setAttribute("position", new BufferAttribute(sphere, 3));
  geometry.setAttribute("aSphere", new BufferAttribute(sphere, 3));
  geometry.setAttribute("aRing", new BufferAttribute(ring, 3));
  geometry.setAttribute("aLoop", new BufferAttribute(loop, 3));
  geometry.setAttribute("aSeed", new BufferAttribute(seed, 1));
  geometry.setAttribute("aRank", new BufferAttribute(rank, 1));
  geometry.setAttribute("aAngle", new BufferAttribute(angle, 1));
  return geometry;
}

function dustGeometry(count) {
  const random = seeded(7);
  const position = new Float32Array(count * 3);
  const seed = new Float32Array(count);
  for (let i = 0; i < count; i++) {
    position.set([(random() - 0.5) * 18, (random() - 0.5) * 12, -2 - random() * 8], i * 3);
    seed[i] = random();
  }
  const geometry = new BufferGeometry();
  geometry.setAttribute("position", new BufferAttribute(position, 3));
  geometry.setAttribute("aSeed", new BufferAttribute(seed, 1));
  return geometry;
}

/* -------------------------------------------------------------- states ---- */
const MODES = {
  research: { mix: [1, 0, 0], amp: 0.16, freq: 1.25, flow: 0.18, heat: 1, scale: 1, tilt: 0.0 },
  applications: { mix: [0, 1, 0], amp: 0.07, freq: 0.8, flow: 0.08, heat: 0.55, scale: 0.42, tilt: 0.0 },
  systems: { mix: [0, 0, 1], amp: 0.05, freq: 2.2, flow: 0.3, heat: 0.75, scale: 0.5, tilt: 0.0 },
};

export function mountLabScene(host, { gsap, reduced, compact = false } = {}) {
  let renderer;
  try {
    renderer = new WebGLRenderer({ antialias: !compact, alpha: true, powerPreference: "high-performance" });
  } catch {
    return null;
  }
  if (!renderer.getContext()) return null;
  const canvas = renderer.domElement;
  canvas.setAttribute("aria-hidden", "true");
  host.prepend(canvas);
  renderer.setClearColor(0x000000, 0);
  const pixelRatio = Math.min(window.devicePixelRatio || 1, compact ? 1.5 : 1.75);
  renderer.setPixelRatio(pixelRatio);

  const scene = new Scene();
  const camera = new PerspectiveCamera(30, 1, 0.1, 60);
  camera.position.set(0, 0, 11);

  const sculpture = new Group();
  scene.add(sculpture);

  const coreUniforms = {
    uTime: { value: 0 },
    uAmp: { value: MODES.research.amp },
    uFreq: { value: MODES.research.freq },
    uFlow: { value: MODES.research.flow },
    uHeat: { value: 1 },
    uNavy: { value: NAVY },
    uPink: { value: PINK },
    uPinkDeep: { value: PINK_DEEP },
    uBlue: { value: BLUE },
    uPale: { value: PALE },
  };
  const core = new Mesh(
    new IcosahedronGeometry(1.32, compact ? 40 : 72),
    new ShaderMaterial({ vertexShader: coreVertex, fragmentShader: coreFragment, uniforms: coreUniforms }),
  );
  sculpture.add(core);

  const shellUniforms = {
    uTime: { value: 0 },
    uMix: { value: new Vector3(...MODES.research.mix) },
    uNoise: { value: 1 },
    uRanked: { value: 0 },
    uStep: { value: 0 },
    uPixelRatio: { value: pixelRatio },
    uSize: { value: compact ? 6.5 : 7.5 },
    uPointer: { value: new Vector2(9, 9) },
    uPink: { value: PINK },
    uPale: { value: PALE },
    uBlue: { value: BLUE },
  };
  const shell = new Points(
    shellGeometry(compact ? 7000 : 14000),
    new ShaderMaterial({
      vertexShader: shellVertex, fragmentShader: shellFragment, uniforms: shellUniforms,
      transparent: true, depthWrite: false, blending: AdditiveBlending,
    }),
  );
  shell.frustumCulled = false;
  sculpture.add(shell);

  const dustUniforms = {
    uTime: { value: 0 }, uPixelRatio: { value: pixelRatio },
    uParallax: { value: new Vector2() }, uColor: { value: IVORY },
  };
  const dust = new Points(
    dustGeometry(compact ? 500 : 1100),
    new ShaderMaterial({
      vertexShader: dustVertex, fragmentShader: dustFragment, uniforms: dustUniforms,
      transparent: true, depthWrite: false, blending: AdditiveBlending,
    }),
  );
  dust.frustumCulled = false;
  scene.add(dust);

  /* ---- layout ---- */
  let offsetX = 0;
  const resize = () => {
    const { width, height } = host.getBoundingClientRect();
    if (!width || !height) return;
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    // Wide stages push the sculpture right of the copy; narrow ones keep it centred.
    offsetX = camera.aspect > 1.25 ? Math.min(1.3, (camera.aspect - 1) * 0.9) : 0;
    const fit = camera.aspect < 0.8 ? 1.35 : 1;
    camera.position.z = 11 * fit;
    camera.updateProjectionMatrix();
    sculpture.position.x = offsetX;
    sculpture.position.y = camera.aspect < 0.8 ? 0.6 : 0;
    draw();
  };

  /* ---- pointer ---- */
  const pointer = new Vector2(9, 9);
  const tilt = { x: 0, y: 0, tx: 0, ty: 0 };
  const onPointer = (event) => {
    if (event.pointerType === "touch") return;
    const rect = host.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    const y = -(((event.clientY - rect.top) / rect.height) * 2 - 1);
    pointer.set(x, y);
    tilt.tx = y * 0.18;
    tilt.ty = x * 0.28;
  };
  const onLeave = () => { pointer.set(9, 9); tilt.tx = 0; tilt.ty = 0; };
  // Listen on the whole stage so the copy and bench above the canvas still steer it.
  const surface = host.closest(".stage") || host;
  surface.addEventListener("pointermove", onPointer, { passive: true });
  surface.addEventListener("pointerleave", onLeave);

  /* ---- render loop ---- */
  let visible = true;
  let running = false;
  let elapsed = 0;
  let last = performance.now();
  const live = () => visible && !document.hidden && !reduced.matches;

  function draw() {
    renderer.render(scene, camera);
  }
  function frame(now) {
    if (!running) return;
    const dt = Math.min((now - last) / 1000, 0.05);
    last = now;
    elapsed += dt;
    coreUniforms.uTime.value = elapsed;
    shellUniforms.uTime.value = elapsed;
    dustUniforms.uTime.value = elapsed;
    shellUniforms.uPointer.value.lerp(pointer, 0.08);
    tilt.x += (tilt.tx - tilt.x) * 0.05;
    tilt.y += (tilt.ty - tilt.y) * 0.05;
    sculpture.rotation.x = tilt.x;
    sculpture.rotation.y = elapsed * 0.06 + tilt.y;
    core.rotation.z = elapsed * 0.03;
    dustUniforms.uParallax.value.set(-tilt.y * 0.8, tilt.x * 0.8);
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
  const ease = "power3.inOut";
  const tweenTo = (target, vars, duration = 1.4) => {
    if (!gsap || reduced.matches) {
      Object.entries(vars).forEach(([key, value]) => { target[key] = value; });
      draw();
      return;
    }
    gsap.to(target, { ...vars, duration, ease, overwrite: "auto", onUpdate: running ? undefined : draw });
  };

  let mode = "research";
  const api = {
    setMode(next) {
      const state = MODES[next];
      if (!state || next === mode) return;
      mode = next;
      tweenTo(shellUniforms.uMix.value, { x: state.mix[0], y: state.mix[1], z: state.mix[2] }, 1.6);
      tweenTo(coreUniforms.uAmp, { value: state.amp });
      tweenTo(coreUniforms.uFreq, { value: state.freq });
      tweenTo(coreUniforms.uFlow, { value: state.flow });
      tweenTo(coreUniforms.uHeat, { value: state.heat });
      tweenTo(core.scale, { x: state.scale, y: state.scale, z: state.scale }, 1.6);
    },
    /* 1 = most noise (strongest privacy), 0 = least. */
    setNoise(value) {
      tweenTo(shellUniforms.uNoise, { value }, 0.9);
      tweenTo(coreUniforms.uAmp, { value: MODES.research.amp * (0.55 + value * 0.75) }, 0.9);
    },
    setRanked(ranked) { tweenTo(shellUniforms.uRanked, { value: ranked ? 1 : 0 }, 1.1); },
    setStep(step) { tweenTo(shellUniforms.uStep, { value: step }, 0.9); },
    dispose() {
      running = false;
      observer.disconnect();
      resizeObserver.disconnect();
      document.removeEventListener("visibilitychange", sync);
      reduced.removeEventListener?.("change", sync);
      surface.removeEventListener("pointermove", onPointer);
      surface.removeEventListener("pointerleave", onLeave);
      [core, shell, dust].forEach((object) => { object.geometry.dispose(); object.material.dispose(); });
      renderer.dispose();
      canvas.remove();
    },
  };

  resize();
  sync();
  return api;
}
