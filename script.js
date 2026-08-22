/* =========================================================================
   Portfolio — behaviour ported from the React components.
   ========================================================================= */

/* ---------------------------------------------------------------- helpers */
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];

/* ======================================================================
   THEME TOGGLE (dark / light)  — theme-toggle.tsx
   ====================================================================== */
(function () {
  const moon = '<path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"/>';
  const sun = '<circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>';
  // Light is default for first-time / unset visitors.
  let dark = localStorage.getItem('theme') === 'dark';
  if (localStorage.getItem('theme') !== 'dark' && localStorage.getItem('theme') !== 'light') {
    localStorage.setItem('theme', 'light');
    dark = false;
  }
  const apply = () => {
    document.documentElement.classList.toggle('dark', dark);
    $$('#theme-icon').forEach((icon) => { icon.innerHTML = dark ? sun : moon; });
  };
  apply();
  window.__applyThemeIcons = apply;
  // Delegation so soft-nav photos topbar toggles work too.
  document.addEventListener('click', (e) => {
    if (!e.target.closest?.('#theme-toggle')) return;
    dark = !dark;
    localStorage.setItem('theme', dark ? 'dark' : 'light');
    apply();
  });
})();

/* ======================================================================
   PALETTE SWATCHES  — theme-menu.tsx + themes.ts
   ====================================================================== */
(function () {
  const THEMES = [
    { id: 'zinc', name: 'black and white', className: 'theme-stark-mono', bg: '#FFFFFF', accent: '#1A1714' },
    { id: 'editorial', name: 'warm', className: 'theme-warm-editorial', bg: '#F5EBD9', accent: '#A36A58' },
    { id: 'nordic', name: 'blue', className: 'theme-cyber-nordic', bg: '#E5E9F0', accent: '#4C768F' },
    { id: 'mint', name: 'green', className: 'theme-midnight-mint', bg: '#E6EDE8', accent: '#2D6A4F' },
    { id: 'lavender', name: 'purple', className: 'theme-lavender-dusk', bg: '#EDE8FF', accent: '#7C5CFC' },
    { id: 'rose', name: 'rose', className: 'theme-cherry-blossom', bg: '#FFE8EC', accent: '#E05870' },
  ];
  const squares = $('#palette-squares');
  if (!squares) return;
  const root = document.documentElement;
  let active = THEMES[0];

  const setActive = (theme) => {
    THEMES.forEach((t) => root.classList.remove(t.className));
    root.classList.add(theme.className);
    localStorage.setItem('portfolio-palette', theme.id);
    active = theme;
    $$('.palette-square', squares).forEach((b) => b.classList.toggle('active', b.dataset.id === active.id));
  };

  THEMES.forEach((t) => {
    const b = document.createElement('button');
    b.className = 'palette-square';
    b.dataset.id = t.id;
    b.title = t.name;
    b.setAttribute('aria-label', t.name);
    b.style.background = `linear-gradient(135deg, ${t.bg} 50%, ${t.accent} 50%)`;
    b.addEventListener('click', () => setActive(t));
    squares.appendChild(b);
  });

  const saved = localStorage.getItem('portfolio-palette');
  setActive(THEMES.find((t) => t.id === saved) || THEMES[0]);
})();

/* ======================================================================
   GITHUB CONTRIBUTION GRAPH — interactive tiles + hover counts
   ====================================================================== */
(function () {
  const root = $('#gh-graph');
  const tip = $('#gh-tooltip');
  const card = $('#gh-card');
  if (!root || !tip || !card) return;

  const GH_USER = 'matthewhamilton3141';
  const WEEKS = 18; // ~4 months
  const CELL = 22;
  const GAP = 5;
  const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

  const fmtTip = (count, dateStr) => {
    const d = new Date(dateStr + 'T12:00:00');
    const label = d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
    if (count === 0) return `No contributions on ${label}`;
    if (count === 1) return `1 contribution on ${label}`;
    return `${count} contributions on ${label}`;
  };

  const hideTip = () => { tip.hidden = true; tip.textContent = ''; };

  const showTip = (el, count, dateStr) => {
    tip.textContent = fmtTip(count, dateStr);
    tip.hidden = false;
    const c = card.getBoundingClientRect();
    const r = el.getBoundingClientRect();
    const tw = tip.offsetWidth;
    const th = tip.offsetHeight;
    let left = r.left + r.width / 2 - c.left - tw / 2;
    let top = r.top - c.top - th - 8;
    left = Math.max(4, Math.min(left, c.width - tw - 4));
    if (top < 4) top = r.bottom - c.top + 8;
    tip.style.transform = `translate(${left}px, ${top}px)`;
  };

  const render = (days) => {
    // Pad so first day lands on its weekday column (Sun=0 … Sat=6), matching GitHub.
    const first = days[0];
    const pad = first ? new Date(first.date + 'T12:00:00').getDay() : 0;
    const cells = Array.from({ length: pad }, () => null).concat(days);
    while (cells.length % 7 !== 0) cells.push(null);
    const weeks = [];
    for (let i = 0; i < cells.length; i += 7) weeks.push(cells.slice(i, i + 7));

    root.innerHTML = '';
    root.style.setProperty('--gh-cols', weeks.length);
    root.style.setProperty('--gh-cell', CELL + 'px');
    root.style.setProperty('--gh-gap', GAP + 'px');

    const monthsRow = document.createElement('div');
    monthsRow.className = 'gh-months';
    let lastMonth = -1;
    weeks.forEach((week) => {
      const day = week.find((d) => d);
      const label = document.createElement('span');
      if (day) {
        const m = new Date(day.date + 'T12:00:00').getMonth();
        if (m !== lastMonth) {
          label.textContent = MONTHS[m];
          lastMonth = m;
        }
      }
      monthsRow.appendChild(label);
    });
    root.appendChild(monthsRow);

    const grid = document.createElement('div');
    grid.className = 'gh-cells';

    // GitHub fills column-major (week columns, Sun→Sat down).
    for (let day = 0; day < 7; day++) {
      for (let wi = 0; wi < weeks.length; wi++) {
        const d = weeks[wi][day];
        const cell = document.createElement('span');
        cell.className = 'gh-cell';
        if (!d) {
          cell.classList.add('empty');
          grid.appendChild(cell);
          continue;
        }
        cell.dataset.level = String(d.level ?? 0);
        cell.setAttribute('aria-label', fmtTip(d.count, d.date));
        cell.addEventListener('mouseenter', () => showTip(cell, d.count, d.date));
        cell.addEventListener('mouseleave', hideTip);
        cell.addEventListener('focus', () => showTip(cell, d.count, d.date));
        cell.addEventListener('blur', hideTip);
        cell.tabIndex = 0;
        grid.appendChild(cell);
      }
    }
    root.appendChild(grid);

    // On narrow viewports the graph scrolls horizontally — pin to the latest weeks.
    const pinLatest = () => {
      root.scrollLeft = Math.max(0, root.scrollWidth - root.clientWidth);
    };
    pinLatest();
    requestAnimationFrame(pinLatest);
  };

  const onResize = () => {
    if (root.querySelector('.gh-cells')) {
      root.scrollLeft = Math.max(0, root.scrollWidth - root.clientWidth);
    }
  };
  window.addEventListener('resize', onResize, { passive: true });

  card.addEventListener('mouseleave', hideTip);
  root.innerHTML = '<p class="gh-loading">loading contributions…</p>';

  fetch(`https://github-contributions-api.jogruber.de/v4/${GH_USER}?y=last`)
    .then((r) => {
      if (!r.ok) throw new Error('bad response');
      return r.json();
    })
    .then((data) => {
      const all = data.contributions || [];
      const today = new Date();
      const todayStr = [
        today.getFullYear(),
        String(today.getMonth() + 1).padStart(2, '0'),
        String(today.getDate()).padStart(2, '0'),
      ].join('-');
      // Drop any future padding the API includes through year-end.
      const throughToday = all.filter((d) => d.date <= todayStr);
      render(throughToday.slice(-(WEEKS * 7)));
    })
    .catch(() => {
      root.innerHTML = '<p class="gh-loading">couldn’t load contributions</p>';
    });
})();

