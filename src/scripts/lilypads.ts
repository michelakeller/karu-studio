/**
 * Lily pads.
 *
 * Solid green pads that float on top of the page, including over text.
 * They wander, bounce off each other and off the viewport, and get pushed
 * aside by the cursor. They are not confined to the dusty blue bands.
 *
 * Four rules are built into this file rather than left to taste, because a
 * playful motif is exactly where a site turns cheap.
 *
 * 1. The pads sit above the copy. They are allowed to pass over words.
 *    Michela reversed the earlier never-over-text rule.
 * 2. They never interfere with clicking or with assistive technology. The
 *    layer is pointer-events: none and hidden from the accessibility tree.
 *    Cursor-push is read from the window, so the canvas never captures the
 *    pointer that belongs to a button.
 * 3. Under prefers-reduced-motion nothing moves. No loop, no listeners.
 * 4. Without a fine pointer there is no cursor to push them, so they do not
 *    animate either. A phone gets a quiet still arrangement or nothing.
 */

type Circle = { x: number; y: number; r: number };

type Pad = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  r: number;
  /** The slow loop the pad is pulled along, in viewport coordinates. */
  baseX: number;
  baseY: number;
  ampX: number;
  ampY: number;
  rateX: number;
  rateY: number;
  phase: number;
  angle: number;
  spin: number;
  outline: Path2D;
  veins: Path2D;
};

const SVG_NS = 'http://www.w3.org/2000/svg';

const CURSOR_RADIUS = 250;
const CURSOR_FORCE = 2600;
/**
 * The notch. A wide shallow nick at the rim reads as a lily pad. A narrow
 * deep one reads as a slice taken out of a circle, which is why these three
 * numbers were tuned together rather than guessed.
 *   NOTCH_GAP  opening at the rim, in radians
 *   CLEFT      how far in the base of the notch sits, as a fraction of radius
 *   SLIT       half width of the flat base, in radians
 */
const NOTCH_GAP = 0.4;
const CLEFT = 0.66;
const SLIT = 0.05;

/**
 * A pad is a near circle with one narrow cleft, the way a real lily pad is cut
 * from its rim in towards the stem. The outline wobbles slightly so no two
 * pads are the same shape and none of them reads as a plain circle.
 *
 * Returned as SVG path data, which both the canvas version and the still
 * version build from, so there is only ever one definition of the shape.
 */
function padGeometry(
  r: number,
  notch: number,
  wobble: number,
): { outline: string; veins: string } {
  const steps = 56;
  const start = notch + NOTCH_GAP / 2;
  const span = Math.PI * 2 - NOTCH_GAP;
  const points: string[] = [];

  for (let i = 0; i <= steps; i += 1) {
    const t = start + span * (i / steps);
    // Small amplitudes on purpose. A lily pad is close to round, and a strong
    // wobble turns it into a potato.
    const wob =
      1 + 0.02 * Math.sin(t * 3 + wobble) + 0.011 * Math.sin(t * 5 - wobble * 1.6);
    const rr = r * wob;
    const x = (Math.cos(t) * rr).toFixed(2);
    const y = (Math.sin(t) * rr).toFixed(2);
    points.push(`${i === 0 ? 'M' : 'L'}${x} ${y}`);
  }

  const at = (angle: number, radius: number) =>
    `${(Math.cos(angle) * radius).toFixed(2)} ${(Math.sin(angle) * radius).toFixed(2)}`;

  // In from one side of the opening, across the flat base of the notch, and
  // back out to the other side.
  const base = r * CLEFT;
  const outline = `${points.join(' ')} L${at(notch - SLIT, base)} L${at(notch + SLIT, base)} Z`;

  // Veins radiate from the base of the notch towards the rim, stopping short
  // of it so the outline stays the strongest line in the shape. They bow
  // outwards rather than running straight, because an even fan of straight
  // lines reads as a pie chart instead of as a leaf.
  const veinCount = 5;
  const originX = Math.cos(notch) * base;
  const originY = Math.sin(notch) * base;
  const veins: string[] = [];

  for (let v = 1; v <= veinCount; v += 1) {
    const along = v / (veinCount + 1);
    const tip = start + span * along;
    const tipX = Math.cos(tip) * r * 0.72;
    const tipY = Math.sin(tip) * r * 0.72;
    // Bow hardest on the veins furthest from the notch axis, which is where a
    // real leaf curves most.
    const bow = Math.sin(along * Math.PI) * r * 0.16;
    const midX = (originX + tipX) / 2;
    const midY = (originY + tipY) / 2;
    const length = Math.hypot(tipX - originX, tipY - originY) || 1;
    const cx = midX - ((tipY - originY) / length) * bow;
    const cy = midY + ((tipX - originX) / length) * bow;
    veins.push(
      `M${originX.toFixed(2)} ${originY.toFixed(2)} ` +
        `Q${cx.toFixed(2)} ${cy.toFixed(2)} ${tipX.toFixed(2)} ${tipY.toFixed(2)}`,
    );
  }

  return { outline, veins: veins.join(' ') };
}

