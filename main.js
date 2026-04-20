(() => {
  const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const isMobile = window.matchMedia("(max-width: 900px), (hover: none)").matches;

  /* Mobile menu */
  const menuBtn = document.getElementById("menuBtn");
  const menu = document.getElementById("menu-overlay");
  const menuClose = document.getElementById("menuClose");
  if (menuBtn && menu) {
    const open = () => {
      menu.classList.add("is-open");
      menu.removeAttribute("inert");
      menuBtn.setAttribute("aria-expanded", "true");
      document.body.style.overflow = "hidden";
    };
    const close = () => {
      menu.classList.remove("is-open");
      menu.setAttribute("inert", "");
      menuBtn.setAttribute("aria-expanded", "false");
      document.body.style.overflow = "";
    };
    menuBtn.addEventListener("click", open);
    menuClose && menuClose.addEventListener("click", close);
    menu.querySelectorAll("a").forEach(a => a.addEventListener("click", close));
    document.addEventListener("keydown", e => { if (e.key === "Escape") close(); });
  }

  /* Lenis (desktop only) */
  let lenis = null;
  const initLenis = () => {
    if (prefersReduced || isMobile || typeof Lenis === "undefined") return;
    lenis = new Lenis({
      duration: 1.1,
      easing: t => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true
    });
    const raf = t => { lenis.raf(t); requestAnimationFrame(raf); };
    requestAnimationFrame(raf);
  };

  /* Reveal */
  const reveals = document.querySelectorAll(".reveal");
  if (reveals.length) {
    const io = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          e.target.classList.add("is-in");
          io.unobserve(e.target);
        }
      });
    }, { threshold: 0.14, rootMargin: "0px 0px -40px 0px" });
    reveals.forEach(el => io.observe(el));
  }

  /* Polaroid subtle float on scroll (desktop only) */
  const polaroids = document.querySelectorAll(".polaroid");
  if (polaroids.length && !prefersReduced && !isMobile) {
    const baseRot = new WeakMap();
    polaroids.forEach(p => {
      const m = getComputedStyle(p).transform;
      const match = m.match(/matrix\(([^,]+),([^,]+)/);
      let rot = 0;
      if (match) rot = Math.atan2(parseFloat(match[2]), parseFloat(match[1])) * 180 / Math.PI;
      baseRot.set(p, rot);
    });
    const onScroll = () => {
      const y = window.scrollY;
      polaroids.forEach((p, i) => {
        const base = baseRot.get(p) || 0;
        const offset = Math.sin((y / 200) + i) * 0.6;
        p.style.transform = `rotate(${base + offset}deg) translateY(${Math.sin((y / 400) + i) * 4}px)`;
      });
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
  }

  /* GSAP */
  const initGsap = () => {
    if (typeof gsap === "undefined" || typeof ScrollTrigger === "undefined" || prefersReduced) return;
    gsap.registerPlugin(ScrollTrigger);
    if (lenis) {
      lenis.on("scroll", ScrollTrigger.update);
      gsap.ticker.add(t => lenis.raf(t * 1000));
      gsap.ticker.lagSmoothing(0);
    }

    const heroTitle = document.querySelector(".hero__title");
    if (heroTitle) gsap.from(heroTitle, { y: 28, opacity: 0, duration: 1, ease: "power3.out", delay: 0.1 });
    const heroLines = document.querySelectorAll(".hero__eyebrow, .hero__sub, .hero__actions, .hero__facts");
    if (heroLines.length) gsap.from(heroLines, { y: 16, opacity: 0, duration: 0.7, stagger: 0.08, ease: "power2.out", delay: 0.25 });
    const polls = document.querySelectorAll(".polaroid");
    if (polls.length) gsap.from(polls, { y: 30, opacity: 0, scale: 0.95, duration: 0.9, stagger: 0.12, ease: "power3.out", delay: 0.4 });

    gsap.utils.toArray(".story__body, .chalk__head, .cars__top, .thump__body, .visit__body, .ticket, .chalk__col, .cc-info__lede, .cc-hero__sub").forEach(el => {
      gsap.from(el, { y: 26, opacity: 0, duration: 0.8, ease: "power2.out", scrollTrigger: { trigger: el, start: "top 84%" } });
    });

    ScrollTrigger.refresh();
  };

  window.addEventListener("load", () => {
    initLenis();
    initGsap();
  });
})();
