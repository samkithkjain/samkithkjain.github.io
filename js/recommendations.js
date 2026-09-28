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

// ---- Lightbox logic (Single image viewer, no navigation) ----
const lightbox   = document.getElementById('lightbox');
const lbImg      = document.getElementById('lbImg');
const lbCaption  = document.getElementById('lbCaption');
const lbClose    = document.getElementById('lbClose');
const lbBackdrop = document.getElementById('lbBackdrop');

const cards = Array.from(document.querySelectorAll('.rec-card'));
let lastFocusedElement = null;

function openLightbox(card) {
  const src     = card.dataset.src     || '';
  const name    = card.dataset.name    || '';
  const title   = card.dataset.title   || '';
  const caption = card.dataset.caption || '';

  lbImg.src = src;
  lbImg.alt = `LinkedIn recommendation from ${name}`;
  lbCaption.textContent = [name, title, caption].filter(Boolean).join(' · ');

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

// Open on card click
cards.forEach(card => {
  const activate = () => {
    lastFocusedElement = card;
    openLightbox(card);
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

// Keyboard
document.addEventListener('keydown', (e) => {
  if (!lightbox.classList.contains('open')) return;
  if (e.key === 'Escape') {
    e.preventDefault();
    closeLightbox();
  }
  if (e.key === 'Tab') {
    e.preventDefault();
    lbClose.focus();
  }
});