function readColours() {
  const styles = getComputedStyle(document.documentElement);
  const read = (name: string, fallback: string) =>
    styles.getPropertyValue(name).trim() || fallback;
  return {
    fill: read('--pad-fill', '#4a8562'),
    edge: read('--pad-edge', '#3a6b4e'),
    vein: read('--pad-vein', '#3d7355'),
  };
}

function randomPoint(width: number, height: number, r: number): { x: number; y: number } | null {
  const minX = r * 1.1;
  const maxX = width - r * 1.1;
  const minY = r * 1.1;
  const maxY = height - r * 1.1;
  if (maxX <= minX || maxY <= minY) return null;
  return {
    x: minX + Math.random() * (maxX - minX),
    y: minY + Math.random() * (maxY - minY),
  };
}

export function mountLilyPads(canvas: HTMLCanvasElement): void {
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

  if (reducedMotion || !finePointer) {
    mountStill(canvas);
    return;
  }

  mountDrifting(canvas);
}

/* ==========================================================================
   Still version. Used on touch devices and under prefers-reduced-motion.

   The pads are placed once, in document coordinates, and scroll with the
   page. They sit on top of the copy. They do not move.
   ========================================================================== */

function mountStill(canvas: HTMLCanvasElement): void {
  const layer = document.createElement('div');
  layer.className = 'lilypads lilypads--still';
  layer.setAttribute('aria-hidden', 'true');
  canvas.replaceWith(layer);

  const colours = readColours();

  function render(): void {
    layer.textContent = '';

    const docWidth = document.documentElement.clientWidth;
    const docHeight = Math.max(
      document.body.scrollHeight,
      document.documentElement.scrollHeight,
    );
    layer.style.height = `${docHeight}px`;

    const r = Math.min(70, Math.max(26, docWidth * 0.055));
    const area = docWidth * docHeight;
    const wanted = Math.min(6, Math.max(3, Math.round(area / 280000)));
    const placed: Circle[] = [];

    for (let i = 0; i < wanted; i += 1) {
      let spot: Circle | null = null;
      for (let attempt = 0; attempt < 80; attempt += 1) {
        const origin = randomPoint(docWidth, docHeight, r);
        if (!origin) continue;
        const candidate = { x: origin.x, y: origin.y, r };
        let clear = true;
        for (const other of placed) {
          if (Math.hypot(other.x - candidate.x, other.y - candidate.y) < r * 2.4) {
            clear = false;
            break;
          }
        }
        if (clear) {
          spot = candidate;
          break;
        }
      }
      if (!spot) continue;
      placed.push(spot);

      const { outline, veins } = padGeometry(r, Math.random() * Math.PI * 2, Math.random() * 10);
      const svg = document.createElementNS(SVG_NS, 'svg');
      svg.setAttribute('width', `${r * 2.2}`);
      svg.setAttribute('height', `${r * 2.2}`);
      svg.setAttribute('viewBox', `${-r * 1.1} ${-r * 1.1} ${r * 2.2} ${r * 2.2}`);
      svg.style.position = 'absolute';
      svg.style.left = `${spot.x - r * 1.1}px`;
      svg.style.top = `${spot.y - r * 1.1}px`;
      svg.style.pointerEvents = 'none';

      const body = document.createElementNS(SVG_NS, 'path');
      body.setAttribute('d', outline);
      body.setAttribute('fill', colours.fill);
      body.setAttribute('stroke', colours.edge);
      body.setAttribute('stroke-width', '1');
      svg.append(body);

      const vein = document.createElementNS(SVG_NS, 'path');
      vein.setAttribute('d', veins);
      vein.setAttribute('fill', 'none');
      vein.setAttribute('stroke', colours.vein);
      vein.setAttribute('stroke-width', '0.7');
      svg.append(vein);

      layer.append(svg);
    }
  }

  render();

  let timer = 0;
  window.addEventListener('resize', () => {
    window.clearTimeout(timer);
    timer = window.setTimeout(render, 200);
  });
}