/* ======================================================================
   LANDING — typewriter + staggered reveal + parallax fade
   Skip intro when returning within the session (e.g. back from /photos).
   ====================================================================== */
(function () {
  const fullName = 'MATTHEW HAMILTON';
  const line1 = $('#name-line1');
  const line2 = $('#name-line2');
  const cursor = $('#name-cursor');
  const nameWrap = $('#name-wrap');
  if (!nameWrap || !line1 || !line2) {
    // Still reveal shared chrome (palette) on non-landing pages.
    $('#palette')?.classList.add('show');
    return;
  }
  const INTRO_KEY = 'portfolio-intro-done';
  const skipIntro = sessionStorage.getItem(INTRO_KEY) === '1';

  const revealRest = () => {
    $('#about-bio')?.classList.add('show');
    $('#photo-frame')?.classList.add('show');
    $('#icon-strip')?.classList.add('show');
    $('#site-directory')?.classList.add('show');
    $('#palette')?.classList.add('show');
    $('#mobile-hint')?.classList.add('show');
  };

  const startNameSwap = () => {
    if (!nameWrap || nameWrap.dataset.swapReady) return;
    nameWrap.dataset.swapReady = '1';
    let paused = false;
    nameWrap.addEventListener('mouseenter', () => { paused = true; });
    nameWrap.addEventListener('mouseleave', () => { paused = false; });
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduceMotion) return;
    setInterval(() => {
      if (paused) return;
      nameWrap.classList.toggle('showing-zh');
    }, 5000);
  };

  const finishName = () => {
    line1.textContent = fullName.slice(0, 7);
    line2.textContent = fullName.slice(7).trim();
    if (cursor) { cursor.style.display = 'none'; line2.appendChild(cursor); }
    nameWrap?.classList.add('interactive');
    startNameSwap();
  };

  const markIntroDone = () => sessionStorage.setItem(INTRO_KEY, '1');

  if (skipIntro) {
    document.documentElement.classList.add('skip-intro');
    finishName();
    revealRest();
  } else {
    let index = 0;
    const typeNext = () => {
      if (index <= fullName.length) {
        const typed = fullName.slice(0, index);
        line1.textContent = typed.slice(0, 7);
        line2.textContent = typed.slice(7).trim();
        line2.appendChild(cursor);
        index++;
        setTimeout(typeNext, 80 + (Math.random() * 30 - 15));
      } else {
        cursor.style.display = 'none';
        nameWrap.classList.add('interactive');
        startNameSwap();
        markIntroDone();
      }
    };
    setTimeout(typeNext, 300);
    setTimeout(() => $('#about-bio')?.classList.add('show'), 520);
    setTimeout(() => {
      $('#photo-frame')?.classList.add('show');
      $('#icon-strip')?.classList.add('show');
    }, 800);
    setTimeout(() => {
      $('#site-directory')?.classList.add('show');
      $('#palette')?.classList.add('show');
      $('#mobile-hint')?.classList.add('show');
      markIntroDone();
    }, 1000);
  }

  // Fade the right panel as the landing scrolls away. Opacity only — translating
  // it down used to push text into the section clip edge and look like a hard cut.
  // Disabled on mobile: the stacked layout puts the about copy inside #right-fade,
  // so the same progress math fades text while you're still reading it.
  const section = $('#landing');
  const target = $('#right-fade');
  if (!section || !target) return;
  const desktopMq = window.matchMedia('(min-width: 768px)');
  const reduceMq = window.matchMedia('(prefers-reduced-motion: reduce)');
  let ticking = false;

  const clearFade = () => {
    target.style.opacity = '';
    target.style.pointerEvents = '';
  };

  const update = () => {
    ticking = false;
    if (!desktopMq.matches || reduceMq.matches) {
      clearFade();
      return;
    }
    const rect = section.getBoundingClientRect();
    const scrolled = Math.max(0, -rect.top);
    const progress = Math.min(scrolled / (rect.height * 0.75), 1);
    target.style.opacity = `${1 - progress}`;
    target.style.pointerEvents = progress > 0.85 ? 'none' : '';
  };

  const onScroll = () => {
    if (!ticking) {
      ticking = true;
      requestAnimationFrame(update);
    }
  };

  window.addEventListener('scroll', onScroll, { passive: true });
  desktopMq.addEventListener('change', update);
  reduceMq.addEventListener('change', update);
  update();
})();

/* ======================================================================
   LIVE PHOTO — hover to play preview video  (live-photo.tsx)
   ====================================================================== */
function applyMediaCrop(el, { fit, objectPosition, zoom } = {}) {
  if (fit) el.style.objectFit = fit;
  if (objectPosition) el.style.objectPosition = objectPosition;
  const z = zoom != null && zoom !== '' ? Number(zoom) : NaN;
  if (Number.isFinite(z) && z !== 1) el.style.transform = `scale(${z})`;
}

