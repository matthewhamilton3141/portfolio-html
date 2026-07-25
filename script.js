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
  const btn = $('#theme-toggle');
  const icon = $('#theme-icon');
  const moon = '<path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"/>';
  const sun = '<circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>';
  let dark = localStorage.getItem('theme') === 'dark';
  const apply = () => {
    document.documentElement.classList.toggle('dark', dark);
    icon.innerHTML = dark ? sun : moon;
  };
  apply();
  btn.addEventListener('click', () => {
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
  };

  card.addEventListener('mouseleave', hideTip);
  root.innerHTML = '<p class="gh-loading">loading contributions…</p>';

  fetch(`https://github-contributions-api.jogruber.de/v4/${GH_USER}?y=last`)
    .then((r) => {
      if (!r.ok) throw new Error('bad response');
      return r.json();
    })
    .then((data) => {
      const all = data.contributions || [];
      render(all.slice(-(WEEKS * 7)));
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

  const finishName = () => {
    line1.textContent = fullName.slice(0, 7);
    line2.textContent = fullName.slice(7).trim();
    if (cursor) { cursor.style.display = 'none'; line2.appendChild(cursor); }
    nameWrap?.classList.add('interactive');
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
        setTimeout(() => $('#about-bio')?.classList.add('show'), 200);
        markIntroDone();
      }
    };
    setTimeout(typeNext, 300);
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
  const section = $('#landing');
  const target = $('#right-fade');
  let ticking = false;
  const update = () => {
    ticking = false;
    const rect = section.getBoundingClientRect();
    const scrolled = Math.max(0, -rect.top);
    const progress = Math.min(scrolled / (rect.height * 0.75), 1);
    target.style.opacity = `${1 - progress}`;
    target.style.pointerEvents = progress > 0.85 ? 'none' : '';
  };
  window.addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(update); } }, { passive: true });
  update();
})();

/* ======================================================================
   LIVE PHOTO — hover to play preview video  (live-photo.tsx)
   ====================================================================== */
function initLivePhoto(el) {
  const videoSrc = el.dataset.video, webm = el.dataset.webm;
  let video = null;
  const ensureVideo = () => {
    if (video || !videoSrc) return;
    video = document.createElement('video');
    video.loop = true; video.muted = true; video.playsInline = true; video.preload = 'auto'; video.crossOrigin = 'anonymous';
    if (webm) { const s = document.createElement('source'); s.src = webm; s.type = 'video/webm'; video.appendChild(s); }
    const s2 = document.createElement('source'); s2.src = videoSrc; s2.type = 'video/mp4'; video.appendChild(s2);
    el.insertBefore(video, el.firstChild);
  };
  const activate = () => { ensureVideo(); el.classList.add('active'); if (video) video.play().catch(() => {}); };
  const deactivate = () => { el.classList.remove('active'); if (video) { video.pause(); video.currentTime = 0; } };
  el.addEventListener('pointerenter', (e) => { if (e.pointerType === 'mouse') activate(); });
  el.addEventListener('pointerleave', (e) => { if (e.pointerType === 'mouse') deactivate(); });
  el.addEventListener('pointerup', (e) => { if (e.pointerType !== 'mouse') el.classList.contains('active') ? deactivate() : activate(); });
}
$$('.livephoto').forEach(initLivePhoto);

/* ======================================================================
   PROJECTS — list / grid render + floating hover preview
   ====================================================================== */
