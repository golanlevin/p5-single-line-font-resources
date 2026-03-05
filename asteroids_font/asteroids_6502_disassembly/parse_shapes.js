#!/usr/bin/env node
'use strict';
const fs = require('fs');

// ── Parse HTML hex dump → address-keyed word map ──────────────────────────────
const html = fs.readFileSync(
  '/Users/gl/Desktop/gear/asteroids/Asteroids Disassembly.html', 'utf8');
const text = html.replace(/<[^>]+>/g, '');   // strip HTML tags

const words = {};
for (const line of text.split('\n')) {
  const m = line.match(/^\s*([0-9a-fA-F]{4}):\s+([0-9a-fA-F]{2})\s+([0-9a-fA-F]{2})/);
  if (!m) continue;
  const addr = parseInt(m[1], 16);
  const lo   = parseInt(m[2], 16);
  const hi   = parseInt(m[3], 16);
  words[addr] = (hi << 8) | lo;
}

// ── SVEC decoder ──────────────────────────────────────────────────────────────
// bit[11]=sc: 0→mul=1, 1→mul=2
// bit[10]=ySign, bits[9:8]=yMag, bits[7:4]=brightness
// bit[2]=xSign, bits[1:0]=xMag
function decodeSVEC(word) {
  const mul   = ((word >> 11) & 1) ? 2 : 1;
  const ySign = (word >> 10) & 1;
  const yMag  = (word >>  8) & 3;
  const b     = (word >>  4) & 0xF;
  const xSign = (word >>  2) & 1;
  const xMag  =  word        & 3;
  return {
    dx: (xSign ? -xMag : xMag) * mul,
    dy: (ySign ? -yMag : yMag) * mul,
    b,
  };
}

// ── VCTR decoder ──────────────────────────────────────────────────────────────
// Word1: bits[15:12]=sc, bit[10]=ySign, bits[9:0]=yMag
// Word2: bits[15:12]=brightness, bit[10]=xSign, bits[9:0]=xMag
// Divide by VCTR_SCALE to normalize into the same space as SVEC units.
const VCTR_SCALE = 64;
function decodeVCTR(w1, w2) {
  const ySign = (w1 >> 10) & 1;
  const yMag  =  w1 & 0x3FF;
  const b     = (w2 >> 12) & 0xF;
  const xSign = (w2 >> 10) & 1;
  const xMag  =  w2 & 0x3FF;
  const r = (v) => Math.round(v * 100) / 100;  // round to 2dp
  return {
    dx: r((xSign ? -xMag : xMag) / VCTR_SCALE),
    dy: r((ySign ? -yMag : yMag) / VCTR_SCALE),
    b,
  };
}

// ── Trace a shape ─────────────────────────────────────────────────────────────
// Returns { strokes: [[x,y,...], ...], dots: [[x,y], ...] }
function traceShape(startAddr) {
  const strokes = [];
  const dots    = [];
  let x = 0, y = 0;
  let penDown = false;
  let stroke  = [];
  let addr    = startAddr;

  for (let i = 0; i < 64; i++) {
    const w1 = words[addr];
    if (w1 === undefined) break;

    const op = (w1 >> 12) & 0xF;
    let vec;

    if (op === 0xF) {          // SVEC (1 word)
      vec  = decodeSVEC(w1);
      addr += 2;
    } else if (op === 0xD) {   // RTSL
      break;
    } else {                   // VCTR (2 words)
      const w2 = words[addr + 2];
      if (w2 === undefined) break;
      vec  = decodeVCTR(w1, w2);
      addr += 4;
    }

    const nx = Math.round((x + vec.dx) * 100) / 100;
    const ny = Math.round((y + vec.dy) * 100) / 100;

    if (vec.b === 0) {
      // pen-up: commit current stroke
      if (penDown && stroke.length >= 4) strokes.push(stroke);
      stroke  = [];
      penDown = false;
    } else if (vec.dx === 0 && vec.dy === 0) {
      // dot at current position
      dots.push([x, y]);
    } else {
      // pen-down move
      if (!penDown) {
        stroke  = [x, y];
        penDown = true;
      }
      stroke.push(nx, ny);
    }

    x = nx;
    y = ny;
  }
  if (penDown && stroke.length >= 4) strokes.push(stroke);

  return { strokes, dots };
}

// ── Shape catalogue ───────────────────────────────────────────────────────────
const shapeDefs = [
  { name: 'shrapnel1', addr: 0x5100 },
  { name: 'shrapnel2', addr: 0x512c },
  { name: 'shrapnel3', addr: 0x516a },
  { name: 'shrapnel4', addr: 0x51a0 },
  { name: 'asteroid1', addr: 0x51e6 },
  { name: 'asteroid2', addr: 0x51fe },
  { name: 'asteroid3', addr: 0x521a },
  { name: 'asteroid4', addr: 0x5234 },
  { name: 'saucer',    addr: 0x5252 },
  { name: 'ship',      addr: 0x5290 },
  { name: 'thrust',    addr: 0x52a2 },
];

// ── Output ────────────────────────────────────────────────────────────────────
console.log('const ASTEROIDS_SHAPES = {');
for (const { name, addr } of shapeDefs) {
  const { strokes, dots } = traceShape(addr);
  const ss = strokes.map(s => `[${s.join(',')}]`).join(', ');
  const ds = dots.map(d => `[${d.join(',')}]`).join(', ');
  const dotPart = dots.length ? `, pts:[${ds}]` : '';
  console.log(`  ${name}: {d:[${ss}]${dotPart}},`);
}
console.log('};');
