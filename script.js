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

/* ---- cosine palette — warm watercolor pigments ---------- */
/* terracotta · ochre · sage · dusty slate                   */
vec3 palette(float t) {
  vec3 a = vec3(0.68, 0.50, 0.38);
  vec3 b = vec3(0.18, 0.10, 0.07);
  vec3 c = vec3(1.00, 0.85, 0.65);
  vec3 d = vec3(0.05, 0.12, 0.20);
  return clamp(a + b * cos(6.28318 * (c * t + d)), 0.0, 1.0);
}

void main() {
  vec2 uv = gl_FragCoord.xy / uRes;
  vec2 p  = vec2(uv.x * (uRes.x / uRes.y), uv.y); /* aspect-correct */
  float t = uTime * 0.026; /* slow drift */

  /* Two washes at different scales for depth */
  float n  = wfbm(p * 1.1,  t);
  float n2 = wfbm(p * 0.62 + vec2(3.7, 2.1), t * 0.50);
  float v  = mix(n, n2, 0.38);

  /* Wet-bead edge darkening: 3.8·v·(1-v) peaks at v=0.5   */
  /* which is exactly where paint regions meet — darkens    */
  /* the boundary like pigment accumulating at a wet edge.  */
  float bead = 3.8 * v * (1.0 - v);

  /* Paper granulation — high-freq noise, very subtle */
  float grain = (vnoise(uv * 180.0) - 0.5) * 0.013;

  vec3 col = palette(v);
  col = mix(col, col * 0.52, bead * 0.55); /* darken at edges */
  col = clamp(col + grain, 0.0, 1.0);

  /* Alpha: paint regions opaque, paper shows through */
  float alpha = smoothstep(0.28, 0.60, v) * 0.52 + bead * 0.10;
  gl_FragColor = vec4(col, clamp(alpha, 0.0, 0.58));
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

  const uTime = gl.getUniformLocation(prog, 'uTime');
  const uRes  = gl.getUniformLocation(prog, 'uRes');

  gl.enable(gl.BLEND);
  gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
  gl.clearColor(0, 0, 0, 0);

  // ── Resize ─────────────────────────────────────────────
  function resize() {
    // Render at half resolution — bilinear browser upscale
    // softens the output exactly like watercolor diffuses on paper
    const W = Math.max(1, Math.round(wrap.offsetWidth  * 0.5));
    const H = Math.max(1, Math.round(wrap.offsetHeight * 0.5));
    canvas.width  = W;
    canvas.height = H;
    gl.viewport(0, 0, W, H);
    gl.uniform2f(uRes, W, H);
  }

  window.addEventListener('resize', resize, { passive: true });
  resize();

  // ── Render loop (pause when hero off-screen) ───────────
  let visible = true;
  new IntersectionObserver(entries => {
    visible = entries[0].isIntersecting;
  }, { threshold: 0 }).observe(wrap);

  function draw(ts) {
    requestAnimationFrame(draw);
    if (!visible) return;
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.uniform1f(uTime, ts * 0.001);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
  }

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
