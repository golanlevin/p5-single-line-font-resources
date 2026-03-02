// LeonSans — p5.js port
// Original LeonSans by Jongmin Kim, 2019: https://github.com/cmiscm/leonsans
// p5.js adaptation by Golan Levin, 2026
//
// LeonSans weight (1–900) controls both the Bezier geometry AND the line
// thickness — both are derived from the same 'weight' parameter.
// At low weight the letters are hairline thin; at high weight they are bold
// with noticeably different stroke contours (not just a thicker line).
// Font data (LEON_FONT) is loaded from fontData.js.


// ─── p5.js lifecycle ──────────────────────────────────────────────────────────
let weightSlider;

function setup() {
  createCanvas(1400, 340);
  pixelDensity(2);

  weightSlider = createSlider(1, 900, 200, 1);
  weightSlider.position(20, height + 14);
  weightSlider.style('width', (width - 40) + 'px');
  weightSlider.input(() => redraw());
}

function draw() {
  background(0);

  const w = weightSlider.value(); // 1...900
  let DISPLAY_SIZE = 56; 
  let trk = 0; // tracking
  let byp = false; // bypass weight
  let rnd = true; // rounded
  
  stroke('white'); 
  drawLeon("ABCDEFGHIJKLMNOPQRSTUVWXYZ", 280, 60, DISPLAY_SIZE, w, trk, byp, rnd);
  drawLeon("abcdefghijklmnopqrstuvwxyz 0123456789", 280, 140, DISPLAY_SIZE, w, trk, byp, rnd);
  drawLeon("*&+${}()/[]^=-!.,<>'#_:;@%?~\"", 280, 220, DISPLAY_SIZE, w, trk, byp, rnd);

  stroke('gray');
  drawLeon("&", 50, 40, 280, w, 0, false, rnd);
  stroke('white');
  drawLeon("&", 50, 40, 280, w, 0, true, rnd);

  /*
  // Sample each stroke of the big '&' at e.g. 30% and draw a red dot.
  const pts = getLeonGlyphPathPoints('&', 50, 40, 280, w, mouseY/height);
  noStroke();
  fill('red');
  for (const pt of pts) {
    circle(pt.x, pt.y, 10);
  }
  */
}

//==============================================================================
// LEON SANS
// ─── Weight & scale constants (mirrored from src/core/util.js) ───────────────
const MIN_FONT_WEIGHT  = 1;
const MAX_FONT_WEIGHT  = 900;
const MAX_LINE_WIDTH   = 70;
const FONT_WEIGHT_LIMIT = 80;
const FR_1             = 1;      // font-ratio at thin weight
const FR_2             = 0.78;   // font-ratio at bold weight (slight compression)
const DEFAULT_FONT_SIZE = 500;   // design reference size
const RECT_RATIO       = 0.49;   // advance-width / design-unit conversion factor

// ─── Weight formula functions (from src/core/util.js) ────────────────────────

// Maps weight (1–900) → fontW (1–70), the internal stroke-width unit.
function getFontW(weight) {
  return (MAX_LINE_WIDTH - MIN_FONT_WEIGHT) / (MAX_FONT_WEIGHT - MIN_FONT_WEIGHT)
         * (weight - MIN_FONT_WEIGHT) + MIN_FONT_WEIGHT;
}

// Maps fontW → weightRatio (0–~0.86); drives Bezier control-point blending.
function getWeightRatio(fontW) {
  return fontW / (FONT_WEIGHT_LIMIT - MIN_FONT_WEIGHT);
}

// Maps fontW → arc-cap radius (4–58 design units).
function getCircleRound(fontW) {
  return (58 - 4) / (FONT_WEIGHT_LIMIT - MIN_FONT_WEIGHT) * (fontW - MIN_FONT_WEIGHT) + 4;
}

// Maps size (px) → scale factor relative to the 500-unit design grid.
function getLeoScale(size) { return size / DEFAULT_FONT_SIZE; }

// Maps weightRatio → slight horizontal compression at heavy weights.
function getFontRatio(wr) { return (FR_2 - FR_1) * wr + FR_1; }

// Canvas stroke width from fontW and scale.
function getLeoLineW(fontW, scale) { return Math.max(1, fontW * scale); }

