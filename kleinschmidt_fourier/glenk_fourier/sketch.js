// Fourier-synthesized glyphs by Glen Kleinschmidt, 2014
// Adapted from: https://glensstuff.com/fouriersynthchargen/fouriersynthchargen.htm

const CHARS = '0123456789ABCDEF';
const VISIBLE_START = 0.125;
const VISIBLE_END = 0.875;
const NSAMPLES = 420;
let romBounds;

const FOURIER_ROM = {
  '0': {
    x: [['sin', 1, '75k'], ['sin', -2, '130k'], ['sin', -3, '270k'], ['sin', -4, '560k'], ['sin', -5, '1M5']],
    y: [['cos', -1, '56k'], ['cos', 2, '180k'], ['cos', 3, '470k'], ['cos', 4, '820k'], ['cos', 5, '2M2'], ['dc', -1, '4M7']],
  },
  '1': {
    x: [],
    y: [['cos', 5, '62k']],
  },
  '2': {
    x: [['sin', -1, '680k'], ['cos', -1, '910k'], ['sin', 2, '56k'], ['cos', 2, '160k'], ['sin', 3, '360k'], ['dc', 1, '20M']],
    y: [['sin', -1, '56k'], ['cos', -1, '360k'], ['cos', -2, '430k'], ['sin', 3, '510k'], ['cos', 3, '2M2'], ['sin', -4, '2M4'], ['cos', 4, '1M3'], ['sin', 5, '1M'], ['cos', 5, '1M5'], ['dc', -1, '5M1']],
  },
  '3': {
    x: [['cos', -1, '56k'], ['cos', -2, '180k'], ['cos', 3, '150k'], ['cos', -4, '1M5'], ['cos', 5, '510k'], ['dc', -1, '20M']],
    y: [['sin', -1, '62k'], ['cos', -1, '1M'], ['sin', -2, '300k'], ['sin', 3, '390k']],
  },
  '4': {
    x: [['sin', 1, '150k'], ['cos', 1, '100k'], ['sin', -2, '110k'], ['cos', 2, '430k'], ['cos', -3, '430k'], ['sin', -4, '2M7'], ['sin', 5, '2M'], ['dc', 1, '3M6']],
    y: [['sin', -1, '560k'], ['cos', -1, '75k'], ['sin', -2, '110k'], ['cos', -2, '820k'], ['sin', -3, '1M2'], ['cos', -3, '2M7'], ['sin', -4, '820k'], ['sin', -5, '2M7'], ['dc', 1, '12M']],
  },
  '5': {
    x: [['sin', 1, '430k'], ['cos', 1, '560k'], ['sin', -2, '62k'], ['sin', -3, '560k'], ['cos', 3, '430k'], ['sin', -4, '910k'], ['cos', -4, '1M5'], ['sin', 5, '1M5'], ['cos', 5, '430k'], ['dc', -1, '20M']],
    y: [['sin', -1, '56k'], ['cos', 1, '1M6'], ['sin', -2, '430k'], ['cos', 2, '430k'], ['sin', 3, '430k'], ['sin', -4, '910k'], ['sin', 5, '820k'], ['cos', -5, '2M7'], ['dc', 1, '6M8']],
  },
  '6': {
    x: [['sin', -1, '470k'], ['cos', 1, '220k'], ['sin', 2, '56k'], ['sin', 3, '430k'], ['cos', 3, '240k'], ['dc', -1, '30M']],
    y: [['sin', 1, '100k'], ['cos', 1, '200k'], ['cos', -2, '91k'], ['sin', 3, '510k'], ['dc', -1, '30M']],
  },
  '7': {
    x: [['cos', -1, '39k'], ['cos', -2, '36k'], ['cos', -3, '110k'], ['cos', -4, '750k'], ['cos', -5, '1M'], ['dc', -1, '1M8']],
    y: [['cos', 1, '51k'], ['cos', -2, '180k'], ['cos', 3, '270k'], ['cos', 4, '1M'], ['cos', 5, '680k'], ['dc', 1, '1M5']],
  },
  '8': {
    x: [['sin', 1, '430k'], ['sin', 2, '130k'], ['sin', -3, '68k'], ['sin', -4, '330k'], ['sin', -5, '910k']],
    y: [['cos', -1, '68k'], ['cos', 2, '180k'], ['cos', 3, '680k'], ['cos', 4, '270k'], ['cos', 5, '2M7'], ['dc', -1, '4M7']],
  },
  '9': {
    x: [['sin', 1, '470k'], ['cos', -1, '220k'], ['sin', -2, '56k'], ['sin', -3, '430k'], ['cos', -3, '240k'], ['dc', 1, '30M']],
    y: [['sin', -1, '100k'], ['cos', -1, '200k'], ['cos', 2, '91k'], ['sin', -3, '510k'], ['dc', 1, '30M']],
  },
  'A': {
    x: [['cos', 1, '56k'], ['cos', -2, '150k'], ['cos', 3, '510k'], ['cos', 4, '750k'], ['cos', 5, '1M8'], ['dc', 1, '2M']],
    y: [['sin', 1, '560k'], ['sin', -2, '100k'], ['sin', -3, '510k'], ['sin', -4, '1M3'], ['dc', -1, '1M6']],
  },
  'B': {
    x: [['sin', 1, '100k'], ['cos', -1, '82k'], ['sin', -2, '130k'], ['cos', -2, '150k'], ['cos', -4, '620k'], ['cos', -5, '1M5'], ['dc', -1, '1M6']],
    y: [['sin', -1, '150k'], ['cos', 1, '130k'], ['sin', -2, '91k'], ['cos', 2, '150k'], ['sin', 3, '1M5'], ['cos', -3, '470k'], ['sin', -4, '1M8'], ['cos', 4, '1M8'], ['sin', -5, '1M5'], ['cos', -5, '2M2'], ['dc', -1, '4M7']],
  },
  'C': {
    x: [['cos', 1, '43k'], ['dc', 1, '3M3']],
    y: [['sin', 1, '100k'], ['dc', -1, '1M5']],
  },
  'D': {
    x: [['sin', -1, '100k'], ['cos', 1, '82k'], ['sin', 2, '130k'], ['cos', 2, '150k'], ['cos', 4, '620k'], ['cos', 5, '1M5'], ['dc', 1, '1M6']],
    y: [['sin', -1, '150k'], ['cos', 1, '130k'], ['sin', -2, '91k'], ['cos', 2, '150k'], ['sin', 3, '1M5'], ['cos', -3, '470k'], ['sin', -4, '1M8'], ['cos', 4, '1M8'], ['sin', -5, '1M5'], ['cos', -5, '2M2'], ['dc', -1, '4M7']],
  },
  'E': {
    x: [['sin', -1, '470k'], ['cos', 1, '220k'], ['sin', 2, '56k'], ['sin', 3, '430k'], ['cos', 3, '240k'], ['dc', -1, '30M']],
    y: [['sin', -1, '100k'], ['cos', -1, '200k'], ['cos', 2, '91k'], ['sin', -3, '510k'], ['dc', -1, '820k']],
  },
  'F': {
    x: [['sin', -1, '180k'], ['cos', 1, '68k'], ['sin', -2, '220k'], ['cos', 2, '100k'], ['cos', 3, '330k'], ['sin', -5, '1M'], ['cos', 5, '3M3'], ['dc', 1, '30M']],
    y: [['sin', -1, '110k'], ['cos', 1, '110k'], ['sin', -2, '910k'], ['cos', -2, '150k'], ['sin', -3, '750k']],
  },
};

