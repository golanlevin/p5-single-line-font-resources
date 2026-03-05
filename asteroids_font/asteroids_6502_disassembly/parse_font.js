'use strict';
const fs = require('fs');

// ── SVEC decoder ─────────────────────────────────────────────────────────────
// word = 16-bit value ($HHLL, high byte = opcode+sc+y, low byte = b+x)
function decodeSVEC(word) {
  const op = (word >> 12) & 0xF;
  if (op === 0xD) return null;          // RTSL
  if (op !== 0xF) return null;          // unknown

  const sc      = (word >> 11) & 1;
  const ySign   = (word >> 10) & 1;
  const yMag    = (word >>  8) & 3;
  const b       = (word >>  4) & 0xF;
  const xSign   = (word >>  2) & 1;
  const xMag    =  word        & 3;

  const mul = sc ? 2 : 1;
  return {
    dx: (xSign ? -xMag : xMag) * mul,
    dy: (ySign ? -yMag : yMag) * mul,
    b,
  };
}

// ── Parse hex dump lines → address-keyed word map ─────────────────────────────
const text = fs.readFileSync(
  '/Users/gl/Desktop/gear/asteroids/asteroids_font.txt', 'utf8');

const words = {};   // addr → 16-bit word value
for (const line of text.split('\n')) {
  const m = line.match(/^\s*([0-9a-fA-F]{4}):\s+([0-9a-fA-F]{2})\s+([0-9a-fA-F]{2})/);
  if (!m) continue;
  const addr  = parseInt(m[1], 16);
  const lo    = parseInt(m[2], 16);   // low byte at addr
  const hi    = parseInt(m[3], 16);   // high byte at addr+1
  words[addr] = (hi << 8) | lo;       // reconstruct word $HHLL
}

// ── Character → start address map (from CharPtrTbl) ──────────────────────────
const charMap = {
  ' ': 0x5658,
  '0': 0x55ba,
  '1': 0x565c, '2': 0x5664, '3': 0x5674, '4': 0x5682,
  '5': 0x5690, '6': 0x569e, '7': 0x56ac, '8': 0x56b6, '9': 0x56c6,
  'A': 0x54f0, 'B': 0x5500, 'C': 0x551a, 'D': 0x5526, 'E': 0x5536,
  'F': 0x5546, 'G': 0x5554, 'H': 0x5566, 'I': 0x5574, 'J': 0x5582,
  'K': 0x558e, 'L': 0x559a, 'M': 0x55a4, 'N': 0x55b0, 'O': 0x55ba,
  'P': 0x55c6, 'Q': 0x55d4, 'R': 0x55e6, 'S': 0x55f6, 'T': 0x5604,
  'U': 0x5610, 'V': 0x561c, 'W': 0x5626, 'X': 0x5634, 'Y': 0x563e,
  'Z': 0x564c,
};

// ── Trace one character's SVECs into strokes ──────────────────────────────────
// Returns { w, strokes } where w = advance width, strokes = [[x,y,...], ...]
function traceChar(startAddr) {
  const strokes = [];
  let x = 0, y = 0;
  let penDown = false;
  let stroke = [];
  let addr = startAddr;

  for (let i = 0; i < 32; i++) {     // safety limit
    const word = words[addr];
    if (word === undefined) break;
    addr += 2;

    const sv = decodeSVEC(word);
    if (sv === null) break;           // RTSL

    const nx = x + sv.dx;
    const ny = y + sv.dy;

    if (sv.b !== 0) {
      // pen-down: add to current stroke
      if (!penDown) {
        stroke = [x, y];              // include start point
        penDown = true;
      }
      stroke.push(nx, ny);
    } else {
      // pen-up: commit stroke if any
      if (penDown && stroke.length >= 4) strokes.push(stroke);
      stroke = [];
      penDown = false;
    }

    x = nx;
    y = ny;
  }
  if (penDown && stroke.length >= 4) strokes.push(stroke);

  return { w: Math.round(x), strokes };
}

// ── Build font data ───────────────────────────────────────────────────────────
const font = {};
for (const [ch, addr] of Object.entries(charMap)) {
  font[ch] = traceChar(addr);
}

// ── Print as compact JS object literal ───────────────────────────────────────
console.log('const ASTEROIDS_FONT = {');
for (const [ch, { w, strokes }] of Object.entries(font)) {
  const key = ch === "'" ? `"'"` : `'${ch}'`;
  const ds  = strokes.map(s => `[${s.join(',')}]`).join(', ');
  console.log(`  ${key}: {w:${w}, d:[${ds}]},`);
}
console.log('};');
