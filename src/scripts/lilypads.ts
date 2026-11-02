/**
 * Lily pads.
 *
 * Dusty blue pads wander behind the page, bounce off each other and off the
 * edges of the viewport, and get pushed aside by the cursor.
 *
 * Four rules are built into this file rather than left to taste, because a
 * playful motif is exactly where a site turns cheap.
 *
 * 1. The pads never pass over text. Every readable element is measured and
 *    treated as solid. In the moving version the pads collide with those
 *    rectangles and fade out if they ever touch one anyway, so the rule is
 *    enforced twice. In the still version the pads are positioned in document
 *    coordinates and scroll with the page, so they cannot drift onto a word
 *    even in principle.
 * 2. They never interfere with clicking or with assistive technology. Both
 *    versions are inert and hidden from the accessibility tree.
 * 3. Under prefers-reduced-motion nothing moves. No loop, no listeners.
 * 4. Without a fine pointer there is no cursor to push them, so they do not
 *    animate either. A phone gets a quiet still arrangement or nothing.
 */

type Rect = { left: number; top: number; right: number; bottom: number };
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

const SVG_NS = 'http://www.w3.org/2000/svg';

/**
 * Guaranteed clearance between a pad and any real text box. Collision is
 * resolved against rectangles inflated by this much, so a pad that is hard up
 * against its limit is still this far from a letter.
 */
const TEXT_MARGIN = 18;
/**
 * The fade is the emergency brake, not the everyday behaviour. It only bites
 * in the last stretch of the buffer above, so a pad drifting through a narrow
 * gap stays at full strength instead of dimming to a smudge.
 */
const FADE_DEPTH = 9;
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

/** How far a circle has pushed into a rectangle. Positive means overlap. */
function penetration(circle: Circle, rect: Rect): number {
  const nearestX = Math.max(rect.left, Math.min(circle.x, rect.right));
  const nearestY = Math.max(rect.top, Math.min(circle.y, rect.bottom));
  return circle.r - Math.hypot(circle.x - nearestX, circle.y - nearestY);
}

/** Distance from a point to the nearest text box. */
function clearance(x: number, y: number, rects: Rect[]): number {
  let nearest = Infinity;
  for (const rect of rects) {
    const px = Math.max(rect.left, Math.min(x, rect.right));
    const py = Math.max(rect.top, Math.min(y, rect.bottom));
    const distance = Math.hypot(x - px, y - py);
    if (distance < nearest) nearest = distance;
  }
  return nearest;
}

function worstPenetration(circle: Circle, rects: Rect[]): number {
  let worst = -circle.r;
  for (const rect of rects) {
    const depth = penetration(circle, rect);
    if (depth > worst) worst = depth;
  }
  return worst;
}