// ─── Coordinate conversion (from src/core/vector.js) ─────────────────────────
// Each glyph vertex carries per-axis ratio values (v.ratio.x, v.ratio.y) that
// control how strongly that vertex responds to weight changes.  Vertices with
// ratio.x = 0 don't move horizontally as weight increases; ratio.x = 1 is full
// movement.  This is what makes the Bezier geometry morph with weight.

function cvtX(x, ratioX, range, scale, cx) {
  const rr = range.r  * ratioX;
  const gx = (range.gx2 - range.gx1) * rr + range.gx1;
  const fr = (range.fr2 - range.fr1) * rr + range.fr1;
  return cx + (x - gx) * scale * fr;
}

function cvtY(y, ratioY, range, scale, cy) {
  const rr = range.r  * ratioY;
  const gy = (range.gy2 - range.gy1) * rr + range.gy1;
  const fr = (range.fr2 - range.fr1) * rr + range.fr1;
  return cy + (y - gy) * scale * fr;
}

// ─── Cap-inset helpers ───────────────────────────────────────────────────────
// When roundCaps is true, each open stroke endpoint must be pulled inward by
// lineW/2 so the tip of the round endcap lands where the square cap would have.
// These helpers implement that trimming via arc-length walking + De Casteljau.

// Find Bezier parameter t such that arc-length from t=0 to t ≈ targetLen.
// For lines this is exact; for cubics a 20-step chord table is used.
function _tAtDist(seg, targetLen) {
  if (seg.type === 'l') {
    const d = Math.sqrt((seg.x2-seg.x1)**2 + (seg.y2-seg.y1)**2);
    return d > 0 ? Math.max(0, Math.min(1, targetLen / d)) : 0;
  }
  const STEPS = 20;
  let px = seg.x1, py = seg.y1, cum = 0;
  for (let i = 1; i <= STEPS; i++) {
    const u  = i / STEPS;
    const qx = bezierPoint(seg.x1, seg.x2, seg.x3, seg.x4, u);
    const qy = bezierPoint(seg.y1, seg.y2, seg.y3, seg.y4, u);
    const d  = Math.sqrt((qx-px)**2 + (qy-py)**2);
    if (cum + d >= targetLen) {
      const frac = d > 0 ? (targetLen - cum) / d : 0;
      return (i - 1 + frac) / STEPS;
    }
    cum += d; px = qx; py = qy;
  }
  return 1;
}

// De Casteljau: return the [startT, 1] portion of a segment.
function _segTrimFrom(seg, t) {
  if (t <= 0) return seg;
  if (seg.type === 'l') {
    return { type: 'l',
      x1: lerp(seg.x1, seg.x2, t), y1: lerp(seg.y1, seg.y2, t),
      x2: seg.x2, y2: seg.y2 };
  }
  const ax = lerp(seg.x1, seg.x2, t), ay = lerp(seg.y1, seg.y2, t); // P01
  const bx = lerp(seg.x2, seg.x3, t), by = lerp(seg.y2, seg.y3, t); // P12
  const cx = lerp(seg.x3, seg.x4, t), cy = lerp(seg.y3, seg.y4, t); // P23
  const dx = lerp(ax, bx, t),         dy = lerp(ay, by, t);          // P012
  const ex = lerp(bx, cx, t),         ey = lerp(by, cy, t);          // P123
  const fx = lerp(dx, ex, t),         fy = lerp(dy, ey, t);          // B(t)
  return { type: 'b', x1: fx, y1: fy, x2: ex, y2: ey, x3: cx, y3: cy, x4: seg.x4, y4: seg.y4 };
}

// De Casteljau: return the [0, endT] portion of a segment.
function _segTrimTo(seg, t) {
  if (t >= 1) return seg;
  if (seg.type === 'l') {
    return { type: 'l',
      x1: seg.x1, y1: seg.y1,
      x2: lerp(seg.x1, seg.x2, t), y2: lerp(seg.y1, seg.y2, t) };
  }
  const ax = lerp(seg.x1, seg.x2, t), ay = lerp(seg.y1, seg.y2, t); // P01
  const bx = lerp(seg.x2, seg.x3, t), by = lerp(seg.y2, seg.y3, t); // P12
  const cx = lerp(seg.x3, seg.x4, t), cy = lerp(seg.y3, seg.y4, t); // P23
  const dx = lerp(ax, bx, t),         dy = lerp(ay, by, t);          // P012
  const ex = lerp(bx, cx, t),         ey = lerp(by, cy, t);          // P123
  const fx = lerp(dx, ex, t),         fy = lerp(dy, ey, t);          // B(t)
  return { type: 'b', x1: seg.x1, y1: seg.y1, x2: ax, y2: ay, x3: dx, y3: dy, x4: fx, y4: fy };
}

