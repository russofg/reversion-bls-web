import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";

gsap.registerPlugin(ScrollTrigger, SplitText);

const prefersReduced = window.matchMedia(
  "(prefers-reduced-motion: reduce)",
).matches;

initCounters();

if (!prefersReduced) {
  initHeroAnimations();
  initAboutAnimations();
  initServicesAnimations();
  initPortfolioAnimations();
  initContactAnimations();
  initMagneticButtons();
}

function initCounters(): void {
  const counterEls = document.querySelectorAll<HTMLElement>("[data-counter]");
  if (!counterEls.length) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const el = entry.target as HTMLElement;
        observer.unobserve(el);

        const target = parseInt(el.dataset.counter || "0", 10);
        const suffix = el.dataset.counterSuffix || "";

        if (prefersReduced) {
          el.textContent = target + suffix;
          return;
        }

        const obj = { val: 0 };
        gsap.to(obj, {
          val: target,
          duration: 2,
          ease: "power2.out",
          onUpdate: () => {
            el.textContent = Math.round(obj.val) + suffix;
          },
        });
      });
    },
    { threshold: 0.1 },
  );
  counterEls.forEach((el) => observer.observe(el));
}

function initHeroAnimations(): void {
  const heroHeadline =
    document.querySelector<HTMLElement>("[data-hero-headline]");
  if (heroHeadline) {
    const split = new SplitText(heroHeadline, {
      type: "chars,lines",
      linesClass: "overflow-hidden",
    });

    gsap.from(split.chars, {
      y: 120,
      rotateX: -40,
      opacity: 0,
      duration: 1,
      ease: "power4.out",
      stagger: 0.025,
      delay: 0.3,
    });
  }

  const heroBadge = document.querySelector("[data-hero-badge]");
  if (heroBadge) {
    gsap.from(heroBadge, {
      y: 30,
      opacity: 0,
      duration: 0.8,
      ease: "power3.out",
      delay: 0.1,
    });
  }

  const heroDesc = document.querySelector("[data-hero-desc]");
  if (heroDesc) {
    gsap.from(heroDesc, {
      y: 40,
      opacity: 0,
      duration: 1,
      ease: "power3.out",
      delay: 1.2,
    });
  }

  const heroCtas = document.querySelector("[data-hero-ctas]");
  if (heroCtas) {
    gsap.from(heroCtas, {
      y: 30,
      opacity: 0,
      duration: 0.8,
      ease: "power3.out",
      delay: 1.5,
    });
  }

  gsap.to("[data-parallax-bg]", {
    yPercent: 30,
    ease: "none",
    scrollTrigger: {
      trigger: "#home",
      start: "top top",
      end: "bottom top",
      scrub: true,
    },
  });

  gsap.utils.toArray<HTMLElement>("[data-blob]").forEach((blob) => {
    gsap.to(blob, {
      yPercent: -50,
      ease: "none",
      scrollTrigger: {
        trigger: "#home",
        start: "top top",
        end: "bottom top",
        scrub: 0.5,
      },
    });
  });
}

function initAboutAnimations(): void {
  const aboutPanel = document.querySelector("[data-about-panel]");
  if (aboutPanel) {
    gsap.from(aboutPanel, {
      x: -80,
      opacity: 0,
      duration: 1,
      ease: "power3.out",
      scrollTrigger: {
        trigger: "#about",
        start: "top 75%",
      },
    });
  }

  const timeline = document.querySelector("[data-about-timeline]");
  if (timeline) {
    gsap.from(timeline, {
      x: 80,
      opacity: 0,
      duration: 1,
      ease: "power3.out",
      scrollTrigger: {
        trigger: "#about",
        start: "top 70%",
      },
    });
  }

  gsap.utils.toArray<HTMLElement>("[data-timeline-item]").forEach((item, i) => {
    gsap.from(item, {
      clipPath: "inset(0 0 100% 0)",
      opacity: 0,
      duration: 0.8,
      ease: "power3.out",
      delay: i * 0.15,
      scrollTrigger: {
        trigger: item,
        start: "top 85%",
      },
    });
  });
}

function initServicesAnimations(): void {
  gsap.utils.toArray<HTMLElement>("[data-service-card]").forEach((card, i) => {
    gsap.from(card, {
      y: 60,
      opacity: 0,
      duration: 0.8,
      ease: "power3.out",
      delay: i * 0.15,
      scrollTrigger: {
        trigger: "#services",
        start: "top 65%",
      },
    });
  });
}

function initPortfolioAnimations(): void {
  const track = document.querySelector("[data-carousel-track]");
  if (track) {
    gsap.from(track.children, {
      y: 40,
      opacity: 0,
      duration: 0.8,
      ease: "power3.out",
      stagger: 0.08,
      scrollTrigger: {
        trigger: "#portfolio",
        start: "top 70%",
      },
    });
  }
}

function initContactAnimations(): void {
  const leftPanel = document.querySelector("[data-contact-left]");
  const rightPanel = document.querySelector("[data-contact-right]");

  if (leftPanel) {
    gsap.from(leftPanel, {
      x: -60,
      opacity: 0,
      duration: 1,
      ease: "power3.out",
      scrollTrigger: {
        trigger: "#contact",
        start: "top 70%",
      },
    });
  }

  if (rightPanel) {
    gsap.from(rightPanel, {
      x: 60,
      opacity: 0,
      duration: 1,
      ease: "power3.out",
      scrollTrigger: {
        trigger: "#contact",
        start: "top 70%",
      },
    });
  }
}

function initMagneticButtons(): void {
  document.querySelectorAll<HTMLElement>("[data-magnetic]").forEach((btn) => {
    btn.addEventListener("mousemove", (e) => {
      const rect = btn.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;
      gsap.to(btn, {
        x: x * 0.3,
        y: y * 0.3,
        duration: 0.4,
        ease: "power2.out",
      });
    });

    btn.addEventListener("mouseleave", () => {
      gsap.to(btn, {
        x: 0,
        y: 0,
        duration: 0.6,
        ease: "elastic.out(1, 0.3)",
      });
    });
  });
}
