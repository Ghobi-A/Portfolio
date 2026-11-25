import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ReactLenis, type LenisRef } from "lenis/react";
import { useEffect, useRef, type ReactNode } from "react";
import { useReduced } from "../lib/hooks";
import { velocity } from "../lib/velocity";

gsap.registerPlugin(ScrollTrigger);

/**
 * Lenis smooth scrolling, driven from GSAP's ticker so ScrollTrigger and the
 * glide never disagree. Off under reduced motion (native scrolling instead).
 * In-page links glide; case-study links (native <details>) keep their jump.
 */
export default function SmoothScroll({ children }: { children: ReactNode }) {
  const reduced = useReduced();
  const lenisRef = useRef<LenisRef>(null);

  useEffect(() => {
    if (reduced) return;
    const update = (time: number) => lenisRef.current?.lenis?.raf(time * 1000);
    gsap.ticker.add(update);
    gsap.ticker.lagSmoothing(0);
    const lenis = lenisRef.current?.lenis;
    const onScroll = (instance: { velocity: number }) => { ScrollTrigger.update(); velocity.emit(instance.velocity); };
    lenis?.on("scroll", onScroll);
    const onClick = (event: MouseEvent) => {
      const link = (event.target as HTMLElement).closest?.<HTMLAnchorElement>('a[href^="#"]');
      if (!link || event.defaultPrevented || event.metaKey || event.ctrlKey || !lenis) return;
      let target: HTMLElement | null = null;
      try { target = document.getElementById(decodeURIComponent(link.hash.slice(1))); } catch { return; }
      if (!target || target.matches("details")) return;
      event.preventDefault();
      history.pushState(null, "", link.hash);
      const header = document.querySelector<HTMLElement>(".header")?.offsetHeight ?? 64;
      lenis.scrollTo(target.id === "top" ? 0 : target, { offset: target.id === "top" ? 0 : -header - 56, duration: 1.4, easing: (t) => 1 - Math.pow(1 - t, 4) });
    };
    document.addEventListener("click", onClick);
    const onToggle = () => lenis?.resize();
    document.addEventListener("toggle", onToggle, true);
    const w = window as unknown as { portfolioMotion?: Record<string, unknown> };
    w.portfolioMotion = { ...(w.portfolioMotion ?? {}), lenis };
    return () => {
      gsap.ticker.remove(update);
      lenis?.off("scroll", onScroll);
      document.removeEventListener("click", onClick);
      document.removeEventListener("toggle", onToggle, true);
    };
  }, [reduced]);

  if (reduced) return <>{children}</>;
  return (
    <ReactLenis root ref={lenisRef} options={{ lerp: 0.075, wheelMultiplier: 0.95, smoothWheel: true, autoRaf: false }}>
      {children}
    </ReactLenis>
  );
}