function initLivePhoto(el) {
  const videoSrc = el.dataset.video, webm = el.dataset.webm, fit = el.dataset.fit;
  let video = null;
  const ensureVideo = () => {
    if (video || !videoSrc) return;
    video = document.createElement('video');
    video.loop = true; video.muted = true; video.playsInline = true; video.preload = 'auto'; video.crossOrigin = 'anonymous';
    applyMediaCrop(video, {
      fit,
      objectPosition: el.dataset.objectPosition,
      zoom: el.dataset.zoom,
    });
    if (webm) { const s = document.createElement('source'); s.src = webm; s.type = 'video/webm'; video.appendChild(s); }
    const s2 = document.createElement('source'); s2.src = videoSrc; s2.type = 'video/mp4'; video.appendChild(s2);
    el.insertBefore(video, el.firstChild);
  };
  const activate = () => { ensureVideo(); el.classList.add('active'); if (video) video.play().catch(() => {}); };
  const deactivate = () => { el.classList.remove('active'); if (video) { video.pause(); video.currentTime = 0; } };
  el.addEventListener('pointerenter', (e) => { if (e.pointerType === 'mouse') activate(); });
  el.addEventListener('pointerleave', (e) => { if (e.pointerType === 'mouse') deactivate(); });
  el.addEventListener('pointerup', (e) => {
    if (e.pointerType === 'mouse') return;
    el.classList.contains('active') ? deactivate() : activate();
  });
}
$$('.livephoto').forEach(initLivePhoto);

/* ======================================================================
   PROJECTS — grid render with livephoto hover previews
   ====================================================================== */
(function () {
  const R2 = 'https://pub-642075d77d2b430c93bf3b1c60299af0.r2.dev/';
  const projects = [
    { category: 'working on', title: 'shield-in-alpasim',
      description: 'Putting a provable safety shield over a learned AV camera policy (VaVAM) in NVIDIA\'s AlpaSim, and measuring how much the "no-collisions" guarantee survives when the obstacle field comes from learned perception instead of ground truth.',
      link: 'https://github.com/matthewhamilton3141/shield-in-alpasim', thumb: 'images/shield-in-alpasim.webp',
      video: R2 + 'montage_drives_labels_nogap.mp4' },
    { category: 'working on', title: 'kitti-nav',
      description: 'Onboard stereo VO + lidar BEV feeding a shielded PPO planner — 78% success, 0 collisions on KITTI.',
      link: 'https://github.com/matthewhamilton3141/kitti-nav', thumb: 'images/kitti-nav.webp' },
    { category: 'working on', title: 'gsplat-rt',
      description: 'Real-time Gaussian-splatting SLAM (CUDA/TensorRT) — a self-planning car drives 312 m through a reconstructed interchange with 0 collisions.',
      link: 'https://github.com/matthewhamilton3141/gsplat-rt', thumb: 'images/reconstruction_desk.webp',
      video: R2 + 'reconstruction_turntable.mp4', zoom: 1.2 },
    { category: 'personal project', title: 'Retermina',
      description: 'AI-coding terminal on Tauri v2 + Rust. Native PTYs, split panes, and out-of-process shells that survive quit, crash, or update.',
      link: 'https://github.com/matthewhamilton3141/Retermina', liveUrl: 'https://retermina.com/',
      thumb: 'images/reterminapreview.webp', video: R2 + 'Retermina%20Promo%20(2).mp4', zoom: 1.35 },
    { category: 'personal project', title: 'Sketchstack',
      description: 'Turn system-design diagrams into structured prompts for Claude Code and Cursor. Next.js, React Flow, Supabase.',
      link: 'https://github.com/matthewhamilton3141/sketchstack', liveUrl: 'https://sketchstack.vercel.app',
      thumb: 'images/sketchstack.webp' },
    { category: 'personal project', title: 'Stash',
      description: 'Menu-bar macOS app to stash code snippets — capture with ⌘⇧K, find and copy in a keystroke. Tauri 2 + React.',
      link: 'https://github.com/matthewhamilton3141/stash', liveUrl: 'https://stashnotes.vercel.app',
      thumb: 'images/codenote.webp' },
    { category: 'hackathon project', title: 'laser tag now',
      description: 'AR laser tag on your phone — real-world matches with radar, health, and live fire over the camera feed.',
      link: 'https://github.com/ConnorXTan/phonegame', thumb: 'images/lasertagnow.webp',
      video: R2 + 'lasertagnow.mp4', logo: 'images/summerhacks.svg',
      logoLink: 'https://summerhacks.ca', fit: 'contain', mediaBg: '#000' },
    { category: 'hackathon project', title: 'baam',
      description: 'Social betting for your circle — Solana contracts with iMessage, Discord, and web clients.',
      link: 'https://github.com/BansonVuong/BAAM', thumb: 'images/baampreview1.webp',
      video: R2 + 'baamimsg.mp4', webm: R2 + 'baamimsg.webm', logo: 'images/jamhackslogo.png',
      logoLink: 'https://jamhacks.ca', startTime: 2.23 },
    { category: 'hackathon project', title: 'Marrymap',
      description: 'Wedding planning with dual-consent vendor swiping and a Chrome extension that clips vendors into shared albums.',
      link: 'https://github.com/aarontran321/marrymap', thumb: 'images/marrymap.webp',
      logo: 'images/about/cursor.png', zoom: 1.25 },
  ];

  const gridView = $('#grid-view');
  if (!gridView) return;

  const icGithub = `<svg class="proj-ic" viewBox="0 0 24 24" aria-hidden="true"><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"/></svg>`;
  const icLink = `<svg class="proj-ic" viewBox="0 0 24 24" aria-hidden="true"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>`;
  const linksHTML = (p) => `
    ${p.link ? `<a class="proj-link" href="${p.link}" target="_blank" rel="noopener noreferrer" title="GitHub" aria-label="GitHub">${icGithub}</a>` : ''}
    ${p.liveUrl ? `<a class="proj-link try" href="${p.liveUrl}" target="_blank" rel="noopener noreferrer" title="Open live site" aria-label="Open live site">${icLink}</a>` : ''}`;
  const logoHTML = (p) => p.logo
    ? (p.logoLink
      ? `<a href="${p.logoLink}" target="_blank" rel="noopener noreferrer" title="View Hackathon"><img class="badge" src="${p.logo}" alt="Hackathon Logo"/></a>`
      : `<img class="badge" src="${p.logo}" alt="Hackathon Logo" title="Hackathon"/>`)
    : '';

  projects.forEach((p) => {
    const card = document.createElement('div');
    card.className = 'grid-card';
    const thumb = document.createElement('div');
    thumb.className = 'grid-thumb';
    const lp = document.createElement('div');
    lp.className = 'livephoto' + (p.video ? ' has-video' : '');
    lp.dataset.video = p.video || '';
    if (p.webm) lp.dataset.webm = p.webm;
    if (p.fit) lp.dataset.fit = p.fit;
    if (p.objectPosition) lp.dataset.objectPosition = p.objectPosition;
    if (p.zoom && p.zoom !== 1) lp.dataset.zoom = String(p.zoom);
    if (p.mediaBg) lp.style.background = p.mediaBg;
    lp.style.borderRadius = '4px';
    const im = document.createElement('img'); im.className = 'lp-thumb'; im.src = p.thumb; im.alt = p.title;
    im.loading = 'lazy'; im.decoding = 'async';
    applyMediaCrop(im, { fit: p.fit, objectPosition: p.objectPosition || 'center', zoom: p.zoom });
    lp.appendChild(im);
    thumb.appendChild(lp);
    if (p.startTime) lp.dataset.startTime = p.startTime;
    initLivePhoto(lp);
    card.appendChild(thumb);
    const details = document.createElement('div');
    details.className = 'grid-details';
    details.innerHTML = `
      <div class="title-line">
        <h3>${p.title}</h3>
        ${logoHTML(p)}
        <div class="title-links">${linksHTML(p)}</div>
      </div>
      <p class="desc">${p.description}</p>`;
    card.appendChild(details);
    gridView.appendChild(card);
  });
})();

