// Licia He's DearPlotter single-line font — p5.js adaptation
// Original: DearPlotter Font Generator, by Licia He, 2026
// https://www.eyesofpanda.com/project/dearplotter_font/
// Adaptation by Golan Levin, 2026. 
// Font data is in fontData.js.

// ─── p5.js lifecycle ─────────────────────────────────────────────────────────
function setup() {
  buildGlyphData();
  createCanvas(1024, 360);
  pixelDensity(2);
  // noLoop();
}

function draw() {
  background(0);
  stroke(255);
  strokeWeight(1);
  strokeCap(ROUND);
  strokeJoin(ROUND);
  noFill();

  const siz = 50;  // cell height in screen pixels
  let tx = 50; 
  let ty = -25; 
  let dy = 75; 
  let trk = 8; // tracking
  drawString("ABCDEFGHIJKLMNOPQRSTUVWXYZ", tx, ty+=dy, siz, trk);
  drawString("abcdefghijklmnopqrstuvwxyz", tx, ty+=dy, siz, trk);
  drawString("Hello World - 0123456789", tx, ty+=dy, siz, trk);
  drawString('!"#$%&\'()*+,-./:;<=>?@[\\]^_`{|}~', tx, ty+=dy, siz);
  
}

function keyPressed() {
  if (key === 's') save('licia_he_font.png');
}


//=============================================================================
// Font data is in fontData.js, which exposes LICIA_FONT (the result of
// calling hn() with default parameters: full_dist=4, half_cutting_dist=2.5,
// quarter_dist=1.15, dot_length=0.25).
//
// Grid system: col_ct=4, row_ct=8, unit_size=25px per grid unit.
// Each glyph lives in a 100×200 px cell (4×8 grid units), Y-down.
//
// Stroke types:
//   "s" — straight line: [start, end] as grid points
//   "h" — horizontal arc: cubic bezier, control points obtained by rotating
//          [s[0]-dist, s[1]] and [e[0]-dist_e, e[1]] around their respective
//          endpoints by ±90°  (dir "c" = +90°, "cc" = -90°)
//   "v" — vertical arc: same logic but [s[0], s[1]-dist] and [e[0], e[1]-dist_e]
//
// v_trans_specs: optional Y-axis transformations applied after grid→pixel:
//   "stretch"   — scale all strokes in Y from center=[50,100] so that the
//                 Y-range of the indexed strokes matches the target metric
//   "translate" — shift all strokes in Y so the max (or min) Y of the indexed
//                 strokes aligns with the target metric
//
// Metrics (pixel coords, Y-down):
//   x_height   = 100 px  (lowercase body height, rows 2–6)
//   base_y     = 150 px  (baseline, row 6)
//   cap_height = 150 px  (same as base_y)
//   ascender_y = 0   px  (top of tallest caps/ascenders)

// ─── font parameters (exposed so you can tweak them) ─────────────────────────
const UNIT       = 25;     // px per grid unit (at 1:1 scale)
const ROW_CT     = 8;      // rows in the cell grid
const CENTER_PX  = [50, 100]; // center of the cell in pixel coords

// Metric targets (in pixel coords, Y-down, at unit_size=25)
const METRICS = {
  x_height    :  4 * UNIT,   //  100px — lowercase x-height
  base_y      :  6 * UNIT,   //  150px — baseline
  cap_height  :  6 * UNIT,   //  150px — cap height (same as baseline in this font)
  descendent_y:  8 * UNIT,   //  200px — descender line
  ascender_y  :  0,          //    0px — top of ascenders
  center      : CENTER_PX,
};

// ─── geometry helpers ─────────────────────────────────────────────────────────
// Rotate point [px, py] around [cx, cy] by deg degrees (multiples of 90 only).
function rotatePt(cx, cy, px, py, deg) {
  const o = px - cx, u = py - cy;
  let l, c;
  deg = ((deg % 360) + 360) % 360;
  if      (deg ===   0) { l =  o; c =  u; }
  else if (deg ===  90) { l = -u; c =  o; }
  else if (deg === 180) { l = -o; c = -u; }
  else                  { l =  u; c = -o; } // 270°
  return [cx + l, cy + c];
}

