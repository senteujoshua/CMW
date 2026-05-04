// ================================================================
// VELURRA AGENCY — SHARED SCRIPT
// ================================================================

(function () {
  // Year injection
  const yr = document.getElementById('year');
  if (yr) yr.textContent = new Date().getFullYear();

  // ===== Custom cursor =====
  const dot = document.getElementById('cursorDot');
  const ring = document.getElementById('cursorRing');
  if (dot && ring) {
    let mx = window.innerWidth / 2, my = window.innerHeight / 2;
    let rx = mx, ry = my;
    document.addEventListener('mousemove', e => {
      mx = e.clientX; my = e.clientY;
      dot.style.transform = `translate(${mx}px, ${my}px)`;
    });
    function animateRing() {
      rx += (mx - rx) * 0.18;
      ry += (my - ry) * 0.18;
      ring.style.transform = `translate(${rx}px, ${ry}px)`;
      requestAnimationFrame(animateRing);
    }
    animateRing();
    const bindHover = () => {
      document.querySelectorAll('a, button, input, select, textarea, label').forEach(el => {
        if (el.dataset.cursorBound) return;
        el.dataset.cursorBound = '1';
        el.addEventListener('mouseenter', () => ring.classList.add('hover'));
        el.addEventListener('mouseleave', () => ring.classList.remove('hover'));
      });
    };
    bindHover();
    // Re-bind for any later DOM changes
    new MutationObserver(bindHover).observe(document.body, { childList: true, subtree: true });
  }

  // ===== Scroll progress =====
  const progress = document.getElementById('scrollProgress');
  if (progress) {
    document.addEventListener('scroll', () => {
      const h = document.documentElement;
      const scrolled = (h.scrollTop / (h.scrollHeight - h.clientHeight)) * 100;
      progress.style.width = scrolled + '%';
    }, { passive: true });
  }

  // ===== Nav scroll state =====
  const nav = document.getElementById('nav');
  if (nav) {
    window.addEventListener('scroll', () => {
      if (window.scrollY > 30) nav.classList.add('scrolled');
      else nav.classList.remove('scrolled');
    }, { passive: true });
  }

  // ===== Hamburger =====
  const burger = document.getElementById('hamburger');
  const navLinks = document.getElementById('navLinks');
  if (burger && navLinks) {
    burger.addEventListener('click', () => {
      const open = navLinks.classList.toggle('open');
      burger.classList.toggle('open', open);
      burger.setAttribute('aria-expanded', open);
    });
    navLinks.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
      navLinks.classList.remove('open');
      burger.classList.remove('open');
      burger.setAttribute('aria-expanded', 'false');
    }));
  }

  // ===== Reveal on scroll =====
  const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in');
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -60px 0px' });
  document.querySelectorAll('.reveal').forEach(el => io.observe(el));

  // ===== Count-up animation =====
  const countEls = document.querySelectorAll('[data-count]');
  if (countEls.length) {
    const countObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        const el = entry.target;
        const target = parseFloat(el.dataset.count);
        const prefix = el.dataset.prefix || '';
        const suffix = el.dataset.suffix || '';
        const duration = 1700;
        const start = performance.now();
        function tick(now) {
          const t = Math.min((now - start) / duration, 1);
          const eased = 1 - Math.pow(1 - t, 3);
          const val = target * eased;
          const display = target % 1 === 0 ? Math.round(val) : val.toFixed(1);
          el.textContent = `${prefix}${display}${suffix}`;
          if (t < 1) requestAnimationFrame(tick);
        }
        requestAnimationFrame(tick);
        countObserver.unobserve(el);
      });
    }, { threshold: 0.5 });
    countEls.forEach(el => countObserver.observe(el));
  }

  // ===== FAQ accordion =====
  document.querySelectorAll('.faq-item').forEach(item => {
    const q = item.querySelector('.faq-q');
    const a = item.querySelector('.faq-a');
    if (!q || !a) return;
    q.addEventListener('click', () => {
      const isOpen = item.classList.toggle('open');
      q.setAttribute('aria-expanded', isOpen);
      a.style.maxHeight = isOpen ? a.scrollHeight + 'px' : '0px';
    });
  });

  // ===== Form handling (Web3Forms) =====
  window.handleForm = async function (e) {
    e.preventDefault();
    const form = e.target;
    const btn = form.querySelector('button[type="submit"]');
    const original = btn.innerHTML;
    const originalBg = btn.style.background;
    const originalColor = btn.style.color;

    btn.disabled = true;
    btn.innerHTML = '<span>Sending…</span>';

    const restore = (delay = 4000) => setTimeout(() => {
      btn.innerHTML = original;
      btn.style.background = originalBg;
      btn.style.color = originalColor;
      btn.disabled = false;
    }, delay);

    try {
      const formData = new FormData(form);
      const res = await fetch(form.action, {
        method: 'POST',
        body: formData,
        headers: { 'Accept': 'application/json' }
      });
      const data = await res.json().catch(() => ({}));

      if (res.ok && data.success) {
        btn.innerHTML = '<span>Sent — thank you</span><svg class="icon icon-stroke" width="16" height="16" viewBox="0 0 24 24"><path d="M5 13l4 4L19 7"/></svg>';
        btn.style.background = 'linear-gradient(135deg, var(--gold), var(--gold-soft))';
        btn.style.color = '#1a0a10';
        form.querySelectorAll('input, select, textarea').forEach(el => {
          if (el.type === 'hidden') return;
          if (el.type === 'checkbox') el.checked = false;
          else el.value = '';
        });
        restore(4000);
      } else {
        throw new Error(data.message || 'Submission failed');
      }
    } catch (err) {
      btn.innerHTML = '<span>Error — please try again</span>';
      btn.style.background = '#7a2030';
      btn.style.color = '#fff';
      restore(4000);
    }
  };

  // ===== Magnetic button effect =====
  document.querySelectorAll('.btn-primary, .btn-gold').forEach(btn => {
    btn.addEventListener('mousemove', (e) => {
      const r = btn.getBoundingClientRect();
      const x = e.clientX - r.left - r.width / 2;
      const y = e.clientY - r.top - r.height / 2;
      btn.style.transform = `scale(1.03) translate(${x * 0.15}px, ${y * 0.15}px)`;
    });
    btn.addEventListener('mouseleave', () => {
      btn.style.transform = '';
    });
  });
})();