/* ======================================================================
   NOTCH MEDIA PLAYER — notch-media-player.tsx
   Persists across / ↔ /photos via sessionStorage so playback can resume.
   ====================================================================== */
(function () {
  const R2 = 'https://pub-ce086066003e4e1cad2011087e85618b.r2.dev/';
  const STATE_KEY = 'portfolio-notch';
  const TRACKS = [
    { title: 'nights', artist: 'frank ocean', src: R2 + 'nights.mp3', cover: '/images/blond.jpg', wave: 'linear-gradient(to top, #22C55E, #e4e4e4ff)' },
    { title: 'who knows', artist: 'daniel caesar', src: R2 + 'whoknows.mp3', cover: '/images/sonofspergy.jpg', wave: 'linear-gradient(to top, #800020, #c60032ff)' },
    { title: 'whiplash', artist: 'aespa', src: R2 + 'whiplash.mp3', cover: '/images/whiplash.jpg', wave: '#FFFFFF' },
    { title: 'clarity', artist: 'zedd (ft. foxes)', src: R2 + 'clarity.mp3', cover: '/images/clarity.jpg', wave: 'linear-gradient(to top, #3B82F6, #22C55E)' },
    { title: 'japanese denim', artist: 'daniel caesar', src: R2 + 'japanesedenim.mp3', cover: '/images/japanesedenim.jpg', wave: 'linear-gradient(to top, #e2e2e2ff, #a5a5a5ff)' },
    { title: 'crank the bass, play the muzik', artist: 'knock2', src: R2 + 'crankthebassplaythemuzik.mp3', cover: '/images/nolimit.jpg', wave: '#A5969B' },
    { title: 'seigfried', artist: 'frank ocean', src: R2 + 'seigfried.mp3', cover: '/images/blond.jpg', wave: 'linear-gradient(to top, #22C55E, #e4e4e4ff)' },
    { title: 'slow dancing in the dark', artist: 'joji', src: R2 + 'slowdancinginthedark.mp3', cover: '/images/ballads1.jpeg', wave: 'linear-gradient(to top, #CDB0AE, #CEC0C0)' },
    { title: 'rearrange my world', artist: 'daniel caesar (ft. rex orange county)', src: R2 + 'rearrangemyworld.mp3', cover: '/images/rearrange.jpeg', wave: '#b7b7b7ff' },
    { title: 'ochos rios', artist: 'daniel caesar', src: R2 + 'ochosrios.mp3', cover: '/images/neverenough.jpg', wave: '#4169E1' },
    { title: 'cyanide', artist: 'daniel caesar', src: R2 + 'cyanide.mp3', cover: '/images/casestudy.jpeg', wave: 'linear-gradient(to top, #7aadffb9, #b7b7b7ff)' },
  ];
  const BAR_COUNT = 6;
  const VIZ_MIN = 0.3;
  const VIZ_MAX = 0.7;
  const notch = $('#notch');
  if (!notch) return;
  const audio = new Audio(); audio.crossOrigin = 'anonymous'; audio.preload = 'metadata'; audio.volume = 0.55;
  let idx = 0, playing = false, muted = false, expanded = window.innerWidth >= 768, skip = false;
  let ctx = null, analyser = null, raf = null, inactivity = null;
  let pendingResume = false;
  let saveTimer = null;

  // build viz bars — each column is a bar plus its reflection
  const viz = $('#viz'); const bars = [];
  for (let i = 0; i < BAR_COUNT; i++) {
    const col = document.createElement('div');
    col.className = 'viz-col';
    const up = document.createElement('div');
    up.className = 'viz-bar';
    const down = document.createElement('div');
    down.className = 'viz-bar viz-bar-mirror';
    col.append(up, down);
    viz.appendChild(col);
    bars.push([up, down]);
  }

  const playIcon = '<svg viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="1.75" stroke-linejoin="round"><path d="M6 3.2v17.6L21.5 12z"/></svg>';
  const pauseIcon = '<svg viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="1.75" stroke-linejoin="round"><path d="M6 5h4v14H6zM14 5h4v14h-4z"/></svg>';
  const volIcon = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07M19.07 4.93a10 10 0 0 1 0 14.14"/></svg>';
  const muteIcon = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><line x1="23" y1="9" x2="17" y2="15"/><line x1="17" y1="9" x2="23" y2="15"/></svg>';

  const fmt = (t) => { if (!isFinite(t)) return '0:00'; const m = Math.floor(t / 60), s = Math.floor(t % 60); return `${m}:${s < 10 ? '0' : ''}${s}`; };

  const saveState = () => {
    try {
      sessionStorage.setItem(STATE_KEY, JSON.stringify({
        idx, t: audio.currentTime || 0, playing: playing || pendingResume, muted,
      }));
    } catch (_) {}
  };
  const scheduleSave = () => {
    if (saveTimer) return;
    saveTimer = setTimeout(() => { saveTimer = null; saveState(); }, 400);
  };
  const readState = () => {
    try { return JSON.parse(sessionStorage.getItem(STATE_KEY) || 'null'); }
    catch (_) { return null; }
  };

  const parseHex = (h) => {
    let s = h.slice(1);
    if (s.length === 3) s = [...s].map((c) => c + c).join('');
    const n = parseInt(s.slice(0, 6), 16);
    const a = s.length >= 8 ? parseInt(s.slice(6, 8), 16) / 255 : 1;
    return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255, a };
  };
  const fmtRgba = ({ r, g, b, a }) =>
    a < 1 ? `rgba(${r},${g},${b},${+a.toFixed(3)})` : `rgb(${r},${g},${b})`;
  const mixRgb = (a, b, t) => ({
    r: Math.round(a.r + (b.r - a.r) * t),
    g: Math.round(a.g + (b.g - a.g) * t),
    b: Math.round(a.b + (b.b - a.b) * t),
    a: a.a + (b.a - a.a) * t,
  });
  /** Fold the wave at its midpoint so the join is the middle colour, not one endpoint. */
  const wavePair = (wave) => {
    const hexes = wave.match(/#(?:[0-9a-fA-F]{8}|[0-9a-fA-F]{6}|[0-9a-fA-F]{3})\b/g) || [];
    if (hexes.length < 2) return { up: wave, down: wave };
    const a = parseHex(hexes[0]);
    const b = parseHex(hexes[1]);
    const mid = fmtRgba(mixRgb(a, b, 0.5));
    return {
      up: `linear-gradient(to top, ${mid}, ${fmtRgba(b)})`,
      down: `linear-gradient(to bottom, ${mid}, ${fmtRgba(a)})`,
    };
  };

  function renderTrack() {
    const t = TRACKS[idx];
    $('#art-cover').src = t.cover; $('#compact-cover').src = t.cover; $('#idle-cover').src = t.cover;
    $('#track-title').textContent = t.title; $('#track-artist').textContent = t.artist; $('#compact-title').textContent = t.title;
    $('#art-glow').style.background = t.wave.includes('linear-gradient') ? t.wave : `radial-gradient(circle, ${t.wave} 0%, transparent 70%)`;
    const pairBg = wavePair(t.wave);
    bars.forEach((pair) => {
      pair[0].style.background = pairBg.up;
      pair[1].style.background = pairBg.down;
    });
    scheduleMarquees();
    syncMediaSession();
  }

  function renderState() {
    notch.classList.toggle('expanded', expanded);
    notch.classList.toggle('playing', playing && !expanded);
    $('#compact-playing').style.display = playing ? 'flex' : 'none';
    $('#viz').style.display = playing ? 'flex' : 'none';
    $('#compact-idle').style.display = playing ? 'none' : 'flex';
    $('#btn-play').innerHTML = playing ? pauseIcon : playIcon;
    $('#btn-mute').innerHTML = muted ? muteIcon : volIcon;
    // Expand/collapse animates width — ResizeObserver remasures after layout settles.
    scheduleMarquees();
    scheduleSave();
    syncMediaSession();
  }

  function syncMediaSession() {
    if (!('mediaSession' in navigator)) return;
    const t = TRACKS[idx];
    try {
      navigator.mediaSession.metadata = new MediaMetadata({
        title: t.title,
        artist: t.artist,
        artwork: [{ src: t.cover, sizes: '512x512', type: 'image/jpeg' }],
      });
      navigator.mediaSession.playbackState = playing ? 'playing' : 'paused';
    } catch (_) {}
  }

  function initCtx() {
    if (!ctx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      ctx = new AC(); analyser = ctx.createAnalyser(); analyser.fftSize = 64;
      const src = ctx.createMediaElementSource(audio); src.connect(analyser); analyser.connect(ctx.destination);
    }
    if (ctx.state === 'suspended') ctx.resume();
    renderViz();
  }
  function renderViz() {
    const len = analyser.frequencyBinCount, data = new Uint8Array(len);
    const draw = () => {
      raf = requestAnimationFrame(draw);
      if (!audio.paused) {
        analyser.getByteFrequencyData(data);
        bars.forEach((pair, i) => {
          const di = Math.floor((i / BAR_COUNT) * (len * 0.55));
          const s = `scaleY(${VIZ_MIN + (VIZ_MAX - VIZ_MIN) * ((data[di] || 0) / 255)})`;
          pair[0].style.transform = s;
          pair[1].style.transform = s;
        });
      } else bars.forEach((pair) => {
        pair[0].style.transform = `scaleY(${VIZ_MIN})`;
        pair[1].style.transform = `scaleY(${VIZ_MIN})`;
      });
    };
    if (raf) cancelAnimationFrame(raf); draw();
  }

  function setSrc(load) {
    audio.src = TRACKS[idx].src; if (load) audio.load();
  }
  function play() {
    pendingResume = false;
    audio.play().then(() => { playing = true; initCtx(); renderState(); }).catch(() => {
      playing = false; pendingResume = true; renderState();
    });
  }
  function pause() { pendingResume = false; audio.pause(); playing = false; renderState(); }

  // Keep UI in sync when OS media keys / Control Center pause/play the element.
  audio.addEventListener('play', () => {
    playing = true;
    pendingResume = false;
    initCtx();
    renderState();
  });
  audio.addEventListener('pause', () => {
    if (!audio.paused) return;
    playing = false;
    renderState();
  });

  if ('mediaSession' in navigator) {
    try {
      navigator.mediaSession.setActionHandler('play', () => { play(); });
      navigator.mediaSession.setActionHandler('pause', () => { pause(); });
      navigator.mediaSession.setActionHandler('previoustrack', () => { prev(); });
      navigator.mediaSession.setActionHandler('nexttrack', () => { next(); });
    } catch (_) {}
  }

  const seekEl = $('#seek');
  const syncSeekFill = () => {
    const max = parseFloat(seekEl.max) || 0;
    const val = parseFloat(seekEl.value) || 0;
    const pct = max > 0 ? Math.min(100, Math.max(0, (val / max) * 100)) : 0;
    seekEl.style.setProperty('--seek-pct', pct + '%');
  };

  audio.addEventListener('loadedmetadata', () => {
    $('#dur-time').textContent = fmt(audio.duration);
    seekEl.max = audio.duration || 100;
    syncSeekFill();
  });
  audio.addEventListener('timeupdate', () => {
    $('#cur-time').textContent = fmt(audio.currentTime);
    seekEl.value = audio.currentTime;
    syncSeekFill();
    scheduleSave();
  });
  audio.addEventListener('ended', () => next());
  window.addEventListener('pagehide', saveState);
  window.addEventListener('visibilitychange', () => { if (document.visibilityState === 'hidden') saveState(); });

  function next() { skip = true; idx = (idx + 1) % TRACKS.length; changeTrack(); }
  function prev() { skip = true; idx = (idx - 1 + TRACKS.length) % TRACKS.length; changeTrack(); }
  function changeTrack() {
    const wasPlaying = playing || skip || pendingResume; skip = false;
    setSrc(true); renderTrack();
    if (wasPlaying) play(); else { audio.currentTime = 0; renderState(); }
    syncSeekFill();
  }

  $('#btn-play').addEventListener('click', (e) => { e.stopPropagation(); playing ? pause() : play(); resetTimer(); });
  $('#btn-mute').addEventListener('click', (e) => { e.stopPropagation(); muted = !muted; audio.muted = muted; renderState(); resetTimer(); });
  $('#btn-next').addEventListener('click', (e) => { e.stopPropagation(); next(); resetTimer(); });
  $('#btn-prev').addEventListener('click', (e) => { e.stopPropagation(); prev(); resetTimer(); });
  seekEl.addEventListener('input', (e) => {
    audio.currentTime = parseFloat(e.target.value);
    syncSeekFill();
    resetTimer();
  });
  seekEl.addEventListener('click', (e) => e.stopPropagation());
  syncSeekFill();

  function resetTimer() {
    if (inactivity) clearTimeout(inactivity);
    if (window.innerWidth < 768 && expanded) inactivity = setTimeout(() => { expanded = false; renderState(); }, 2500);
  }

  // expand / collapse behaviour
  notch.addEventListener('mouseenter', () => { expanded = true; renderState(); });
  notch.addEventListener('mouseleave', () => { expanded = false; renderState(); });
  notch.addEventListener('mousemove', resetTimer);
  notch.addEventListener('click', () => { if (!expanded) { expanded = true; renderState(); } });
  window.addEventListener('scroll', () => { if (expanded) { expanded = false; renderState(); } }, { passive: true });

  // marquee: duplicate text + animate only when overflowing (and visible).
  // Must remasure after notch width transitions — a single rAF runs while the
  // expanded meta column is still ~0px wide, so overflow would be skipped forever.
  let marqueeRaf = 0;
  let marqueeRoTimer = 0;

  function applyMarquees() {
    $$('.marquee-box').forEach((box) => {
      const track = box.querySelector('.track');
      if (!track) return;
      // Strip clones/animation first so overlapping callers can't stack copies.
      track.classList.remove('overflow', 'animate-marquee');
      track.querySelectorAll('span[aria-hidden]').forEach((s) => s.remove());
      const span = track.querySelector('span');
      if (!span) return;
      // Hidden (display:none) or not yet laid out during the width transition.
      if (box.offsetWidth < 2) return;
      if (span.offsetWidth > box.offsetWidth + 1) {
        track.classList.add('overflow', 'animate-marquee');
        const clone = span.cloneNode(true);
        clone.removeAttribute('id');
        clone.setAttribute('aria-hidden', 'true');
        track.appendChild(clone);
      }
    });
  }

  function scheduleMarquees() {
    if (marqueeRaf) return;
    marqueeRaf = requestAnimationFrame(() => {
      marqueeRaf = 0;
      applyMarquees();
    });
  }

  if (typeof ResizeObserver !== 'undefined') {
    const marqueeRo = new ResizeObserver(() => {
      // Debounce through the .4s notch width transition; measure once it settles.
      if (marqueeRoTimer) clearTimeout(marqueeRoTimer);
      marqueeRoTimer = setTimeout(() => {
        marqueeRoTimer = 0;
        scheduleMarquees();
      }, 80);
    });
    $$('.marquee-box').forEach((box) => marqueeRo.observe(box));
    marqueeRo.observe(notch);
  }
  if (document.fonts?.ready) document.fonts.ready.then(() => scheduleMarquees());

  // Restore across pages, or fresh boot.
  const saved = readState();
  if (saved && Number.isFinite(saved.idx)) {
    idx = Math.max(0, Math.min(TRACKS.length - 1, saved.idx | 0));
    muted = !!saved.muted;
    audio.muted = muted;
    expanded = false;
    setSrc(true);
    renderTrack();
    renderState();
    const resumeAt = Math.max(0, Number(saved.t) || 0);
    const shouldPlay = !!saved.playing;
    const kick = () => {
      try { if (resumeAt && isFinite(audio.duration)) audio.currentTime = Math.min(resumeAt, audio.duration - 0.05); }
      catch (_) { audio.currentTime = resumeAt; }
      if (shouldPlay) play();
      else renderState();
    };
    if (audio.readyState >= 1) kick();
    else audio.addEventListener('loadedmetadata', kick, { once: true });
    // Autoplay may block after navigation — retry on next gesture.
    document.addEventListener('pointerdown', () => { if (pendingResume) play(); }, true);
  } else {
    setSrc(false); renderTrack(); renderState();
    if (expanded) setTimeout(() => { expanded = false; renderState(); }, 2000);
  }

  // ?viz-preview — expanded player + fake waveform, no audio needed.
  if (new URLSearchParams(location.search).has('viz-preview')) {
    playing = true;
    expanded = true;
    renderTrack();
    renderState();
    const fake = () => {
      raf = requestAnimationFrame(fake);
      const t = performance.now() / 200;
      bars.forEach((pair, i) => {
        const s = `scaleY(${VIZ_MIN + (VIZ_MAX - VIZ_MIN) * (0.5 + 0.5 * Math.sin(t + i * 0.62))})`;
        pair[0].style.transform = s;
        pair[1].style.transform = s;
      });
    };
    if (raf) cancelAnimationFrame(raf);
    fake();

    const step = (dir) => {
      idx = (idx + dir + TRACKS.length) % TRACKS.length;
      renderTrack();
    };
    let cycle = setInterval(() => step(1), 2400);
    const poke = (dir) => {
      clearInterval(cycle);
      step(dir);
      cycle = setInterval(() => step(1), 2400);
    };
    window.addEventListener('scroll', (e) => { e.stopImmediatePropagation(); }, true);
    notch.addEventListener('mouseleave', (e) => { e.stopImmediatePropagation(); }, true);
    $('#btn-prev')?.addEventListener('click', (e) => { e.stopPropagation(); poke(-1); });
    $('#btn-next')?.addEventListener('click', (e) => { e.stopPropagation(); poke(1); });
    notch.addEventListener('wheel', (e) => {
      e.preventDefault();
      poke(e.deltaY > 0 ? 1 : -1);
    }, { passive: false });
  }
})();

