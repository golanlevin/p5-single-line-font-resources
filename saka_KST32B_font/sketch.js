// KST32B Single-Line Japanese Font (Kanji Stroke Table)
// Font data: KST32B by Saka.N, modeled after JIS kanji
// Original p5.js port: Kitasenju
//   https://kitasenjudesign.com/tool/01/ 
//   https://x.com/hsgn/status/1413826984413704195
//   https://www.vector.co.jp/soft/data/writing/se119277.html
//   https://www.vector.co.jp/download/file/data/writing/fh691397.html 
// p5.js adaptation by Golan Levin, 2026
//
// Font data is loaded from fontData.h.txt (4125 characters).
// Each line has the form:
//   const int fontXXXX[] = {0xHH, 0xHH, ...};//[char]
// where XXXX is the JIS X 0208 address in hex, and the bytes
// encode drawing commands on a 29-wide × 31-tall integer grid.
//
// Byte command encoding (from LineFont.js by Kitasenju):
//   0x20        : Terminator / reset (curX = curY = nextX = 0)
//   0x21–0x26   : moveX  →  curX = byte - 0x21          (X = 0–5)
//   0x28–0x3F   : moveX  →  curX = byte - 0x28 + 5      (X = 5–28)
//   0x40–0x5B   : drawX  →  horizontal line to X = byte - 0x40  (X = 0–27)
//   0x5E–0x5F   : drawX  →  horizontal line to X = byte - 0x5E + 27 (X = 27–28)
//   0x60–0x7D   : nextX  →  nextX = byte - 0x60         (nextX = 0–29)
//   0x7E        : moveY  →  curY = 0
//   0xA1–0xBF   : moveY  →  curY = byte - 0xA1          (Y = 0–30)
//   0xC0–0xDF   : drawY  →  diagonal/vertical line from (curX, curY)
//                           to (nextX, Y), where Y = byte - 0xC0
//   (0x27, 0x5C–0x5D are reserved and silently ignored)
//
// Coordinate system: X = 0–28 (left→right), Y = 0–30 (bottom→top).
// Scale: sx = cellW / 28,  sy = cellH / 30.
// Origin: ox = cell left edge,  oy = cell bottom edge. 

// ─── globals ────────────────────────────────────────────────────────────────

let rawLines;      // string array from loadStrings()
let fontMap;       // Map: Unicode codepoint (int) → byte array (chars with //[char] comment)
let jisMap;        // Map: JIS X 0208 code (int) → byte array (all 4125 chars, including the
                   //  ~480 whose //[] comment is empty and have no known Unicode equivalent)
let sortedCPs;     // sorted Unicode codepoints (for fontMap; used by drawString)
let sortedJIS;     // sorted JIS codes (all 4125 glyphs; used by the grid display)

const COLS = 64;   // characters per row in the grid display
const CELL = 18;   // pixel size of each character cell (square)

// ─── p5.js lifecycle ────────────────────────────────────────────────────────
function preload() {
  rawLines = loadStrings('fontData.h.txt');
}

function setup() {
  buildKSTFontMap(); 
  createCanvas(1200, 1280);
  pixelDensity(2);
  noLoop();
}

function draw() {
  background(0);
  stroke(255);
  strokeWeight(0.75);
  strokeCap(ROUND);
  noFill();

  // drawString() and drawGlyph() use the Unicode-keyed fontMap, 
  // so typing characters direcly works normally
  drawString("Hello World",        25,32, 21, 0.65); // English
  drawString("ハロー・ワールド",   245,32, 21); // Japanese (katakana)
  drawString("Γεια σου Κόσμε",  488,32, 21, 0.8); // Greek
  drawString("Привет мир",       800,32, 21, 0.95); // Russian
  drawString("大家好世界",         1066, 32, 21); // Chinese

  for (let i = 0; i < sortedJIS.length; i++) {
    const co = i % COLS;
    const ro = floor(i / COLS);
    const cx = 25 + co * CELL;
    const cy = 90 + ro * CELL;
    let sca = CELL-4;   
    drawStringJIS([sortedJIS[i]], cx, cy, CELL-4);

    //// Alternate display approach:
    // let charToDraw = String.fromCodePoint(sortedCPs[i]);
    // drawGlyph(charToDraw, cx,cy, sca); 
  }
}

function keyPressed() {
  if (key === 's') save('saka_KST32B_font.png');
}


//============================================================================
//─── LineFont drawing (adapted from LineFont.js by Kitasenju Design) ──────

