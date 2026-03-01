// p5.js port of the single-line font from Abel Vincze's Gear Generator (geargenerator.com).
// Ported from https://www.robopenguins.com/assets/wp-content/pages/geargenerator/index.html
// Note that Vincze has a more advanced version at https://geargenerator.com/beta/. 
// Ported to p5.js by Golan Levin, 2026
//
// Font data format (three parallel arrays):
//   font[0] — charset string: each character is the key for the corresponding glyph
//   font[1] — coordinate lookup table: pairs of ASCII digit characters encoding
//             (x, y) points on a 7×9 integer grid (x: 0–6, y: 0–8)
//   font[2] — space-separated glyph entries; within each entry:
//               • first character: the advance width as a single digit (0–6)
//               • uppercase/lowercase ASCII letters: index into font[1] via getindex()
//               • '/' and other non-letter chars: stroke break (pen-up / moveTo)
//
// Coordinate system: x=0 is left edge of glyph; y=0 is baseline, y=8 is cap height.
// In p5.js: screen_x = gx + x*sca,  screen_y = gy − y*sca.



// ─── p5.js sketch ───────────────────────────────────────────────────────────
function setup() {
  createCanvas(800, 300);
  pixelDensity(2);
  noLoop();
}

function draw() {
  background(0);
  stroke(255);
  strokeWeight(1.2);
  strokeCap(ROUND);
  strokeJoin(ROUND);
  noFill();

  let tx = 40;
  let sca = 5.25;    // scale: font units to pixels
  let sp  = 1;       // inter-character spacing in font units

  drawString("ABCDEFGHIJKLMNOPQRSTUVWXYZ", tx,  80, sca, sp);
  drawString("abcdefghijklmnopqrstuvwxyz", tx, 140, sca, sp);
  drawString("0123456789  +-/=*;:,.<>",    tx, 200, sca, sp);
  drawString("Hello, World",               tx, 260, sca, sp);
}

function keyPressed() {
  if (key === 's') save('vincze_geargenerator_font.png');
}

// ========================================================
// GEARGENERATOR FONT

// ─── Font data (from geargenerator.js, line 37)
// Correction: Q entry changed from "4DVMPQLKJD" → "4DVMPQLKJD/YE"
//   The original Q had no tail stroke, rendering identically to O.
//   Added tail: Y=(3,3) → E=(4,2), a short diagonal from inside the lower-right
//   of the loop to the bottom-right corner (y=2, the floor of uppercase letters).
const font = [
  "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+-/=*;:,.<>",
  "0204284442324335464738181215080307480525452224683316263634174130100106373120004014232713",
  "4ABCDE/BD 4AFGDHIJKLM/NH/OL 4GFMPQLKJ 4AFGJKO/LM 4EAOR/ST 4AOR/ST 4HUEMPQLR 4ER/US/OA 2VA/ML/CO 4RGFMP 4ENR/AO/NS 4EAO 4ERWOA 4REOA 4UGFMPQLKJU 4SHIJKOA 4DVMPQLKJD/YE 4ENHIJKOA/NS 4JKLQGFMP 4RO/CV 4RGFMPO 6XFO 6XEHVO 4RA/EO 4RTO/TV 4EARO 4YVMPSZaHYE 4OBabUGFVBA 4EMPSZI 4EDVMPSZaDR 4FMPSZbUcB 4MdCKJ/HS 4EMPSZbUefgh 4BabUE/AO 0Ai/QO 3Kj/bklgh 4EWI/AO/WB 1MPO 4Ai/SZTbUE/WT 4Ai/BabUE 4GFMPSZbUG 4mi/SZbUGFA 4nI/EMPSZbU 4Ai/BabU 4IZSocGFA 4GFpC/Ii 4IE/DVMPi 4IVi 4IFaMi 4IA/Ei 4Igm/Vi 4EAIi 3YVMPQLCjY 2QLM/VA 4EABNHIJKLQ 4QLKJIHDGFMP/TH 4DBKF 4ROibUGFMP 4SHDGFMPiCK 4ORV 4NBPMFGDHNiQLKJIH 4UNiQLKJDVM 4pq/US 4US 4RA 4Ii/DB 4US/pq/JP/GQ 1ZN/oMh 1ZN/or 1rMh 0PA 3KSF 3OHA"
];

// Map an ASCII character code to a byte-offset into font[1].
// Letters A–Z map to offsets 0, 2, 4 … 50.
// Letters a–z map to offsets 52, 54 … 102.
// Digits, punctuation, and '/' yield a negative value → stroke break.
function getindex(code) {
  code -= 65;
  if (code > 25) code -= 6;   // skip the 6 ASCII chars between 'Z' and 'a'
  return code * 2;
}

// Parse the glyph data for a single character.
// Returns an array where:
//   data[0]       = advance width in font units  (-1 if character unknown)
//   data[1..n]    = stroke arrays; each stroke is an array of {x, y} objects
//
// Each letter in font[2]'s glyph entry is decoded by getindex() to a position
// in font[1], from which a two-digit (x, y) coordinate is read.
// Non-letter chars (digits, '/') create a new stroke (pen-up).
function getchardata(chr) {
  const i = font[0].lastIndexOf(chr);
  const data = [];
  if (i > -1) {
    const chdata = font[2].split(" ")[i];
    let l = 0;
    data[0] = Number(chdata.charAt(0));   // advance width
    for (let p = 0; p < chdata.length; p++) {
      const pi = getindex(chdata.charCodeAt(p));
      if (pi < 0) {
        // Non-letter character → begin a new stroke
        data[++l] = [];
      } else {
        // Letter character → look up (x, y) from the coordinate table
        if (!data[l]) data[l] = [];
        const pair = font[1].substr(pi, 2);
        data[l].push({ x: Number(pair[0]), y: Number(pair[1]) });
      }
    }
  } else {
    data[0] = (chr === " ") ? 3 : -1;   // space advances 3 units; unknown = -1
  }
  return data;
}

// ─── Rendering ───────────────────────────────────────────────────────────────

// Draw a single glyph.
// ch:       the character to render
// gx, gy:  pixel position — gx is the left edge, gy is the baseline (font y=0)
// sca:     scale factor (font units → pixels)
function drawGlyph(ch, gx, gy, sca) {
  const data = getchardata(ch);
  if (data[0] < 0) return;           // unknown character; skip
  for (let l = 1; l < data.length; l++) {
    const stroke = data[l];
    if (!stroke || stroke.length === 0) continue;
    beginShape();
    for (const pt of stroke) {
      vertex(gx + pt.x * sca,   // x increases rightward
             gy - pt.y * sca);  // y=0 at baseline, y=8 at cap top
    }
    endShape();
  }
}

// Font metric: cap-height in font units (y=0 at baseline, y=8 at top of capitals)
const GG_CAPH = 8;

// Draw a string of text.
// str:       text to render
// x, y:     pixel position — x is left edge, y is the baseline
// sca:      scale factor (font units → pixels)
// spacing:  extra gap between characters in font units (default 1)
// lineH:    line-height multiplier for '\n' newlines (default 1.6)
function drawString(str, x, y, sca, spacing = 1, lineH = 1.6) {

  let cx = x;
  let cy = y;
  for (let i = 0; i < str.length; i++) {
    const ch = str[i];
    if (ch === "\n") {
      cy += GG_CAPH * sca * lineH;
      cx = x;
      continue;
    }
    drawGlyph(ch, cx, cy, sca);
    const data = getchardata(ch);
    const adv = (data[0] >= 0) ? data[0] : 3;  // unknown chars advance like a space
    cx += (adv + spacing) * sca;
  }
}