/* ======================================================================
   SIDE NAV — active tracking + scroll-to  (side-nav.tsx)
   ====================================================================== */
(function () {
  const dots = $$('.nav-dot-wrap');
  let scrollAnim = null;

  // Slower ease than native smooth-scroll so section jumps feel deliberate.
  const scrollTo = (id, duration = 1200) => {
    const el = document.getElementById(id);
    if (!el) return;
    if (scrollAnim) cancelAnimationFrame(scrollAnim);

    const start = window.scrollY;
    const target = el.getBoundingClientRect().top + start;
    const dist = target - start;
    if (Math.abs(dist) < 2) return;
    const t0 = performance.now();
    const ease = (t) => t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

    const step = (now) => {
      const p = Math.min((now - t0) / duration, 1);
      window.scrollTo(0, start + dist * ease(p));
      if (p < 1) scrollAnim = requestAnimationFrame(step);
      else scrollAnim = null;
    };
    scrollAnim = requestAnimationFrame(step);
  };

  dots.forEach((d) => d.addEventListener('click', () => scrollTo(d.dataset.target)));
  $$('[data-target]').forEach((el) => {
    if (!el.classList.contains('nav-dot-wrap')) el.addEventListener('click', () => scrollTo(el.dataset.target));
  });

  const sections = ['landing', 'projects', 'contact'];
  const obs = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (e.isIntersecting) {
        dots.forEach((d) => d.querySelector('.nav-dot').classList.toggle('active', d.dataset.target === e.target.id));
      }
    });
  }, { rootMargin: '-30% 0px -40% 0px' });
  sections.forEach((id) => { const el = document.getElementById(id); if (el) obs.observe(el); });

})();

