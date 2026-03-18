/* ============================================================
   MEHUL TOTALA — PORTFOLIO SCRIPT
   ============================================================ */

'use strict';

// ── WATERCOLOR HERO — WebGL GLSL shader ────────────────────
// Domain-warped fBm noise → organic watercolor wash shapes.
// Rendered at 0.5× resolution; browser bilinear upscale adds
// natural softness that mirrors how watercolor diffuses on paper.

(function initWatercolor() {
  const wrap = document.getElementById('hero-canvas-wrap');
  if (!wrap) return;

  const canvas = document.createElement('canvas');
  wrap.appendChild(canvas);

  const gl = canvas.getContext('webgl', {
    alpha: true,
    premultipliedAlpha: false,
    antialias: false,
    powerPreference: 'low-power',
  });
  if (!gl) return;

  // ── Vertex shader (pass-through quad) ─────────────────
  const VERT = `
attribute vec2 a_pos;
void main() { gl_Position = vec4(a_pos, 0.0, 1.0); }
`;

  // ── Fragment shader ────────────────────────────────────
  const FRAG = `
precision highp float;
uniform float uTime;
uniform vec2  uRes;

/* ---- value noise ---------------------------------------- */
float hash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
}
float vnoise(vec2 p) {
  vec2 i = floor(p), f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash(i),           hash(i + vec2(1,0)), u.x),
             mix(hash(i + vec2(0,1)), hash(i + vec2(1,1)), u.x), u.y);
}

/* ---- fractional Brownian motion ------------------------- */
float fbm(vec2 p) {
  float v = 0.0, a = 0.5;
  for (int i = 0; i < 5; i++) {
    v += a * vnoise(p);
    p  = p * 2.1 + vec2(1.7, 9.2);
    a *= 0.48;
  }
  return v;
}

/* ---- two-layer domain-warped fBm ------------------------ */
/* Warping creates the organic, blooming shapes real          */
/* watercolor makes when wet pigment spreads on wet paper.   */
float wfbm(vec2 p, float t) {
  vec2 q = vec2(fbm(p + t * 0.28),
                fbm(p + vec2(5.2, 1.3) + t * 0.28));
  vec2 r = vec2(fbm(p + 1.6 * q + vec2(1.7, 9.2) + t * 0.18),
                fbm(p + 1.6 * q + vec2(8.3, 2.8) + t * 0.18));
  return fbm(p + 2.0 * r + t * 0.08);
}

/* ---- lively watercolor palette --------------------------  */
/* cobalt blue · cerulean · sage · terracotta · ochre · violet */
vec3 palette(float t) {
  t = fract(t);
  float s = t * 6.0;
  vec3 c0 = vec3(0.18, 0.38, 0.80); /* cobalt blue    */
  vec3 c1 = vec3(0.10, 0.62, 0.74); /* cerulean       */
  vec3 c2 = vec3(0.35, 0.64, 0.38); /* sage green     */
  vec3 c3 = vec3(0.74, 0.34, 0.20); /* terracotta     */
  vec3 c4 = vec3(0.82, 0.58, 0.18); /* warm ochre     */
  vec3 c5 = vec3(0.54, 0.28, 0.66); /* dusty violet   */
  vec3 col = c0;
  col = mix(col, c1, clamp(s - 0.0, 0.0, 1.0));
  col = mix(col, c2, clamp(s - 1.0, 0.0, 1.0));
  col = mix(col, c3, clamp(s - 2.0, 0.0, 1.0));
  col = mix(col, c4, clamp(s - 3.0, 0.0, 1.0));
  col = mix(col, c5, clamp(s - 4.0, 0.0, 1.0));
  col = mix(col, c0, clamp(s - 5.0, 0.0, 1.0));
  return col;
}

uniform vec2  uClickUv;
uniform float uClickTime;

void main() {
  vec2  uv  = gl_FragCoord.xy / uRes;
  float asp = uRes.x / uRes.y;
  vec2  p   = vec2(uv.x * asp, uv.y);
  float T   = uTime;

  /* Three independent layers — each with its own oscillating drift   */
  /* so they move through each other rather than all going one way.   */
  float d1 = T * 0.034 + sin(T * 0.11) * 0.65;
  float d2 = T * 0.021 + cos(T * 0.08) * 0.80;
  float d3 = T * 0.015 + sin(T * 0.13 + 1.6) * 0.55;

  float n1 = wfbm(p * 1.10,                     d1);
  float n2 = wfbm(p * 0.72 + vec2(3.7, 2.1),   d2);
  float n3 = wfbm(p * 1.60 + vec2(1.2, 6.4),   d3);
  float v  = n1 * 0.44 + n2 * 0.33 + n3 * 0.23;

  /* Stretch the 0.3-0.7 fBm range across all 6 palette colours.     */
  /* Position offset ensures different screen areas use different hues.*/
  float palIdx = fract(v * 2.4 + p.x * 0.11 + p.y * 0.08
                       + sin(T * 0.04) * 0.14);

  float bead  = 3.8 * v * (1.0 - v);
  float grain = (vnoise(uv * 180.0) - 0.5) * 0.012;

  vec3 col = palette(palIdx);
  /* Boost saturation — pull away from grey */
  float lum = dot(col, vec3(0.299, 0.587, 0.114));
  col = mix(vec3(lum), col, 1.40);
  col = mix(col, col * 0.50, bead * 0.50);
  col = clamp(col + grain, 0.0, 1.0);

  float alpha = smoothstep(0.20, 0.52, v) * 0.76 + bead * 0.14;

  /* Click bloom */
  float clickAge = uTime - uClickTime;
  float guard    = step(0.0, uClickTime) * step(clickAge, 3.5);
  if (guard > 0.0) {
    vec2  clickP   = vec2(uClickUv.x * asp, uClickUv.y);
    float dist     = length(p - clickP);
    float bloom    = exp(-dist * 3.6) * exp(-clickAge * 1.0);
    vec3  clickCol = palette(fract(uClickUv.x * 0.6 + uClickUv.y * 0.3 + 0.1));
    col   = mix(col, clickCol, bloom * 0.65);
    alpha = clamp(alpha + bloom * 0.50, 0.0, 0.90);
  }

  gl_FragColor = vec4(col, clamp(alpha, 0.0, 0.82));
}
`;

  // ── Compile & link ─────────────────────────────────────
  function compile(type, src) {
    const s = gl.createShader(type);
    gl.shaderSource(s, src);
    gl.compileShader(s);
    return s;
  }

  const prog = gl.createProgram();
  gl.attachShader(prog, compile(gl.VERTEX_SHADER, VERT));
  gl.attachShader(prog, compile(gl.FRAGMENT_SHADER, FRAG));
  gl.linkProgram(prog);

  if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
    console.warn('Watercolor shader link error:', gl.getProgramInfoLog(prog));
    return;
  }

  gl.useProgram(prog);

  // Full-screen quad (triangle strip)
  const buf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(gl.ARRAY_BUFFER,
    new Float32Array([-1,-1, 1,-1, -1,1, 1,1]), gl.STATIC_DRAW);

  const aloc = gl.getAttribLocation(prog, 'a_pos');
  gl.enableVertexAttribArray(aloc);
  gl.vertexAttribPointer(aloc, 2, gl.FLOAT, false, 0, 0);

  const uTime      = gl.getUniformLocation(prog, 'uTime');
  const uRes       = gl.getUniformLocation(prog, 'uRes');
  const uClickUv   = gl.getUniformLocation(prog, 'uClickUv');
  const uClickTime = gl.getUniformLocation(prog, 'uClickTime');

  gl.enable(gl.BLEND);
  gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
  gl.clearColor(0, 0, 0, 0);

  /* No click yet */
  gl.uniform2f(uClickUv,   -1.0, -1.0);
  gl.uniform1f(uClickTime, -99.0);

  // ── Resize ─────────────────────────────────────────────
  function resize() {
    const W = Math.max(1, Math.round(wrap.offsetWidth  * 0.65));
    const H = Math.max(1, Math.round(wrap.offsetHeight * 0.65));
    canvas.width  = W;
    canvas.height = H;
    gl.viewport(0, 0, W, H);
    gl.uniform2f(uRes, W, H);
  }

  window.addEventListener('resize', resize, { passive: true });
  resize();

  // ── Render loop (pause when hero off-screen) ───────────
  let visible = true;
  let lastTs  = 0;

  new IntersectionObserver(entries => {
    visible = entries[0].isIntersecting;
  }, { threshold: 0 }).observe(wrap);

  function draw(ts) {
    requestAnimationFrame(draw);
    if (!visible) return;
    lastTs = ts * 0.001;
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.uniform1f(uTime, lastTs);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
  }

  // ── Click bloom ────────────────────────────────────────
  // wrap has pointer-events:none so listen on the hero section.
  const hero = document.getElementById('hero') || wrap.parentElement;
  hero.addEventListener('mousedown', (e) => {
    const rect = wrap.getBoundingClientRect();
    const u = (e.clientX - rect.left)  / rect.width;
    const v = 1.0 - (e.clientY - rect.top) / rect.height; /* flip Y for GL */
    gl.uniform2f(uClickUv,   u, v);
    gl.uniform1f(uClickTime, lastTs);
  });

  requestAnimationFrame(draw);
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
