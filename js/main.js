/* ============================================================
   MAIN.JS — Shared JavaScript for all pages
   Civil Engineering Portfolio · Alex Carter
   ============================================================ */

/* ── 1. CUSTOM CURSOR ─────────────────────────────────────── */
(function initCursor() {
  const dot  = document.getElementById('cursor-dot');
  const ring = document.getElementById('cursor-ring');
  if (!dot || !ring) return;

  let mx = 0, my = 0, rx = 0, ry = 0;

  document.addEventListener('mousemove', e => {
    mx = e.clientX;
    my = e.clientY;
    dot.style.left = mx + 'px';
    dot.style.top  = my + 'px';
  });

  (function trackRing() {
    rx += (mx - rx) * 0.12;
    ry += (my - ry) * 0.12;
    ring.style.left = rx + 'px';
    ring.style.top  = ry + 'px';
    requestAnimationFrame(trackRing);
  })();

  // Hover state
  document.querySelectorAll('a, button, .card, .sw-card, .focus-card, .icard, .page-nav-item, .contact-link-item, .badge, .val-card, .tl-item').forEach(el => {
    el.addEventListener('mouseenter', () => document.body.classList.add('cursor-hover'));
    el.addEventListener('mouseleave', () => document.body.classList.remove('cursor-hover'));
  });
})();


/* ── 2. PAGE TRANSITIONS ──────────────────────────────────── */
(function initTransitions() {
  const overlay = document.getElementById('page-overlay');
  if (!overlay) return;

  // Fade in on load
  window.addEventListener('load', () => {
    requestAnimationFrame(() => {
      overlay.classList.add('out');
    });
  });

  // Fade out on navigation
  document.querySelectorAll('a[href]').forEach(a => {
    const href = a.getAttribute('href');
    if (!href || href.startsWith('#') || href.startsWith('mailto') || href.startsWith('tel')) return;

    a.addEventListener('click', e => {
      e.preventDefault();
      overlay.classList.remove('out');
      overlay.classList.add('in');
      setTimeout(() => {
        window.location.href = href;
      }, 600);
    });
  });
})();


/* ── 3. NAVIGATION ────────────────────────────────────────── */
(function initNav() {
  const nav = document.querySelector('.site-nav');
  if (!nav) return;

  // Scroll state
  window.addEventListener('scroll', () => {
    nav.classList.toggle('scrolled', window.scrollY > 40);
  }, { passive: true });

  // Hamburger
  const burger  = document.querySelector('.nav-hamburger');
  const drawer  = document.querySelector('.nav-mobile-drawer');
  if (burger && drawer) {
    burger.addEventListener('click', () => {
      burger.classList.toggle('open');
      drawer.classList.toggle('open');
    });
    // Close on link click
    drawer.querySelectorAll('a').forEach(a => {
      a.addEventListener('click', () => {
        burger.classList.remove('open');
        drawer.classList.remove('open');
      });
    });
  }

  // Active link highlighting
  const current = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-links a, .nav-mobile-drawer a').forEach(a => {
    const ahref = (a.getAttribute('href') || '').split('/').pop();
    if (ahref === current) a.classList.add('active');
  });
})();


/* ── 4. SCROLL PROGRESS BAR ───────────────────────────────── */
(function initScrollProgress() {
  const bar = document.getElementById('scroll-progress');
  if (!bar) return;
  window.addEventListener('scroll', () => {
    const pct = (window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100;
    bar.style.width = Math.min(pct, 100) + '%';
  }, { passive: true });
})();


/* ── 5. BACKGROUND CANVAS ─────────────────────────────────── */
(function initBgCanvas() {
  const canvas = document.getElementById('bg-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let W, H;

  function resize() {
    W = canvas.width  = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }
  resize();
  window.addEventListener('resize', resize, { passive: true });

  // Particle class
  class Particle {
    constructor() { this.reset(); }
    reset() {
      this.x  = Math.random() * W;
      this.y  = Math.random() * H;
      this.vx = (Math.random() - 0.5) * 0.28;
      this.vy = (Math.random() - 0.5) * 0.28;
      this.r  = Math.random() * 1.4 + 0.4;
      this.a  = Math.random() * 0.35 + 0.08;
      this.c  = Math.random() < 0.72 ? 'blue' : 'gold';
    }
    update() {
      this.x += this.vx;
      this.y += this.vy;
      if (this.x < 0 || this.x > W || this.y < 0 || this.y > H) this.reset();
    }
    draw() {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
      ctx.fillStyle = this.c === 'blue'
        ? `rgba(0,200,255,${this.a})`
        : `rgba(255,184,48,${this.a * 0.65})`;
      ctx.fill();
    }
  }

  const NUM_PARTICLES = 110;
  const particles = Array.from({ length: NUM_PARTICLES }, () => new Particle());

  // Schematic grid
  function drawSchematic() {
    // Horizontal
    const hStep = H / 22;
    for (let r = 0; r <= 22; r++) {
      const y = r * hStep;
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(W, y);
      ctx.strokeStyle = 'rgba(0,200,255,0.04)';
      ctx.lineWidth = 0.5;
      ctx.stroke();
    }
    // Vertical
    const vStep = W / 32;
    for (let c = 0; c <= 32; c++) {
      const x = c * vStep;
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, H);
      ctx.strokeStyle = 'rgba(255,184,48,0.025)';
      ctx.lineWidth = 0.5;
      ctx.stroke();
    }
    // Cross-hatch diagonals (subtle)
    const diagStep = 180;
    ctx.setLineDash([2, 12]);
    for (let d = -H; d < W + H; d += diagStep) {
      ctx.beginPath();
      ctx.moveTo(d, 0);
      ctx.lineTo(d + H, H);
      ctx.strokeStyle = 'rgba(0,200,255,0.025)';
      ctx.lineWidth = 0.4;
      ctx.stroke();
    }
    ctx.setLineDash([]);
  }

  // Connection lines
  function drawConnections() {
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 95) {
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.strokeStyle = `rgba(0,200,255,${(1 - dist / 95) * 0.07})`;
          ctx.lineWidth = 0.5;
          ctx.stroke();
        }
      }
    }
  }

  function animate() {
    ctx.clearRect(0, 0, W, H);
    drawSchematic();
    drawConnections();
    particles.forEach(p => { p.update(); p.draw(); });
    requestAnimationFrame(animate);
  }
  animate();
})();


