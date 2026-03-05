/*
* https://6502disassembly.com/va-asteroids/Asteroids.html
* Asteroids (rev 4)                                                            *
* Copyright 1979 Atari, Inc.                                                   *
* By Lyle Rains and Ed Logg.                                                   *
********************************************************************************
* Disassembly by Nick Mikstas (https://www.nicholasmikstas.com/asteroids-      *
* fimrware) and Lonnie Howell / Mark McDougall                                 *
* (http://computerarcheology.com/Arcade/Asteroids/).                           *
* The binary used is a concatenation of the four ROMs that are addressable by  *
* the 6502.                                                                    *
* Project created by Andy McFadden, using 6502bench SourceGen v1.8.  This is a *
* fairly straight conversion from the listings on nicholasmikstas.com, which   *
* in turn drew heavily on the material at computerarcheology.com.  I have done *
* some reformatting and correction of typographical errors.                    *
* Last updated 2021/11/04      
*/

//============================================================
// ── p5.js setup / draw 
function setup() {
  pixelDensity(2);
  createCanvas(1000, 400);
  noLoop();
}

function draw() {
  background(0);
  stroke(255);
  noFill();
  strokeWeight(1.0);
  strokeCap(ROUND);
  strokeJoin(ROUND);

  const sca = 5.5;
  const margin = 55;
  let ty = 30;
  const dy = sca * FONT_CAP * 1.8;

  // Full character set
  drawString('ABCDEFGHIJKLMNOPQRSTUVWXYZ', margin, ty+=dy, sca);
  drawString('0123456789', margin, ty+=dy, sca);
  drawString('HELLO WORLD', margin, ty+=dy, sca);

  // ── Game graphics:
  // four asteroid silhouettes, saucer, ship
  const S = 11;   // pixels per game unit
  let gy = ty + 90;
  drawShape(ASTEROIDS_SHAPES.asteroid1, 100, gy, S);
  drawShape(ASTEROIDS_SHAPES.asteroid2, 250, gy, S);
  drawShape(ASTEROIDS_SHAPES.asteroid3, 400, gy, S);
  drawShape(ASTEROIDS_SHAPES.asteroid4, 550, gy, S);
  drawShape(ASTEROIDS_SHAPES.saucer,  700, gy, S);
  drawShape(ASTEROIDS_SHAPES.ship,    850, gy, S);
}

function keyPressed() {
  if (key === 's') save('asteroids-font.png');
}


//============================================================
// ── Asteroids arcade font and game graphics (Atari, 1979)
// Decoded from 6502 ROM DVG instructions (SVEC + VCTR).
// Coordinate system: x=0 left, y=0 baseline, y=6 cap-height (Y-up).
// d: array of strokes; each stroke = flat array [x0,y0, x1,y1, x2,y2, ...]
// w: advance width (always 6 for this font)

const ASTEROIDS_SHAPES = {
  shrapnel1: {d:[], pts:[[-2,0],[-4,-2],[-2,-4],[1,-3],[3,-4],[3,-2],[4,1],[3,4],[-5,2],[-8,3]]},
  asteroid1: {d:[[0,2,2,4,4,2,3,0,4,-2,1,-4,-2,-4,-4,-2,-4,2,-2,4,0,2]]},
  asteroid2: {d:[[2,1,4,2,2,4,0,3,-2,4,-4,2,-3,0,-4,-2,-2,-4,-1,-3,2,-4,4,-1,2,1]]},
  asteroid3: {d:[[-2,0,-4,-1,-2,-4,0,-1,0,-4,2,-4,4,-1,4,1,2,4,-1,4,-4,1,-2,0]]},
  asteroid4: {d:[[1,0,4,1,4,2,1,4,-2,4,-1,2,-4,2,-4,-1,-2,-4,1,-3,2,-4,4,-2,1,0]]},
  saucer:    {d:[[-2,1,2,1],[5,-1,-5,-1,-2,-3,2,-3,5,-1,2,1,1,3,-1,3,-2,1,-5,-1]]},
  ship:      {d:[[-3,-2,-3,2,-5,4,7,0,-5,-4,-3,-2]]},
  thrust:    {d:[[0,0,-4,2,0,4]]},
};

