/* ============================================================
   MEHUL TOTALA — PORTFOLIO SCRIPT
   ============================================================ */

'use strict';

// ── WATERCOLOR WAVES (p5.js) ────────────────────────────────

(function initWaves() {
  const wrap = document.getElementById('hero-canvas-wrap');
  if (!wrap || typeof p5 === 'undefined') return;

  new p5((sk) => {

    // Warm watercolor pigments — same palette as the design system
    const PALETTE = [
      [184,  92,  58],   // terracotta
      [196, 140,  56],   // ochre
      [120, 152, 100],   // sage
      [172, 114,  78],   // sienna
      [192, 148, 112],   // dusty sand
      [100, 130, 150],   // muted slate
    ];

    let waves = [];
    let nextIn = 90;   // frames until next wave appears

    // ── Wave ──────────────────────────────────────────────
    // A broad horizontal band whose top and bottom edges are
    // driven by Perlin noise — drawn in multiple semi-transparent
    // passes to build up the watercolor layering effect.
    class Wave {
      constructor() {
        this.y          = sk.random(sk.height * 0.06, sk.height * 0.94);
        this.amplitude  = sk.random(14, 42);
        this.thickness  = sk.random(28, 80);
        this.noiseOff   = sk.random(3000);
        this.noiseScale = sk.random(0.004, 0.009);
        this.timeScale  = sk.random(0.0006, 0.0015);
        this.col        = sk.random(PALETTE);
        this.maxAlpha   = sk.random(9, 22);   // out of 255 — intentionally faint
        this.alpha      = 0;
        this.fadeIn     = sk.random(0.10, 0.25);
        this.fadeOut    = sk.random(0.05, 0.12);
        this.holdMax    = sk.random(260, 550); // frames at full opacity
        this.held       = 0;
        this.phase      = 'in';
        this.passes     = sk.floor(sk.random(3, 7));
      }

      // Returns the Y position of one edge at a given X,
      // with noise-driven irregularity different per pass.
      _edgeY(x, top, pass, t) {
        const n = sk.noise(
          this.noiseOff + x * this.noiseScale + pass * 280,
          t * this.timeScale + pass * 0.08
        );
        const base  = this.y + Math.sin(x * 0.005 + this.noiseOff * 0.015) * this.amplitude;
        const half  = this.thickness * 0.5;
        const jitter = (n - 0.5) * this.thickness * 0.45;
        return top ? base - half + jitter : base + half + jitter;
      }

      update() {
        if (this.phase === 'in') {
          this.alpha = Math.min(this.alpha + this.fadeIn, this.maxAlpha);
          if (this.alpha >= this.maxAlpha) this.phase = 'hold';
        } else if (this.phase === 'hold') {
          if (++this.held >= this.holdMax) this.phase = 'out';
        } else {
          this.alpha -= this.fadeOut;
        }
      }

      draw(t) {
        if (this.alpha < 0.5) return;
        const [r, g, b] = this.col;
        const step = 11;

        for (let p = 0; p < this.passes; p++) {
          const a = this.alpha * (1 - p * 0.13);
          if (a < 0.5) continue;

          sk.fill(r, g, b, a);
          sk.noStroke();
          sk.beginShape();

          // Top edge — left to right
          for (let x = -step; x <= sk.width + step; x += step) {
            sk.curveVertex(x, this._edgeY(x, true, p, t));
          }
          // Bottom edge — right to left (closes the shape)
          for (let x = sk.width + step; x >= -step; x -= step) {
            sk.curveVertex(x, this._edgeY(x, false, p, t));
          }

          sk.endShape(sk.CLOSE);
        }
      }

      get done() {
        return this.phase === 'out' && this.alpha < 0.5;
      }
    }

    // ── p5 lifecycle ───────────────────────────────────────
    sk.setup = () => {
      const cnv = sk.createCanvas(wrap.offsetWidth, wrap.offsetHeight);
      cnv.parent(wrap);
      sk.colorMode(sk.RGB, 255, 255, 255, 255);
      sk.frameRate(30);
      sk.noSmooth();
    };

    sk.draw = () => {
      sk.clear();

      // Spawn a new wave every 4-10 seconds (at 30fps)
      if (--nextIn <= 0 && waves.length < 4) {
        waves.push(new Wave());
        nextIn = sk.floor(sk.random(120, 300));
      }

      waves = waves.filter(w => !w.done);
      const t = sk.frameCount;
      for (const w of waves) {
        w.update();
        w.draw(t);
      }
    };

    sk.windowResized = () => {
      sk.resizeCanvas(wrap.offsetWidth, wrap.offsetHeight);
    };

  }, wrap);
})();


