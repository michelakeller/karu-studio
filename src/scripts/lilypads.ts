/**
 * Lily pads.
 *
 * Dusty blue pads wander behind the page, bounce off each other and off the
 * edges of the viewport, and get pushed aside by the cursor.
 *
 * Four rules are built into this file rather than left to taste, because a
 * playful motif is exactly where a site turns cheap.
 *
 * 1. The pads never pass over text. Every readable element in the viewport is
 *    collected as a rectangle, and the pads collide with those rectangles the
 *    same way they collide with the edges of the screen. If a pad still ends
 *    up touching one after the collision is resolved, its opacity falls away
 *    before it can sit on a word. The rule is enforced twice on purpose.
 * 2. They never interfere with clicking. The canvas is inert.
 * 3. Under prefers-reduced-motion they stop moving. One still frame, no
 *    listeners, no animation loop.
 * 4. Without a fine pointer there is no cursor to push them, so they do not
 *    animate. A phone gets a quiet still arrangement or nothing at all.
 */

type Rect = { left: number; top: number; right: number; bottom: number };
type Circle = { x: number; y: number; r: number };

type Pad = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  r: number;
  /** The slow path the pad is pulled along, in viewport coordinates. */
  baseX: number;
  baseY: number;
  ampX: number;
  ampY: number;
  rateX: number;
  rateY: number;
  phase: number;
  angle: number;
  spin: number;
  notch: number;
  wobble: number;
  alpha: number;
};

const READABLE = [
  'h1',
  'h2',
  'h3',
  'h4',
  'p',
  'li',
  'a',
  'button',
  'time',
  'dt',
  'dd',
  'blockquote',
  'figcaption',
  'img',
  'th',
  'td',
  '.label',
].join(',');

/** Keep the pads this far clear of any text box. */
const TEXT_MARGIN = 14;
/** Distance over which a pad fades as it approaches a text box. */
const FADE_DEPTH = 10;
const CURSOR_RADIUS = 190;
const CURSOR_FORCE = 1600;

