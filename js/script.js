function initStarfield() {
  const canvas = document.getElementById("starfield");
  if (!canvas || !canvas.getContext) {
    return { destroy() {} };
  }

  const ctx = canvas.getContext("2d", { alpha: true });
  if (!ctx) {
    return { destroy() {} };
  }

  const rootStyles = getComputedStyle(document.documentElement);
  const token = (name) => rootStyles.getPropertyValue(name).trim();

  const colors = {
    bgDeep: token("--bg-deep"),
    bgMid: token("--bg-mid"),
    starNear: token("--text-primary"),
    starDistant: token("--text-muted"),
    glowCyan: token("--cosmic-cyan"),
    glowStar: token("--accent-star"),
    nebulaPurple: token("--cosmic-purple"),
    nebulaRose: token("--cosmic-rose"),
  };

  // ===== Parâmetros visuais (Densidade 5/10, Motion 6/10 — DESIGN.md) =====
  const STAR_DENSITY = 0.00024; // estrelas por px² (dobrado)
  const NEAR_RATIO = 0.3; // proporção de estrelas próximas (parallax)
  const GLOW_CHANCE = 0.08; // glow apenas em estrelas próximas raras
  const PARALLAX_FACTOR = 0.06; // deslocamento sutil vinculado ao scroll
  const TWINKLE_SPEED = 0.0006; // cintilação lenta, quase imperceptível

  // ===== Pulso (top 10% por tamanho) =====
  const PULSE_PERCENTILE = 0.9; // corte: percentil 90 de raio
  const PULSE_AMPLITUDE = 0.15; // brilho oscila ±15%
  const PULSE_MIN_PERIOD = 2000; // período aleatório entre 2s...
  const PULSE_PERIOD_SPREAD = 3000; // ...e 5s por estrela

  // ===== Meteoros =====
  const METEOR_MIN_DELAY = 2000; // 1 meteoro a cada 2s...
  const METEOR_DELAY_SPREAD = 1000; // ...a 3s
  const METEOR_MIN_SPEED = 0.45; // px/ms
  const METEOR_SPEED_SPREAD = 0.2;
  const METEOR_MIN_LENGTH = 120; // comprimento do rastro (px)
  const METEOR_LENGTH_SPREAD = 60;
  const METEOR_WIDTH = 1.5;
  const METEOR_ALPHA = 0.85;

  const reducedMotionQuery = window.matchMedia(
    "(prefers-reduced-motion: reduce)",
  );

  let width = 0;
  let height = 0;
  let dpr = 1;
  let stars = [];
  let meteors = [];
  let nextMeteorAt = 0;
  let lastFrameAt = 0;
  let bgGradient = null;
  let nebulaLayer = null;
  let animationId = null;

  const markPulsingStars = () => {
    if (!stars.length) return;

    // Corte do percentil 90 por raio: só as maiores pulsam
    const sortedRadii = stars.map((star) => star.radius).sort((a, b) => a - b);
    const threshold =
      sortedRadii[Math.floor(sortedRadii.length * PULSE_PERCENTILE)];

    for (const star of stars) {
      star.hasPulse = star.radius >= threshold;

      if (star.hasPulse) {
        star.pulsePeriod =
          PULSE_MIN_PERIOD + Math.random() * PULSE_PERIOD_SPREAD;
        star.pulsePhase = Math.random() * Math.PI * 2;
      }
    }
  };

  const createStars = () => {
    const count = Math.floor(width * height * STAR_DENSITY);

    stars = Array.from({ length: count }, () => {
      const isNear = Math.random() < NEAR_RATIO;

      // Distribuição enviesada: Math.pow concentra a massa nos raios
      // pequenos e deixa uma cauda rara de estrelas grandes
      const radius = isNear
        ? 0.6 + Math.pow(Math.random(), 2.2) * 1.15 // 0.6px–1.75px
        : 0.3 + Math.pow(Math.random(), 2) * 0.45; // 0.3px–0.75px

      return {
        x: Math.random() * width,
        y: Math.random() * height,
        radius,
        isNear,
        hasGlow: isNear && Math.random() < GLOW_CHANCE,
        glowColor: Math.random() < 0.5 ? colors.glowCyan : colors.glowStar,
        twinklePhase: Math.random() * Math.PI * 2,
        twinkleSpeed: 0.5 + Math.random(),
        hasPulse: false,
        pulsePeriod: 0,
        pulsePhase: 0,
      };
    });

    markPulsingStars();
  };

  const createBackgroundGradient = () => {
    // Gradiente radial suave de --bg-mid para --bg-deep (spec §5)
    bgGradient = ctx.createRadialGradient(
      width / 2,
      height * 0.35,
      0,
      width / 2,
      height * 0.35,
      Math.max(width, height),
    );
    bgGradient.addColorStop(0, colors.bgMid);
    bgGradient.addColorStop(1, colors.bgDeep);
  };

  const renderNebulae = () => {
    // Pré-renderiza as nebulosas em canvas offscreen (só redesenha no resize)
    nebulaLayer = document.createElement("canvas");
    nebulaLayer.width = Math.max(1, Math.floor(width * dpr));
    nebulaLayer.height = Math.max(1, Math.floor(height * dpr));

    const nebulaCtx = nebulaLayer.getContext("2d");
    if (!nebulaCtx) return;

    nebulaCtx.scale(dpr, dpr);

    // Manchas de baixíssima opacidade (2–5% — spec §5)
    const blobs = [
      { color: colors.nebulaPurple, x: 0.2, y: 0.3, r: 0.5, alpha: 0.05 },
      { color: colors.nebulaRose, x: 0.8, y: 0.7, r: 0.45, alpha: 0.04 },
      { color: colors.nebulaPurple, x: 0.65, y: 0.12, r: 0.35, alpha: 0.03 },
    ];

    const maxSide = Math.max(width, height);

    for (const blob of blobs) {
      const gradient = nebulaCtx.createRadialGradient(
        width * blob.x,
        height * blob.y,
        0,
        width * blob.x,
        height * blob.y,
        maxSide * blob.r,
      );
      gradient.addColorStop(0, blob.color);
      gradient.addColorStop(1, "transparent");

      nebulaCtx.globalAlpha = blob.alpha;
      nebulaCtx.fillStyle = gradient;
      nebulaCtx.fillRect(0, 0, width, height);
    }
  };

  const spawnMeteor = () => {
    // Nasce no terço superior e cruza em diagonal (25°–40°)
    const angle = ((25 + Math.random() * 15) * Math.PI) / 180;
    const goesRight = Math.random() < 0.5;

    meteors.push({
      x: Math.random() * width,
      y: Math.random() * height * 0.35,
      dirX: goesRight ? Math.cos(angle) : -Math.cos(angle),
      dirY: Math.sin(angle),
      speed: METEOR_MIN_SPEED + Math.random() * METEOR_SPEED_SPREAD,
      length: METEOR_MIN_LENGTH + Math.random() * METEOR_LENGTH_SPREAD,
    });
  };

  const updateMeteors = (time, delta) => {
    if (time >= nextMeteorAt) {
      spawnMeteor();
      nextMeteorAt =
        time + METEOR_MIN_DELAY + Math.random() * METEOR_DELAY_SPREAD;
    }

    meteors = meteors.filter((meteor) => {
      meteor.x += meteor.dirX * meteor.speed * delta;
      meteor.y += meteor.dirY * meteor.speed * delta;

      const margin = meteor.length;
      return (
        meteor.x > -margin &&
        meteor.x < width + margin &&
        meteor.y < height + margin
      );
    });
  };

  const drawMeteors = () => {
    for (const meteor of meteors) {
      const tailX = meteor.x - meteor.dirX * meteor.length;
      const tailY = meteor.y - meteor.dirY * meteor.length;

      // Rastro: cabeça em --text-primary desvanecendo até transparente
      const gradient = ctx.createLinearGradient(
        meteor.x,
        meteor.y,
        tailX,
        tailY,
      );
      gradient.addColorStop(0, colors.starNear);
      gradient.addColorStop(1, "transparent");

      ctx.globalAlpha = METEOR_ALPHA;
      ctx.strokeStyle = gradient;
      ctx.lineWidth = METEOR_WIDTH;
      ctx.lineCap = "round";
      ctx.beginPath();
      ctx.moveTo(meteor.x, meteor.y);
      ctx.lineTo(tailX, tailY);
      ctx.stroke();
    }

    ctx.globalAlpha = 1;
  };

  const getPulseFactor = (star, time) => {
    if (!star.hasPulse) return 1;
    return (
      1 +
      PULSE_AMPLITUDE *
        Math.sin((time / star.pulsePeriod) * Math.PI * 2 + star.pulsePhase)
    );
  };

  const drawFrame = (time = 0) => {
    ctx.fillStyle = bgGradient || colors.bgDeep;
    ctx.fillRect(0, 0, width, height);

    if (nebulaLayer) ctx.drawImage(nebulaLayer, 0, 0, width, height);

    // Parallax: estrelas próximas se deslocam com o scroll (wrap vertical)
    const scrollOffset = window.scrollY * PARALLAX_FACTOR;
    const animate = !reducedMotionQuery.matches;

    for (const star of stars) {
      const y = star.isNear
        ? (((star.y - scrollOffset) % height) + height) % height
        : star.y;

      const pulse = animate ? getPulseFactor(star, time) : 1;

      if (star.isNear) {
        // Base 0.87 nas pulsantes para o pico de +15% caber sem clipping
        const base = star.hasPulse ? 0.87 : 1;
        ctx.globalAlpha = Math.min(1, base * pulse);
        ctx.fillStyle = colors.starNear;
      } else {
        // --text-muted com cintilação lenta em torno de alpha ~0.3
        const twinkle = animate
          ? Math.sin(
              time * TWINKLE_SPEED * star.twinkleSpeed + star.twinklePhase,
            )
          : 0;
        ctx.globalAlpha = Math.min(1, (0.42 + twinkle * 0.18) * pulse);
        ctx.fillStyle = colors.starDistant;
      }

      if (star.hasGlow) {
        ctx.shadowBlur = 6;
        ctx.shadowColor = star.glowColor;
      }

      ctx.beginPath();
      ctx.arc(star.x, y, star.radius, 0, Math.PI * 2);
      ctx.fill();

      if (star.hasGlow) ctx.shadowBlur = 0;
    }

    ctx.globalAlpha = 1;

    if (animate) drawMeteors();
  };

  const startLoop = () => {
    if (animationId !== null) return;

    lastFrameAt = 0;

    const tick = (time) => {
      // Delta limitado a 50ms: evita "salto" de meteoro ao voltar de aba inativa
      const delta = lastFrameAt ? Math.min(time - lastFrameAt, 50) : 16;
      lastFrameAt = time;

      if (!nextMeteorAt) {
        nextMeteorAt =
          time + METEOR_MIN_DELAY + Math.random() * METEOR_DELAY_SPREAD;
      }

      updateMeteors(time, delta);
      drawFrame(time);
      animationId = requestAnimationFrame(tick);
    };

    animationId = requestAnimationFrame(tick);
  };

  const stopLoop = () => {
    if (animationId === null) return;
    cancelAnimationFrame(animationId);
    animationId = null;
  };

  const handleMotionChange = () => {
    // Movimento reduzido: pausa o loop, descarta meteoros e renderiza
    // um único frame estático
    if (reducedMotionQuery.matches) {
      stopLoop();
      meteors = [];
      drawFrame(0);
      return;
    }
    startLoop();
  };

  const handleResize = () => {
    dpr = window.devicePixelRatio || 1;
    width = window.innerWidth;
    height = window.innerHeight;

    // Buffer interno em pixels físicos (nitidez em telas High-DPI)
    canvas.width = Math.floor(width * dpr);
    canvas.height = Math.floor(height * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    createStars();
    createBackgroundGradient();
    renderNebulae();

    // Redesenho imediato para não "esticar" a imagem no resize
    if (reducedMotionQuery.matches) drawFrame(0);
  };

  window.addEventListener("resize", handleResize, { passive: true });
  reducedMotionQuery.addEventListener("change", handleMotionChange);

  handleResize();
  handleMotionChange();

  // Cleanup: cancela o rAF e remove listeners (evita memory leaks)
  const destroyStarfield = () => {
    stopLoop();
    window.removeEventListener("resize", handleResize);
    reducedMotionQuery.removeEventListener("change", handleMotionChange);
    stars = [];
    meteors = [];
    nebulaLayer = null;
  };

  return destroyStarfield;
}

function initFloatingNav() {
  const nav = document.querySelector(".floating-nav");
  if (!nav) return;

  const hero = document.getElementById("hero");

  const getThreshold = () => {
    if (hero) return hero.offsetHeight * 0.6;
    return window.innerHeight * 0.6 || 300;
  };

  const handleScroll = () => {
    nav.classList.toggle("visible", window.scrollY > getThreshold());
  };

  window.addEventListener("scroll", handleScroll, { passive: true });
  handleScroll();
}

function initMarioScrollAnimation() {
  if (typeof gsap === "undefined" || typeof ScrollTrigger === "undefined")
    return;

  gsap.registerPlugin(ScrollTrigger);

  const tl = gsap.timeline({
    scrollTrigger: {
      trigger: "#hero",
      start: "top top",
      end: "+=100%",
      scrub: true,
    },
  });

  tl.to(".hero__mario", { y: "100vh", ease: "none", duration: 1 }, 0).to(
    ".hero__mario",
    { opacity: 0, ease: "none", duration: 0.5 },
    0.5,
  );
}

function initYoshiScrollAnimation() {
  if (typeof gsap === "undefined" || typeof ScrollTrigger === "undefined")
    return;

  gsap.registerPlugin(ScrollTrigger);

  const tl = gsap.timeline({
    scrollTrigger: {
      trigger: "#hero",
      start: "top top",
      end: "+=100%",
      scrub: true,
    },
  });

  tl.to(".hero__yoshi", { y: "100vh", ease: "none", duration: 1 }, 0).to(
    ".hero__yoshi",
    { opacity: 0, ease: "none", duration: 0.5 },
    0.5,
  );
}

function initHeroContentScrollAnimation() {
  if (typeof gsap === "undefined" || typeof ScrollTrigger === "undefined")
    return;

  gsap.registerPlugin(ScrollTrigger);

  const tl = gsap
    .timeline({
      scrollTrigger: {
        trigger: "#hero",
        start: "top top",
        end: "+=100%",
        scrub: true,
        pin: ".hero__content-layer",
        pinSpacing: false,
      },
    })

    .to(
      ".hero__content-layer",
      { opacity: 0, ease: "none", duration: 0.5 },
      0.5,
    );

  const tl2 = gsap
    .timeline({
      scrollTrigger: {
        trigger: "#hero",
        start: "top top",
        end: " +=100%",
        scrub: true,
        pin: "hero__scroll-indicator",
        pinSpacing: false,
      },
    })

    .to(
      ".hero__scroll-indicator",
      { opacity: 0, ease: "none", duration: 0.1 },
      0.1,
    );
}

function initPlanetZoomAnimation() {
  if (typeof gsap === "undefined" || typeof ScrollTrigger === "undefined")
    return;

  gsap.registerPlugin(ScrollTrigger);

  const planet = document.querySelector(".hero__planet");
  if (!planet) return;

  gsap
    .timeline({
      scrollTrigger: {
        trigger: "#hero",
        start: "top top",
        end: "+=100%",
        scrub: true,
      },
    })
    .fromTo(
      planet,
      {
        xPercent: -50,
        yPercent: 50,
        scale: 1,
        force3D: true,
        transformOrigin: "50% 100%",
      },
      {
        xPercent: -50,
        yPercent: 50,
        scale: 3.5,
        ease: "none",
        duration: 1,
      },
      0,
    );
}

function initPersonagensParallax() {
  if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;

  gsap.registerPlugin(ScrollTrigger);

  const section = document.getElementById('personagens');
  if (!section) return;

  if (
    typeof window.matchMedia === 'function' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  ) {
    return;
  }

  const parallaxConfigs = [
    {
      selector: '.personagem--mario',
      from: { x: -14, y: -42 },
      to: { x: 22, y: 188 },
      scrub: 0.8,
    },
    {
      selector: '.personagem--luigi',
      from: { x: 18, y: -28 },
      to: { x: -32, y: 210 },
      scrub: 3.3,
    },
    {
      selector: '.personagem--peach',
      from: { x: -8, y: -50 },
      to: { x: 24, y: 164 },
      scrub: 1.05,
    },
    {
      selector: '.personagem--rosalina',
      from: { x: -20, y: -24 },
      to: { x: 36, y: 232 },
      scrub: 1.45,
    },
    {
      selector: '.personagem--yoshi',
      from: { x: 14, y: -38 },
      to: { x: -46, y: 176 },
      scrub: 0.65,
    },
    {
      selector: '.personagem--bowser-jr',
      from: { x: -16, y: -18 },
      to: { x: 30, y: 198 },
      scrub: 1.15,
    },
  ];

  ScrollTrigger.matchMedia({
    '(prefers-reduced-motion: no-preference) and (min-width: 768px)': function () {
      parallaxConfigs.forEach((cfg) => {
        const el = document.querySelector(cfg.selector);
        if (!el) return;

        gsap.fromTo(
          el,
          {
            x: cfg.from.x,
            y: cfg.from.y,
            force3D: true,
          },
          {
            x: cfg.to.x,
            y: cfg.to.y,
            ease: 'none',
            immediateRender: false,
            scrollTrigger: {
              trigger: section,
              start: 'top bottom',
              end: 'bottom top',
              scrub: cfg.scrub,
              invalidateOnRefresh: true,
            },
          }
        );
      });
    },
  });
}

function initPersonagensBg() {
  const host = document.getElementById("personagens-particles-js");
  if (!host) return () => {};

  // Cria o canvas dentro do container já posicionado (inset:0) pelo CSS.
  // O container é pointer-events:none e o canvas é pointer-events:auto,
  // então hover/click funcionam sem bloquear os cards de personagem.
  const canvas = document.createElement("canvas");
  if (!canvas.getContext) return () => {};

  const ctx = canvas.getContext("2d", { alpha: true });
  if (!ctx) return () => {};

  canvas.style.display = "block";
  canvas.style.width = "100%";
  canvas.style.height = "100%";
  host.appendChild(canvas);

  const rootStyles = getComputedStyle(document.documentElement);
  const token = (name) => rootStyles.getPropertyValue(name).trim();

  // Cores exclusivamente via tokens do :root (troca de tema desacoplada)
  const readColors = () => ({
    dot: token("--particles-dot"),
    line: token("--particles-line"),
    accent: token("--particles-accent"),
  });
  let colors = readColors();

  // ===== Spec de comportamento (mapeamento ParticlesComponent) =====
  const BASE_COUNT = 140; // referência para área de 800×800 (density)
  const DENSITY_AREA = 800 * 800;
  const MOBILE_COUNT = 80; // §9 — reduz em telas pequenas
  const MAX_COUNT = 220; // teto de segurança (escala + push)

  const SIZE_MIN = 1;
  const SIZE_MAX = 3;
  const SIZE_SPEED = 0.0012; // pulso de tamanho (px/ms)
  const STROKE_WIDTH = 0.5; // halo fino na cor accent

  const OPACITY_BASE = 0.7;
  const OPACITY_MIN = 0.3;
  const OPACITY_SPEED = 0.0006; // "respiração" da opacidade

  const MOVE_SPEED = 0.024; // px/ms (equivale a ~2 no particles.js)

  const LINK_DISTANCE = 160; // distância máx. de conexão (px)
  const LINK_DISTANCE_SQ = LINK_DISTANCE * LINK_DISTANCE;
  const LINK_OPACITY = 0.4;
  const LINK_WIDTH = 1.2;

  const GRAB_DISTANCE = 220; // raio da "teia magnética" no hover
  const GRAB_DISTANCE_SQ = GRAB_DISTANCE * GRAB_DISTANCE;
  const GRAB_OPACITY = 0.8;

  const PUSH_COUNT = 4; // partículas adicionadas por clique
  const RETINA_MAX_DPR = 2; // §9 — não renderiza acima de 2x

  const reducedMotionQuery = window.matchMedia(
    "(prefers-reduced-motion: reduce)",
  );
  const mobileQuery = window.matchMedia("(max-width: 767px)");

  let width = 0;
  let height = 0;
  let dpr = 1;
  let particles = [];
  let animationId = null;
  let lastFrameAt = 0;
  let inView = true;
  const pointer = { x: -1, y: -1, active: false };

  const targetCount = () => {
    if (mobileQuery.matches) return MOBILE_COUNT;
    // Escala proporcional à área (comportamento density do particles.js)
    const scaled = Math.round((BASE_COUNT * (width * height)) / DENSITY_AREA);
    return Math.min(MAX_COUNT, Math.max(BASE_COUNT, scaled));
  };

  const createParticle = (x, y) => {
    const angle = Math.random() * Math.PI * 2;
    return {
      x: x ?? Math.random() * width,
      y: y ?? Math.random() * height,
      dirX: Math.cos(angle),
      dirY: Math.sin(angle),
      radius: SIZE_MIN + Math.random() * (SIZE_MAX - SIZE_MIN),
      sizePhase: Math.random() * Math.PI * 2,
      opacityPhase: Math.random() * Math.PI * 2,
    };
  };

  const buildParticles = () => {
    const count = targetCount();
    particles = Array.from({ length: count }, () => createParticle());
  };

  const bounce = (p, delta) => {
    p.x += p.dirX * MOVE_SPEED * delta;
    p.y += p.dirY * MOVE_SPEED * delta;

    // out_mode: "bounce" — quica nas bordas, densidade constante
    if (p.x <= 0 || p.x >= width) {
      p.dirX *= -1;
      p.x = Math.max(0, Math.min(width, p.x));
    }
    if (p.y <= 0 || p.y >= height) {
      p.dirY *= -1;
      p.y = Math.max(0, Math.min(height, p.y));
    }
  };

  const drawLinks = () => {
    ctx.lineWidth = LINK_WIDTH;

    for (let i = 0; i < particles.length; i += 1) {
      const a = particles[i];

      for (let j = i + 1; j < particles.length; j += 1) {
        const b = particles[j];
        const dx = a.x - b.x;
        const dy = a.y - b.y;
        const distSq = dx * dx + dy * dy;
        if (distSq > LINK_DISTANCE_SQ) continue;

        const t = 1 - distSq / LINK_DISTANCE_SQ; // mais perto = mais opaco
        ctx.globalAlpha = LINK_OPACITY * t;
        ctx.strokeStyle = colors.line;
        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(b.x, b.y);
        ctx.stroke();
      }
    }
  };

  const drawGrab = () => {
    if (!pointer.active) return;

    ctx.lineWidth = LINK_WIDTH;

    for (const p of particles) {
      const dx = p.x - pointer.x;
      const dy = p.y - pointer.y;
      const distSq = dx * dx + dy * dy;
      if (distSq > GRAB_DISTANCE_SQ) continue;

      const t = 1 - distSq / GRAB_DISTANCE_SQ;
      ctx.globalAlpha = GRAB_OPACITY * t;
      ctx.strokeStyle = colors.line;
      ctx.beginPath();
      ctx.moveTo(p.x, p.y);
      ctx.lineTo(pointer.x, pointer.y);
      ctx.stroke();
    }
  };

  const drawParticles = (time, animate) => {
    for (const p of particles) {
      // Pulso de tamanho (size_min → radius) e de opacidade (respiração)
      const sizeWave = animate
        ? (Math.sin(time * SIZE_SPEED + p.sizePhase) + 1) / 2
        : 0.5;
      const radius = SIZE_MIN + (p.radius - SIZE_MIN) * sizeWave;

      const opacityWave = animate
        ? (Math.sin(time * OPACITY_SPEED + p.opacityPhase) + 1) / 2
        : 1;
      const alpha =
        OPACITY_MIN + (OPACITY_BASE - OPACITY_MIN) * opacityWave;

      ctx.globalAlpha = alpha;
      ctx.fillStyle = colors.dot;
      ctx.beginPath();
      ctx.arc(p.x, p.y, radius, 0, Math.PI * 2);
      ctx.fill();

      // Stroke fino em accent — leve halo
      ctx.globalAlpha = Math.min(1, alpha + 0.15);
      ctx.strokeStyle = colors.accent;
      ctx.lineWidth = STROKE_WIDTH;
      ctx.stroke();
    }
  };

  const drawFrame = (time = 0, animate = true) => {
    ctx.clearRect(0, 0, width, height);
    drawLinks();
    drawGrab();
    drawParticles(time, animate);
    ctx.globalAlpha = 1;
  };

  const startLoop = () => {
    if (animationId !== null) return;
    lastFrameAt = 0;

    const tick = (time) => {
      const delta = lastFrameAt ? Math.min(time - lastFrameAt, 50) : 16;
      lastFrameAt = time;

      for (const p of particles) bounce(p, delta);
      drawFrame(time, true);
      animationId = requestAnimationFrame(tick);
    };

    animationId = requestAnimationFrame(tick);
  };

  const stopLoop = () => {
    if (animationId === null) return;
    cancelAnimationFrame(animationId);
    animationId = null;
  };

  const syncPlayState = () => {
    // Respeita prefers-reduced-motion (§9): sem linhas de grab, sem loop,
    // apenas um frame estático (partículas + constelação paradas)
    if (reducedMotionQuery.matches) {
      stopLoop();
      pointer.active = false;
      drawFrame(0, false);
      return;
    }
    // Pausa fora do viewport (IntersectionObserver) — economiza CPU
    if (!inView) {
      stopLoop();
      return;
    }
    startLoop();
  };

  const handleResize = () => {
    dpr = Math.min(window.devicePixelRatio || 1, RETINA_MAX_DPR);
    const rect = host.getBoundingClientRect();
    width = rect.width;
    height = rect.height;

    canvas.width = Math.max(1, Math.floor(width * dpr));
    canvas.height = Math.max(1, Math.floor(height * dpr));
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    buildParticles();
    if (reducedMotionQuery.matches) drawFrame(0, false);
  };

  const handlePointerMove = (event) => {
    const rect = canvas.getBoundingClientRect();
    pointer.x = event.clientX - rect.left;
    pointer.y = event.clientY - rect.top;
    pointer.active = true;
  };

  const handlePointerLeave = () => {
    pointer.active = false;
  };

  const handleClick = (event) => {
    // push: adiciona partículas no ponto clicado, com teto (§9)
    if (particles.length >= MAX_COUNT) return;
    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    const room = Math.min(PUSH_COUNT, MAX_COUNT - particles.length);
    for (let i = 0; i < room; i += 1) particles.push(createParticle(x, y));
  };

  const handleThemeChange = () => {
    colors = readColors();
    if (reducedMotionQuery.matches || !inView) drawFrame(0, false);
  };

  const observer =
    typeof IntersectionObserver === "function"
      ? new IntersectionObserver(
          (entries) => {
            inView = entries[0].isIntersecting;
            syncPlayState();
          },
          { threshold: 0 },
        )
      : null;

  // Reobserva troca de tokens (data-theme) para recolorir sem reload
  const themeObserver =
    typeof MutationObserver === "function"
      ? new MutationObserver(handleThemeChange)
      : null;

  window.addEventListener("resize", handleResize, { passive: true });
  canvas.addEventListener("pointermove", handlePointerMove, { passive: true });
  canvas.addEventListener("pointerleave", handlePointerLeave, {
    passive: true,
  });
  canvas.addEventListener("click", handleClick);
  reducedMotionQuery.addEventListener("change", syncPlayState);

  if (observer) observer.observe(host);
  else inView = true;
  if (themeObserver) {
    themeObserver.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-theme", "class"],
    });
  }

  handleResize();
  syncPlayState();

  return () => {
    stopLoop();
    window.removeEventListener("resize", handleResize);
    canvas.removeEventListener("pointermove", handlePointerMove);
    canvas.removeEventListener("pointerleave", handlePointerLeave);
    canvas.removeEventListener("click", handleClick);
    reducedMotionQuery.removeEventListener("change", syncPlayState);
    if (observer) observer.disconnect();
    if (themeObserver) themeObserver.disconnect();
    if (canvas.parentNode) canvas.parentNode.removeChild(canvas);
    particles = [];
  };
}