function buildKSTFontMap(){
  // Must be called in setup().
  fontMap = new Map();
  jisMap  = new Map();
  // Regex with //[char] comment — covers the ~3645 glyphs whose Unicode is known.
  const reUni = /^const int font([0-9A-Fa-f]+)\[\]\s*=\s*\{([^}]*)\}.*\/\/\[(.)\]/;
  // Simpler regex without comment — covers all 4125 glyphs for jisMap.
  const reJIS = /^const int font([0-9A-Fa-f]+)\[\]\s*=\s*\{([^}]*)\}/;
  for (let ln of rawLines) {
    const mj = ln.match(reJIS);
    if (!mj) continue;
    const jis   = parseInt(mj[1], 16);
    const bytes = mj[2].split(',')
                       .map(s => parseInt(s.trim(), 16))
                       .filter(n => !isNaN(n));
    jisMap.set(jis, bytes);
    const mu = ln.match(reUni);
    if (mu) fontMap.set(mu[3].codePointAt(0), bytes);  // Unicode key from //[char]
  }
  sortedCPs = [...fontMap.keys()].sort((a, b) => a - b);
  sortedJIS = [...jisMap.keys()].sort((a, b) => a - b);
}

// Core CSF/1 stroke renderer — shared by drawGlyph and drawStringJIS.
function renderBytes(bytes, x, y, sca) {
  const sx = sca / 28, sy = sca / 30;
  const ox = x, oy = y + sca;
  let curX = 0, curY = 0, nextX = 0;
  for (const b of bytes) {
    if      (b === 0x20)             { 
      curX = curY = nextX = 0; }
    else if (b >= 0x21 && b <= 0x26) { 
      curX = b - 0x21;      
      nextX = curX; }
    else if (b >= 0x28 && b <= 0x3F) { 
      curX = b - 0x28 + 5;  
      nextX = curX; }
    else if (b >= 0x40 && b <= 0x5B) { 
      const x2 = b - 0x40;  
      line(curX*sx+ox, -curY*sy+oy, x2*sx+ox, -curY*sy+oy); 
      curX = nextX = x2; }
    else if (b >= 0x5E && b <= 0x5F) { 
      const x2 = b-0x5E+27; 
      line(curX*sx+ox, -curY*sy+oy, x2*sx+ox, -curY*sy+oy); 
      curX = nextX = x2; }
    else if (b >= 0x60 && b <= 0x7D) { 
      nextX = b - 0x60; }
    else if (b === 0x7E)             { 
      curY = 0; }
    else if (b >= 0xA1 && b <= 0xBF) { 
      curY = b - 0xA1; }
    else if (b >= 0xC0 && b <= 0xDF) { 
      const y2 = b-0xC0; 
      line(curX*sx+ox, -curY*sy+oy, nextX*sx+ox, -y2*sy+oy); 
      curX = nextX; 
      curY = y2; }
    // 0x27, 0x5C, 0x5D, 0x80–0xA0, 0xE0–0xFF: reserved, ignored
  }
}

// Maps Unicode combining diacritics to their nearest spacing equivalents in the font,
// so precomposed characters (e.g. ό = ο + U+0301) can be rendered by overlaying
// the base glyph and the accent glyph at the same cell position.
const COMBINING_TO_SPACING = new Map([
  [0x0300, 0x0060], // combining grave      → `  (U+0060)
  [0x0301, 0x00B4], // combining acute      → ´  (U+00B4, covers Greek tonos)
  [0x0302, 0x005E], // combining circumflex → ^  (U+005E)
  [0x0303, 0x007E], // combining tilde      → ~  (U+007E)
  [0x0308, 0x00A8], // combining diaeresis  → ¨  (U+00A8)
]);

// Draw a single glyph.
// ch:    the character (string) to render
// x, y:  top-left pixel position of the character cell
// sca:   cell size in pixels (used as both width and height)
// Precomposed characters (e.g. accented Greek) are NFD-decomposed so the base
// character and each combining mark are drawn separately at the same position.
function drawGlyph(ch, x, y, sca) {
  const nfd = [...ch.normalize('NFD')];
  const bytes = fontMap.get(nfd[0].codePointAt(0));
  if (!bytes || bytes.length === 0) return;
  renderBytes(bytes, x, y, sca);
  for (let i = 1; i < nfd.length; i++) {
    const spacing = COMBINING_TO_SPACING.get(nfd[i].codePointAt(0));
    if (spacing !== undefined) {
      const cb = fontMap.get(spacing);
      if (cb) renderBytes(cb, x, y, sca);
    }
  }
}

// Draw a string of characters horizontally.
// str:   text to render
// x, y:  top-left position of the first character cell
// sca:   cell size in pixels
function drawString(str, x, y, sca, spf=1.0) {
  let cx = x;
  for (const ch of str) {
    if (ch === '\n') { y += sca; cx = x; }
    else             { drawGlyph(ch, cx, y, sca); cx += sca*spf; }
  }
}

// Draw glyphs specified by raw JIS X 0208 codes, for the ~480 characters
// whose Unicode equivalent is unknown (empty //[] in fontData.h.txt).
// codes: array of integer JIS codes, e.g. [0x4F7C, 0x4F66]
// Example: drawStringJIS([0x4F7C, 0x4F66], 25, 60, 20);
function drawStringJIS(codes, x, y, sca, spf=1.0) {
  let cx = x;
  for (const code of codes) {
    const bytes = jisMap.get(code);
    if (bytes && bytes.length > 0) renderBytes(bytes, cx, y, sca);
    cx += sca * spf;
  }
}
