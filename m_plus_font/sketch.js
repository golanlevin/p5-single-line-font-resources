// M+ Single-Stroke Font — p5.js adaptation
// Original font data: mplus_stroke.svg, designed by Coji Morishita
// From https://domisan.sakura.ne.jp/article/cadfont/cadfont.html
// Font data is in mPlusFontData.js, 
// which exposes MPLUS_FONT keyed by UTF-16 hex codepoints.
//
// Coordinate system: each glyph lives in a 100×100 cell, Y-down.
// SVG commands: M (moveto), L (lineto), C (cubic bezier) — all absolute.
// Each M starts a new stroke; there is no explicit advance-width, 
// all chars use cellSize.

const CELL = 20;    // cell size in pixels
const COLS = 80;    // characters per row
const PAD  = 10;    // padding on each edge

function setup() {
  const chars = Object.keys(MPLUS_FONT);
  const rows = Math.ceil(chars.length / COLS);
  createCanvas(COLS * CELL + PAD * 2, (rows + 1) * CELL + PAD * 2);
  pixelDensity(2);
  noLoop();
}

function draw() {
  background(0);
  stroke(255);
  strokeWeight(0.8);
  strokeCap(ROUND);
  noFill();

  // ── Demo row
  // Hiragana: おはよう世界 ("Good Morning World" — ん unavailable)
  drawString('おはよう世界',   PAD +  0 * CELL, PAD, CELL);
  // Katakana: コンニチハ世界 (phonetic "Konnichiha World")
  drawString('コンニチハ世界', PAD +  9 * CELL, PAD, CELL);
  // Chinese:  大家好世界 ("Everyone Hello World" — 你 unavailable)
  drawString('大家好世界',     PAD + 19 * CELL, PAD, CELL);

  // ── Full glyph grid (shifted down one row)
  const chars = Object.keys(MPLUS_FONT);
  for (let i = 0; i < chars.length; i++) {
    const co = i % COLS;
    const ro = Math.floor(i / COLS);
    const ch = String.fromCodePoint(parseInt(chars[i], 16));
    drawGlyph(ch, PAD + co * CELL, PAD + CELL + ro * CELL, CELL-1);
  }
}

function keyPressed() {
  if (key === 's') save('mplus_font.png');
}


// ─── rendering
// Draw one glyph.
// ch:       character string
// ox, oy:   top-left corner of the cell in screen pixels
// cellSize: cell width and height in screen pixels (glyph coords are 0–100)
function drawGlyph(ch, ox, oy, cellSize) {
  const cp = ch.codePointAt(0).toString(16).toLowerCase();
  const d = MPLUS_FONT[cp];
  if (!d) return;

  const scale = cellSize / 100;
  // Split on M/L/C tokens (all absolute, no lowercase in this font)
  const commands = d.match(/[MLC][^MLC]*/g);
  if (!commands) return;

  let inShape = false;
  for (const cmd of commands) {
    const type = cmd[0];
    const nums = cmd.slice(1).trim().split(/[\s,]+/).map(parseFloat);

    if (type === 'M') {
      if (inShape) endShape();
      beginShape();
      vertex(ox + nums[0] * scale, oy + nums[1] * scale);
      inShape = true;
    } else if (type === 'L') {
      vertex(ox + nums[0] * scale, oy + nums[1] * scale);
    } else if (type === 'C') {
      bezierVertex(
        ox + nums[0] * scale, oy + nums[1] * scale,
        ox + nums[2] * scale, oy + nums[3] * scale,
        ox + nums[4] * scale, oy + nums[5] * scale
      );
    }
  }
  if (inShape) endShape();
}

// Draw a string of characters, left-to-right.
// All characters have equal advance width (cellSize), plus optional tracking.
function drawString(str, x, y, cellSize, tracking = 0) {
  let cx = x;
  for (const ch of str) {
    drawGlyph(ch, cx, y, cellSize);
    cx += cellSize + tracking;
  }
}