// ─── stroke → bezier control points ──────────────────────────────────────────
// Convert one stroke definition to pixel-space control points.
// Returns { type:'s', pts:[[x0,y0],[x1,y1]] }
//      or { type:'b', pts:[[x0,y0],[cx1,cy1],[cx2,cy2],[x3,y3]] }
function strokeToCtrlPts(st) {
  const s = st.s, a = st.e;
  const S = [s[0] * UNIT, s[1] * UNIT];
  const A = [a[0] * UNIT, a[1] * UNIT];

  if (st.type === 's') {
    return { type: 's', pts: [S, A] };
  }

  const dist  = st.dist;
  const distE = ('dist_e' in st) ? st.dist_e : dist;
  // "c" = clockwise = +90°; anything else ("cc", "cC", …) = -90°
  const deg = (st.dir === 'c') ? 90 : -90;

  let ctrl1, ctrl2;
  if (st.type === 'h') {
    ctrl1 = rotatePt(s[0], s[1], s[0] - dist,  s[1],         deg);
    ctrl2 = rotatePt(a[0], a[1], a[0] - distE, a[1],         deg);
  } else { // 'v'
    ctrl1 = rotatePt(s[0], s[1], s[0],          s[1] - dist,  deg);
    ctrl2 = rotatePt(a[0], a[1], a[0],          a[1] - distE, deg);
  }

  return {
    type: 'b',
    pts: [S,
          [ctrl1[0] * UNIT, ctrl1[1] * UNIT],
          [ctrl2[0] * UNIT, ctrl2[1] * UNIT],
          A]
  };
}

// ─── v_trans_specs ────────────────────────────────────────────────────────────
// Compute the actual y-extremes of a cubic bezier from its 4 control points.
// The bezier control handles overshoot the curve, so we must find the true min/max
// analytically via the derivative, not just take min/max of the 4 stored points.
function bezierYBounds(pts) {
  const y0 = pts[0][1], y1 = pts[1][1], y2 = pts[2][1], y3 = pts[3][1];
  let lo = Math.min(y0, y3), hi = Math.max(y0, y3);

  // B'(t)/3 = A(1-t)^2 + 2Bt(1-t) + Ct^2  where A=y1-y0, B=y2-y1, C=y3-y2
  // Setting to 0 gives quadratic: qa*t^2 + qb*t + qc = 0
  const A = y1-y0, B = y2-y1, C = y3-y2;
  const qa = A - 2*B + C, qb = 2*(B - A), qc = A;

  const evalAt = t => {
    const mt = 1-t;
    return mt*mt*mt*y0 + 3*t*mt*mt*y1 + 3*t*t*mt*y2 + t*t*t*y3;
  };
  const check = t => {
    if (t > 0 && t < 1) { const y = evalAt(t); lo = Math.min(lo,y); hi = Math.max(hi,y); }
  };

  if (Math.abs(qa) < 1e-12) {
    if (Math.abs(qb) > 1e-12) check(-qc / qb);
  } else {
    const disc = qb*qb - 4*qa*qc;
    if (disc >= 0) {
      const sq = Math.sqrt(disc);
      check((-qb + sq) / (2*qa));
      check((-qb - sq) / (2*qa));
    }
  }
  return [lo, hi];
}

// Apply the v_trans_specs pipeline to a flat array of {type, pts} segments.
// specs: array of { type:"stretch"|"translate", idx, target, alignment? }
// Returns a new array with the same structure but transformed Y coordinates.
function applyVTransSpecs(specs, segs) {
  // Work on mutable copies of point arrays
  let ptArrays = segs.map(seg => seg.pts.map(p => [p[0], p[1]]));

  for (const spec of specs) {
    // Find the actual Y-range of the indexed strokes.
    // For bezier segments we must use the on-curve extrema, not the control
    // point handles, because handles overshoot the real curve extent.
    let yMin = Infinity, yMax = -Infinity;
    for (const idx of spec.idx) {
      const pts = ptArrays[idx];
      if (pts.length === 2) {
        // Straight segment: endpoints are the extrema
        for (const [, y] of pts) { yMin = Math.min(yMin, y); yMax = Math.max(yMax, y); }
      } else {
        // Bezier: find actual on-curve y extrema via derivative
        const [lo, hi] = bezierYBounds(pts);
        yMin = Math.min(yMin, lo); yMax = Math.max(yMax, hi);
      }
    }

    if (spec.type === 'stretch') {
      const ySpan = yMax - yMin;
      if (ySpan <= 0) continue;
      const target = METRICS[spec.target];
      const sy = target / ySpan;
      const cy = CENTER_PX[1];
      // Apply to ALL strokes (not just indexed ones)
      ptArrays = ptArrays.map(pts =>
        pts.map(([x, y]) => [x, y * sy + (1 - sy) * cy])
      );

    } else if (spec.type === 'translate') {
      const refY = (spec.alignment === 'max') ? yMax : yMin;
      const dy   = METRICS[spec.target] - refY;
      // Apply to ALL strokes
      ptArrays = ptArrays.map(pts =>
        pts.map(([x, y]) => [x, y + dy])
      );
    }
  }

  return segs.map((seg, i) => ({ type: seg.type, pts: ptArrays[i] }));
}