//--------------------------------------
function setup() {
  pixelDensity(2);
  createCanvas(1200, 400);
  romBounds = getRomBounds();
}

function draw() {
  background(0);

  const cellW = 120;
  const cellH = 140;
  const gap = 10; 

  strokeCap(ROUND);
  strokeJoin(ROUND);
  drawString("01234567\n89ABCDEF",60,60, {
    cellW,
    cellH,
    gap,
  });
}


function keyPressed() {
  if (key === 's') saveCanvas('glen-kleinschmidt-fourier-rom', 'png');
}

//--------------------------------------
function drawString(str, left, top, options = {}) {
  const chars = str.toUpperCase();
  const cellW = options.cellW ?? 100;
  const cellH = options.cellH ?? 100;
  const gap = options.gap ?? 0;
  let col = 0;
  let gridRow = 0;

  for (const ch of chars) {
    if (ch === '\n') {
      col = 0;
      gridRow += 1;
      continue;
    }

    const x = left + col * (cellW + gap);
    const y = top + gridRow * (cellH + gap*0.75);
    drawGlyph(ch, x, y, cellW, cellH);
    col += 1;
  }
}

//--------------------------------------
function drawGlyph(ch, left, top, cellW, cellH) {
  const bounds = romBounds;
  const cx = left + cellW * 0.5;
  const cy = top + cellH * 0.52;
  const spanX = Math.max(bounds.maxX - bounds.minX, 1e-9);
  const spanY = Math.max(bounds.maxY - bounds.minY, 1e-9);
  const scale = min(cellW * 0.72 / spanX, cellH * 0.66 / spanY);
  const midX = (bounds.minX + bounds.maxX) * 0.5;
  const midY = (bounds.minY + bounds.maxY) * 0.5;

  strokeWeight(1);
  noFill();

  stroke(34, 118, 255, 135);
  strokeWeight(max(1, min(cellW, cellH) * 0.01));
  traceRange(ch, 0, VISIBLE_START, cx, cy, scale, midX, midY);
  traceRange(ch, VISIBLE_END, 1, cx, cy, scale, midX, midY);

  stroke(247, 245, 235);
  strokeWeight(max(1.35, min(cellW, cellH) * 0.018));
  traceRange(ch, VISIBLE_START, VISIBLE_END, cx, cy, scale, midX, midY);
}

