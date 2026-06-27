/* JN Entertainment — Shared JS */
(function () {
  'use strict';

  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ── Aurora background ──────────────────────────────────────── */
  (function initAurora() {
    const layer = document.createElement('div');
    layer.id = 'aurora-layer';
    layer.setAttribute('aria-hidden', 'true');

    layer.innerHTML = `
      <div class="aurora-pulse"></div>
      <div class="aurora-blob aurora-blob-1"></div>
      <div class="aurora-blob aurora-blob-2"></div>
      <div class="aurora-blob aurora-blob-3"></div>
      <div class="aurora-stars"></div>
    `;

    document.body.prepend(layer);

    const starContainer = layer.querySelector('.aurora-stars');
    const starCount = reduced ? 0 : 80;
    for (let i = 0; i < starCount; i++) {
      const star = document.createElement('div');
      star.className = 'aurora-star';
      star.style.setProperty('--dur',   (Math.random() * 3 + 2) + 's');
      star.style.setProperty('--delay', (Math.random() * 6) + 's');
      star.style.setProperty('--peak',  (Math.random() * 0.7 + 0.1).toFixed(2));
      star.style.left = (Math.random() * 100) + 'vw';
      star.style.top  = (Math.random() * 100) + 'vh';
      starContainer.appendChild(star);
    }
  })();

  /* ── Page transition ────────────────────────────────────────── */
  const overlay = document.createElement('div');
  overlay.id = 'page-overlay';
  overlay.innerHTML = `
    <div class="pt-panel pt-panel-1"></div>
    <div class="pt-panel pt-panel-2"></div>
  `;
  document.body.appendChild(overlay);

  const logoStamp = document.createElement('div');
  logoStamp.className = 'pt-logo';
  logoStamp.innerHTML = `<div class="pt-logo-text">J<span>N</span></div>`;
  document.body.appendChild(logoStamp);

  function pageEnter() {
    // Panels already cover the screen (CSS default) — now reveal the page
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        overlay.classList.add('is-revealing');
        logoStamp.style.opacity = '0';
        setTimeout(() => {
          overlay.classList.remove('is-revealing');
          // Reset panels below screen ready for next exit
          overlay.querySelectorAll('.pt-panel').forEach(p => {
            p.style.transition = 'none';
            p.style.transform = 'translateY(100%)';
          });
        }, 620);
      });
    });
  }

  window.addEventListener('DOMContentLoaded', pageEnter);

  if (!reduced) {
    document.addEventListener('click', function (e) {
      const link = e.target.closest('a[href]');
      if (!link) return;
      const href = link.getAttribute('href');
      if (!href || href.startsWith('#') || href.startsWith('http') ||
          href.startsWith('mailto') || href.startsWith('tel') ||
          link.target === '_blank') return;

      e.preventDefault();
      // Reset panels to bottom, then animate them covering the screen
      overlay.querySelectorAll('.pt-panel').forEach(p => {
        p.style.transition = 'none';
        p.style.transform = 'translateY(100%)';
      });
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          overlay.classList.add('is-covering');
          logoStamp.style.transition = 'opacity 160ms ease-out 260ms';
          logoStamp.style.opacity = '1';
          setTimeout(() => { window.location.href = href; }, 520);
        });
      });
    });
  }

  /* ── Navbar ─────────────────────────────────────────────────── */
  const navbar = document.getElementById('navbar');
  if (navbar) {
    const tick = () => navbar.classList.toggle('scrolled', window.scrollY > 60);
    window.addEventListener('scroll', tick, { passive: true });
    tick();
  }

  /* ── Active nav link ─────────────────────────────────────────── */
  const page = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-links a, .mobile-nav-links a').forEach(a => {
    const h = a.getAttribute('href');
    if (h === page || (page === '' && h === 'index.html')) {
      a.classList.add('active');
      a.setAttribute('aria-current', 'page');
    }
  });

  /* ── Mobile menu ─────────────────────────────────────────────── */
  const burger = document.getElementById('hamburger');
  const mobileMenu = document.getElementById('mobile-menu');

  if (burger && mobileMenu) {
    const toggle = (force) => {
      const open = typeof force === 'boolean' ? force : !mobileMenu.classList.contains('open');
      mobileMenu.classList.toggle('open', open);
      burger.setAttribute('aria-expanded', String(open));
      document.body.style.overflow = open ? 'hidden' : '';
    };

    burger.addEventListener('click', () => toggle());

    mobileMenu.querySelectorAll('a').forEach(a =>
      a.addEventListener('click', () => toggle(false))
    );

    document.addEventListener('keydown', e => {
      if (e.key === 'Escape' && mobileMenu.classList.contains('open')) {
        toggle(false);
        burger.focus();
      }
    });
  }

  /* ── Scroll reveal ───────────────────────────────────────────── */
  function initReveal() {
    const els = document.querySelectorAll('.reveal');
    if (!els.length) return;

    if (reduced) {
      els.forEach(el => el.classList.add('visible'));
      return;
    }

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        const el = entry.target;
        const delay = parseInt(el.dataset.delay || 0);
        setTimeout(() => el.classList.add('visible'), delay);
        observer.unobserve(el);
      });
    }, { threshold: 0.08, rootMargin: '0px 0px -48px 0px' });

    els.forEach(el => observer.observe(el));
  }

  /* ── Counter animation ──────────────────────────────────────── */
  function animateCounter(el) {
    if (reduced) {
      el.textContent = el.dataset.count + (el.dataset.suffix || '');
      return;
    }
    const target = parseInt(el.dataset.count);
    const suffix = el.dataset.suffix || '';
    const dur = 1400;
    const start = performance.now();
    const run = (now) => {
      const p = Math.min((now - start) / dur, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(eased * target) + suffix;
      if (p < 1) requestAnimationFrame(run);
    };
    requestAnimationFrame(run);
  }

  function initCounters() {
    const counters = document.querySelectorAll('[data-count]');
    if (!counters.length) return;

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        animateCounter(entry.target);
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.5 });

    counters.forEach(el => {
      el.textContent = '0' + (el.dataset.suffix || '');
      observer.observe(el);
    });
  }

  /* ── Package tabs ────────────────────────────────────────────── */
  function initPackageTabs() {
    const tabList = document.querySelector('.pkg-tabs');
    if (!tabList) return;

    const tabs   = tabList.querySelectorAll('.pkg-tab');
    const panels = document.querySelectorAll('.pkg-panel');

    function activate(tab) {
      tabs.forEach(t => {
        t.classList.toggle('active', t === tab);
        t.setAttribute('aria-selected', t === tab ? 'true' : 'false');
      });
      panels.forEach(p => {
        const isActive = p.id === tab.dataset.panel;
        if (isActive) {
          p.style.display = 'block';
          requestAnimationFrame(() => p.classList.add('active'));
        } else {
          p.classList.remove('active');
          p.addEventListener('transitionend', () => {
            if (!p.classList.contains('active')) p.style.display = 'none';
          }, { once: true });
        }
      });
    }

    tabs.forEach(tab => {
      tab.addEventListener('click', () => activate(tab));
      tab.addEventListener('keydown', e => {
        const idx = [...tabs].indexOf(tab);
        if (e.key === 'ArrowRight') { e.preventDefault(); tabs[(idx + 1) % tabs.length].focus(); activate(tabs[(idx + 1) % tabs.length]); }
        if (e.key === 'ArrowLeft')  { e.preventDefault(); tabs[(idx - 1 + tabs.length) % tabs.length].focus(); activate(tabs[(idx - 1 + tabs.length) % tabs.length]); }
      });
    });
  }

  /* ── FAQ accordion ──────────────────────────────────────────── */
  function initAccordion() {
    document.querySelectorAll('.faq-item').forEach(item => {
      const btn    = item.querySelector('.faq-trigger');
      const body   = item.querySelector('.faq-body');
      if (!btn || !body) return;

      btn.addEventListener('click', () => {
        const open = item.classList.contains('open');
        // close all
        document.querySelectorAll('.faq-item.open').forEach(i => {
          i.classList.remove('open');
          i.querySelector('.faq-trigger').setAttribute('aria-expanded', 'false');
          i.querySelector('.faq-body').style.maxHeight = '0';
        });
        if (!open) {
          item.classList.add('open');
          btn.setAttribute('aria-expanded', 'true');
          body.style.maxHeight = body.scrollHeight + 'px';
        }
      });
    });
  }

  /* ── Contact form ────────────────────────────────────────────── */
  function initContactForm() {
    const form = document.getElementById('contact-form');
    if (!form) return;

    // Blur validation
    form.querySelectorAll('[required]').forEach(input => {
      input.addEventListener('blur', () => validateField(input));
      input.addEventListener('input', () => {
        if (input.closest('.field-wrap')?.classList.contains('error')) {
          validateField(input);
        }
      });
    });

    form.addEventListener('submit', e => {
      e.preventDefault();
      let valid = true;
      form.querySelectorAll('[required]').forEach(input => {
        if (!validateField(input)) valid = false;
      });
      if (!valid) { form.querySelector('.field-wrap.error input, .field-wrap.error select')?.focus(); return; }

      const btn = form.querySelector('.form-submit');
      btn.disabled = true;
      btn.textContent = 'Sending…';

      setTimeout(() => {
        form.style.display = 'none';
        document.getElementById('form-success').style.display = 'flex';
      }, 800);
    });
  }

  function validateField(input) {
    const wrap = input.closest('.field-wrap');
    if (!wrap) return true;
    const err = wrap.querySelector('.field-error');
    let valid = true;
    let msg = '';

    if (input.required && !input.value.trim()) {
      valid = false; msg = 'This field is required.';
    } else if (input.type === 'email' && input.value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.value)) {
      valid = false; msg = 'Please enter a valid email address.';
    }

    wrap.classList.toggle('error', !valid);
    if (err) err.textContent = valid ? '' : msg;
    return valid;
  }

  /* ── Gallery filter ──────────────────────────────────────────── */
  function initGalleryFilter() {
    const filters = document.querySelectorAll('.gallery-filter-btn');
    const items   = document.querySelectorAll('.gallery-item');
    if (!filters.length) return;

    filters.forEach(btn => {
      btn.addEventListener('click', () => {
        filters.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const cat = btn.dataset.filter;

        items.forEach(item => {
          const show = cat === 'all' || item.dataset.cat === cat;
          if (show) {
            item.style.display = '';
            requestAnimationFrame(() => item.classList.add('visible'));
          } else {
            item.classList.remove('visible');
            item.addEventListener('transitionend', () => {
              if (!item.classList.contains('visible')) item.style.display = 'none';
            }, { once: true });
          }
        });
      });
    });
  }

  /* ── Init ────────────────────────────────────────────────────── */
  document.addEventListener('DOMContentLoaded', () => {
    initReveal();
    initCounters();
    initPackageTabs();
    initAccordion();
    initContactForm();
    initGalleryFilter();
    if (typeof lucide !== 'undefined') lucide.createIcons();
  });

})();