/* ======================================================================
   PORO 3D — contact-section.tsx + poro.tsx
   Loads three.js from CDN, mounts the GLB, follows cursor X, plays anims.
   Model is uncompressed (no Draco) so Safari doesn't need the wasm decoder.
   ====================================================================== */
(function () {
  const canvas = $('#poro-canvas');
  const fallback = $('#poro-fallback');
  const section = $('#contact');
  if (!canvas || !section) return;
  let started = false;

  const fail = (msg) => {
    canvas.style.display = 'none';
    if (fallback) fallback.textContent = msg;
  };

  const start = () => {
    if (started) return;
    started = true;
    io.disconnect();
    boot().catch((err) => {
      console.error('[poro]', err);
      fail('poro 3d model — failed to start.');
    });
  };

  const io = new IntersectionObserver(([e]) => {
    if (e.isIntersecting) start();
  }, { threshold: 0.05, rootMargin: '120px 0px' });
  io.observe(section);
  // Hash / restore scroll can land on contact before the observer fires.
  requestAnimationFrame(() => {
    const r = section.getBoundingClientRect();
    if (r.top < innerHeight && r.bottom > 0) start();
  });

  async function boot() {
    const THREE_URL = 'https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js';
    const LOADER_URL = 'https://cdn.jsdelivr.net/npm/three@0.160.0/examples/jsm/loaders/GLTFLoader.js';
    let THREE, GLTFLoader;
    try {
      THREE = await import(THREE_URL);
      ({ GLTFLoader } = await import(LOADER_URL));
    } catch (err) {
      console.error('[poro] three import', err);
      fail('poro 3d model — needs internet for three.js (couldn\'t load).');
      return;
    }

    try {
      const probe = document.createElement('canvas');
      if (!probe.getContext('webgl') && !probe.getContext('experimental-webgl')) {
        fail('poro 3d model — WebGL unavailable in this browser.');
        return;
      }
    } catch {
      fail('poro 3d model — WebGL unavailable in this browser.');
      return;
    }

    const SCALE = 0.95, SPEED = 0.3, RUN_THRESH = 0.02;
    const TARGET_H = 0.28; // world units — small bottom mascot
    const w = () => Math.max(1, section.clientWidth);
    const h = () => Math.max(1, section.clientHeight);

    let renderer;
    try {
      renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'high-performance' });
    } catch {
      fail('poro 3d model — could not create WebGL context.');
      return;
    }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
    renderer.setSize(w(), h(), false);
    renderer.setClearColor(0x000000, 0);
    renderer.outputColorSpace = THREE.SRGBColorSpace;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(38, w() / h(), 0.1, 100);
    camera.position.set(0, 0, 4.5);
    scene.add(new THREE.AmbientLight(0xffffff, 2));
    const d1 = new THREE.DirectionalLight(0xffffff, 1.5); d1.position.set(3, 5, 3); scene.add(d1);
    const d2 = new THREE.DirectionalLight(0xffffff, 0.5); d2.position.set(-2, 2, -2); scene.add(d2);

    const loader = new GLTFLoader();
    let mixer, actions = {}, group, posX = 0, facing = Math.PI * 0.15, current = null, targetX = 0;
    let override = null, reacting = false, nextClick = 'idle3';
    let raf = null, onScreen = true;

    let gltf;
    try {
      gltf = await loader.loadAsync('models/poro.glb?v=fitscale');
    } catch (err) {
      console.error('[poro]', err);
      fail('poro 3d model — could not load models/poro.glb.');
      return;
    }

    group = new THREE.Group();
    const model = gltf.scene;
    // Fit to a readable size. The GLB is ~130 units tall; 0.001 left it nearly invisible.
    model.updateMatrixWorld(true);
    const fitBox = new THREE.Box3().setFromObject(model);
    const fitSize = fitBox.getSize(new THREE.Vector3());
    const fit = fitSize.y > 0 ? (TARGET_H * SCALE) / fitSize.y : 0.01;
    model.scale.setScalar(fit);
    model.updateMatrixWorld(true);
    const box = new THREE.Box3().setFromObject(model);
    const center = box.getCenter(new THREE.Vector3());
    model.position.x -= center.x;
    model.position.z -= center.z;
    model.position.y -= box.min.y; // feet on group origin
    model.traverse((obj) => {
      if (!obj.isMesh) return;
      obj.castShadow = false;
      obj.receiveShadow = false;
      const mats = Array.isArray(obj.material) ? obj.material : [obj.material];
      mats.forEach((m) => {
        if (!m) return;
        // Mesh is mirrored (scale.x = -1); DoubleSide avoids vanishing faces.
        m.side = THREE.DoubleSide;
        if (m.map) m.map.colorSpace = THREE.SRGBColorSpace;
        m.needsUpdate = true;
      });
    });
    group.add(model);
    scene.add(group);

    mixer = new THREE.AnimationMixer(model);
    gltf.animations.forEach((clip) => { actions[clip.name] = mixer.clipAction(clip); });

    const pick = (name) => actions[name] || actions['Poro_idle1.anm'] || Object.values(actions)[0];
    const playAnim = (name) => {
      Object.values(actions).forEach((a) => a.fadeOut(0.3));
      const a = pick(name); if (!a) return;
      a.reset().fadeIn(0.3);
      if (['Death', 'HappyLick', 'Jump', 'Eat'].includes(name)) {
        a.setLoop(THREE.LoopOnce, 1);
        a.clampWhenFinished = true;
      } else {
        a.setLoop(THREE.LoopRepeat, Infinity);
      }
      a.play();
    };
    current = 'Poro_idle1.anm';
    playAnim(current);

    const raycaster = new THREE.Raycaster(), pointer = new THREE.Vector2();
    section.addEventListener('click', (e) => {
      const r = canvas.getBoundingClientRect();
      if (!r.width || !r.height) return;
      pointer.x = ((e.clientX - r.left) / r.width) * 2 - 1;
      pointer.y = -((e.clientY - r.top) / r.height) * 2 + 1;
      raycaster.setFromCamera(pointer, camera);
      if (group && raycaster.intersectObject(group, true).length && !reacting) {
        const anim = nextClick === 'idle3' ? 'Poro_idle3.anm' : 'Death';
        nextClick = nextClick === 'idle3' ? 'death' : 'idle3';
        reacting = true; override = anim; playAnim(anim); current = anim;
        setTimeout(() => { reacting = false; override = null; }, anim === 'Death' ? 4000 : 2500);
      }
    });

    const clock = new THREE.Clock();
    const loop = () => {
      raf = requestAnimationFrame(loop);
      if (!onScreen) return;
      const delta = Math.min(clock.getDelta(), 0.05);
      if (mixer) mixer.update(delta);
      if (group) {
        const vpH = 2 * Math.tan((camera.fov * Math.PI / 180) / 2) * camera.position.z;
        const vpW = vpH * (w() / h());
        const destX = (targetX * vpW) / 2;
        const dist = destX - posX, adist = Math.abs(dist);
        const desired = override ? override : adist > RUN_THRESH ? 'Run2' : 'Poro_idle1.anm';
        if (desired !== current) { current = desired; playAnim(desired); }
        const busy = override === 'Poro_idle3.anm' || override === 'Death';
        if (!busy) {
          const maxMove = SPEED * delta;
          if (adist <= maxMove) posX = destX;
          else posX += Math.sign(dist) * maxMove;
          if (adist > RUN_THRESH) {
            const ta = destX > posX ? Math.PI * 0.5 : -Math.PI * 0.5;
            facing += (ta - facing) * Math.min(delta * 8, 1);
          } else {
            facing += (Math.PI * 0.15 - facing) * Math.min(delta * 4, 1);
          }
        }
        group.position.x = posX;
        group.position.y = -1.62 * SCALE;
        group.rotation.y = facing;
      }
      renderer.render(scene, camera);
    };
    loop();

    new IntersectionObserver(([e]) => { onScreen = e.isIntersecting; }, { threshold: 0.05 }).observe(section);

    section.addEventListener('mousemove', (e) => {
      const r = section.getBoundingClientRect();
      const nx = ((e.clientX - r.left) / r.width) * 2 - 1;
      const ny = (e.clientY - r.top) / r.height;
      if (ny > 0.6 && !reacting) targetX = nx;
    });
    window.addEventListener('resize', () => {
      renderer.setSize(w(), h(), false);
      camera.aspect = w() / h();
      camera.updateProjectionMatrix();
    });
  }
})();