function readColours() {
  const styles = getComputedStyle(document.documentElement);
  const read = (name: string, fallback: string) =>
    styles.getPropertyValue(name).trim() || fallback;
  return {
    fill: read('--pad-fill', 'rgba(150,177,207,0.32)'),
    edge: read('--pad-edge', 'rgba(150,177,207,0.62)'),
    vein: read('--pad-vein', 'rgba(150,177,207,0.3)'),
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

   The pads are placed once, in document coordinates, into gaps the text does
   not occupy. They scroll with the page like any other element, so they are
   incapable of ending up on top of a word.
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

    const rects: Rect[] = [];
    for (const node of document.querySelectorAll<HTMLElement>(READABLE)) {
      const box = node.getBoundingClientRect();
      if (box.width === 0 || box.height === 0) continue;
      rects.push({
        left: box.left + window.scrollX - TEXT_MARGIN,
        top: box.top + window.scrollY - TEXT_MARGIN,
        right: box.right + window.scrollX + TEXT_MARGIN,
        bottom: box.bottom + window.scrollY + TEXT_MARGIN,
      });
    }

    // Small. A still pad has no motion to earn its space with, so a large one
    // is just a grey shape sitting next to the copy.
    const r = Math.min(70, Math.max(26, docWidth * 0.055));
    const wanted = Math.min(8, Math.max(2, Math.round(docHeight / 1300)));
    const placed: Circle[] = [];

    for (let i = 0; i < wanted; i += 1) {
      let spot: Circle | null = null;
      for (let attempt = 0; attempt < 200; attempt += 1) {
        const candidate = {
          x: r + Math.random() * Math.max(1, docWidth - r * 2),
          y: r + Math.random() * Math.max(1, docHeight - r * 2),
          r: r * 1.08,
        };
        if (worstPenetration(candidate, rects) > 0) continue;
        let clear = true;
        for (const other of placed) {
          if (Math.hypot(other.x - candidate.x, other.y - candidate.y) < r * 2.6) {
            clear = false;
            break;
          }
        }
        if (clear) {
          spot = candidate;
          break;
        }
      }
      // No room is a perfectly good answer. Better one fewer pad than a pad
      // sitting on a sentence.
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
  let rects: Rect[] = [];
  let pointerX = -9999;
  let pointerY = -9999;
  let elapsed = 0;
  let lastTime = 0;
  let rectsStale = true;
  let rectsCheckedAt = 0;

  function collectRects(): void {
    const next: Rect[] = [];
    for (const node of document.querySelectorAll<HTMLElement>(READABLE)) {
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

  /**
   * Where a pad is born. Rejection sampling keeps it out of text, and then of
   * every legal spot it takes the roomiest, measured as distance to the
   * nearest text box. A pad dropped into a tight gap has nowhere to drift and
   * spends its life pinned against a paragraph, which looks like a bug rather
   * than like water.
   */
  function findFreeSpot(r: number): { x: number; y: number } | null {
    const span = r * 1.4;
    let best: { x: number; y: number } | null = null;
    let bestRoom = 0;

    for (let attempt = 0; attempt < 220; attempt += 1) {
      const x = span + Math.random() * Math.max(1, width - span * 2);
      const y = span + Math.random() * Math.max(1, height - span * 2);
      // Tested at a padded radius, so the pad has somewhere to move once live.
      if (worstPenetration({ x, y, r: r * 1.25 }, rects) > 0) continue;
      let clear = true;
      for (const other of pads) {
        if (Math.hypot(other.x - x, other.y - y) < other.r + r + 24) {
          clear = false;
          break;
        }
      }
      if (!clear) continue;

      const room = clearance(x, y, rects);
      if (room > bestRoom) {
        bestRoom = room;
        best = { x, y };
      }
    }

    return best;
  }

  function build(): void {
    pads = [];
    collectRects();
    const area = width * height;
    // Few enough that each one has somewhere to go. A crowd of pads in the
    // gaps between paragraphs cannot move, and a motif that cannot move is
    // just a pattern.
    const target = area > 1600000 ? 6 : area > 900000 ? 5 : 4;
    const base = Math.min(width, height);

    for (let i = 0; i < target; i += 1) {
      // A spread of sizes, all of them modest. Several small pads moving in
      // their own time read as water. Two big ones read as a graphic.
      const r = base * (0.035 + Math.random() * 0.035);
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
        alpha: 1,
      });
    }
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

  /** Push one pad out of every text box it is touching. */
  function resolveText(pad: Pad): void {
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
      // Text boxes are solid. Two passes, because being pushed out of one box
      // can push a pad into its neighbour.
      resolveText(pad);
      resolveText(pad);

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

      // Last line of defence. A pad still touching a text box fades out
      // rather than being read through.
      const depth = worstPenetration(pad, rects);
      const wanted = depth > 0 ? 0 : Math.min(1, -depth / FADE_DEPTH);
      pad.alpha += (wanted - pad.alpha) * Math.min(1, dt * 8);
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

    // Text boxes move when the page scrolls, so they are re-read on a short
    // timer rather than on every scroll event.
    if (rectsStale && time - rectsCheckedAt > 100) {
      rectsCheckedAt = time;
      collectRects();
    }

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