/* ── 6. SCROLL REVEAL (IntersectionObserver) ─────────────── */
(function initReveal() {
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');

        // Trigger skill bars inside revealed elements
        entry.target.querySelectorAll('.skill-bar-fill').forEach(bar => {
          setTimeout(() => {
            bar.style.width = (bar.dataset.pct || 0) + '%';
            bar.classList.add('animated');
          }, 250);
        });
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

  document.querySelectorAll(
    '.reveal, .reveal-left, .reveal-right, .tl-item, .val-card, .sw-card, .focus-card, .icard, .page-nav-item'
  ).forEach(el => observer.observe(el));
})();


/* ── 7. COUNT-UP NUMBERS ─────────────────────────────────── */
(function initCountUp() {
  function countUp(el, target, duration) {
    const start = performance.now();
    function frame(now) {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      el.textContent = Math.floor(eased * target) + (progress === 1 ? '+' : '');
      if (progress < 1) requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
  }

  const obs = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.querySelectorAll('[data-count]').forEach(el => {
          countUp(el, parseInt(el.dataset.count), 1600);
        });
        obs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.4 });

  document.querySelectorAll('.stats-row, .hero-stats, .counter-wrap').forEach(el => obs.observe(el));

  // Also trigger immediately for hero stats if already visible
  setTimeout(() => {
    document.querySelectorAll('#hero [data-count]').forEach(el => {
      countUp(el, parseInt(el.dataset.count), 1600);
    });
  }, 1200);
})();


/* ── 8. SKILL BAR TRIGGER (standalone) ───────────────────── */
(function initSkillBars() {
  const obs = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.querySelectorAll('.skill-bar-fill').forEach((bar, i) => {
          setTimeout(() => {
            bar.style.width = (bar.dataset.pct || 0) + '%';
            bar.classList.add('animated');
          }, 200 + i * 80);
        });
        obs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.2 });

  document.querySelectorAll('.skill-col, .skills-block').forEach(el => obs.observe(el));
})();