(function () {
  const R2 = 'https://pub-642075d77d2b430c93bf3b1c60299af0.r2.dev/';
  const projects = [
    { category: 'currently building', title: 'gsplat-rt',
      description: "Real-time pipeline converting a live video stream into 3D Gaussian Splats plus a physics-ready collision mesh, exported as an OpenUSD stage for Isaac Sim / Omniverse. A multi-threaded, queue-decoupled architecture runs a strongly-typed FP16 TensorRT depth engine (Depth Anything V2, 2.24×), a custom CUDA TSDF fusion kernel (175× over numpy, bit-for-bit verified), and a learned SuperPoint + LightGlue SLAM front-end (3.5 cm ATE). Benchmarked at 82.7 FPS on an A10G — 2.75× the 30 FPS real-time budget — so an RL robot can see and physically interact with a scene as it's captured.",
      link: 'https://github.com/matthewhamilton3141/gsplat-rt', thumb: 'images/reconstruction_desk.webp',
      video: R2 + 'reconstruction_turntable.mp4', zoom: 1.2 },
    { category: 'personal project', title: 'Retermina',
      description: 'A customizable terminal workspace built on Tauri v2 with a Rust backend driving native PTY shells — fully local, with no cloud, token limits, or subscription. Seven draggable panels (split terminals, syntax-highlighted code, explorer, live project-wide git diff, localhost tracker, native preview window, and an embedded Claude Code CLI with per-project token tracking) arrange freely on a react-grid-layout grid. Five structural theme engines and portable Loom presets re-skin the whole app instantly.',
      link: 'https://github.com/matthewhamilton3141/Retermina', liveUrl: 'https://retermina.com/',
      thumb: 'images/reterminapreview.webp', video: R2 + 'Retermina%20Promo%20(2).mp4', zoom: 1.0 },
    { category: 'personal project', title: 'Sketchstack',
      description: 'Sketchstack is a full-stack web app that turns visual system-design diagrams into structured prompts for AI coding agents like Claude Code and Cursor. Built with Next.js, TypeScript, and React Flow, with Supabase (Postgres, GitHub OAuth, row-level security) powering authentication, cloud save, and shareable links.',
      link: 'https://github.com/matthewhamilton3141/sketchstack', liveUrl: 'https://sketchstack.vercel.app',
      thumb: 'images/sketchstack.webp' },
    { category: 'personal project', title: 'Iris-NL',
      description: 'Building an open-source TypeScript library that turns plain English into shell commands for terminal tools. Provider-agnostic backend (NVIDIA NIM / local Ollama / TensorRT-LLM) with a built-in safety layer and test suite. Designed to plug into my Retermina terminal app, with a benchmarking harness already in place to measure and optimize a local TensorRT-LLM model on consumer GPU hardware.',
      link: 'https://github.com/matthewhamilton3141/iris-nl', thumb: 'images/iris-nl.webp',
      video: R2 + 'iris-nl.mp4', objectPosition: 'left' },
    { category: 'hackathon project', title: 'baam',
      description: 'BAAM goes where you go, a social betting platform for your personal circle linking Solana smart contracts, MongoDB Atlas for data management, and Vultr for backend infrastructure to provide a native iMessage plugin, Discord bot, and a centralized web app.',
      link: 'https://github.com/BansonVuong/BAAM', thumb: 'images/baampreview1.webp',
      video: R2 + 'baamimsg.mp4', webm: R2 + 'baamimsg.webm', logo: 'images/jamhackslogo.png',
      logoLink: 'https://jamhacks.ca', startTime: 2.23 },
    { category: 'personal projects', title: 'portfolio',
      description: 'Utilizes React and TypeScript to create a complex, stacked event architecture to create a high-fidelity UI. Leverages Cloudflare R2 Object Storage for efficient asset delivery and is deployed through Vercel to ensure rapid, globally distributed performance. Real-time state management, cloud infrastructure integration for a smooth, responsive user experience.',
      link: 'https://github.com/matthewhamilton3141/portfolio', thumb: 'images/casestudy1.webp',
      video: R2 + 'portfolio.mp4', webm: R2 + 'portfolio.webm' },
  ];

  const listView = $('#list-view');
  const gridView = $('#grid-view');
  const hp = $('#hover-preview');
  let hovered = null, mouse = { x: 0, y: 0 };

  const icGithub = `<svg class="proj-ic" viewBox="0 0 24 24" aria-hidden="true"><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"/></svg>`;
  const icLink = `<svg class="proj-ic" viewBox="0 0 24 24" aria-hidden="true"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>`;
  const linksHTML = (p) => `
    ${p.link ? `<a class="proj-link" href="${p.link}" target="_blank" rel="noopener noreferrer">${icGithub}<span>github repo</span></a>` : ''}
    ${p.liveUrl ? `<a class="proj-link try" href="${p.liveUrl}" target="_blank" rel="noopener noreferrer">${icLink}<span>try</span></a>` : ''}`;

  // ---- list ----
  projects.forEach((p, idx) => {
    const row = document.createElement('div');
    row.className = 'list-row';
    row.innerHTML = `
      <div>
        <span class="cat">${p.category || 'In Development'}</span>
        <div class="title-line">
          <h3>${p.title}</h3>
          ${p.logo ? `<a href="${p.logoLink}" target="_blank" rel="noopener noreferrer" title="View Hackathon"><img class="badge" src="${p.logo}" alt="Hackathon Logo"/></a>` : ''}
        </div>
        <p class="desc">${p.description}</p>
      </div>
      <div class="links">${linksHTML(p)}</div>`;
    row.addEventListener('mouseenter', (e) => { hovered = idx; mouse = { x: e.clientX, y: e.clientY }; showPreview(); });
    row.addEventListener('mouseleave', () => { hovered = null; hp.style.display = 'none'; hp.innerHTML = ''; });
    listView.appendChild(row);
  });
  listView.addEventListener('mousemove', (e) => {
    if (hovered === null) return;
    mouse = { x: e.clientX, y: e.clientY };
    positionPreview();
  });

  function showPreview() {
    if (hovered === null || window.innerWidth < 1024) return;
    const p = projects[hovered];
    hp.innerHTML = '';
    if (p.video) {
      const v = document.createElement('video');
      v.autoplay = true; v.muted = true; v.loop = true; v.playsInline = true; v.crossOrigin = 'anonymous';
      v.style.objectPosition = p.objectPosition || 'center';
      if (p.webm) { const s = document.createElement('source'); s.src = p.webm; s.type = 'video/webm'; v.appendChild(s); }
      const s2 = document.createElement('source'); s2.src = p.video; s2.type = 'video/mp4'; v.appendChild(s2);
      if (p.startTime) v.addEventListener('loadedmetadata', () => { v.currentTime = p.startTime; }, { once: true });
      hp.appendChild(v);
    } else {
      const img = document.createElement('img'); img.src = p.thumb; hp.appendChild(img);
    }
    hp.style.display = 'block';
    positionPreview();
  }
  function positionPreview() {
    hp.style.left = mouse.x + 20 + 'px';
    hp.style.top = mouse.y - 120 + 'px';
  }

  // ---- grid ----
  projects.forEach((p) => {
    const card = document.createElement('div');
    card.className = 'grid-card';
    const thumb = document.createElement('div');
    thumb.className = 'grid-thumb';
    const lp = document.createElement('div');
    lp.className = 'livephoto' + (p.video ? ' has-video' : '');
    lp.dataset.video = p.video || '';
    if (p.webm) lp.dataset.webm = p.webm;
    lp.style.borderRadius = '12px';
    const im = document.createElement('img'); im.className = 'lp-thumb'; im.src = p.thumb; im.alt = p.title;
    im.loading = 'lazy'; im.decoding = 'async';
    if (p.zoom && p.zoom !== 1) im.style.transform = `scale(${p.zoom})`;
    im.style.objectPosition = p.objectPosition || 'center';
    lp.appendChild(im);
    thumb.appendChild(lp);
    if (p.startTime) lp.dataset.startTime = p.startTime;
    initLivePhoto(lp);
    card.appendChild(thumb);
    const details = document.createElement('div');
    details.className = 'grid-details';
    details.innerHTML = `
      <p class="cat">${p.category || 'In Development'}</p>
      <div class="title-line">
        <h3>${p.title}</h3>
        ${p.logo ? `<a href="${p.logoLink}" target="_blank" rel="noopener noreferrer" title="View Hackathon"><img class="badge" src="${p.logo}" alt="Hackathon Badge" style="width:18px;height:18px"/></a>` : ''}
      </div>
      <p class="desc">${p.description}</p>
      <div class="links">${linksHTML(p)}</div>`;
    card.appendChild(details);
    gridView.appendChild(card);
  });

  // ---- view switch ----
  $$('.view-switch button').forEach((btn) => {
    btn.addEventListener('click', () => {
      $$('.view-switch button').forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');
      const grid = btn.dataset.view === 'grid';
      gridView.style.display = grid ? 'grid' : 'none';
      listView.style.display = grid ? 'none' : 'flex';
      if (grid) { hovered = null; hp.style.display = 'none'; }
    });
  });
})();

