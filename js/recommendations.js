/* =========================================
   RECOMMENDATIONS — LIGHTBOX + CARDS
   ========================================= */

// ---- Build avatar initials from data-name ----
document.querySelectorAll('.rec-card').forEach(card => {
  const name = card.dataset.name || '';
  const avatar = card.querySelector('.rec-avatar');
  if (avatar && name) {
    const parts = name.trim().split(' ');
    const initials = parts.length >= 2
      ? parts[0][0] + parts[parts.length - 1][0]
      : parts[0].slice(0, 2);
    avatar.textContent = initials.toUpperCase();
  }
});

// ---- Lightbox logic ----
const lightbox   = document.getElementById('lightbox');
const lbImg      = document.getElementById('lbImg');
const lbCaption  = document.getElementById('lbCaption');
const lbClose    = document.getElementById('lbClose');
const lbPrev     = document.getElementById('lbPrev');
const lbNext     = document.getElementById('lbNext');
const lbBackdrop = document.getElementById('lbBackdrop');

// Collect all cards that have a real image src
const cards = Array.from(document.querySelectorAll('.rec-card'));
let current  = 0;
let lastFocusedElement = null;

function openLightbox(index) {
  current = index;
  const card = cards[index];
  const src  = card.dataset.src  || '';
  const name = card.dataset.name || '';
  const title = card.dataset.title || '';
  const caption = card.dataset.caption || '';

  lbImg.src = src;
  lbImg.alt = `LinkedIn recommendation from ${name}`;
  lbCaption.textContent = [name, title, caption].filter(Boolean).join(' · ');

  lbPrev.disabled = index === 0;
  lbNext.disabled = index === cards.length - 1;

  lightbox.classList.add('open');
  lightbox.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';
  lbClose.focus();
}

function closeLightbox() {
  lightbox.classList.remove('open');
  lightbox.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = '';
  setTimeout(() => { lbImg.src = ''; }, 300);
  if (lastFocusedElement) lastFocusedElement.focus();
}

function navigate(dir) {
  const next = current + dir;
  if (next >= 0 && next < cards.length) openLightbox(next);
}

// Open on card click
cards.forEach((card, i) => {
  const activate = () => {
    lastFocusedElement = card;
    openLightbox(i);
  };
  card.addEventListener('click', activate);
  card.addEventListener('keydown', (event) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      activate();
    }
  });
});

// Controls
lbClose.addEventListener('click', closeLightbox);
lbBackdrop.addEventListener('click', closeLightbox);
lbPrev.addEventListener('click', (e) => { e.stopPropagation(); navigate(-1); });
lbNext.addEventListener('click', (e) => { e.stopPropagation(); navigate(+1); });

// Keyboard
document.addEventListener('keydown', (e) => {
  if (!lightbox.classList.contains('open')) return;
  if (e.key === 'Escape') {
    e.preventDefault();
    closeLightbox();
  }
  if (e.key === 'ArrowLeft')   navigate(-1);
  if (e.key === 'ArrowRight')  navigate(+1);
  if (e.key === 'Tab') {
    const focusable = [lbClose, lbPrev, lbNext].filter(control => !control.disabled);
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  }
});

// Touch swipe support
let touchStartX = 0;
lightbox.addEventListener('touchstart', (e) => { touchStartX = e.touches[0].clientX; }, { passive: true });
lightbox.addEventListener('touchend',   (e) => {
  const dx = e.changedTouches[0].clientX - touchStartX;
  if (Math.abs(dx) > 50) navigate(dx < 0 ? 1 : -1);
});