/* ==========================================================================
   Drifting version. Used when there is a cursor to push the pads with.
   ========================================================================== */

function mountDrifting(canvas: HTMLCanvasElement): void {
  const context = canvas.getContext('2d', { alpha: true });
  if (!context) return;
  const ctx: CanvasRenderingContext2D = context;
  const colours = readColours();

  let width = 0;
  let height = 0;
  let dpr = 1;
  let pads: Pad[] = [];
  let pointerX = -9999;
  let pointerY = -9999;
  let elapsed = 0;
  let lastTime = 0;

  function findFreeSpot(r: number): { x: number; y: number } | null {
    let best: { x: number; y: number } | null = null;
    let bestSpread = -1;

    for (let attempt = 0; attempt < 80; attempt += 1) {
      const origin = randomPoint(width, height, r);
      if (!origin) continue;
      const { x, y } = origin;
      let clear = true;
      let nearest = Infinity;
      for (const other of pads) {
        const distance = Math.hypot(other.x - x, other.y - y);
        if (distance < other.r + r + 24) {
          clear = false;
          break;
        }
        if (distance < nearest) nearest = distance;
      }
      if (!clear) continue;
      if (pads.length === 0 || nearest > bestSpread) {
        bestSpread = nearest === Infinity ? 0 : nearest;
        best = { x, y };
      }
    }

    return best;
  }

  function build(): void {
    pads = [];
    const area = width * height;
    const target = area > 900000 ? 6 : area > 450000 ? 5 : 4;
    const base = Math.min(width, height);

    for (let i = 0; i < target; i += 1) {
      // A spread of sizes, all of them modest. Several small pads moving in
      // their own time read as water. Two big ones read as a graphic.
      const r = base * (0.038 + Math.random() * 0.04);
      const spot = findFreeSpot(r);
      if (!spot) continue;
      const geometry = padGeometry(r, Math.random() * Math.PI * 2, Math.random() * 10);
      pads.push({
        x: spot.x,
        y: spot.y,
        vx: (Math.random() - 0.5) * 14,
        vy: (Math.random() - 0.5) * 14,
        r,
        baseX: spot.x,
        baseY: spot.y,
        ampX: r * (0.9 + Math.random() * 1.2),
        ampY: r * (0.6 + Math.random() * 0.9),
        // One loop every twelve to thirty seconds. Slower than this and the
        // drift is not perceptible at all, faster and the page gets busy.
        rateX: 0.22 + Math.random() * 0.3,
        rateY: 0.18 + Math.random() * 0.26,
        phase: Math.random() * Math.PI * 2,
        angle: Math.random() * Math.PI * 2,
        spin: (Math.random() - 0.5) * 0.05,
        outline: new Path2D(geometry.outline),
        veins: new Path2D(geometry.veins),
      });
    }
  }

  function draw(): void {
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, width, height);

    for (const pad of pads) {
      ctx.save();
      ctx.globalAlpha = 1;
      ctx.translate(pad.x, pad.y);
      ctx.rotate(pad.angle);

      ctx.fillStyle = colours.fill;
      ctx.fill(pad.outline);
      ctx.lineWidth = 1;
      ctx.strokeStyle = colours.edge;
      ctx.stroke(pad.outline);
      ctx.lineWidth = 0.7;
      ctx.strokeStyle = colours.vein;
      ctx.stroke(pad.veins);

      ctx.restore();
    }
  }

  function clampToViewport(pad: Pad): void {
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
  }

  function step(dt: number): void {
    for (const pad of pads) {
      // Each pad is pulled along a slow loop of its own, which is where the
      // wandering comes from. The pull is soft, so a shove from the cursor
      // overrides it and the pad springs back afterwards.
      const homeX = pad.baseX + Math.sin(elapsed * pad.rateX + pad.phase) * pad.ampX;
      const homeY = pad.baseY + Math.cos(elapsed * pad.rateY + pad.phase * 1.7) * pad.ampY;
      pad.vx += (homeX - pad.x) * 2.2 * dt;
      pad.vy += (homeY - pad.y) * 2.2 * dt;

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
      clampToViewport(pad);
    }
  }

  function tick(time: number): void {
    if (document.hidden) {
      lastTime = time;
      requestAnimationFrame(tick);
      return;
    }

    const dt = Math.min(0.05, (time - lastTime) / 1000 || 0.016);
    lastTime = time;
    elapsed += dt;

    step(dt);
    draw();
    requestAnimationFrame(tick);
  }

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

  requestAnimationFrame((time) => {
    lastTime = time;
    requestAnimationFrame(tick);
  });
}
