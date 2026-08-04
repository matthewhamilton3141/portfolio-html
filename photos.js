/* Photobook polaroid board — shared by /photos cold load and soft-nav from home. */
(function (global) {
  const SHOTS = [
    {
      src: '/photos/web/IMG_9795.jpg',
      caption: 'touching grass',
      alt: 'Tall grass and a quiet pond under a blue sky',
      size: 'xl', x: 2, y: 1, rot: -5, z: 3,
    },
    {
      src: '/photos/web/pink-sky.jpg',
      caption: 'pink sky',
      alt: 'Pink sky',
      size: 'md', x: 42, y: 2, rot: 6, z: 2,
    },
    {
      src: '/photos/web/IMG_9404.jpg',
      caption: 'pse (e7) at night',
      alt: 'Looking down a dark atrium crossed by lit red staircases',
      size: 'md', x: 68, y: 0, rot: 8, z: 4,
    },
    {
      src: '/photos/web/cat.jpg',
      caption: 'cat',
      alt: 'Cat',
      size: 'md', x: 36, y: 14, rot: -9, z: 6,
    },
    {
      src: '/photos/web/harbour.jpg',
      caption: 'harbour',
      alt: 'Harbour',
      size: 'lg', x: 58, y: 16, rot: -3, z: 5,
    },
    {
      src: '/photos/web/cool-tree.jpg',
      caption: 'cool tree',
      alt: 'Cool tree',
      size: 'md', x: 4, y: 28, rot: 4, z: 3,
    },
    {
      src: '/photos/web/daniel-caesar-fist-bump.jpg',
      caption: 'daniel caesar fist bump',
      alt: 'Fist bump with Daniel Caesar',
      size: 'md', x: 38, y: 30, rot: 11, z: 7,
    },
    {
      src: '/photos/web/dc.jpg',
      caption: 'bro broke his ankle mid tour',
      alt: 'Daniel Caesar on stage with a bandaged ankle and crutch',
      size: 'md', x: 84, y: 40, rot: -9, z: 5,
    },
    {
      src: '/photos/web/cursor-hackathon.jpg',
      caption: 'cursor hackathon',
      alt: 'Cursor hackathon',
      size: 'xl', x: 52, y: 34, rot: -6, z: 4,
    },
    {
      src: '/photos/web/IMG_9704.jpg',
      caption: 'dawg',
      alt: 'Hand petting a golden retriever on asphalt',
      size: 'lg', x: 8, y: 46, rot: -4, z: 5,
    },
    {
      src: '/photos/web/i-love-rayquaza.jpg',
      caption: 'i love rayquaza',
      alt: 'Rayquaza',
      size: 'md', x: 42, y: 50, rot: 5, z: 6,
    },
    {
      src: '/photos/web/central.jpg',
      caption: 'central',
      alt: 'Central',
      size: 'md', x: 72, y: 52, rot: -8, z: 3,
    },
    {
      src: '/photos/web/if-i-am-the-sky-you-are-the-sea.jpg',
      caption: 'if i am the sky you are the sea',
      alt: 'If I am the sky you are the sea',
      size: 'lg', x: 58, y: 62, rot: 3, z: 5,
    },
    {
      src: '/photos/web/IMG_9761.jpg',
      caption: 'forgot to tap off because of this',
      alt: 'GO Transit train at a platform at dusk',
      size: 'md', x: 28, y: 64, rot: 10, z: 4,
    },
    {
      src: '/photos/web/danielcaesartookmyphone.jpg',
      caption: 'daniel caesar took my phone',
      alt: 'Daniel Caesar took my phone',
      size: 'md', x: 4, y: 68, rot: -7, z: 6,
    },
    {
      src: '/photos/web/how-does-this-even-happen.jpg',
      caption: 'how does this even happen',
      alt: 'How does this even happen',
      size: 'md', x: 36, y: 76, rot: -2, z: 3,
    },
    {
      src: '/photos/web/trees.jpg',
      caption: 'trees',
      alt: 'Trees',
      size: 'xl', x: 62, y: 78, rot: 5, z: 4,
    },
    {
      src: '/photos/web/getting-into-uw-cs-at-a-frisbee-tournament.jpg',
      caption: 'getting into uw cs at a frisbee tournament',
      alt: 'Getting into UW CS at a frisbee tournament',
      size: 'lg', x: 6, y: 86, rot: 6, z: 5,
    },
    {
      src: '/photos/web/IMG_9394.jpg',
      caption: 'first overnight at the loo',
      alt: 'Mirror selfie brushing teeth and flashing a peace sign',
      size: 'md', x: 48, y: 90, rot: -6, z: 7,
    },
  ];

  function initPhotobook() {
    const board = document.getElementById('polaroid-board');
    const lightbox = document.getElementById('photo-lightbox');
    const lbImg = document.getElementById('lightbox-img');
    const lbCap = document.getElementById('lightbox-cap');
    const btnPrev = document.getElementById('lightbox-prev');
    const btnNext = document.getElementById('lightbox-next');
    if (!board || !lightbox || !lbImg || board.dataset.ready === '1') return;
    board.dataset.ready = '1';

    const deskMq = window.matchMedia('(min-width: 901px)');
    const DRAG_THRESHOLD = 6;
    let active = -1;
    let hoverBoost = null;
    let topZ = SHOTS.reduce((m, s, i) => Math.max(m, s.z ?? i + 1), 1);

    const showShot = (i) => {
      active = (i + SHOTS.length) % SHOTS.length;
      const shot = SHOTS[active];
      lbImg.classList.remove('swap');
      void lbImg.offsetWidth;
      lbImg.src = shot.src;
      lbImg.alt = shot.alt || '';
      lbCap.textContent = shot.caption || '';
      lbImg.classList.add('swap');
    };

    const open = (i) => {
      showShot(i);
      lightbox.hidden = false;
      document.body.style.overflow = 'hidden';
      requestAnimationFrame(() => lightbox.classList.add('open'));
    };
    const close = () => {
      lightbox.classList.remove('open');
      document.body.style.overflow = '';
      active = -1;
      setTimeout(() => {
        if (!lightbox.classList.contains('open')) {
          lightbox.hidden = true;
          lbImg.removeAttribute('src');
        }
      }, 220);
    };
    const prev = () => { if (active >= 0) showShot(active - 1); };
    const next = () => { if (active >= 0) showShot(active + 1); };

    const readPct = (el, prop, fallback = 0) => {
      const raw = el.style.getPropertyValue(prop);
      const n = parseFloat(raw);
      return Number.isFinite(n) ? n : fallback;
    };

    const clampPos = (el, x, y) => {
      const bw = board.clientWidth || 1;
      const bh = board.clientHeight || 1;
      const maxX = Math.max(0, 100 - (el.offsetWidth / bw) * 100);
      const maxY = Math.max(0, 100 - (el.offsetHeight / bh) * 100);
      return {
        x: Math.min(maxX, Math.max(0, x)),
        y: Math.min(maxY, Math.max(0, y)),
      };
    };

    const place = (el, x, y, rot, z) => {
      const p = clampPos(el, x, y);
      el.style.setProperty('--x', p.x + '%');
      el.style.setProperty('--y', p.y + '%');
      if (rot != null) el.style.setProperty('--rot', rot + 'deg');
      if (z != null) el.style.setProperty('--z', String(z));
    };

    const rand = (min, max) => min + Math.random() * (max - min);

    const enableDesk = () => deskMq.matches;

    const bindDrag = (el, index) => {
      let pointerId = null;
      let startClientX = 0;
      let startClientY = 0;
      let startX = 0;
      let startY = 0;
      let dragging = false;
      let moved = false;

      const onMove = (e) => {
        if (pointerId == null || e.pointerId !== pointerId) return;
        const dx = e.clientX - startClientX;
        const dy = e.clientY - startClientY;
        if (!dragging) {
          if (Math.hypot(dx, dy) < DRAG_THRESHOLD) return;
          dragging = true;
          moved = true;
          el.classList.add('dragging');
          el.classList.add('lifted');
          topZ += 1;
          el.style.setProperty('--z', String(topZ));
          try { el.setPointerCapture(pointerId); } catch (_) { /* ignore */ }
        }
        e.preventDefault();
        const bw = board.clientWidth || 1;
        const bh = board.clientHeight || 1;
        place(el, startX + (dx / bw) * 100, startY + (dy / bh) * 100);
      };

      const onUp = (e) => {
        if (pointerId == null || e.pointerId !== pointerId) return;
        const wasMoved = moved;
        pointerId = null;
        dragging = false;
        el.classList.remove('dragging');
        window.removeEventListener('pointermove', onMove);
        window.removeEventListener('pointerup', onUp);
        window.removeEventListener('pointercancel', onUp);
        if (!wasMoved) open(index);
        else {
          // Slight settle tilt when dropped.
          const rot = readPct(el, '--rot');
          const settle = Math.max(-14, Math.min(14, rot + rand(-2.5, 2.5)));
          el.style.setProperty('--rot', settle + 'deg');
        }
        moved = false;
      };

      el.addEventListener('pointerdown', (e) => {
        if (!enableDesk()) return;
        if (e.button != null && e.button !== 0) return;
        if (e.target.closest('a')) return;
        pointerId = e.pointerId;
        startClientX = e.clientX;
        startClientY = e.clientY;
        startX = readPct(el, '--x');
        startY = readPct(el, '--y');
        dragging = false;
        moved = false;
        window.addEventListener('pointermove', onMove, { passive: false });
        window.addEventListener('pointerup', onUp);
        window.addEventListener('pointercancel', onUp);
      });
    };

    SHOTS.forEach((shot, i) => {
      const el = document.createElement('button');
      el.type = 'button';
      el.className = `polaroid polaroid-${shot.size}`;
      el.style.setProperty('--x', shot.x + '%');
      el.style.setProperty('--y', shot.y + '%');
      el.style.setProperty('--rot', shot.rot + 'deg');
      el.style.setProperty('--z', String(shot.z ?? i + 1));
      el.style.setProperty('--delay', (80 + i * 70) + 'ms');
      el.setAttribute('aria-label', shot.caption || shot.alt || 'Open photo');
      el.innerHTML =
        `<span class="polaroid-frame">` +
          `<img src="${shot.src}" alt="" loading="lazy" decoding="async" draggable="false" />` +
        `</span>` +
        `<span class="polaroid-cap">${shot.caption || ''}</span>`;
      el.addEventListener('pointerenter', () => {
        if (el.classList.contains('dragging')) return;
        if (hoverBoost && hoverBoost !== el) hoverBoost.classList.remove('lifted');
        hoverBoost = el;
        el.classList.add('lifted');
      });
      el.addEventListener('pointerleave', () => {
        if (el.classList.contains('dragging')) return;
        el.classList.remove('lifted');
        if (hoverBoost === el) hoverBoost = null;
      });
      el.addEventListener('focus', () => el.classList.add('lifted'));
      el.addEventListener('blur', () => el.classList.remove('lifted'));
      // Mobile: click opens. Desktop pointer path opens via pointerup (drag vs click).
      // detail === 0 is a keyboard-activated click — still open on desk.
      el.addEventListener('click', (e) => {
        if (enableDesk() && e.detail !== 0) {
          e.preventDefault();
          return;
        }
        open(i);
      });
      bindDrag(el, i);
      board.appendChild(el);
      requestAnimationFrame(() => requestAnimationFrame(() => el.classList.add('show')));
    });

    btnPrev?.addEventListener('click', (e) => { e.stopPropagation(); prev(); });
    btnNext?.addEventListener('click', (e) => { e.stopPropagation(); next(); });
    lightbox.addEventListener('click', (e) => {
      if (e.target === lightbox || e.target.classList.contains('photo-lightbox-close')) close();
    });
    document.addEventListener('keydown', (e) => {
      if (lightbox.hidden) return;
      if (e.key === 'Escape') close();
      else if (e.key === 'ArrowLeft') { e.preventDefault(); prev(); }
      else if (e.key === 'ArrowRight') { e.preventDefault(); next(); }
    });

    lbImg.addEventListener('load', () => {
      if (active < 0) return;
      [active - 1, active + 1].forEach((i) => {
        const img = new Image();
        img.src = SHOTS[(i + SHOTS.length) % SHOTS.length].src;
      });
    });
  }

  global.initPhotobook = initPhotobook;
  if (document.body?.classList.contains('photos-page')) {
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initPhotobook);
    else initPhotobook();
  }
})(typeof window !== 'undefined' ? window : globalThis);
