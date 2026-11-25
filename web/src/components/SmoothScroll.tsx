import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ReactLenis, useLenis, type LenisRef } from "lenis/react";
import { useEffect, useRef, type ReactNode } from "react";
import { useReduced } from "../lib/hooks";
import { velocity } from "../lib/velocity";

gsap.registerPlugin(ScrollTrigger);

/** Wires the live Lenis instance (available after ReactLenis mounts) into the page. */
function LenisBridge() {
  // Every Lenis scroll updates ScrollTrigger and broadcasts speed for kinetic effects.
  const lenis = useLenis((instance) => {
    ScrollTrigger.update();
    velocity.emit(instance.velocity);
  });

  useEffect(() => {
    if (!lenis) return;
    const w = window as unknown as { portfolioMotion?: Record<string, unknown> };
    w.portfolioMotion = { ...(w.portfolioMotion ?? {}), lenis };
    // In-page links glide; case-study links (native <details>) keep their open-and-jump.
    const onClick = (event: MouseEvent) => {
      const link = (event.target as HTMLElement).closest?.<HTMLAnchorElement>('a[href^="#"]');
      if (!link || event.defaultPrevented || event.metaKey || event.ctrlKey) return;
      let target: HTMLElement | null = null;
      try { target = document.getElementById(decodeURIComponent(link.hash.slice(1))); } catch { return; }
      if (!target || target.matches("details")) return;
      event.preventDefault();
      history.pushState(null, "", link.hash);
      const header = document.querySelector<HTMLElement>(".header")?.offsetHeight ?? 64;
      lenis.scrollTo(target.id === "top" ? 0 : target, { offset: target.id === "top" ? 0 : -header - 56, duration: 1.4, easing: (t) => 1 - Math.pow(1 - t, 4) });
    };
    const onToggle = () => lenis.resize();
    document.addEventListener("click", onClick);
    document.addEventListener("toggle", onToggle, true);
    return () => {
      document.removeEventListener("click", onClick);
      document.removeEventListener("toggle", onToggle, true);
      if (w.portfolioMotion?.lenis === lenis) w.portfolioMotion.lenis = undefined;
    };
  }, [lenis]);

  return null;
}

/**
 * Lenis smooth scrolling, driven from GSAP's ticker so ScrollTrigger and the
 * glide never disagree. Off under reduced motion (native scrolling instead).
 */
export default function SmoothScroll({ children }: { children: ReactNode }) {
  const reduced = useReduced();
  const lenisRef = useRef<LenisRef>(null);

  useEffect(() => {
    if (reduced) return;
    const update = (time: number) => lenisRef.current?.lenis?.raf(time * 1000);
    gsap.ticker.add(update);
    gsap.ticker.lagSmoothing(0);
    return () => gsap.ticker.remove(update);
  }, [reduced]);

  if (reduced) return <>{children}</>;
  return (
    <ReactLenis root ref={lenisRef} options={{ lerp: 0.09, wheelMultiplier: 1, smoothWheel: true, autoRaf: false }}>
      <LenisBridge />
      {children}
    </ReactLenis>
  );
}