// Trim `inset` pixels from both ends of a segment array via arc-length walking.
function _insetSegs(segs, inset) {
  let s = [...segs];
  let lens = s.map(seg => _leonSegLen(seg));
  const total = lens.reduce((a, b) => a + b, 0);
  if (total <= 2 * inset) return s;  // path too short — leave untouched

  // Trim start: walk `inset` px from the beginning.
  let rem = inset, i = 0;
  while (i < s.length - 1 && rem > lens[i]) { rem -= lens[i++]; }
  s[i] = _segTrimFrom(s[i], _tAtDist(s[i], rem));
  s = s.slice(i);

  // Trim end: walk `inset` px back from the new end.
  lens = s.map(seg => _leonSegLen(seg));
  const total2 = lens.reduce((a, b) => a + b, 0);
  const endTarget = total2 - inset;
  let cum = 0, j = 0;
  while (j < s.length - 1 && cum + lens[j] < endTarget) { cum += lens[j++]; }
  s[j] = _segTrimTo(s[j], _tAtDist(s[j], endTarget - cum));
  return s.slice(0, j + 1);
}

// Draw a pre-built segment array as a single open p5.js shape.
function _drawSegs(segs) {
  if (segs.length === 0) return;
  beginShape();
  vertex(segs[0].x1, segs[0].y1);
  for (const seg of segs) {
    if (seg.type === 'l') vertex(seg.x2, seg.y2);
    else                  bezierVertex(seg.x2, seg.y2, seg.x3, seg.y3, seg.x4, seg.y4);
  }
  endShape();
}

// ─── Glyph rendering ─────────────────────────────────────────────────────────
// Draws one LeonSans glyph at top-left position (charX, charY).
// capInset > 0 trims open stroke endpoints inward for round-cap compensation.
function drawLeonGlyph(t, charX, charY, range, scale, fontRatio, circleRound, capInset = 0) {
  const rectW = t.rect.w * RECT_RATIO * scale;
  const rectH = (t.rect.h + 220) * RECT_RATIO * scale;
  const cx = charX + rectW / 2;
  const cy = charY + (rectH - (220 - 90) * RECT_RATIO * scale) / 2;

  for (const path of t.p) {
    // Closed loops have no free endpoints — no cap overshoot to correct.
    // Paths containing 'a' arc-caps handle their own termination geometry.
    const isClosed = path.v.some(v => v.ratio.c);
    const hasArc   = path.v.some(v => v.type === 'a');
    const doInset  = capInset > 0 && !isClosed && !hasArc;

    let segs = [], prevX = 0, prevY = 0;

    const flushSegs = () => {
      if (segs.length === 0) return;
      let shouldInset = doInset;
      if (shouldInset) {
        // Geometric closure fallback: some loops (e.g. 'D') lack ratio.c but
        // return exactly to their 'm' anchor. Check last endpoint vs first anchor.
        const last = segs[segs.length - 1];
        const endX = last.type === 'l' ? last.x2 : last.x4;
        const endY = last.type === 'l' ? last.y2 : last.y4;
        if (Math.hypot(endX - segs[0].x1, endY - segs[0].y1) < 0.5) {
          shouldInset = false;
        }
      }
      _drawSegs(shouldInset ? _insetSegs(segs, capInset) : segs);
      segs = [];
    };

    for (const v of path.v) {
      const rx = v.ratio.x, ry = v.ratio.y;

      if (v.type === 'a') {
        flushSegs();
        const ax = cvtX(v.x, rx, range, scale, cx);
        const ay = cvtY(v.y, ry, range, scale, cy);
        const r  = Math.max(0.5, circleRound * scale * fontRatio);
        push(); strokeCap(ROUND); 
        strokeWeight(r * 2); point(ax, ay); pop();

      } else if (v.type === 'm') {
        flushSegs();
        prevX = cvtX(v.x, rx, range, scale, cx);
        prevY = cvtY(v.y, ry, range, scale, cy);

      } else if (v.type === 'l') {
        const lx = cvtX(v.x, rx, range, scale, cx);
        const ly = cvtY(v.y, ry, range, scale, cy);
        segs.push({ type: 'l', x1: prevX, y1: prevY, x2: lx, y2: ly });
        prevX = lx; prevY = ly;

      } else if (v.type === 'b') {
        // Cubic Bezier: v.x/y = cp1,  v.x2/y2 = cp2,  v.x3/y3 = endpoint.
        const bx1 = cvtX(v.x,  rx, range, scale, cx), by1 = cvtY(v.y,  ry, range, scale, cy);
        const bx2 = cvtX(v.x2, rx, range, scale, cx), by2 = cvtY(v.y2, ry, range, scale, cy);
        const bx3 = cvtX(v.x3, rx, range, scale, cx), by3 = cvtY(v.y3, ry, range, scale, cy);
        segs.push({ type: 'b', x1: prevX, y1: prevY, x2: bx1, y2: by1, x3: bx2, y3: by2, x4: bx3, y4: by3 });
        prevX = bx3; prevY = by3;
      }
    }
    flushSegs();
  }
}