/* ── 9. RADAR CHART (skills page) ────────────────────────── */
function drawRadarChart(canvasId, labels, values, options) {
  const rc = document.getElementById(canvasId);
  if (!rc) return;
  const rctx = rc.getContext('2d');
  const cx = rc.width / 2, cy = rc.height / 2;
  const maxR = Math.min(cx, cy) - 50;
  const N = labels.length;
  let progress = 0;

  const opts = Object.assign({
    levels: 5,
    fillColor1: 'rgba(0,200,255,0.25)',
    fillColor2: 'rgba(255,184,48,0.12)',
    strokeColor: 'rgba(0,200,255,0.8)',
    webColor: 'rgba(0,200,255,0.1)',
    spokeColor: 'rgba(0,200,255,0.18)',
    dotColor: '#ffb830',
    labelColor: 'rgba(208,228,240,0.75)',
    font: '10px JetBrains Mono, monospace'
  }, options);

  function frame() {
    rctx.clearRect(0, 0, rc.width, rc.height);
    progress = Math.min(progress + 0.022, 1);
    const ep = 1 - Math.pow(1 - progress, 3);

    // Web
    for (let lv = 1; lv <= opts.levels; lv++) {
      rctx.beginPath();
      for (let i = 0; i < N; i++) {
        const angle = i * (Math.PI * 2 / N) - Math.PI / 2;
        const r = (lv / opts.levels) * maxR;
        const x = cx + Math.cos(angle) * r;
        const y = cy + Math.sin(angle) * r;
        i === 0 ? rctx.moveTo(x, y) : rctx.lineTo(x, y);
      }
      rctx.closePath();
      rctx.strokeStyle = opts.webColor;
      rctx.lineWidth = 0.8;
      rctx.stroke();
    }

    // Spokes
    for (let i = 0; i < N; i++) {
      const angle = i * (Math.PI * 2 / N) - Math.PI / 2;
      rctx.beginPath();
      rctx.moveTo(cx, cy);
      rctx.lineTo(cx + Math.cos(angle) * maxR, cy + Math.sin(angle) * maxR);
      rctx.strokeStyle = opts.spokeColor;
      rctx.lineWidth = 0.8;
      rctx.stroke();
    }

    // Data fill
    rctx.beginPath();
    for (let i = 0; i < N; i++) {
      const angle = i * (Math.PI * 2 / N) - Math.PI / 2;
      const r = values[i] * maxR * ep;
      const x = cx + Math.cos(angle) * r;
      const y = cy + Math.sin(angle) * r;
      i === 0 ? rctx.moveTo(x, y) : rctx.lineTo(x, y);
    }
    rctx.closePath();

    const grad = rctx.createRadialGradient(cx, cy, 0, cx, cy, maxR);
    grad.addColorStop(0, opts.fillColor1);
    grad.addColorStop(1, opts.fillColor2);
    rctx.fillStyle = grad;
    rctx.fill();
    rctx.strokeStyle = opts.strokeColor;
    rctx.lineWidth = 2;
    rctx.stroke();

    // Dots + labels
    for (let i = 0; i < N; i++) {
      const angle = i * (Math.PI * 2 / N) - Math.PI / 2;
      const r = values[i] * maxR * ep;
      const x = cx + Math.cos(angle) * r;
      const y = cy + Math.sin(angle) * r;

      rctx.beginPath();
      rctx.arc(x, y, 4, 0, Math.PI * 2);
      rctx.fillStyle = opts.dotColor;
      rctx.shadowColor = opts.dotColor;
      rctx.shadowBlur = 12;
      rctx.fill();
      rctx.shadowBlur = 0;

      // Labels at edge
      const lx = cx + Math.cos(angle) * (maxR + 28);
      const ly = cy + Math.sin(angle) * (maxR + 28);
      rctx.font = opts.font;
      rctx.fillStyle = opts.labelColor;
      rctx.textAlign = 'center';
      rctx.textBaseline = 'middle';
      rctx.fillText(labels[i], lx, ly);
    }

    if (progress < 1) requestAnimationFrame(frame);
  }

  frame();
}


/* ── 10. FORM SUBMISSION (contact page) ───────────────────── */
(function initForm() {
  const form = document.getElementById('contact-form');
  if (!form) return;

  form.addEventListener('submit', e => {
    e.preventDefault();
    const btn = form.querySelector('.form-submit');
    if (btn) {
      btn.textContent = 'SENDING…';
      btn.disabled = true;
      setTimeout(() => {
        btn.textContent = '✓ MESSAGE SENT';
        btn.style.background = 'linear-gradient(135deg,#00c87c,#008855)';
        form.reset();
        setTimeout(() => {
          btn.textContent = 'SEND MESSAGE →';
          btn.style.background = '';
          btn.disabled = false;
        }, 3500);
      }, 1800);
    }
  });
})();


/* ── 11. TYPED TEXT EFFECT (hero) ─────────────────────────── */
function initTyped(el, words, speed = 90, pause = 1800) {
  if (!el) return;
  let wIdx = 0, cIdx = 0, deleting = false;

  function tick() {
    const word = words[wIdx];
    el.textContent = deleting ? word.slice(0, cIdx--) : word.slice(0, cIdx++);

    if (!deleting && cIdx > word.length) {
      deleting = true;
      setTimeout(tick, pause);
      return;
    }
    if (deleting && cIdx < 0) {
      deleting = false;
      wIdx = (wIdx + 1) % words.length;
    }
    setTimeout(tick, deleting ? speed * 0.5 : speed);
  }
  tick();
}


/* ── 12. SMOOTH ANCHOR SCROLL ─────────────────────────────── */
(function initAnchorScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      e.preventDefault();
      const target = document.querySelector(a.getAttribute('href'));
      if (target) {
        const navH = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--nav-h')) || 70;
        window.scrollTo({ top: target.offsetTop - navH - 10, behavior: 'smooth' });
      }
    });
  });
})();


/* ── 13. FLOATING SECTION NUMBERS (decoration) ────────────── */
(function initSectionNumbers() {
  document.querySelectorAll('[data-section-num]').forEach((el, i) => {
    const num = el.dataset.sectionNum || String(i + 1).padStart(2, '0');
    const span = document.createElement('span');
    span.className = 'section-bg-num';
    span.textContent = num;
    el.style.position = 'relative';
    el.appendChild(span);
  });
})();
