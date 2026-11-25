/** Scroll speed broadcast for kinetic effects (px per frame, like Lenis).
 *  Lenis feeds it; without Lenis, ScrollTrigger's velocity stands in. */
type Listener = (value: number) => void;
const listeners = new Set<Listener>();
export const velocity = {
  emit: (value: number) => listeners.forEach((listen) => listen(value)),
  on: (listener: Listener) => { listeners.add(listener); return () => { listeners.delete(listener); }; },
};