function initTrailersCarousel() {
  const carousel = document.querySelector(".trailers__carousel");
  if (!carousel) return;

  const track = carousel.querySelector(".trailers__track");
  const slides = Array.from(carousel.querySelectorAll(".trailers__slide"));
  const prevBtn = carousel.querySelector(".trailers__arrow--prev");
  const nextBtn = carousel.querySelector(".trailers__arrow--next");
  const dots = Array.from(carousel.querySelectorAll(".trailers__dot"));
  const liveRegion = carousel.querySelector("#trailers-carousel-live");

  if (!track || slides.length === 0) return;

  const total = slides.length;
  let index = 0;

  // Lazy-load: os iframes trazem só data-src no markup. Copia para src
  // quando o slide entra em vista (e no adjacente, pra transição não
  // revelar um iframe em branco). Cada iframe é carregado uma única vez.
  const loadSlide = (i) => {
    const slide = slides[i];
    if (!slide) return;
    const iframe = slide.querySelector("iframe[data-src]");
    if (!iframe) return;
    if (iframe.getAttribute("src") === iframe.dataset.src) return;
    iframe.src = iframe.dataset.src;
  };

  const render = () => {
    // Slides são flex: 0 0 100% — desloca o track em múltiplos de 100%
    track.style.transform = `translate3d(-${index * 100}%, 0, 0)`;

    dots.forEach((dot, i) => {
      const active = i === index;
      dot.classList.toggle("is-active", active);
      dot.setAttribute("aria-selected", active ? "true" : "false");
    });

    slides.forEach((slide, i) => {
      const hidden = i !== index;
      // inert tira o slide oculto do foco/a11y sem os problemas de
      // aria-hidden sobre um iframe focável
      if ("inert" in slide) slide.inert = hidden;
      slide.setAttribute("aria-hidden", hidden ? "true" : "false");
    });

    // Carrega o slide atual e os vizinhos imediatos (wrap circular)
    loadSlide(index);
    loadSlide((index + 1) % total);
    loadSlide((index - 1 + total) % total);

    if (liveRegion) {
      liveRegion.textContent = `Trailer ${index + 1} de ${total}`;
    }
  };

  const goTo = (next) => {
    // Wrap circular: passa do último volta ao primeiro e vice-versa
    index = (next + total) % total;
    render();
  };

  const handlePrev = () => goTo(index - 1);
  const handleNext = () => goTo(index + 1);

  if (prevBtn) prevBtn.addEventListener("click", handlePrev);
  if (nextBtn) nextBtn.addEventListener("click", handleNext);

  dots.forEach((dot, i) => {
    dot.addEventListener("click", () => goTo(i));
  });

  // Navegação por teclado quando o carrossel tem foco (tabindex="0")
  const handleKeydown = (event) => {
    if (event.key === "ArrowLeft") {
      event.preventDefault();
      handlePrev();
    }
    if (event.key === "ArrowRight") {
      event.preventDefault();
      handleNext();
    }
  };
  carousel.addEventListener("keydown", handleKeydown);

  render();
}

