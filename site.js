// Theme toggle — persisted in localStorage
(function () {
  // Progressive enhancement marker: scroll-reveal hiding only applies
  // when this class is present, so no-JS visitors see all content.
  document.documentElement.classList.add('js');

  // Default to light mode; only honour dark if the user explicitly chose it.
  const stored = localStorage.getItem('theme');
  const initial = stored || 'light';
  document.documentElement.setAttribute('data-theme', initial);

  function init() {
    const btn = document.querySelector('.theme-toggle');
    if (btn) {
      const SUN = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><circle cx="12" cy="12" r="4.2"/><path d="M12 2.5v2.5M12 19v2.5M2.5 12H5M19 12h2.5M4.9 4.9l1.8 1.8M17.3 17.3l1.8 1.8M19.1 4.9l-1.8 1.8M6.7 17.3l-1.8 1.8"/></svg>';
      const MOON = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M20.4 14.9A8.6 8.6 0 0 1 9.1 3.6a8.6 8.6 0 1 0 11.3 11.3z"/></svg>';
      const setIcon = () => {
        const t = document.documentElement.getAttribute('data-theme');
        btn.innerHTML = t === 'dark' ? MOON : SUN;
        btn.setAttribute('aria-label', t === 'dark' ? 'Switch to light mode' : 'Switch to dark mode');
      };
      setIcon();
      btn.addEventListener('click', () => {
        const cur = document.documentElement.getAttribute('data-theme');
        const next = cur === 'dark' ? 'light' : 'dark';
        document.documentElement.setAttribute('data-theme', next);
        localStorage.setItem('theme', next);
        setIcon();
      });
    }

    // Mark active nav link
    const path = location.pathname.split('/').pop() || 'index.html';
    document.querySelectorAll('.topbar nav a').forEach(a => {
      const href = a.getAttribute('href');
      if (href === path || (path === '' && href === 'index.html')) {
        a.classList.add('active');
      }
    });

    // Hero drift — "hello" and the name slide apart as you scroll.
    // Steady state (scrollY = 0) keeps both exactly in their layout position.
    const hero = document.querySelector('.hero');
    const hello = document.querySelector('.hero-hello');
    if (hero && hello) {
      const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
      let ticking = false;
      const updateDrift = () => {
        ticking = false;
        const vw = document.documentElement.clientWidth || window.innerWidth || 1280;
        if (reduceMotion.matches) {
          hero.style.setProperty('--hello-shift', '0px');
          hero.style.setProperty('--name-shift', '0px');
          return;
        }
        const scrollOffset = Math.max(0, window.scrollY);
        const baseSpeed = Math.max(0.85, Math.min(1.15, vw / 1400));
        const drift = vw <= 720
          ? Math.min(scrollOffset * 0.14, 28)
          : scrollOffset * baseSpeed * 0.6;
        hero.style.setProperty('--hello-shift', `${drift}px`);
        hero.style.setProperty('--name-shift', `${-drift}px`);
      };
      const requestDrift = () => {
        if (!ticking) {
          ticking = true;
          window.requestAnimationFrame(updateDrift);
        }
      };
      updateDrift();
      window.addEventListener('scroll', requestDrift, { passive: true });
      window.addEventListener('resize', requestDrift, { passive: true });
      if (reduceMotion.addEventListener) reduceMotion.addEventListener('change', requestDrift);
    }

    // News list — show/hide older items
    const newsBtn = document.getElementById('news-toggle');
    const newsList = document.getElementById('news-list');
    if (newsBtn && newsList) {
      const hidden = newsList.querySelectorAll('.hidden-news');
      if (hidden.length === 0) {
        newsBtn.parentElement.style.display = 'none';
      } else {
        newsBtn.addEventListener('click', () => {
          const expanded = newsList.classList.toggle('expanded');
          newsBtn.textContent = expanded ? '– Show fewer' : '+ Show older news';
        });
      }
    }

    // Reveal on scroll — with fallback for elements already in viewport
    const els = document.querySelectorAll('.reveal');
    if (!('IntersectionObserver' in window)) {
      els.forEach(el => el.classList.add('in'));
      return;
    }
    const io = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          e.target.classList.add('in');
          io.unobserve(e.target);
        }
      });
    }, { threshold: 0, rootMargin: '0px 0px -10% 0px' });

    const revealInView = () => {
      els.forEach(el => {
        if (el.classList.contains('in')) return;
        const rect = el.getBoundingClientRect();
        if (rect.top < window.innerHeight && rect.bottom > 0) {
          el.classList.add('in');
          io.unobserve(el);
        }
      });
    };

    els.forEach(el => {
      const rect = el.getBoundingClientRect();
      // If already in viewport, reveal immediately
      if (rect.top < window.innerHeight && rect.bottom > 0) {
        el.classList.add('in');
      } else {
        io.observe(el);
      }
    });

    // Fallback: viewport size changes can bring sections into view
    window.addEventListener('resize', revealInView, { passive: true });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