//--------------------------------------
function traceRange(ch, start, end, cx, cy, scale, midX, midY) {
  beginShape();
  let detail = (mouseIsPressed) ? (0.5 + 0.5 * sin(millis() / 300.0)) : 1.0;
  for (let i = 0; i <= NSAMPLES; i += 1) {
    const u = lerp(start, end, i / NSAMPLES);
    const p = sampleGlyph(ch, u, detail);
    vertex(cx + (p.x - midX) * scale, cy - (p.y - midY) * scale);
  }
  endShape();
}

//--------------------------------------
function getRomBounds() {
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;

  for (const ch of CHARS) {
    for (let i = 0; i <= NSAMPLES; i += 1) {
      const u = lerp(VISIBLE_START, VISIBLE_END, i / NSAMPLES);
      const p = sampleGlyph(ch, u, 1);
      minX = min(minX, p.x);
      minY = min(minY, p.y);
      maxX = max(maxX, p.x);
      maxY = max(maxY, p.y);
    }
  }
  return { minX, minY, maxX, maxY };
}

//--------------------------------------
function sampleGlyph(ch, u, termLimit) {
  const t = u * TWO_PI;
  const glyph = FOURIER_ROM[ch];
  return {
    x: evaluateAxis(glyph.x, t, termLimit),
    y: evaluateAxis(glyph.y, t, termLimit),
  };
}

//--------------------------------------
function evaluateAxis(terms, t, termLimit = 1.0) {
  let sum = 0;
  const termCount = constrain(termLimit, 0, 1) * terms.length;

  for (let i = 0; i < terms.length; i += 1) {
    const termWeight = constrain(termCount - i, 0, 1);
    if (termWeight <= 0) break;

    const [kind, signedHarmonic, resistor] = terms[i];
    const gain = resistorGain(resistor);

    if (kind === 'dc') {
      sum += termWeight * signedHarmonic * 12 * gain;
      continue;
    }

    const sign = Math.sign(signedHarmonic);
    const harmonic = Math.abs(signedHarmonic);
    const phase = harmonic * t;
    sum += termWeight * sign * gain * (kind === 'sin' ? sin(phase) : cos(phase));
  }
  return sum;
}

//--------------------------------------
function resistorGain(value) {
  const match = value.match(/^(\d+)([kM]?)(\d*)$/);
  const whole = Number(match[1]);
  const suffix = match[2];
  const fractional = match[3] ? Number(`0.${match[3]}`) : 0;
  const multiplier = suffix === 'M' ? 1_000_000 : suffix === 'k' ? 1_000 : 1;
  return 1 / ((whole + fractional) * multiplier);
}