const ASTEROIDS_FONT = {
  '0': {w:6, d:[[0,0,0,6,4,6,4,0,0,0]]},
  '1': {w:6, d:[[2,0,2,6]]},
  '2': {w:6, d:[[0,6,4,6,4,3,0,3,0,0,4,0]]},
  '3': {w:6, d:[[0,0,4,0,4,6,0,6], [0,3,4,3]]},
  '4': {w:6, d:[[0,6,0,3,4,3], [4,6,4,0]]},
  '5': {w:6, d:[[0,0,4,0,4,3,0,3,0,6,4,6]]},
  '6': {w:6, d:[[0,3,4,3,4,0,0,0,0,6]]},
  '7': {w:6, d:[[0,6,4,6,4,0]]},
  '8': {w:6, d:[[0,0,4,0,4,6,0,6,0,0], [0,3,4,3]]},
  '9': {w:6, d:[[4,0,4,6,0,6,0,3,4,3]]},
  ' ': {w:6, d:[]},
  'A': {w:6, d:[[0,0,0,4,2,6,4,4,4,0], [0,2,4,2]]},
  'B': {w:6, d:[[0,0,0,6,3,6,4,5,4,4,3,3,0,3], [3,3,4,2,4,1,3,0,0,0]]},
  'C': {w:6, d:[[0,0,0,6,4,6], [0,0,4,0]]},
  'D': {w:6, d:[[0,0,0,6,2,6,4,4,4,2,2,0,0,0]]},
  'E': {w:6, d:[[0,0,0,6,4,6], [3,3,0,3], [0,0,4,0]]},
  'F': {w:6, d:[[0,0,0,6,4,6], [3,3,0,3]]},
  'G': {w:6, d:[[0,0,0,6,4,6,4,4], [2,2,4,2,4,0,0,0]]},
  'H': {w:6, d:[[0,0,0,6], [0,3,4,3], [4,6,4,0]]},
  'I': {w:6, d:[[0,0,4,0], [2,0,2,6], [4,6,0,6]]},
  'J': {w:6, d:[[0,2,2,0,4,0,4,6]]},
  'K': {w:6, d:[[0,0,0,6], [3,6,0,3,3,0]]},
  'L': {w:6, d:[[0,6,0,0,4,0]]},
  'M': {w:6, d:[[0,0,0,6,2,4,4,6,4,0]]},
  'N': {w:6, d:[[0,0,0,6,4,0,4,6]]},
  'O': {w:6, d:[[0,0,0,6,4,6,4,0,0,0]]},
  'P': {w:6, d:[[0,0,0,6,4,6,4,3,0,3]]},
  'Q': {w:6, d:[[0,0,0,6,4,6,4,2,2,0,0,0], [2,2,4,0]]},
  'R': {w:6, d:[[0,0,0,6,4,6,4,3,0,3], [1,3,4,0]]},
  'S': {w:6, d:[[0,0,4,0,4,3,0,3,0,6,4,6]]},
  'T': {w:6, d:[[2,0,2,6], [0,6,4,6]]},
  'U': {w:6, d:[[0,6,0,0,4,0,4,6]]},
  'V': {w:6, d:[[0,6,2,0,4,6]]},
  'W': {w:6, d:[[0,6,0,0,2,2,4,0,4,6]]},
  'X': {w:6, d:[[0,0,4,6], [0,6,4,0]]},
  'Y': {w:6, d:[[2,0,2,4,0,6], [4,6,2,4]]},
  'Z': {w:6, d:[[0,6,4,6,0,0,4,0]]},
};

// Font metrics (in font units)
const FONT_CAP   = 6;   // cap-height (font Y-up)
const FONT_ADV   = 6;   // default advance width

// ── drawGlyph 
// ch       : character to draw
// ox, oy   : baseline-left origin in screen pixels
// cellSize : pixels per font unit (scale)
function drawGlyph(ch, ox, oy, cellSize) {
  const glyph = ASTEROIDS_FONT[ch.toUpperCase()] ?? ASTEROIDS_FONT[' '];
  for (const stroke of glyph.d) {
    beginShape();
    for (let i = 0; i + 1 < stroke.length; i += 2) {
      const fx = stroke[i];
      const fy = stroke[i + 1];
      // Y-flip: font Y-up → screen Y-down
      vertex(ox + fx * cellSize, oy - fy * cellSize);
    }
    endShape();
  }
}

// ── drawString 
// str      : string to render (upper-cased automatically)
// x, y     : baseline-left of first character
// cellSize : pixels per font unit
// tracking : extra pixels between glyphs (default 0; use negative to tighten)
function drawString(str, x, y, cellSize, tracking = 0) {
  let cursorX = x;
  for (const ch of str.toUpperCase()) {
    const glyph = ASTEROIDS_FONT[ch] ?? ASTEROIDS_FONT[' '];
    drawGlyph(ch, cursorX, y, cellSize);
    cursorX += glyph.w * cellSize + tracking;
  }
}

// ── drawShape 
// shape : entry from ASTEROIDS_SHAPES — .d = strokes, .pts = dot positions
// ox,oy : screen position of the shape's local (0,0)
// scale : pixels per game unit; game Y-up → screen Y-down flip applied
function drawShape(shape, ox, oy, scale) {
  for (const s of shape.d) {
    beginShape();
    for (let i = 0; i + 1 < s.length; i += 2) {
      vertex(ox + s[i] * scale, oy - s[i + 1] * scale);
    }
    endShape();
  }
  if (shape.pts) {
    for (const [px, py] of shape.pts) {
      point(ox + px * scale, oy - py * scale);
    }
  }
}

