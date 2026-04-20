(() => {
  const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const isMobile = window.matchMedia("(max-width: 900px), (hover: none)").matches;

  /* Loader */
  const loader = document.getElementById("loader");
  if (loader) {
    const done = () => loader.classList.add("is-done");
    window.addEventListener("load", () => setTimeout(done, prefersReduced ? 200 : 900));
    setTimeout(done, 2400);
  }

  /* Nav: light over cream, dark over hero */
  const nav = document.getElementById("nav");
  if (nav) {
    const darkSections = document.querySelectorAll("[data-nav-dark]");
    const setNav = () => {
      const scrollY = window.scrollY;
      // Default light mode. Switch to dark when over a dark-background section.
      let overDark = false;
      darkSections.forEach(s => {
        const r = s.getBoundingClientRect();
        if (r.top <= 20 && r.bottom >= 20) overDark = true;
      });
      if (scrollY < 10) {
        nav.classList.remove("is-light", "is-dark");
        if (overDark) nav.classList.add("is-dark");
      } else {
        nav.classList.toggle("is-dark", overDark);
        nav.classList.toggle("is-light", !overDark);
      }
    };
    setNav();
    window.addEventListener("scroll", setNav, { passive: true });
    window.addEventListener("resize", setNav);
  }

  /* Mobile menu */
  const menuBtn = document.getElementById("menuBtn");
  const menu = document.getElementById("menu");
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

  /* Progress bar */
  const progress = document.getElementById("progress");
  if (progress) {
    const update = () => {
      const h = document.documentElement;
      const max = h.scrollHeight - h.clientHeight;
      const p = max > 0 ? h.scrollTop / max : 0;
      progress.style.transform = `scaleX(${p})`;
    };
    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
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

  /* Hero parallax (desktop only) */
  const heroBg = document.querySelector(".hero__bg");
  if (heroBg && !prefersReduced && !isMobile) {
    const onScroll = () => {
      const y = Math.min(window.scrollY, 800) * 0.12;
      heroBg.style.transform = `translate3d(0, ${y}px, 0) scale(1.03)`;
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
  }

  /* GSAP hookups */
  const initGsap = () => {
    if (typeof gsap === "undefined" || typeof ScrollTrigger === "undefined" || prefersReduced) return;
    gsap.registerPlugin(ScrollTrigger);
    if (lenis) {
      lenis.on("scroll", ScrollTrigger.update);
      gsap.ticker.add(t => lenis.raf(t * 1000));
      gsap.ticker.lagSmoothing(0);
    }
    const heroTitle = document.querySelector(".hero__title");
    if (heroTitle) gsap.from(heroTitle, { y: 36, opacity: 0, duration: 1.1, ease: "power3.out", delay: 0.2 });
    const heroMeta = document.querySelectorAll(".hero__meta span");
    if (heroMeta.length) gsap.from(heroMeta, { y: 14, opacity: 0, duration: 0.7, stagger: 0.08, ease: "power2.out", delay: 0.35 });
    const heroActions = document.querySelectorAll(".hero__actions .btn, .hero__sub");
    if (heroActions.length) gsap.from(heroActions, { y: 18, opacity: 0, duration: 0.7, stagger: 0.09, ease: "power2.out", delay: 0.55 });

    gsap.utils.toArray(".section-head, .story__lede p, .story__body, .cars__body, .roaster__body, .visit__body, .menu-teaser__head").forEach(el => {
      gsap.from(el, { y: 32, opacity: 0, duration: 0.9, ease: "power2.out", scrollTrigger: { trigger: el, start: "top 82%" } });
    });

    const items = gsap.utils.toArray(".menu-teaser__item");
    if (items.length) {
      gsap.from(items, { y: 24, opacity: 0, duration: 0.7, stagger: 0.08, ease: "power2.out", scrollTrigger: { trigger: ".menu-teaser__grid", start: "top 86%" } });
    }
    const dateCards = gsap.utils.toArray(".date-card");
    if (dateCards.length) {
      gsap.from(dateCards, { y: 20, opacity: 0, duration: 0.6, stagger: 0.06, ease: "power2.out", scrollTrigger: { trigger: ".dates-grid", start: "top 86%" } });
    }

    ScrollTrigger.refresh();
  };

  window.addEventListener("load", () => {
    initLenis();
    initGsap();
  });
})();