const initEstreiaCountdown = () => {
  const secao = document.querySelector("#estreia")
  if (!secao) return

  const liveRegion = secao.querySelector("#estreia-countdown-live")

  const ALVO = new Date("2026-12-25T00:00:00").getTime()
  const CASCATA = ["dia", "hor", "min", "seg"]
  const STAGGER = 90

  const reducedMotionQuery = window.matchMedia(
    "(prefers-reduced-motion: reduce)",
  )

  const calcularRestante = () => {
    const diff = Math.max(0, ALVO - Date.now())
    return {
      dia: Math.floor(diff / 86400000),
      hor: Math.floor((diff % 86400000) / 3600000),
      min: Math.floor((diff % 3600000) / 60000),
      seg: Math.floor((diff % 60000) / 1000),
    }
  }

  const formatar = (n, unidade) =>
    unidade === "dia" ? String(n) : String(n).padStart(2, "0")

  const elementos = CASCATA.reduce((acc, unidade) => {
    acc[unidade] = secao.querySelector(
      `[data-unit="${unidade}"] .countdown-value`,
    )
    return acc
  }, {})

  const trocar = (unidade, valor) => {
    const el = elementos[unidade]
    if (!el) return

    el.textContent = formatar(valor, unidade)

    if (reducedMotionQuery.matches) return

    el.classList.remove("is-changing")
    void el.offsetWidth
    el.classList.add("is-changing")
  }

  let valorAtual = calcularRestante()
  let minutoAnunciado = -1
  let intervalo = null

  const renderInicial = () => {
    for (const unidade of CASCATA) {
      const el = elementos[unidade]
      if (el) el.textContent = formatar(valorAtual[unidade], unidade)
    }
  }

  const atualizarLive = (valores) => {
    if (!liveRegion) return
    if (valores.min === minutoAnunciado) return

    minutoAnunciado = valores.min
    liveRegion.textContent = `${valores.dia} dias, ${valores.hor} horas, ${valores.min} minutos e ${valores.seg} segundos`
  }

  const parar = () => {
    if (!intervalo) return
    clearInterval(intervalo)
    intervalo = null
  }

  const handleTick = () => {
    const novo = calcularRestante()
    const mudaram = CASCATA.filter((unidade) => novo[unidade] !== valorAtual[unidade])

    mudaram.forEach((unidade, indice) => {
      valorAtual[unidade] = novo[unidade]
      setTimeout(() => trocar(unidade, novo[unidade]), indice * STAGGER)
    })

    atualizarLive(novo)

    if (ALVO - Date.now() <= 0) {
      for (const unidade of CASCATA) trocar(unidade, 0)
      parar()
      secao.dispatchEvent(new CustomEvent("estreia:zerado", { bubbles: true }))
    }
  }

  const sincronizarSemAnimar = () => {
    valorAtual = calcularRestante()
    renderInicial()
    atualizarLive(valorAtual)
  }

  const handleVisibility = () => {
    if (document.hidden) return
    sincronizarSemAnimar()
  }

  document.addEventListener("visibilitychange", handleVisibility)

  renderInicial()
  atualizarLive(valorAtual)
  intervalo = setInterval(handleTick, 1000)
}

document.addEventListener("DOMContentLoaded", () => {
  initStarfield();
  initFloatingNav();
  initMarioScrollAnimation();
  initYoshiScrollAnimation();
  initHeroContentScrollAnimation();
  initPlanetZoomAnimation();
  initPersonagensParallax();
  initPersonagensBg();
  initTrailersCarousel();
  initEstreiaCountdown();
});
