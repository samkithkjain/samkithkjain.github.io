/**
 * Live Math, Strings & Theoretical CS Background Canvas
 * Full-page interactive, high-DPI canvas background for index.html.
 * Renders mathematical symbols, stringology notations, automata,
 * and graph networks with zero English words.
 *
 * Disabled in the top bar (starts below navbar, mouse events ignored in navbar).
 */

(function () {
  'use strict';

  const canvas = document.getElementById('math-canvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  // ---- Curated Math & CS Tokens (STRICTLY NO ENGLISH WORDS) ----
  const MATH_SYMBOLS = [
    'λ', '∑', '∏', '∫', '∂', '∇', '∞', 'π',
    'Ω', 'Θ', '𝒪', '∈', '∉', '⊂', '⊆', '∪',
    '∩', '∀', '∃', '⊕', '⊗', '√', '≠', '≤',
    '≥', '≈', '≡', '⊢', '⊨', '⊥', '⊤', '∧',
    '∨', '¬', 'σ', 'τ', 'φ', 'ψ', 'γ', 'δ',
    'α', 'β', 'μ', 'ρ', 'ξ', 'ζ'
  ];

  const STRING_TOKENS = [
    '01101001', '10101', '0101', '110011', '0110', '1001',
    'w[i..j]', 'w·wᴿ', 'u·v', 'u⊏w',
    'Σ*', 'Σ⁺', 'ε', '$', '\\0',
    'aⁿbⁿ', 'π[i]', 'lcp(i,j)',
    'P ≟ NP', 'O(n log n)', 'O(1)', 'O(|Σ|)', 'O(n²)', 'O(log n)',
    'δ(q, σ)', 'G = (V, E)', '(u, v) ∈ E',
    'q₀ ∈ Q', 'F ⊆ Q', 'λx. x', '⟨u, v⟩',
    '0x7F', '0xFF', '{ }', '[0..k)', '::', '->', '=>',
    'x ↦ f(x)', 'A ∩ B = ∅', '∑ᵢ aᵢ', 'limₙ'
  ];

  // Editorial color palette matching the theme with enhanced contrast
  const COLOR_PALETTES = [
    { r: 136, g: 19,  b: 55  }, // Burgundy Accent
    { r: 14,  g: 116, b: 144 }, // Teal Accent
    { r: 75,  g: 68,  b: 62  }, // Rich Charcoal
    { r: 115, g: 105, b: 98  }  // Medium Slate
  ];

  let width = 0;
  let height = 0;
  let navH = 68;
  let dpr = 1;
  let isRunning = false;
  let animationId = null;
  let lastTime = 0;

  // Mouse / Pointer state (relative to canvas, which starts below navbar)
  const mouse = {
    x: -9999,
    y: -9999,
    targetX: -9999,
    targetY: -9999,
    active: false,
    alpha: 0
  };

  // Click ripple effects
  const ripples = [];

  // Data pulses traveling along graph edges
  const pulses = [];

  // Particles array
  let particles = [];

  // Rotation angles for background geometric reticle
  let reticleAngle = 0;

  // Respect user preference for reduced motion
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function getNavbarHeight() {
    const navEl = document.getElementById('navbar');
    return navEl ? navEl.offsetHeight : 68;
  }

  class Particle {
    constructor() {
      this.reset(true);
    }

    reset(initial = false) {
      this.x = initial ? Math.random() * width : (Math.random() > 0.5 ? -20 : width + 20);
      this.y = initial ? Math.random() * height : Math.random() * height;

      // Gentle floating speed
      const speed = 0.18 + Math.random() * 0.35;
      const angle = Math.random() * Math.PI * 2;
      this.vx = Math.cos(angle) * speed;
      this.vy = Math.sin(angle) * speed;

      // Particle type: 65% symbol/string, 35% graph node dot
      this.isNode = Math.random() < 0.32;

      if (!this.isNode) {
        const isMath = Math.random() < 0.55;
        this.text = isMath
          ? MATH_SYMBOLS[Math.floor(Math.random() * MATH_SYMBOLS.length)]
          : STRING_TOKENS[Math.floor(Math.random() * STRING_TOKENS.length)];

        this.isMath = isMath;
        this.fontSize = isMath ? (13 + Math.random() * 7) : (10 + Math.random() * 4);
      } else {
        this.radius = 2 + Math.random() * 2.5;
        this.isDoubleRing = Math.random() < 0.35;
      }

      this.color = COLOR_PALETTES[Math.floor(Math.random() * COLOR_PALETTES.length)];
      this.baseAlpha = 0.30 + Math.random() * 0.32;
      this.currentAlpha = this.baseAlpha;
      this.phase = Math.random() * Math.PI * 2;
      this.phaseSpeed = 0.01 + Math.random() * 0.02;

      // Depth layer for subtle parallax
      this.depth = 0.75 + Math.random() * 0.5;

      // Interaction offset from mouse push
      this.offsetX = 0;
      this.offsetY = 0;
    }

    update(dt) {
      this.phase += this.phaseSpeed;

      // Normal drift
      this.x += this.vx * this.depth;
      this.y += this.vy * this.depth;

      // Soft sinusoidal oscillation
      this.x += Math.sin(this.phase) * 0.15;
      this.y += Math.cos(this.phase * 0.8) * 0.15;

      // Mouse repulsion / attraction physics (when pointer is below navbar)
      if (mouse.active) {
        const dx = (this.x + this.offsetX) - mouse.x;
        const dy = (this.y + this.offsetY) - mouse.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const maxDist = 160;

        if (dist < maxDist && dist > 1) {
          const force = (1 - dist / maxDist) * 3.5;
          const nx = dx / dist;
          const ny = dy / dist;
          this.offsetX += nx * force;
          this.offsetY += ny * force;
        }
      }

      // Smooth relaxation of interaction offsets
      this.offsetX *= 0.92;
      this.offsetY *= 0.92;

      // Center legibility: softly reduce particle alpha directly behind the name for maximum legibility without splitting particles apart
      let alphaMult = 1.0;
      const nameEl = document.querySelector('.hero-name') || document.querySelector('.hero-content');

      if (nameEl) {
        const nRect = nameEl.getBoundingClientRect();
        if (nRect.bottom > 0 && nRect.top < height) {
          const centerX = nRect.left + nRect.width / 2;
          const centerY = nRect.top + nRect.height / 2;
          const cdx = (this.x + this.offsetX) - centerX;
          const cdy = (this.y + this.offsetY) - centerY;
          const rx = Math.max(160, nRect.width * 0.52);
          const ry = Math.max(65, nRect.height * 0.52);
          const distSq = (cdx * cdx) / (rx * rx) + (cdy * cdy) / (ry * ry);

          if (distSq < 1.0) {
            alphaMult = 0.28 + 0.72 * Math.sqrt(distSq);
          }
        }
      }

      // Screen boundary wrapping (constrained within canvas area below navbar)
      const margin = 50;
      if (this.x < -margin) this.x = width + margin;
      else if (this.x > width + margin) this.x = -margin;
      if (this.y < -margin) this.y = height + margin;
      else if (this.y > height + margin) this.y = -margin;

      // Boost opacity when near mouse
      if (mouse.active) {
        const mdx = (this.x + this.offsetX) - mouse.x;
        const mdy = (this.y + this.offsetY) - mouse.y;
        const mdist = Math.sqrt(mdx * mdx + mdy * mdy);
        if (mdist < 140) {
          alphaMult += (1 - mdist / 140) * 0.5;
        }
      }

      this.currentAlpha = this.baseAlpha * alphaMult;
    }

    draw() {
      const renderX = this.x + this.offsetX;
      const renderY = this.y + this.offsetY;

      if (renderX < -60 || renderX > width + 60 || renderY < -60 || renderY > height + 60) {
        return;
      }

      ctx.save();
      const { r, g, b } = this.color;
      let alpha = Math.min(0.85, Math.max(0.10, this.currentAlpha));

      // Softly fade out particles as they approach the top bar
      if (renderY < navH + 18) {
        alpha *= Math.max(0, (renderY - 8) / (navH + 10));
      }

      if (this.isNode) {
        ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${alpha})`;
        ctx.beginPath();
        ctx.arc(renderX, renderY, this.radius, 0, Math.PI * 2);
        ctx.fill();

        if (this.isDoubleRing) {
          ctx.strokeStyle = `rgba(${r}, ${g}, ${b}, ${alpha * 0.85})`;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.arc(renderX, renderY, this.radius + 3, 0, Math.PI * 2);
          ctx.stroke();
        }
      } else {
        ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${alpha})`;
        if (this.isMath) {
          ctx.font = `italic ${this.fontSize}px 'DM Serif Display', Georgia, serif`;
        } else {
          ctx.font = `500 ${this.fontSize}px 'DM Mono', 'Courier New', monospace`;
        }
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(this.text, renderX, renderY);
      }

      ctx.restore();
    }
  }

  // ---- Draw Subtle Word-Free Background Reticle Centered on Name ----
  function drawReticle() {
    const nameEl = document.querySelector('.hero-name') || document.querySelector('.hero-content');
    if (!nameEl) return;

    const nRect = nameEl.getBoundingClientRect();
    if (nRect.bottom < 0 || nRect.top > height) return;

    const cx = nRect.left + nRect.width / 2 + (mouse.active ? (mouse.x - width / 2) * 0.02 : 0);
    const cy = nRect.top + nRect.height / 2 + (mouse.active ? (mouse.y - height / 2) * 0.02 : 0);

    ctx.save();
    ctx.translate(cx, cy);

    const rings = [
      { r: Math.min(320, width * 0.42), dash: [4, 6], alpha: 0.09, stroke: '136, 19, 55' },
      { r: Math.min(220, width * 0.30), dash: [], alpha: 0.08, stroke: '14, 116, 144' },
      { r: Math.min(130, width * 0.18), dash: [2, 4], alpha: 0.11, stroke: '136, 19, 55' }
    ];

    rings.forEach(ring => {
      ctx.strokeStyle = `rgba(${ring.stroke}, ${ring.alpha})`;
      ctx.lineWidth = 0.8;
      ctx.setLineDash(ring.dash);
      ctx.beginPath();
      ctx.arc(0, 0, ring.r, 0, Math.PI * 2);
      ctx.stroke();
    });

    // Slowly rotating satellite nodes on outer ring
    ctx.rotate(reticleAngle);
    const orbitR = Math.min(220, width * 0.30);
    const nodeAngles = [0, Math.PI * 0.5, Math.PI, Math.PI * 1.5];

    nodeAngles.forEach((ang, i) => {
      const nx = Math.cos(ang) * orbitR;
      const ny = Math.sin(ang) * orbitR;
      ctx.fillStyle = i % 2 === 0 ? 'rgba(136, 19, 55, 0.40)' : 'rgba(14, 116, 144, 0.40)';
      ctx.beginPath();
      ctx.arc(nx, ny, 2.5, 0, Math.PI * 2);
      ctx.fill();
    });

    ctx.restore();
  }

  // ---- Draw Graph Edges & Traveling Pulses Between Nearby Particles ----
  function drawGraphEdges() {
    const connectionDist = width < 640 ? 85 : 120;
    const len = particles.length;

    ctx.save();

    for (let i = 0; i < len; i++) {
      const pi = particles[i];
      const xi = pi.x + pi.offsetX;
      const yi = pi.y + pi.offsetY;

      for (let j = i + 1; j < len; j++) {
        const pj = particles[j];
        const xj = pj.x + pj.offsetX;
        const yj = pj.y + pj.offsetY;

        const dx = xj - xi;
        const dy = yj - yi;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < connectionDist) {
          const proximity = 1 - dist / connectionDist;
          const alpha = proximity * Math.min(pi.currentAlpha, pj.currentAlpha) * 0.85;

          if (alpha > 0.015) {
            ctx.strokeStyle = `rgba(136, 19, 55, ${alpha})`;
            ctx.lineWidth = 0.8;
            ctx.setLineDash([]);
            ctx.beginPath();
            ctx.moveTo(xi, yi);
            ctx.lineTo(xj, yj);
            ctx.stroke();

            // Occasionally spawn a traveling pulse between connected nodes
            if (Math.random() < 0.0004 && pulses.length < 5) {
              pulses.push({
                x1: xi,
                y1: yi,
                x2: xj,
                y2: yj,
                progress: 0,
                speed: 0.018 + Math.random() * 0.015,
                color: pi.color
              });
            }
          }
        }
      }

      // Connect cursor to closest particles
      if (mouse.active && mouse.alpha > 0.05) {
        const mdx = mouse.x - xi;
        const mdy = mouse.y - yi;
        const mdist = Math.sqrt(mdx * mdx + mdy * mdy);
        const mouseRange = 140;

        if (mdist < mouseRange) {
          const mProx = (1 - mdist / mouseRange) * mouse.alpha * 0.50;
          ctx.strokeStyle = `rgba(14, 116, 144, ${mProx})`;
          ctx.lineWidth = 0.9;
          ctx.setLineDash([3, 3]);
          ctx.beginPath();
          ctx.moveTo(mouse.x, mouse.y);
          ctx.lineTo(xi, yi);
          ctx.stroke();
        }
      }
    }

    // Render & update traveling data pulses
    for (let p = pulses.length - 1; p >= 0; p--) {
      const pulse = pulses[p];
      pulse.progress += pulse.speed;

      if (pulse.progress >= 1) {
        pulses.splice(p, 1);
        continue;
      }

      const px = pulse.x1 + (pulse.x2 - pulse.x1) * pulse.progress;
      const py = pulse.y1 + (pulse.y2 - pulse.y1) * pulse.progress;
      const { r, g, b } = pulse.color;

      ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${0.95 * (1 - pulse.progress)})`;
      ctx.beginPath();
      ctx.arc(px, py, 2.2, 0, Math.PI * 2);
      ctx.fill();
    }

    // Render & update click ripples
    for (let r = ripples.length - 1; r >= 0; r--) {
      const rip = ripples[r];
      rip.radius += 2.2;
      rip.alpha *= 0.95;

      if (rip.alpha <= 0.01 || rip.radius > 160) {
        ripples.splice(r, 1);
        continue;
      }

      ctx.strokeStyle = `rgba(136, 19, 55, ${rip.alpha * 0.28})`;
      ctx.lineWidth = 1;
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.arc(rip.x, rip.y, rip.radius, 0, Math.PI * 2);
      ctx.stroke();
    }

    ctx.restore();
  }

  // ---- Canvas Resize & Particle Density (Full Page) ----
  function resize() {
    navH = getNavbarHeight();
    width = window.innerWidth;
    height = window.innerHeight;
    dpr = Math.min(window.devicePixelRatio || 1, 2);

    canvas.width = Math.floor(width * dpr);
    canvas.height = Math.floor(height * dpr);
    canvas.style.width = width + 'px';
    canvas.style.height = height + 'px';

    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.scale(dpr, dpr);

    // Target particle count based on screen area
    let targetCount = 75;
    if (width < 540) targetCount = 35;
    else if (width < 820) targetCount = 52;
    else if (width > 1400) targetCount = 90;

    if (particles.length === 0) {
      for (let i = 0; i < targetCount; i++) {
        particles.push(new Particle());
      }
    } else if (particles.length < targetCount) {
      while (particles.length < targetCount) {
        particles.push(new Particle());
      }
    } else if (particles.length > targetCount) {
      particles.length = targetCount;
    }
  }

  // ---- Main Animation Loop ----
  function animate(now) {
    if (!isRunning) return;

    animationId = requestAnimationFrame(animate);

    const dt = Math.min((now - lastTime) / 1000, 0.1);
    lastTime = now;

    if (mouse.active) {
      mouse.x += (mouse.targetX - mouse.x) * 0.18;
      mouse.y += (mouse.targetY - mouse.y) * 0.18;
      mouse.alpha = Math.min(1, mouse.alpha + 0.05);
    } else {
      mouse.alpha = Math.max(0, mouse.alpha - 0.03);
    }

    reticleAngle += 0.0012;

    ctx.clearRect(0, 0, width, height);

    drawReticle();

    for (let i = 0; i < particles.length; i++) {
      particles[i].update(dt);
      particles[i].draw();
    }

    drawGraphEdges();
  }

  // ---- Pointer Listeners (Disabled When Cursor is Inside Top Bar) ----
  function updatePointerPos(e) {
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;

    // If mouse is inside top bar, disable interaction
    if (clientY < navH) {
      mouse.active = false;
      return;
    }

    mouse.targetX = clientX;
    mouse.targetY = clientY;
    mouse.active = true;

    if (mouse.x < -100) {
      mouse.x = mouse.targetX;
      mouse.y = mouse.targetY;
    }
  }

  window.addEventListener('mousemove', updatePointerPos, { passive: true });
  window.addEventListener('touchmove', updatePointerPos, { passive: true });

  window.addEventListener('mouseleave', () => {
    mouse.active = false;
  });

  window.addEventListener('touchend', () => {
    mouse.active = false;
  });

  window.addEventListener('click', (e) => {
    const clientY = e.clientY;
    if (clientY < navH) return; // ignore clicks on top bar

    const rx = e.clientX;
    const ry = clientY;

    ripples.push({
      x: rx,
      y: ry,
      radius: 8,
      alpha: 1.0
    });

    particles.forEach(p => {
      const dx = (p.x + p.offsetX) - rx;
      const dy = (p.y + p.offsetY) - ry;
      const d = Math.sqrt(dx * dx + dy * dy);
      if (d < 180 && d > 1) {
        const force = (1 - d / 180) * 12;
        p.offsetX += (dx / d) * force;
        p.offsetY += (dy / d) * force;
      }
    });
  });

  // ---- Window Resize ----
  let resizeTimeout;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(resize, 80);
  });

  // ---- Tab Visibility ----
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      isRunning = false;
      if (animationId) {
        cancelAnimationFrame(animationId);
        animationId = null;
      }
    } else {
      if (!isRunning && !prefersReducedMotion) {
        isRunning = true;
        lastTime = performance.now();
        animationId = requestAnimationFrame(animate);
      }
    }
  });

  // Start animation loop across whole page
  resize();

  if (prefersReducedMotion) {
    drawReticle();
    particles.forEach(p => p.draw());
    drawGraphEdges();
  } else {
    const heroEl = document.getElementById('hero');
    if (heroEl) {
      const observer = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting) {
          if (!isRunning && !document.hidden) {
            isRunning = true;
            lastTime = performance.now();
            animationId = requestAnimationFrame(animate);
          }
        } else {
          isRunning = false;
          if (animationId) {
            cancelAnimationFrame(animationId);
            animationId = null;
          }
        }
      }, { rootMargin: '100px' });
      observer.observe(heroEl);
    } else {
      // Fallback if no #hero exists
      isRunning = true;
      lastTime = performance.now();
      animationId = requestAnimationFrame(animate);
    }
  }
})();