// ─── String layout + rendering ────────────────────────────────────────────────
// Renders a string at (x, y) with the given size and LeonSans weight (1–900).
// tracking adjusts inter-character spacing (0 = default, positive = wider).
function drawLeon(str, x, y, size, weight, tracking = 0, bypassW = false, roundCaps = false) {
  const fontW       = getFontW(weight);
  const weightRatio = getWeightRatio(fontW);
  const circleRound = getCircleRound(fontW);
  const scale       = getLeoScale(size);
  const fontRatio   = getFontRatio(weightRatio);
  const trackingPx  = tracking * 50 * scale;
  const lineW       = getLeoLineW(fontW, scale);

  strokeWeight(bypassW ? 1 : lineW);
  strokeCap(roundCaps ? ROUND : SQUARE);
  strokeJoin(roundCaps ? ROUND : MITER); 
  noFill();

  // When round caps are active (and not in spine/bypassW mode), pull each open
  // stroke endpoint inward by lineW/2 so the semicircular cap tip lands exactly
  // where the square cap endpoint was.
  const capInset = (roundCaps /*&& !bypassW */) ? lineW / 2 : 0;

  let curX = x;
  for (const ch of str) {
    const t = LEON_FONT[ch] || LEON_FONT['tofu'];
    const range = {
      r:   weightRatio,
      cr:  circleRound,
      fr1: FR_1,
      fr2: FR_2,
      gx1: t.ratio.x1,
      gx2: t.ratio.x2,
      gy1: t.ratio.y1,
      gy2: t.ratio.y2,
    };
    drawLeonGlyph(t, curX, y, range, scale, fontRatio, circleRound, capInset);
    curX += t.rect.w * RECT_RATIO * scale + trackingPx;
  }
}

// Returns the total pixel width of a string at the given size.
function leonStringWidth(str, size) {
  const scale = getLeoScale(size);
  let w = 0;
  for (const ch of str) {
    const t = LEON_FONT[ch] || LEON_FONT['tofu'];
    w += t.rect.w * RECT_RATIO * scale;
  }
  return w;
}

// ─── Glyph path-point sampling ────────────────────────────────────────────────
// Arc-length of one segment (screen-space coordinates already converted).
// 'l' segments are exact; 'b' cubic Beziers are integrated numerically using
// p5's bezierPoint(), matching the approach in leonsans_source/src/core/length.js.
function _leonSegLen(seg) {
  if (seg.type === 'l') {
    const dx = seg.x2 - seg.x1, dy = seg.y2 - seg.y1;
    return Math.sqrt(dx * dx + dy * dy);
  }
  // Bezier: sum chord lengths across STEPS sub-intervals.
  const STEPS = 20;
  let len = 0, px = seg.x1, py = seg.y1;
  for (let i = 1; i <= STEPS; i++) {
    const u  = i / STEPS;
    const qx = bezierPoint(seg.x1, seg.x2, seg.x3, seg.x4, u);
    const qy = bezierPoint(seg.y1, seg.y2, seg.y3, seg.y4, u);
    const dx = qx - px, dy = qy - py;
    len += Math.sqrt(dx * dx + dy * dy);
    px = qx; py = qy;
  }
  return len;
}

