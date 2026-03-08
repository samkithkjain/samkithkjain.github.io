/* =========================================
   SHARED NAV + UTILITY SCRIPTS
   ========================================= */

// ---- Set footer year ----
const yearEl = document.getElementById('year');
if (yearEl) yearEl.textContent = new Date().getFullYear();

// ---- Navbar scroll effect ----
const navbar = document.getElementById('navbar');
if (navbar) {
  // Pages without hero get solid nav always
  if (navbar.classList.contains('solid')) {
    // already solid
  } else {
    window.addEventListener('scroll', () => {
      navbar.classList.toggle('scrolled', window.scrollY > 40);
    });
  }
}

// ---- Hamburger ----
const hamburger = document.getElementById('hamburger');
const navLinks  = document.querySelector('.nav-links');
if (hamburger && navLinks) {
  hamburger.addEventListener('click', () => {
    navLinks.classList.toggle('open');
    const spans = hamburger.querySelectorAll('span');
    const isOpen = navLinks.classList.contains('open');
    spans[0].style.transform = isOpen ? 'rotate(45deg) translate(5px, 5.5px)' : '';
    spans[1].style.opacity   = isOpen ? '0' : '1';
    spans[2].style.transform = isOpen ? 'rotate(-45deg) translate(5px, -5.5px)' : '';
  });
  navLinks.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      navLinks.classList.remove('open');
      hamburger.querySelectorAll('span').forEach(s => {
        s.style.transform = ''; s.style.opacity = '1';
      });
    });
  });
}

// ---- Intersection Observer: reveal on scroll ----
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const el = entry.target;
      const delay = parseInt(el.dataset.index || 0) * 90;
      setTimeout(() => el.classList.add('visible'), delay);
      revealObserver.unobserve(el);
    }
  });
}, { threshold: 0.08, rootMargin: '0px 0px -50px 0px' });

document.querySelectorAll('.timeline-item, .award-card, .reveal, .pub-item').forEach(el => {
  revealObserver.observe(el);
});

// ---- Publication filter ----
const filterBtns = document.querySelectorAll('.filter-btn');
const pubItems   = document.querySelectorAll('.pub-item');
filterBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    filterBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    const filter = btn.dataset.filter;
    pubItems.forEach(item => {
      const show = filter === 'all' || item.dataset.type === filter;
      item.classList.toggle('hidden', !show);
      if (show) item.style.animation = 'fadeUp .4s forwards';
    });
  });
});