/* ======================================================================
   NOTCH MEDIA PLAYER — notch-media-player.tsx
   ====================================================================== */
(function () {
  const R2 = 'https://pub-ce086066003e4e1cad2011087e85618b.r2.dev/';
  const TRACKS = [
    { title: 'who knows', artist: 'daniel caesar', src: R2 + 'whoknows.mp3', cover: 'images/sonofspergy.jpg', wave: 'linear-gradient(to top, #800020, #c60032ff)' },
    { title: 'japanese denim', artist: 'daniel caesar', src: R2 + 'japanesedenim.mp3', cover: 'images/japanesedenim.jpg', wave: 'linear-gradient(to top, #e2e2e2ff, #a5a5a5ff)' },
    { title: 'nights', artist: 'frank ocean', src: R2 + 'nights.mp3', cover: 'images/blond.jpg', wave: 'linear-gradient(to top, #22C55E, #e4e4e4ff)' },
    { title: 'seigfried', artist: 'frank ocean', src: R2 + 'seigfried.mp3', cover: 'images/blond.jpg', wave: 'linear-gradient(to top, #22C55E, #e4e4e4ff)' },
    { title: 'rearrange my world', artist: 'daniel caesar (ft. rex orange county)', src: R2 + 'rearrangemyworld.mp3', cover: 'images/rearrange.jpeg', wave: '#b7b7b7ff' },
    { title: 'ochos rios', artist: 'daniel caesar', src: R2 + 'ochosrios.mp3', cover: 'images/neverenough.jpg', wave: '#4169E1' },
    { title: 'clarity', artist: 'zedd (ft. foxes)', src: R2 + 'clarity.mp3', cover: 'images/clarity.jpg', wave: 'linear-gradient(to top, #3B82F6, #22C55E)' },
    { title: 'whiplash', artist: 'aespa', src: R2 + 'whiplash.mp3', cover: 'images/whiplash.jpg', wave: '#FFFFFF' },
    { title: 'slow dancing in the dark', artist: 'joji', src: R2 + 'slowdancinginthedark.mp3', cover: 'images/ballads1.jpeg', wave: 'linear-gradient(to top, #CDB0AE, #CEC0C0)' },
    { title: 'cyanide', artist: 'daniel caesar', src: R2 + 'cyanide.mp3', cover: 'images/casestudy.jpeg', wave: 'linear-gradient(to top, #7aadffb9, #b7b7b7ff)' },
  ];
  const BAR_COUNT = 9;
  const notch = $('#notch');
  const audio = new Audio(); audio.crossOrigin = 'anonymous'; audio.preload = 'metadata';
  let idx = 0, playing = false, muted = false, expanded = true, skip = false;
  let ctx = null, analyser = null, raf = null, inactivity = null;

  // build viz bars
  const viz = $('#viz'); const bars = [];
  for (let i = 0; i < BAR_COUNT; i++) { const b = document.createElement('div'); b.className = 'viz-bar'; viz.appendChild(b); bars.push(b); }

  const playIcon = '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>';
  const pauseIcon = '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M6 5h4v14H6zM14 5h4v14h-4z"/></svg>';
  const volIcon = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07M19.07 4.93a10 10 0 0 1 0 14.14"/></svg>';
  const muteIcon = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><line x1="23" y1="9" x2="17" y2="15"/><line x1="17" y1="9" x2="23" y2="15"/></svg>';

  const fmt = (t) => { if (!isFinite(t)) return '0:00'; const m = Math.floor(t / 60), s = Math.floor(t % 60); return `${m}:${s < 10 ? '0' : ''}${s}`; };

  function renderTrack() {
    const t = TRACKS[idx];
    $('#art-cover').src = t.cover; $('#compact-cover').src = t.cover; $('#idle-cover').src = t.cover;
    $('#track-title').textContent = t.title; $('#track-artist').textContent = t.artist; $('#compact-title').textContent = t.title;
    $('#art-glow').style.background = t.wave.includes('linear-gradient') ? t.wave : `radial-gradient(circle, ${t.wave} 0%, transparent 70%)`;
    bars.forEach((b) => { b.style.background = t.wave; });
    setupMarquees();
  }

  function renderState() {
    notch.classList.toggle('expanded', expanded);
    notch.classList.toggle('playing', playing && !expanded);
    $('#compact-playing').style.display = playing ? 'flex' : 'none';
    $('#viz').style.display = playing ? 'flex' : 'none';
    $('#compact-idle').style.display = playing ? 'none' : 'flex';
    $('#btn-play').innerHTML = playing ? pauseIcon : playIcon;
    $('#btn-mute').innerHTML = muted ? muteIcon : volIcon;
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
        bars.forEach((b, i) => { const di = Math.floor((i / BAR_COUNT) * (len * 0.55)); b.style.transform = `scaleY(${Math.max(0.15, (data[di] || 0) / 255)})`; });
      } else bars.forEach((b) => { b.style.transform = 'scaleY(0.15)'; });
    };
    if (raf) cancelAnimationFrame(raf); draw();
  }

  function setSrc(load) {
    audio.src = TRACKS[idx].src; if (load) audio.load();
  }
  function play() { audio.play().then(() => { playing = true; initCtx(); renderState(); }).catch(() => { playing = false; renderState(); }); }
  function pause() { audio.pause(); playing = false; renderState(); }

  audio.addEventListener('loadedmetadata', () => { $('#dur-time').textContent = fmt(audio.duration); $('#seek').max = audio.duration || 100; });
  audio.addEventListener('timeupdate', () => { $('#cur-time').textContent = fmt(audio.currentTime); $('#seek').value = audio.currentTime; });
  audio.addEventListener('ended', () => next());

  function next() { skip = true; idx = (idx + 1) % TRACKS.length; changeTrack(); }
  function prev() { skip = true; idx = (idx - 1 + TRACKS.length) % TRACKS.length; changeTrack(); }
  function changeTrack() {
    const wasPlaying = playing || skip; skip = false;
    setSrc(true); renderTrack();
    if (wasPlaying) play(); else { audio.currentTime = 0; renderState(); }
  }

  $('#btn-play').addEventListener('click', (e) => { e.stopPropagation(); playing ? pause() : play(); resetTimer(); });
  $('#btn-mute').addEventListener('click', (e) => { e.stopPropagation(); muted = !muted; audio.muted = muted; renderState(); resetTimer(); });
  $('#btn-next').addEventListener('click', (e) => { e.stopPropagation(); next(); resetTimer(); });
  $('#btn-prev').addEventListener('click', (e) => { e.stopPropagation(); prev(); resetTimer(); });
  $('#seek').addEventListener('input', (e) => { audio.currentTime = parseFloat(e.target.value); resetTimer(); });
  $('#seek').addEventListener('click', (e) => e.stopPropagation());

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

  // marquee: duplicate text + animate only when overflowing
  function setupMarquees() {
    $$('.marquee-box').forEach((box) => {
      const track = box.querySelector('.track');
      const span = track.querySelector('span');
      track.classList.remove('overflow');
      track.querySelectorAll('span[aria-hidden]').forEach((s) => s.remove());
      requestAnimationFrame(() => {
        if (span.offsetWidth > box.offsetWidth) {
          track.classList.add('overflow', 'animate-marquee');
          const clone = span.cloneNode(true); clone.setAttribute('aria-hidden', 'true'); track.appendChild(clone);
        } else {
          track.classList.remove('animate-marquee');
        }
      });
    });
  }

  setSrc(false); renderTrack(); renderState();
  // auto-collapse after 2s like the original
  setTimeout(() => { expanded = false; renderState(); }, 2000);
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
    const TARGET_H = 0.38; // world units — small bottom mascot (1.2 was huge)
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