// Sample segment at arc-length parameter u ∈ [0, 1].
// Note: u here is the Bezier curve parameter t, not a true arc-length fraction,
// but the difference is negligible given that _leonSegLen already normalises the
// distribution across segments by total arc-length.
function _leonSegSample(seg, u) {
  if (seg.type === 'l') {
    return { x: lerp(seg.x1, seg.x2, u), y: lerp(seg.y1, seg.y2, u) };
  }
  return {
    x: bezierPoint(seg.x1, seg.x2, seg.x3, seg.x4, u),
    y: bezierPoint(seg.y1, seg.y2, seg.y3, seg.y4, u),
  };
}

// Returns an array of {x, y} points — one per stroke path in the glyph —
// each sampled at `percent` (0.0–1.0) of the way along that stroke's arc length.
// Arguments mirror drawLeon: charX/charY is the top-left cell position,
// size and weight are the same values passed to drawLeon.
function getLeonGlyphPathPoints(ch, charX, charY, size, weight, percent) {
  const fontW       = getFontW(weight);
  const weightRatio = getWeightRatio(fontW);
  const circleRound = getCircleRound(fontW);
  const scale       = getLeoScale(size);
  const fontRatio   = getFontRatio(weightRatio);

  const t = LEON_FONT[ch] || LEON_FONT['tofu'];
  const range = {
    r:   weightRatio,
    cr:  circleRound,
    fr1: FR_1,  fr2: FR_2,
    gx1: t.ratio.x1, gx2: t.ratio.x2,
    gy1: t.ratio.y1, gy2: t.ratio.y2,
  };

  const rectW = t.rect.w * RECT_RATIO * scale;
  const rectH = (t.rect.h + 220) * RECT_RATIO * scale;
  const cx = charX + rectW / 2;
  const cy = charY + (rectH - (220 - 90) * RECT_RATIO * scale) / 2;

  const result = [];

  for (const path of t.p) {
    // Convert path vertices into screen-space segments, skipping 'a' arc caps.
    const segs = [];
    let prevX = 0, prevY = 0;
    for (const v of path.v) {
      const rx = v.ratio.x, ry = v.ratio.y;
      if (v.type === 'm') {
        prevX = cvtX(v.x, rx, range, scale, cx);
        prevY = cvtY(v.y, ry, range, scale, cy);
      } else if (v.type === 'l') {
        const lx = cvtX(v.x, rx, range, scale, cx);
        const ly = cvtY(v.y, ry, range, scale, cy);
        segs.push({ type: 'l', x1: prevX, y1: prevY, x2: lx, y2: ly });
        prevX = lx; prevY = ly;
      } else if (v.type === 'b') {
        // Segment stored as: x1/y1 = start (anchor),
        //   x2/y2 = cp1, x3/y3 = cp2, x4/y4 = end — matching bezierPoint() arg order.
        const bx1 = cvtX(v.x,  rx, range, scale, cx), by1 = cvtY(v.y,  ry, range, scale, cy);
        const bx2 = cvtX(v.x2, rx, range, scale, cx), by2 = cvtY(v.y2, ry, range, scale, cy);
        const bx3 = cvtX(v.x3, rx, range, scale, cx), by3 = cvtY(v.y3, ry, range, scale, cy);
        segs.push({ type: 'b', x1: prevX, y1: prevY, x2: bx1, y2: by1, x3: bx2, y3: by2, x4: bx3, y4: by3 });
        prevX = bx3; prevY = by3;
      }
      // 'a' arc caps are single-point terminals — not traversable segments.
    }
    if (segs.length === 0) continue;

    // Compute per-segment arc-lengths and the cumulative total.
    const lens  = segs.map(s => _leonSegLen(s));
    const total = lens.reduce((a, b) => a + b, 0);
    if (total === 0) continue;

    // Walk `percent * total` along the segment chain.
    let remaining = Math.max(0, Math.min(1, percent)) * total;
    let pt = null;
    for (let i = 0; i < segs.length; i++) {
      if (i === segs.length - 1 || remaining <= lens[i]) {
        const u = lens[i] > 0 ? Math.max(0, Math.min(1, remaining / lens[i])) : 0;
        pt = _leonSegSample(segs[i], u);
        break;
      }
      remaining -= lens[i];
    }
    if (pt) result.push(pt);
  }
  return result;
}