// ─── glyph pre-processing ─────────────────────────────────────────────────────
// Pre-processed glyphs: map from character → { groups, advanceW }
// groups: array of stroke groups, each group = array of { type, pts } segments
// advanceW: advance width in pixels (at unit_size=25 scale)
let GLYPHS = {};

function buildGlyphData() {
  for (const [ch, def] of Object.entries(LICIA_FONT)) {
    // 1. Convert each stroke to pixel-space control points
    const rawSegs = def.st.map(strokeToCtrlPts);

    // 2. Apply vertical transformations (if any)
    const segs = (def.v_trans_specs && def.v_trans_specs.length > 0)
      ? applyVTransSpecs(def.v_trans_specs, rawSegs)
      : rawSegs;

    // 3. Reconstruct stroke groups (st_g gives indices into segs)
    const groups = def.st_g.map(indices => indices.map(i => segs[i]));

    // 4. Advance width: use c * UNIT, fall back to actual max-x when strokes
    //    exceed the nominal cell (e.g. 'w'/'W' whose strokes reach x=6).
    //    rs = right-spacing adjustment in grid units (can be negative).
    const maxStrokeX = segs.reduce((mx, seg) =>
      seg.pts.reduce((m, [x]) => Math.max(m, x), mx), 0);
    const advanceW = Math.max(def.c * UNIT, maxStrokeX + UNIT * 0.5)
                     + (def.rs || 0) * UNIT;

    GLYPHS[ch] = { groups, advanceW };
  }
}

// ─── drawing ──────────────────────────────────────────────────────────────────
// Draw one glyph.
// ch:    character string
// ox,oy: top-left corner of the character cell in screen pixels
// cellH: cell height in screen pixels (200px cell at 1:1 scale)
// Returns the advance width in screen pixels.
function drawGlyph(ch, ox, oy, cellH) {
  const g = GLYPHS[ch] || GLYPHS[ch.toString()];
  if (!g) return cellH * UNIT / ROW_CT; // fallback advance

  const scale = cellH / (ROW_CT * UNIT); // cellH / 200

  for (const group of g.groups) {
    if (group.length === 0) continue;

    beginShape();
    // Anchor: first point of first segment
    const [ax, ay] = group[0].pts[0];
    vertex(ox + ax * scale, oy + ay * scale);

    for (const seg of group) {
      if (seg.type === 's') {
        const [x1, y1] = seg.pts[1];
        vertex(ox + x1 * scale, oy + y1 * scale);
      } else { // 'b' — cubic bezier
        const [, [cx1, cy1], [cx2, cy2], [x3, y3]] = seg.pts;
        bezierVertex(
          ox + cx1 * scale, oy + cy1 * scale,
          ox + cx2 * scale, oy + cy2 * scale,
          ox + x3  * scale, oy + y3  * scale
        );
      }
    }
    endShape();
  }

  return g.advanceW * scale;
}

// Draw a string of characters, left-to-right.
// str:      text to render
// x, y:     top-left of the first character cell
// cellH:    cell height in pixels
// tracking: extra pixels added to each character's advance (default 0)
function drawString(str, x, y, cellH, tracking = 0) {
  let cx = x;
  const scale = cellH / (ROW_CT * UNIT);
  for (const ch of str) {
    if (ch === ' ') {
      cx += (2.5 * UNIT + tracking) * scale;
    } else {
      cx += drawGlyph(ch, cx, y, cellH) + tracking * scale;
    }
  }
}
