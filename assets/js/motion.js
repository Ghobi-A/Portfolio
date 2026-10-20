/* Native editorial motion. Adapt PR #5's intent, not its retired hero selectors. */
(() => {
  "use strict";
  const preference = matchMedia("(prefers-reduced-motion: no-preference)");
  const timing = { feedback: 220, reveal: 420, chart: 680, stagger: 65 };
  const running = new Set();
  const byElement = new WeakMap();
  const play = (element, frames, options = {}) => {
    if (!preference.matches || document.hidden || !element?.animate) return;
    byElement.get(element)?.cancel();
    const animation = element.animate(frames, { duration: timing.reveal, easing: "cubic-bezier(.16,1,.3,1)", ...options });
    byElement.set(element, animation);
    running.add(animation);
    animation.finished.catch(() => {}).finally(() => {
      running.delete(animation);
      if (byElement.get(element) === animation) byElement.delete(element);
    });
  };
  const stop=()=>{running.forEach(animation=>animation.cancel());running.clear();};
  preference.addEventListener("change",stop);
  document.addEventListener("visibilitychange",()=>{if(document.hidden)stop();});
  // One opening composition; deep links enter directly into their evidence.
  if (!location.hash && scrollY < 100) {
    document.querySelectorAll("#dp-title .headline-line").forEach((line, index) =>
      play(line, [
        { clipPath: "inset(0 0 100% 0)", transform: "translateY(6px)" },
        { clipPath: "inset(-10% -3% -10% -3%)", transform: "translateY(0)" },
      ], { delay: index * timing.stagger }));
    const fit = document.querySelector(".privacy-fit");
    if (fit) {
      const length = fit.getTotalLength();
      play(fit, [
        { strokeDasharray: String(length), strokeDashoffset: length },
        { strokeDasharray: String(length), strokeDashoffset: 0 },
      ], { duration: timing.chart, delay: 120 });
      play(document.querySelector(".privacy-bloom"), [
        { clipPath: "inset(0 100% 0 0)" }, { clipPath: "inset(0)" },
      ], { duration: timing.chart, delay: 120 });
    }
  }
  document.addEventListener("privacyselect",event=>{
    play(event.target.querySelector(".is-selected .privacy-dot"),[{strokeWidth:6},{strokeWidth:2}],{duration:timing.feedback});
    play(event.target.querySelector(".privacy-selection"),[{backgroundColor:"#fbd4e7"},{backgroundColor:"#fff0f6"}],{duration:timing.feedback});
  });
  document.addEventListener("evidenceinspect", (event) => {
    // Change emphasis, never animate exact values through false readings.
    play(event.detail.target, [{ opacity: .65 }, { opacity: 1 }], { duration: timing.feedback });
  });
  const sequences=document.querySelectorAll(".partition-chart, .token-flow, .method-rail, .semantic-chain, .simulation-branches");
  if("IntersectionObserver" in window){
    const observer=new IntersectionObserver(entries=>entries.forEach(entry=>{
      if(!entry.isIntersecting)return;
      if (entry.target.matches(".partition-chart")) {
        entry.target.querySelectorAll(".draw-line").forEach((line) => {
          const length = line.hasAttribute("pathLength") ? Number(line.getAttribute("pathLength")) : line.getTotalLength();
          play(line, [
            { strokeDasharray: String(length), strokeDashoffset: length },
            { strokeDasharray: String(length), strokeDashoffset: 0 },
          ], { duration: timing.chart });
        });
      } else {
        [...entry.target.children].forEach((item,index)=>play(item,[{clipPath:"inset(0 100% 0 0)"},{clipPath:"inset(0)"}],{duration:360,delay:Math.min(index*timing.stagger,260)}));
      }
      observer.unobserve(entry.target);
    }),{threshold:.2});
    sequences.forEach(sequence=>observer.observe(sequence));
  }
})();
