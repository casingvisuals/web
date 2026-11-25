/* CASING VISUALS — interactions (vanilla JS, sin dependencias) */
(() => {
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Intro: animate hero title in
  requestAnimationFrame(() => document.body.classList.add('is-loaded'));

  // Year
  const y = $('#year'); if (y) y.textContent = new Date().getFullYear();

  // Header: background on scroll + hide on scroll down
  const header = $('.header');
  let lastY = 0;
  const onScroll = () => {
    const sy = scrollY;
    header.classList.toggle('is-scrolled', sy > 40);
    header.classList.toggle('is-hidden', sy > 400 && sy > lastY && !document.body.classList.contains('menu-open'));
    lastY = sy;
  };
  addEventListener('scroll', onScroll, { passive: true }); onScroll();

  // Fullscreen menu
  const burger = $('.burger'), menu = $('#menu');
  const setMenu = (open) => {
    document.body.classList.toggle('menu-open', open);
    burger.setAttribute('aria-expanded', open);
    burger.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    menu.setAttribute('aria-hidden', !open);
  };
  burger.addEventListener('click', () => setMenu(!document.body.classList.contains('menu-open')));
  $$('#menu a').forEach(a => a.addEventListener('click', () => setMenu(false)));
  addEventListener('keydown', e => { if (e.key === 'Escape') setMenu(false); });

  // Reveal on scroll
  const io = new IntersectionObserver((entries) => {
    entries.forEach(en => {
      if (en.isIntersecting) { en.target.classList.add('is-in'); io.unobserve(en.target); }
    });
  }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });
  $$('.reveal, .step').forEach(el => io.observe(el));

  // Counters
  const countIO = new IntersectionObserver((entries) => {
    entries.forEach(en => {
      if (!en.isIntersecting) return;
      const el = en.target, end = +el.dataset.count, t0 = performance.now(), dur = 1600;
      const tick = (t) => {
        const p = Math.min((t - t0) / dur, 1);
        el.textContent = Math.round(end * (1 - Math.pow(1 - p, 3))).toLocaleString('en-US');
        if (p < 1) requestAnimationFrame(tick);
      };
      reduce ? (el.textContent = end.toLocaleString('en-US')) : requestAnimationFrame(tick);
      countIO.unobserve(el);
    });
  }, { threshold: 0.6 });
  $$('[data-count]').forEach(el => countIO.observe(el));

  // Work carousel buttons
  const reels = $('.reels');
  if (reels) {
  $$('.work__controls .round').forEach(b => b.addEventListener('click', () => {
    const card = $('.reel', reels);
    reels.scrollBy({ left: (card.offsetWidth + 20) * +b.dataset.dir, behavior: 'smooth' });
  }));
  // Drag to scroll (desktop)
  let down = false, sx = 0, sl = 0, moved = false;
  reels.addEventListener('pointerdown', e => { if (e.pointerType !== 'mouse') return; down = true; moved = false; sx = e.clientX; sl = reels.scrollLeft; reels.style.scrollSnapType = 'none'; });
  addEventListener('pointermove', e => { if (!down) return; const dx = e.clientX - sx; if (Math.abs(dx) > 5) moved = true; reels.scrollLeft = sl - dx; });
  addEventListener('pointerup', () => { if (!down) return; down = false; reels.style.scrollSnapType = ''; });
  reels.addEventListener('click', e => { if (moved) { e.preventDefault(); moved = false; } }, true);
  reels.addEventListener('dragstart', e => e.preventDefault());
  }

  // Parallax (light)
  if (!reduce) {
    const aboutImg = $('.about__img img'), icon = $('.belief__icon');
    const par = () => {
      const vh = innerHeight;
      if (aboutImg) {
        const r = aboutImg.parentElement.getBoundingClientRect();
        if (r.bottom > 0 && r.top < vh) aboutImg.style.transform = `translateY(${((r.top + r.height / 2 - vh / 2) / vh) * -60 - 30}px)`;
      }
      if (icon) {
        const r = icon.parentElement.getBoundingClientRect();
        if (r.bottom > 0 && r.top < vh) icon.style.setProperty('--rot', `${(r.top / vh) * 40}deg`);
      }
    };
    addEventListener('scroll', () => requestAnimationFrame(par), { passive: true }); par();
  }

  // Quick form panel (botón flotante)
  const fab = $('.fab'), quick = $('#quick');
  if (fab && quick) {
    const setQuick = (open) => {
      document.body.classList.toggle('quick-open', open);
      fab.setAttribute('aria-expanded', open);
      quick.setAttribute('aria-hidden', !open);
      if (open) setTimeout(() => $('input[name="name"]', quick).focus(), 400);
      else fab.focus();
    };
    fab.addEventListener('click', () => setQuick(true));
    $$('[data-close]', quick).forEach(el => el.addEventListener('click', () => setQuick(false)));
    addEventListener('keydown', e => { if (e.key === 'Escape' && document.body.classList.contains('quick-open')) setQuick(false); });
  }

  // Envío AJAX a Formspree (fetch + JSON, sin librerías)
  $$('form[action*="formspree.io"]').forEach(form => form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const status = $('.quick__status', form);
    const btn = $('button[type="submit"]', form);
    const label = btn.innerHTML;
    // Al menos una opción en los chips del formulario principal
    const chips = $$('input[name="interest"][type="checkbox"]', form);
    if (chips.length && !chips.some(c => c.checked)) {
      status.className = 'quick__status err'; status.textContent = 'Please select at least one option.'; return;
    }
    btn.disabled = true; btn.textContent = 'Sending…';
    status.className = 'quick__status'; status.textContent = '';
    try {
      const data = new FormData(form);
      // Checkboxes múltiples → un solo campo legible en el email
      if (chips.length) { data.delete('interest'); data.append('interest', chips.filter(c => c.checked).map(c => c.value).join(', ')); }
      const res = await fetch(form.action, { method: 'POST', body: data, headers: { Accept: 'application/json' } });
      if (res.ok) {
        form.reset();
        status.className = 'quick__status ok';
        status.textContent = "Thanks! We'll get back to you within 48 hours.";
      } else {
        const json = await res.json().catch(() => ({}));
        throw new Error(json.errors ? json.errors.map(er => er.message).join(' · ') : 'Submission failed');
      }
    } catch (err) {
      status.className = 'quick__status err';
      status.textContent = (err.message && err.message !== 'Failed to fetch' ? err.message + '. ' : 'Something went wrong. ') + 'You can also email us at hello@casingvisuals.com';
    } finally { btn.disabled = false; btn.innerHTML = label; }
  }));

  // "Join as a creator" (contact.html?topic=creator) pre-selects the creator chip
  if (new URLSearchParams(location.search).get('topic') === 'creator') {
    const c = $('#chip-creator'); if (c) c.checked = true;
  }

  // Menu: imagen de preview al pasar por cada link
  const mPrev = $('.menu__preview img');
  if (mPrev) $$('.menu__nav a[data-img]').forEach(a => a.addEventListener('mouseenter', () => {
    if (mPrev.getAttribute('src') === a.dataset.img) return;
    mPrev.classList.add('is-swapping');
    setTimeout(() => { mPrev.src = a.dataset.img; mPrev.classList.remove('is-swapping'); }, 200);
  }));

  // Home: reel a pantalla completa con controles (play/pausa, progreso, tiempo, sonido, repetir)
  const reel = $('.reelfull'), video = reel && $('.reelfull__video', reel);
  if (video) {
    const big = $('.reelfull__big', reel), playBtn = $('.player__play', reel), bar = $('.player__bar', reel);
    const cur = $('.player__cur', reel), dur = $('.player__dur', reel), mute = $('.player__mute', reel);
    const fmt = t => { t = Math.max(0, Math.floor(t || 0)); return Math.floor(t / 60) + ':' + String(t % 60).padStart(2, '0'); };
    let userPaused = false, seeking = false;
    const setState = () => {
      reel.classList.toggle('is-playing', !video.paused && !video.ended);
      reel.classList.toggle('is-ended', video.ended);
      playBtn.setAttribute('aria-label', video.ended ? 'Replay' : video.paused ? 'Play' : 'Pause');
      big.setAttribute('aria-label', video.ended ? 'Replay showreel' : 'Play showreel');
      $('.reelfull__big-label', big).textContent = video.ended ? 'Watch again' : 'Play reel';
    };
    const toggle = () => {
      if (video.ended) { video.currentTime = 0; }
      if (video.paused || video.ended) { userPaused = false; video.play().catch(() => {}); }
      else { userPaused = true; video.pause(); }
    };
    ['play', 'pause', 'ended'].forEach(ev => video.addEventListener(ev, setState));
    video.addEventListener('loadedmetadata', () => { dur.textContent = fmt(video.duration); });
    if (video.readyState >= 1) dur.textContent = fmt(video.duration);
    video.addEventListener('timeupdate', () => {
      cur.textContent = fmt(video.currentTime);
      if (!seeking && video.duration) { bar.value = Math.round(video.currentTime / video.duration * 1000); }
      bar.style.setProperty('--p', (bar.value / 10) + '%');
    });
    video.addEventListener('error', () => { $('.reelfull__error', reel).hidden = false; }, true);
    $('source', video)?.addEventListener('error', () => { $('.reelfull__error', reel).hidden = false; });
    big.addEventListener('click', toggle);
    playBtn.addEventListener('click', toggle);
    video.addEventListener('click', toggle);
    bar.addEventListener('input', () => {
      seeking = true; bar.style.setProperty('--p', (bar.value / 10) + '%');
      if (video.duration) { video.currentTime = bar.value / 1000 * video.duration; cur.textContent = fmt(video.currentTime); }
    });
    bar.addEventListener('change', () => { seeking = false; });
    mute.addEventListener('click', () => {
      video.muted = !video.muted;
      mute.setAttribute('aria-pressed', !video.muted);
      mute.setAttribute('aria-label', video.muted ? 'Unmute' : 'Mute');
      reel.classList.toggle('is-sound', !video.muted);
    });
    $('.player__fs', reel).addEventListener('click', () => {
      const el = reel;
      if (document.fullscreenElement) document.exitFullscreen();
      else if (el.requestFullscreen) el.requestFullscreen();
      else if (video.webkitEnterFullscreen) video.webkitEnterFullscreen();
    });
    // Autoplay (sin sonido) al entrar en pantalla; pausa al salir. No reinicia si terminó o si el usuario lo pausó.
    new IntersectionObserver(([en]) => {
      document.body.classList.toggle('reel-in-view', en.isIntersecting);
      if (en.isIntersecting) { if (!reduce && !userPaused && !video.ended) video.play().catch(() => {}); }
      else if (!video.paused) video.pause();
    }, { threshold: 0.4 }).observe(reel);
    setState();
  }
})();
