/* Photo roll — shared by /photos cold load and soft-nav from home. */
(function (global) {
  const SHOTS = [
    {
      src: '/photos/web/IMG_9795.jpg',
      caption: 'touching grass',
      alt: 'Tall grass and a quiet pond under a blue sky',
    },
    {
      src: '/photos/web/pink-sky.jpg',
      caption: 'pink sky',
      alt: 'Pink sky',
    },
    {
      src: '/photos/web/IMG_9404.jpg',
      caption: 'pse (e7) at night',
      alt: 'Looking down a dark atrium crossed by lit red staircases',
    },
    {
      src: '/photos/web/cat.jpg',
      caption: 'cat',
      alt: 'Cat',
    },
    {
      src: '/photos/web/harbour.jpg',
      caption: 'harbour',
      alt: 'Harbour',
    },
    {
      src: '/photos/web/cool-tree.jpg',
      caption: 'cool tree',
      alt: 'Cool tree',
    },
    {
      src: '/photos/web/daniel-caesar-fist-bump.jpg',
      caption: 'daniel caesar fist bump',
      alt: 'Fist bump with Daniel Caesar',
    },
    {
      src: '/photos/web/dc.jpg',
      caption: 'bro broke his ankle mid tour',
      alt: 'Daniel Caesar on stage with a bandaged ankle and crutch',
    },
    {
      src: '/photos/web/cursor-hackathon.jpg',
      caption: 'cursor hackathon',
      alt: 'Cursor hackathon',
    },
    {
      src: '/photos/web/IMG_9704.jpg',
      caption: 'dawg',
      alt: 'Hand petting a golden retriever on asphalt',
    },
    {
      src: '/photos/web/i-love-rayquaza.jpg',
      caption: 'i love rayquaza',
      alt: 'Rayquaza',
    },
    {
      src: '/photos/web/central.jpg',
      caption: 'central',
      alt: 'Central',
    },
    {
      src: '/photos/web/if-i-am-the-sky-you-are-the-sea.jpg',
      caption: 'if i am the sky you are the sea',
      alt: 'If I am the sky you are the sea',
    },
    {
      src: '/photos/web/IMG_9761.jpg',
      caption: 'forgot to tap off because of this',
      alt: 'GO Transit train at a platform at dusk',
    },
    {
      src: '/photos/web/danielcaesartookmyphone.jpg',
      caption: 'daniel caesar took my phone',
      alt: 'Daniel Caesar took my phone',
    },
    {
      src: '/photos/web/how-does-this-even-happen.jpg',
      caption: 'how does this even happen',
      alt: 'How does this even happen',
    },
    {
      src: '/photos/web/trees.jpg',
      caption: 'trees',
      alt: 'Trees',
    },
    {
      src: '/photos/web/getting-into-uw-cs-at-a-frisbee-tournament.jpg',
      caption: 'getting into uw cs at a frisbee tournament',
      alt: 'Getting into UW CS at a frisbee tournament',
    },
    {
      src: '/photos/web/IMG_9394.jpg',
      caption: 'first overnight at the loo',
      alt: 'Mirror selfie brushing teeth and flashing a peace sign',
    },
    {
      src: '/photos/web/ltn-at-summerhacks.jpg',
      caption: 'laser tag now',
      alt: 'laser tag now',
    },
    {
      src: '/photos/web/watermelon.jpg',
      caption: 'watermelon',
      alt: 'watermelon',
    },
  ];

  function initPhotobook() {
    const roll = document.getElementById('photo-roll');
    const lightbox = document.getElementById('photo-lightbox');
    const lbImg = document.getElementById('lightbox-img');
    const lbCap = document.getElementById('lightbox-cap');
    const btnPrev = document.getElementById('lightbox-prev');
    const btnNext = document.getElementById('lightbox-next');
    if (!roll || !lightbox || !lbImg || roll.dataset.ready === '1') return;
    roll.dataset.ready = '1';

    let active = -1;

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

    SHOTS.forEach((shot, i) => {
      const el = document.createElement('button');
      el.type = 'button';
      el.className = 'roll-item';
      el.style.setProperty('--delay', (40 + i * 40) + 'ms');
      el.setAttribute('aria-label', shot.caption || shot.alt || 'Open photo');
      el.innerHTML =
        `<img src="${shot.src}" alt="" loading="lazy" decoding="async" />` +
        `<figcaption>${shot.caption || ''}</figcaption>`;
      el.addEventListener('click', () => open(i));
      roll.appendChild(el);
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
