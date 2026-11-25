import { lazy, Suspense, useEffect, useRef, useState, type ImgHTMLAttributes } from "react";
import { useFinePointer, useHydrated, useReduced } from "../lib/hooks";

const DistortCanvas = lazy(() => import("./DistortCanvas"));

/**
 * A project image that ripples under the pointer (React Three Fiber).
 * The plain <img> is always rendered: it is the prerendered content, the layout
 * and the fallback. On a fine pointer with WebGL, the first hover lazily mounts a
 * canvas over it that redraws the same image through a ripple, lens and
 * fuchsia-tinted RGB-split shader. Touch, reduced motion and no-WebGL keep the image.
 */
export default function DistortImage(props: ImgHTMLAttributes<HTMLImageElement> & { src: string }) {
  const hydrated = useHydrated();
  const fine = useFinePointer();
  const reduced = useReduced();
  const [webgl, setWebgl] = useState(false);
  const [armed, setArmed] = useState(false);
  const [ready, setReady] = useState(false);
  const wrap = useRef<HTMLSpanElement>(null);
  useEffect(() => setWebgl(document.documentElement.classList.contains("has-field")), []);
  const enabled = hydrated && fine && !reduced && webgl;

  return (
    <span ref={wrap} className={`distort${ready ? " is-ready" : ""}`} onPointerEnter={() => { if (enabled) setArmed(true); }}>
      <img {...props} />
      {enabled && armed && (
        <Suspense fallback={null}>
          <DistortCanvas src={props.src} surface={wrap} onReady={() => setReady(true)} />
        </Suspense>
      )}
    </span>
  );
}