/* ======================================================================
   SOFT NAV — home ↔ /photos without unloading the notch Audio element.
   Full reloads pause music; this swaps the page chrome around the player.
   ====================================================================== */
(function () {
  const pathOf = (href) => {
    try { return new URL(href, location.origin).pathname.replace(/\/$/, '') || '/'; }
    catch (_) { return href; }
  };
  const isPhotos = (p) => p === '/photos' || p.endsWith('/photos.html');
  const isHome = (p) => p === '/' || p === '' || p === '/index.html';

  let view = isPhotos(pathOf(location.pathname)) ? 'photos' : (isHome(pathOf(location.pathname)) ? 'home' : null);
  if (!view) return;

  let photosHtml = null;
  let photosRoot = null;
  let homeHidden = [];
  let navigating = false;
  const HOME_TITLE = 'matthew h';
  const PHOTOS_TITLE = 'photos · matthew h';

  const isChrome = (el) =>
    el.classList?.contains('notch-wrap') ||
    el.id === 'palette' ||
    el.id === 'soft-photos-root';

  const prefetchPhotos = async () => {
    if (photosHtml) return photosHtml;
    try {
      const res = await fetch('/photos', { credentials: 'same-origin' });
      if (!res.ok) throw new Error('fetch photos failed');
      photosHtml = await res.text();
    } catch (_) { photosHtml = null; }
    return photosHtml;
  };

  const buildPhotosRoot = (html) => {
    const doc = new DOMParser().parseFromString(html, 'text/html');
    const root = document.createElement('div');
    root.id = 'soft-photos-root';
    const top = doc.querySelector('header.topbar');
    const main = doc.querySelector('main.photobook');
    const lb = doc.querySelector('#photo-lightbox');
    if (top) root.appendChild(document.importNode(top, true));
    if (main) root.appendChild(document.importNode(main, true));
    if (lb) root.appendChild(document.importNode(lb, true));
    return root;
  };

  const goPhotos = async ({ push = true } = {}) => {
    if (view === 'photos' || navigating) return;
    navigating = true;
    try {
      sessionStorage.setItem('portfolio-intro-done', '1');

      if (document.body.classList.contains('photos-page') && !photosRoot) {
        view = 'photos';
        if (push) history.pushState({ soft: 'photos' }, '', '/photos');
        return;
      }

      const html = await prefetchPhotos();
      if (!html) { location.href = '/photos'; return; }

      if (!photosRoot) {
        photosRoot = buildPhotosRoot(html);
        document.body.appendChild(photosRoot);
      }

      homeHidden = [];
      [...document.body.children].forEach((el) => {
        if (isChrome(el) || el === photosRoot) return;
        homeHidden.push([el, el.style.display]);
        el.style.display = 'none';
      });

      photosRoot.hidden = false;
      photosRoot.removeAttribute('aria-hidden');
      document.body.classList.add('photos-page');
      document.title = PHOTOS_TITLE;
      view = 'photos';
      if (push) history.pushState({ soft: 'photos' }, '', '/photos');
      window.initPhotobook?.();
      window.prefetchPhotobook?.();
      window.__applyThemeIcons?.();
      window.scrollTo(0, 0);
    } finally {
      navigating = false;
    }
  };

  const goHome = async ({ push = true } = {}) => {
    if (view === 'home' || navigating) return;
    navigating = true;
    try {
      sessionStorage.setItem('portfolio-intro-done', '1');

      // Soft return only if we still have the home DOM (came from home via soft-nav).
      if (!homeHidden.length) {
        location.href = '/';
        return;
      }

      if (photosRoot) {
        photosRoot.hidden = true;
        photosRoot.setAttribute('aria-hidden', 'true');
      }
      homeHidden.forEach(([el, display]) => { el.style.display = display; });
      homeHidden = [];
      document.body.classList.remove('photos-page');
      document.body.style.overflow = '';
      document.title = HOME_TITLE;
      view = 'home';
      if (push) history.pushState({ soft: 'home' }, '', '/');
      window.scrollTo(0, 0);
    } finally {
      navigating = false;
    }
  };

  document.addEventListener('click', (e) => {
    const a = e.target.closest?.('a[href]');
    if (!a || a.target === '_blank' || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    const path = pathOf(a.getAttribute('href'));
    if (isPhotos(path) && view === 'home') {
      e.preventDefault();
      goPhotos({ push: true });
    } else if (isHome(path) && view === 'photos') {
      e.preventDefault();
      goHome({ push: true });
    }
  });

  window.addEventListener('popstate', () => {
    const path = pathOf(location.pathname);
    if (isPhotos(path)) goPhotos({ push: false });
    else if (isHome(path)) goHome({ push: false });
  });

  const warmPhotos = () => {
    prefetchPhotos();
    window.prefetchPhotobook?.(8);
  };
  if (view === 'home' && 'requestIdleCallback' in window) {
    requestIdleCallback(warmPhotos, { timeout: 2500 });
  } else if (view === 'home') {
    setTimeout(warmPhotos, 1200);
  }

  document.addEventListener('pointerenter', (e) => {
    const a = e.target.closest?.('a[href]');
    if (!a) return;
    if (isPhotos(pathOf(a.getAttribute('href')))) window.prefetchPhotobook?.();
  }, true);
})();
