/*
 * Slat field, React Three Fiber version.
 *
 * A grid of capsules drawn by one shader on a full-screen plane. Props come
 * straight from the bench: research flicker follows epsilon, applications sort
 * into the ranked review queue, systems light the lifecycle step. Uniforms ease
 * toward their targets each frame (MathUtils.damp), so any change glides.
 *
 * It illustrates the bench; it is not data, so the host is aria-hidden.
 * Rendering stops off screen and in hidden tabs; with reduced motion it renders
 * on demand only and snaps to each new state.
 */
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef, useState } from "react";
import { Color, MathUtils, ShaderMaterial, Vector2, Vector3, Vector4 } from "three";
import type { Mode } from "../lib/bench";
import { fragmentShader, vertexShader } from "./slatShader";

const MIX: Record<Mode, [number, number, number]> = {
  research: [1, 0, 0],
  applications: [0, 1, 0],
  systems: [0, 0, 1],
};

export interface SlatState {
  mode: Mode;
  noise: number;
  ranked: boolean;
  step: number;
}

interface FieldProps extends SlatState {
  reduced: boolean;
  compact: boolean;
  surface: React.RefObject<HTMLElement | null>;
}

function Field({ mode, noise, ranked, step, reduced, compact, surface }: FieldProps) {
  const material = useRef<ShaderMaterial>(null);
  const { gl, invalidate } = useThree();
  const pointer = useRef(new Vector2(-9999, -9999));
  const uniforms = useMemo(
    () => ({
      uRes: { value: new Vector2(1, 1) },
      uPR: { value: 1 },
      uTime: { value: 0 },
      uMix: { value: new Vector3(...MIX[mode]) },
      uNoise: { value: noise },
      uRanked: { value: ranked ? 1 : 0 },
      uStep: { value: step },
      uPointer: { value: new Vector2(-9999, -9999) },
      uRipple: { value: new Vector4(0, 0, -99, 0) },
      uInk: { value: new Color("#f2f0ec") },
      uPink: { value: new Color("#ff3d9a") },
      uCell: { value: new Vector2(compact ? 10 : 12, compact ? 26 : 30) },
    }),
    // Created once; later prop changes are eased in useFrame.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  // Pointer lens over the whole hero; click ripple on the field itself.
  useEffect(() => {
    const host = gl.domElement;
    const area = surface.current ?? host;
    const local = (event: PointerEvent) => {
      const rect = host.getBoundingClientRect();
      return [event.clientX - rect.left, rect.height - (event.clientY - rect.top)] as const;
    };
    const move = (event: PointerEvent) => { if (event.pointerType !== "touch") pointer.current.set(...local(event)); invalidate(); };
    const leave = () => { pointer.current.set(-9999, -9999); invalidate(); };
    const down = (event: PointerEvent) => {
      const [x, y] = local(event);
      uniforms.uRipple.value.set(x, y, uniforms.uTime.value, 1);
      invalidate();
    };
    area.addEventListener("pointermove", move, { passive: true });
    area.addEventListener("pointerleave", leave);
    host.addEventListener("pointerdown", down);
    return () => {
      area.removeEventListener("pointermove", move);
      area.removeEventListener("pointerleave", leave);
      host.removeEventListener("pointerdown", down);
    };
  }, [gl, invalidate, surface, uniforms]);

  // Reduced motion renders on demand: snap to each new state and draw once.
  useEffect(() => {
    if (!reduced) return;
    uniforms.uMix.value.set(...MIX[mode]);
    uniforms.uNoise.value = noise;
    uniforms.uRanked.value = ranked ? 1 : 0;
    uniforms.uStep.value = step;
    invalidate();
  }, [reduced, mode, noise, ranked, step, uniforms, invalidate]);

  useFrame((state, delta) => {
    const dt = Math.min(delta, 0.05);
    const u = uniforms;
    gl.getDrawingBufferSize(u.uRes.value);
    u.uPR.value = state.viewport.dpr;
    if (reduced) return;
    u.uTime.value += dt;
    const [x, y, z] = MIX[mode];
    const mix = u.uMix.value;
    mix.set(MathUtils.damp(mix.x, x, 3.2, dt), MathUtils.damp(mix.y, y, 3.2, dt), MathUtils.damp(mix.z, z, 3.2, dt));
    u.uNoise.value = MathUtils.damp(u.uNoise.value, noise, 4.5, dt);
    u.uRanked.value = MathUtils.damp(u.uRanked.value, ranked ? 1 : 0, 2.8, dt);
    u.uStep.value = MathUtils.damp(u.uStep.value, step, 4.5, dt);
    const p = u.uPointer.value;
    if (pointer.current.x < -999 || p.x < -999) p.copy(pointer.current);
    else p.lerp(pointer.current, 1 - Math.exp(-dt * 12));
  });

  return (
    <mesh frustumCulled={false}>
      <planeGeometry args={[2, 2]} />
      <shaderMaterial ref={material} vertexShader={vertexShader} fragmentShader={fragmentShader} uniforms={uniforms} transparent />
    </mesh>
  );
}

export default function SlatField(props: SlatState & { reduced: boolean; surface: React.RefObject<HTMLElement | null>; onReady?: () => void }) {
  const host = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(true);
  const [tabVisible, setTabVisible] = useState(true);
  useEffect(() => {
    const node = host.current;
    if (!node) return;
    const observer = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting));
    observer.observe(node);
    const onVisibility = () => setTabVisible(!document.hidden);
    document.addEventListener("visibilitychange", onVisibility);
    return () => { observer.disconnect(); document.removeEventListener("visibilitychange", onVisibility); };
  }, []);
  const compact = typeof window !== "undefined" && (window.innerWidth < 900 || (navigator.hardwareConcurrency || 8) <= 4);
  const frameloop = props.reduced ? "demand" : visible && tabVisible ? "always" : "never";
  return (
    <div ref={host} className="slat-canvas">
      <Canvas
        frameloop={frameloop}
        dpr={[1, compact ? 1.25 : 1.5]}
        gl={{ antialias: false, alpha: true, powerPreference: "high-performance" }}
        onCreated={({ gl }) => { gl.setClearColor(0x000000, 0); props.onReady?.(); }}
        aria-hidden="true"
      >
        <Field {...props} compact={compact} />
      </Canvas>
    </div>
  );
}
