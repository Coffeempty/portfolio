/* ============================================================
   MEHUL TOTALA — PORTFOLIO SCRIPT
   ============================================================ */

'use strict';


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
  work()    { console.log('%c jax-cce · Codeuctivity · RL for LLMs', 'color:#8a7a68'); return '—'; },
  contact() { console.log('%c mehultotala21@gmail.com', 'color:#b85c3a'); return "let's build something"; },
};
