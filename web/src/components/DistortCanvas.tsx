import { Canvas, useFrame, useLoader, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import { Color, MathUtils, SRGBColorSpace, TextureLoader, Vector2 } from "three";

const vertexShader = /* glsl */ `
  varying vec2 vUv;
  void main() { vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }
`;

// Cover-fit the image, then push it through a pointer-centred ripple and lens with a
// small RGB split. At rest (uHover = 0) it draws the image exactly as the <img> shows it.
const fragmentShader = /* glsl */ `
  precision highp float;
  uniform sampler2D uTex;
  uniform vec2 uMouse;
  uniform vec2 uRes;
  uniform vec2 uImg;
  uniform float uHover;
  uniform float uTime;
  uniform vec3 uPink;
  varying vec2 vUv;

  vec2 cover(vec2 uv) {
    vec2 scale = uRes / uImg;
    float s = max(scale.x, scale.y);
    vec2 size = uImg * s;
    return (uv * uRes - (uRes - size) * 0.5) / size;
  }

  void main() {
    vec2 d = vUv - uMouse;
    d.x *= uRes.x / uRes.y;
    float dist = length(d);
    vec2 dir = d / max(dist, 1e-4);
    float ripple = sin(dist * 42.0 - uTime * 5.5) * exp(-dist * 7.0) * 0.010 * uHover;
    float lens = exp(-dist * dist * 22.0) * 0.035 * uHover;
    vec2 uv = vUv + dir * (ripple - lens);
    float split = 0.007 * uHover * exp(-dist * 4.0);
    float r = texture2D(uTex, cover(uv + vec2(split, 0.0))).r;
    vec3 g = texture2D(uTex, cover(uv)).rgb;
    float b = texture2D(uTex, cover(uv - vec2(split, 0.0))).b;
    vec3 colour = vec3(r, g.g, b);
    float glow = exp(-dist * dist * 34.0) * uHover;
    colour = mix(colour, colour * 0.55 + uPink * 0.55, glow * 0.32);
    gl_FragColor = vec4(colour, 1.0);
  }
`;

function Plane({ src, surface, onReady }: { src: string; surface: React.RefObject<HTMLElement | null>; onReady: () => void }) {
  const texture = useLoader(TextureLoader, src);
  const { size, invalidate } = useThree();
  const target = useRef({ hover: 0, x: 0.5, y: 0.5 });
  const uniforms = useMemo(() => {
    texture.colorSpace = SRGBColorSpace;
    const image = texture.image as HTMLImageElement;
    return {
      uTex: { value: texture },
      uMouse: { value: new Vector2(0.5, 0.5) },
      uRes: { value: new Vector2(1, 1) },
      uImg: { value: new Vector2(image.width, image.height) },
      uHover: { value: 0 },
      uTime: { value: 0 },
      uPink: { value: new Color("#ff3d9a") },
    };
  }, [texture]);

  useEffect(() => {
    const area = surface.current;
    if (!area) return;
    const move = (event: PointerEvent) => {
      const rect = area.getBoundingClientRect();
      target.current.x = (event.clientX - rect.left) / rect.width;
      target.current.y = 1 - (event.clientY - rect.top) / rect.height;
      target.current.hover = 1;
      invalidate();
    };
    const leave = () => { target.current.hover = 0; invalidate(); };
    area.addEventListener("pointermove", move, { passive: true });
    area.addEventListener("pointerleave", leave);
    return () => { area.removeEventListener("pointermove", move); area.removeEventListener("pointerleave", leave); };
  }, [surface, invalidate]);

  // Reveal the canvas only once the texture has loaded and a frame is drawn.
  useEffect(() => { const id = requestAnimationFrame(() => requestAnimationFrame(onReady)); return () => cancelAnimationFrame(id); }, [onReady]);

  // Render on demand: keep drawing only while hovered or easing back to rest.
  useFrame((_, delta) => {
    const dt = Math.min(delta, 0.05);
    const u = uniforms;
    const t = target.current;
    u.uTime.value += dt;
    u.uRes.value.set(size.width, size.height);
    u.uHover.value = MathUtils.damp(u.uHover.value, t.hover, 6, dt);
    u.uMouse.value.set(MathUtils.damp(u.uMouse.value.x, t.x, 10, dt), MathUtils.damp(u.uMouse.value.y, t.y, 10, dt));
    if (t.hover > 0 || u.uHover.value > 0.002) invalidate();
  });

  return (
    <mesh frustumCulled={false}>
      <planeGeometry args={[2, 2]} />
      <shaderMaterial uniforms={uniforms} vertexShader={vertexShader} fragmentShader={fragmentShader} />
    </mesh>
  );
}

export default function DistortCanvas({ src, surface, onReady }: { src: string; surface: React.RefObject<HTMLElement | null>; onReady: () => void }) {
  return (
    <Canvas className="distort-canvas" frameloop="demand" dpr={[1, 1.5]} gl={{ antialias: false, alpha: false }}
      style={{ position: "absolute", inset: 0, pointerEvents: "none" }} aria-hidden="true">
      <Plane src={src} surface={surface} onReady={onReady} />
    </Canvas>
  );
}
