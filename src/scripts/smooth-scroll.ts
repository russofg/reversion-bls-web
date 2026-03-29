import Lenis from "lenis";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const prefersReduced = window.matchMedia(
  "(prefers-reduced-motion: reduce)",
).matches;

const lenis = new Lenis({
  duration: prefersReduced ? 0 : 1.2,
  easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
  touchMultiplier: 1.5,
  syncTouch: true,
});

lenis.on("scroll", ScrollTrigger.update);

gsap.ticker.add((time: number) => {
  lenis.raf(time * 1000);
});
gsap.ticker.lagSmoothing(0);

requestAnimationFrame(() => ScrollTrigger.refresh());

document.querySelectorAll<HTMLAnchorElement>('a[href^="#"]').forEach((a) => {
  a.addEventListener("click", (e) => {
    const target = document.querySelector(a.getAttribute("href")!);
    if (target) {
      e.preventDefault();
      lenis.scrollTo(target as HTMLElement, { offset: 0 });
    }
  });
});

export { lenis };
