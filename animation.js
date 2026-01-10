gsap.registerPlugin(ScrollTrigger);

/* ================================
   GLOBAL DEFAULTS
================================ */
gsap.defaults({
  ease: "power3.out",
  duration: 1,
});

/* ================================
   ABOUT ME TEXT
================================ */
gsap.from("#aboutMe .sub-title", {
  scrollTrigger: {
    trigger: "#aboutMe",
    start: "top 75%",
  },
  y: 40,
  opacity: 0,
});

gsap.from("#aboutMe p", {
  scrollTrigger: {
    trigger: "#aboutMe",
    start: "top 70%",
  },
  y: 30,
  opacity: 0,
  delay: 0.2,
});

/* ================================
   RESUME BUTTON
================================ */
gsap.from(".resume-btn", {
  scrollTrigger: {
    trigger: ".resume-btn",
    start: "top 80%",
  },
  y: 20,
  opacity: 0,
  scale: 0.9,
});

/* ================================
   TECH STACK TICKER
================================ */
gsap.from(".tech-ticker-wrapper", {
  scrollTrigger: {
    trigger: ".tech-ticker-wrapper",
    start: "top 80%",
  },
  opacity: 0,
  y: 20,
});

/* ================================
   SKILLS SECTION TITLE
================================ */
gsap.from("#skills .sub-title", {
  scrollTrigger: {
    trigger: "#skills",
    start: "top 75%",
  },
  y: 40,
  opacity: 0,
});

/* ================================
   SKILL BARS (ANIMATE WIDTH)
================================ */
document.querySelectorAll(".skill-fill").forEach((bar) => {
  const finalWidth = bar.style.width;
  bar.style.width = "0%";

  gsap.to(bar, {
    scrollTrigger: {
      trigger: bar,
      start: "top 85%",
    },
    width: finalWidth,
    duration: 1.2,
    ease: "power2.out",
  });
});

/* ================================
   EDUCATION CARDS
================================ */
document.querySelectorAll(".eduCard").forEach((card) => {
  gsap.from(card, {
    scrollTrigger: {
      trigger: card,
      start: "top 85%",
      toggleActions: "play none none reverse",
    },
    y: 40,
    opacity: 0,
    duration: 0.9,
    ease: "power3.out",
  });
});

/* ================================
   PROJECT CARDS
================================ */
document.querySelectorAll(".project-card-custom").forEach((card, i) => {
  // Scroll reveal

  gsap.from(card, {
    scrollTrigger: {
      trigger: card,
      start: "top 85%",
      toggleActions: "play none none reverse",
    },
    y: 50,
    opacity: 0,
    scale: 0.97,
    duration: 0.9,
    ease: "power3.out",
  });

  // Hover animation
  card.addEventListener("mouseenter", () => {
    gsap.to(card, {
      x: "+=10",
      duration: 0.1,
      ease: "power2.out",
    });
  });

  card.addEventListener("mouseleave", () => {
    gsap.to(card, {
      x: 0,
      duration: 0.2,
      ease: "power2.out",
    });
  });
});