export function mountLilyPads(canvas: HTMLCanvasElement): void {
  const context = canvas.getContext('2d', { alpha: true });
  if (!context) return;
  const ctx: CanvasRenderingContext2D = context;

  const styles = getComputedStyle(document.documentElement);
  const fill = styles.getPropertyValue('--pad-fill').trim() || 'rgba(150,177,207,0.3)';
  const edge = styles.getPropertyValue('--pad-edge').trim() || 'rgba(150,177,207,0.5)';
  const vein = styles.getPropertyValue('--pad-vein').trim() || 'rgba(150,177,207,0.42)';

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  const animated = !reducedMotion && finePointer;

  let width = 0;
  let height = 0;
  let dpr = 1;
  let pads: Pad[] = [];
  let rects: Rect[] = [];
  let pointerX = -9999;
  let pointerY = -9999;
  let elapsed = 0;
  let lastTime = 0;
  let rectsStale = true;
  let rectsCheckedAt = 0;

  /* ---- Text boxes the pads have to stay out of -------------------------- */

  function collectRects(): void {
    const next: Rect[] = [];
    const nodes = document.querySelectorAll<HTMLElement>(READABLE);
    for (const node of nodes) {
      const box = node.getBoundingClientRect();
      if (box.width === 0 || box.height === 0) continue;
      if (box.bottom < -TEXT_MARGIN || box.top > height + TEXT_MARGIN) continue;
      if (box.right < -TEXT_MARGIN || box.left > width + TEXT_MARGIN) continue;
      next.push({
        left: box.left - TEXT_MARGIN,
        top: box.top - TEXT_MARGIN,
        right: box.right + TEXT_MARGIN,
        bottom: box.bottom + TEXT_MARGIN,
      });
    }
    rects = next;
    rectsStale = false;
  }

  /** How far a circle has pushed into a rectangle. Positive means overlap. */
  function penetration(circle: Circle, rect: Rect): number {
    const nearestX = Math.max(rect.left, Math.min(circle.x, rect.right));
    const nearestY = Math.max(rect.top, Math.min(circle.y, rect.bottom));
    return circle.r - Math.hypot(circle.x - nearestX, circle.y - nearestY);
  }

  function worstPenetration(circle: Circle): number {
    let worst = -circle.r;
    for (const rect of rects) {
      const depth = penetration(circle, rect);
      if (depth > worst) worst = depth;
    }
    return worst;
  }

  /* ---- Placement -------------------------------------------------------- */

  /** Rejection sampling, so a pad only ever starts somewhere it is allowed. */
  function findFreeSpot(r: number): { x: number; y: number } | null {
    const span = r * 1.6;
    for (let attempt = 0; attempt < 140; attempt += 1) {
      const x = span + Math.random() * Math.max(1, width - span * 2);
      const y = span + Math.random() * Math.max(1, height - span * 2);
      // Test at the padded radius so the pad has room to move once it is live.
      if (worstPenetration({ x, y, r: r * 1.25 }) > 0) continue;
      let clear = true;
      for (const other of pads) {
        if (Math.hypot(other.x - x, other.y - y) < other.r + r + 16) {
          clear = false;
          break;
        }
      }
      if (clear) return { x, y };
    }
    return null;
  }

  function padCount(): number {
    const area = width * height;
    if (!animated) return area > 700000 ? 4 : 2;
    if (area > 1600000) return 8;
    if (area > 900000) return 6;
    return 4;
  }

  function build(): void {
    pads = [];
    collectRects();
    const target = padCount();
    const base = Math.min(width, height);
    for (let i = 0; i < target; i += 1) {
      const r = base * (0.065 + Math.random() * 0.07);
      const spot = findFreeSpot(r);
      if (!spot) continue;
      pads.push({
        x: spot.x,
        y: spot.y,
        vx: (Math.random() - 0.5) * 14,
        vy: (Math.random() - 0.5) * 14,
        r,
        baseX: spot.x,
        baseY: spot.y,
        ampX: r * (0.8 + Math.random() * 1.4),
        ampY: r * (0.6 + Math.random() * 1.1),
        rateX: 0.045 + Math.random() * 0.055,
        rateY: 0.035 + Math.random() * 0.05,
        phase: Math.random() * Math.PI * 2,
        angle: Math.random() * Math.PI * 2,
        spin: (Math.random() - 0.5) * 0.05,
        notch: Math.random() * Math.PI * 2,
        wobble: Math.random() * 10,
        alpha: 1,
      });
    }
  }

  /* ---- Drawing ---------------------------------------------------------- */

  function tracePad(pad: Pad): void {
    const steps = 44;
    const gap = 0.44;
    const start = pad.notch + gap / 2;
    const span = Math.PI * 2 - gap;
    ctx.beginPath();
    for (let i = 0; i <= steps; i += 1) {
      const t = start + span * (i / steps);
      const wob =
        1 +
        0.05 * Math.sin(t * 3 + pad.wobble) +
        0.028 * Math.sin(t * 5 - pad.wobble * 1.6);
      const rr = pad.r * wob;
      const x = Math.cos(t) * rr;
      const y = Math.sin(t) * rr;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.closePath();
  }

  function draw(): void {
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, width, height);

    for (const pad of pads) {
      if (pad.alpha <= 0.01) continue;
      ctx.save();
      ctx.globalAlpha = pad.alpha;
      ctx.translate(pad.x, pad.y);
      ctx.rotate(pad.angle);

      tracePad(pad);
      ctx.fillStyle = fill;
      ctx.fill();
      ctx.lineWidth = 1;
      ctx.strokeStyle = edge;
      ctx.stroke();

      // Veins, fanning out from the notch.
      ctx.strokeStyle = vein;
      ctx.lineWidth = 0.75;
      const notchX = Math.cos(pad.notch) * pad.r * 0.08;
      const notchY = Math.sin(pad.notch) * pad.r * 0.08;
      for (let v = -2; v <= 2; v += 1) {
        const t = pad.notch + Math.PI + v * 0.4;
        ctx.beginPath();
        ctx.moveTo(notchX, notchY);
        ctx.lineTo(Math.cos(t) * pad.r * 0.8, Math.sin(t) * pad.r * 0.8);
        ctx.stroke();
      }

      ctx.restore();
    }
  }

  /* ---- Physics ---------------------------------------------------------- */

  function step(dt: number): void {
    for (const pad of pads) {
      // Each pad is pulled along a slow loop of its own, which is where the
      // wandering comes from. The pull is soft, so a shove from the cursor
      // overrides it and the pad springs back afterwards.
      const homeX = pad.baseX + Math.sin(elapsed * pad.rateX + pad.phase) * pad.ampX;
      const homeY = pad.baseY + Math.cos(elapsed * pad.rateY + pad.phase * 1.7) * pad.ampY;
      pad.vx += (homeX - pad.x) * 2.2 * dt;
      pad.vy += (homeY - pad.y) * 2.2 * dt;

      // The cursor pushes.
      const dx = pad.x - pointerX;
      const dy = pad.y - pointerY;
      const distance = Math.hypot(dx, dy);
      const reach = CURSOR_RADIUS + pad.r;
      if (distance < reach && distance > 0.001) {
        const strength = (1 - distance / reach) ** 2 * CURSOR_FORCE;
        pad.vx += (dx / distance) * strength * dt;
        pad.vy += (dy / distance) * strength * dt;
        pad.spin += (dx / distance) * 0.0016;
      }

      pad.vx *= 0.945;
      pad.vy *= 0.945;

      pad.x += pad.vx * dt;
      pad.y += pad.vy * dt;
      pad.angle += pad.spin * dt;
      pad.spin *= 0.992;
    }

    // Pads push each other apart rather than stacking up.
    for (let i = 0; i < pads.length; i += 1) {
      for (let j = i + 1; j < pads.length; j += 1) {
        const a = pads[i];
        const b = pads[j];
        const dx = b.x - a.x;
        const dy = b.y - a.y;
        const distance = Math.hypot(dx, dy);
        const minimum = (a.r + b.r) * 0.92;
        if (distance > 0.001 && distance < minimum) {
          const push = (minimum - distance) / 2;
          const nx = dx / distance;
          const ny = dy / distance;
          a.x -= nx * push;
          a.y -= ny * push;
          b.x += nx * push;
          b.y += ny * push;
          const relative = (b.vx - a.vx) * nx + (b.vy - a.vy) * ny;
          if (relative < 0) {
            const impulse = relative * 0.6;
            a.vx += nx * impulse;
            a.vy += ny * impulse;
            b.vx -= nx * impulse;
            b.vy -= ny * impulse;
          }
        }
      }
    }

    for (const pad of pads) {
      // Text boxes are solid. This is the rule, not an effect.
      for (const rect of rects) {
        const nearestX = Math.max(rect.left, Math.min(pad.x, rect.right));
        const nearestY = Math.max(rect.top, Math.min(pad.y, rect.bottom));
        let dx = pad.x - nearestX;
        let dy = pad.y - nearestY;
        let distance = Math.hypot(dx, dy);

        if (distance < 0.001) {
          // Dead centre of the box. Leave by the nearest edge.
          const toLeft = pad.x - rect.left;
          const toRight = rect.right - pad.x;
          const toTop = pad.y - rect.top;
          const toBottom = rect.bottom - pad.y;
          const smallest = Math.min(toLeft, toRight, toTop, toBottom);
          dx = smallest === toLeft ? -1 : smallest === toRight ? 1 : 0;
          dy = smallest === toTop ? -1 : smallest === toBottom ? 1 : 0;
          if (dx === 0 && dy === 0) dy = 1;
          distance = 0.001;
        }

        const depth = pad.r - distance;
        if (depth > 0) {
          const nx = dx / distance;
          const ny = dy / distance;
          pad.x += nx * depth;
          pad.y += ny * depth;
          const along = pad.vx * nx + pad.vy * ny;
          if (along < 0) {
            pad.vx -= nx * along * 1.5;
            pad.vy -= ny * along * 1.5;
          }
        }
      }

      // The edges of the screen are solid too.
      if (pad.x - pad.r < 0) {
        pad.x = pad.r;
        pad.vx = Math.abs(pad.vx) * 0.7;
      }
      if (pad.x + pad.r > width) {
        pad.x = width - pad.r;
        pad.vx = -Math.abs(pad.vx) * 0.7;
      }
      if (pad.y - pad.r < 0) {
        pad.y = pad.r;
        pad.vy = Math.abs(pad.vy) * 0.7;
      }
      if (pad.y + pad.r > height) {
        pad.y = height - pad.r;
        pad.vy = -Math.abs(pad.vy) * 0.7;
      }

      // Second line of defence. A pad that is still touching a text box fades
      // out rather than being read through.
      const depth = worstPenetration(pad);
      const wanted = depth > 0 ? 0 : Math.min(1, -depth / FADE_DEPTH);
      pad.alpha += (wanted - pad.alpha) * Math.min(1, dt * 8);
    }
  }

  /* ---- Loop ------------------------------------------------------------- */

  function tick(time: number): void {
    if (document.hidden) {
      lastTime = time;
      requestAnimationFrame(tick);
      return;
    }

    const dt = Math.min(0.05, (time - lastTime) / 1000 || 0.016);
    lastTime = time;
    elapsed += dt;

    // Text boxes move when the page scrolls, so they are re-read on a timer
    // rather than on every scroll event.
    if (rectsStale && time - rectsCheckedAt > 110) {
      rectsCheckedAt = time;
      collectRects();
    }

    step(dt);
    draw();
    requestAnimationFrame(tick);
  }

  /* ---- Setup ------------------------------------------------------------ */

  function resize(): void {
    width = window.innerWidth;
    height = window.innerHeight;
    dpr = Math.min(2, window.devicePixelRatio || 1);
    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    build();
    draw();
  }

  resize();

  let resizeTimer = 0;
  window.addEventListener('resize', () => {
    window.clearTimeout(resizeTimer);
    resizeTimer = window.setTimeout(resize, 180);
  });

  if (!animated) {
    // Still frame. No pointer tracking, no loop.
    return;
  }

  window.addEventListener(
    'pointermove',
    (event) => {
      pointerX = event.clientX;
      pointerY = event.clientY;
    },
    { passive: true },
  );

  window.addEventListener('pointerleave', () => {
    pointerX = -9999;
    pointerY = -9999;
  });

  window.addEventListener(
    'scroll',
    () => {
      rectsStale = true;
    },
    { passive: true },
  );

  requestAnimationFrame((time) => {
    lastTime = time;
    requestAnimationFrame(tick);
  });
}