// ── CURSOR — small dot only ────────────────────────────────

const dot = document.getElementById('cursor-dot');

if (dot && window.matchMedia('(hover: hover)').matches) {
  document.addEventListener('mousemove', (e) => {
    dot.style.left = e.clientX + 'px';
    dot.style.top  = e.clientY + 'px';
  }, { passive: true });

  document.addEventListener('mouseleave', () => { dot.style.opacity = '0'; });
  document.addEventListener('mouseenter', () => { dot.style.opacity = '0.65'; });
}


// ── NAV SCROLL ────────────────────────────────────────────

const nav = document.getElementById('site-nav');
if (nav) {
  window.addEventListener('scroll', () => {
    nav.classList.toggle('scrolled', window.scrollY > 72);
  }, { passive: true });
}


// ── INTERSECTION OBSERVER (reveal) ────────────────────────

const revealObs = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('revealed');
      revealObs.unobserve(entry.target);
    }
  });
}, { threshold: 0.08, rootMargin: '0px 0px -48px 0px' });

document.querySelectorAll('.reveal').forEach(el => revealObs.observe(el));


// ── FOOTER YEAR ───────────────────────────────────────────

const yearEl = document.getElementById('footer-year');
if (yearEl) yearEl.textContent = new Date().getFullYear();


// ── SMOOTH ANCHOR SCROLL ──────────────────────────────────

document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    const target = document.querySelector(a.getAttribute('href'));
    if (target) { e.preventDefault(); target.scrollIntoView({ behavior: 'smooth' }); }
  });
});


// ── KEYBOARD SHORTCUTS ────────────────────────────────────

document.addEventListener('keydown', e => {
  if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
  if (e.ctrlKey || e.metaKey || e.altKey) return;
  if (e.key === 'j') window.scrollBy({ top:  160, behavior: 'smooth' });
  if (e.key === 'k') window.scrollBy({ top: -160, behavior: 'smooth' });
  if (e.key === 'h') window.scrollTo({ top: 0,    behavior: 'smooth' });
});


// ── PAGE LOAD FADE ────────────────────────────────────────

window.addEventListener('load', () => {
  document.body.style.opacity = '0';
  requestAnimationFrame(() => {
    document.body.style.transition = 'opacity 0.7s ease';
    document.body.style.opacity = '1';
  });
});


// ── CONSOLE EASTER EGG ────────────────────────────────────

console.log('%c Mehul Totala', 'color:#b85c3a;font-size:18px;font-weight:400;font-style:italic');
console.log('%c mehultotala21@gmail.com', 'color:#8a7a68;font-size:12px');
console.log('%c github.com/Coffeempty',   'color:#8a7a68;font-size:12px');
console.log('%c', '');
console.log('%c 🏁 lights out and away we go', 'color:#b85c3a;font-size:11px');
console.log('%c 🏁 box box box',              'color:#b85c3a;font-size:11px');
console.log('%c — portfolio.help() for commands', 'color:#c2b5a3;font-size:10px');

window.portfolio = {
  help()    { console.log('%c .info() .work() .contact()', 'color:#c49a3c'); return '—'; },
  info()    { console.log('%c Mehul Totala\n Production Engg · VJTI\n ML · RL · Robotics', 'color:#b85c3a'); return '—'; },
  work()    { console.log('%c Marty-100 · Codeuctivity · RL for LLMs', 'color:#8a7a68'); return '—'; },
  contact() { console.log('%c mehultotala21@gmail.com', 'color:#b85c3a'); return "let's build something"; },
};
