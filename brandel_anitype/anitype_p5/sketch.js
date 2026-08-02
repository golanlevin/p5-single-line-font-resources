// p5.js recovery display for Jono Brandel's AniType endpoint font.
// The glyph data in anitype_endpoints.js preserves Brandel's original
// endpoint records: command, x, y, controls.left, controls.right.

let anitypeFont;
let animationStartMillis = 0;
let isGifExporting = false;
let gifFrameIndex = 0;

const FULL_SET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789*+-/?!';
const SAMPLE_TEXT = 'HELLO WORLD';
const CYCLE_MS = 4000;
const GIF_FPS = 30;
const GIF_FRAME_COUNT = Math.round((CYCLE_MS / 1000) * GIF_FPS);
const gapPercent = 0.9;

function setup() {
  createCanvas(900, 300);
  frameRate(GIF_FPS);
  anitypeFont = new AniTypeP5Font(ANITYPE_ENDPOINTS);
  animationStartMillis = millis();
}

function draw() {
  background('black'); 
  stroke('white');
  strokeWeight(1);
  strokeJoin(ROUND);
  strokeCap(ROUND);
  noFill();

  const elapsed = isGifExporting
    ? (gifFrameIndex / GIF_FRAME_COUNT) * CYCLE_MS
    : millis() - animationStartMillis;
  const phase = pow(drawPhase(elapsed, CYCLE_MS), 2.0); // 0...1
  const txSize = 34;

  anitypeFont.drawString(FULL_SET.slice(0, 26),   42,  70, txSize, phase);
  anitypeFont.drawString(FULL_SET.slice(26, 36),  42, 120, txSize, phase);
  anitypeFont.drawString(FULL_SET.slice(36),      42, 170, txSize, phase);
  anitypeFont.drawString(SAMPLE_TEXT, 42, 220, txSize, phase);

  if (isGifExporting) {
    gifFrameIndex++;
    if (gifFrameIndex >= GIF_FRAME_COUNT) {
      isGifExporting = false;
      animationStartMillis = millis();
    }
  }
}

function keyPressed() {
  if (key.toLowerCase() !== 's') {
    return;
  }

  isGifExporting = true;
  gifFrameIndex = 0;
  saveGif('anitype_p5_loop', GIF_FRAME_COUNT, {
    units: 'frames'
  });
}

function drawPhase(ms, period) {
  const t = (ms % period) / period;
  const dwell = 1.0 / (period / 1000);
  const moving = 1 - dwell;

  if (t < moving / 2) {
    return t / (moving / 2);
  }
  if (t < moving / 2 + dwell) {
    return 1;
  }
  return 1 - (t - moving / 2 - dwell) / (moving / 2);
}

class AniTypeP5Font {
  constructor(data) {
    this.source = data.source;
    this.version = data.version;
    this.dimensions = data.dimensions;
    this.glyphs = data.glyphs;
    this.advance = this.dimensions.width * gapPercent + this.dimensions.spacing;
  }

  drawString(str, x, y, size, amount = 1) {
    let cursor = x;
    const scale = size / this.dimensions.height;
    const advance = this.advance * scale;

    for (let i = 0; i < str.length; i++) {
      const ch = str[i].toUpperCase();
      if (ch === ' ') {
        cursor += advance;
        continue;
      }

      this.drawGlyph(ch, cursor + this.dimensions.width * scale * 0.5, y, size, amount);
      cursor += advance;
    }
  }

  drawGlyph(ch, x, y, size, amount = 1) {
    const glyph = this.glyphs[ch];
    if (!glyph) {
      return;
    }

    const scale = size / this.dimensions.height;
    const contours = glyphToContours(glyph, scale);
    const dotLength = size * 0.08;
    const totalLength = contours.reduce((sum, contour) => {
      return sum + (contour.isDot ? dotLength : contour.length);
    }, 0);
    let remaining = constrain(amount, 0, 1) * totalLength;

    push();
    translate(x, y);

    for (const contour of contours) {
      if (remaining <= 0) {
        break;
      }

      const contourLength = contour.isDot ? dotLength : contour.length;
      const drawLength = min(remaining, contourLength);
      drawContour(contour, drawLength);
      remaining -= contourLength;
    }

    pop();
  }
}

function glyphToContours(glyph, scale) {
  const contours = [];
  let current = [];
  let previous = null;

  for (const point of glyph) {
    if (point.command === 'M' || !previous) {
      if (current.length > 1) {
        contours.push(makeContour(current));
      }
      current = [scaledPoint(point, scale)];
      previous = point;
      continue;
    }

    if (point.command === 'C') {
      const a = scaledPoint(previous, scale);
      const b = scaledControl(previous, 'right', scale);
      const c = scaledControl(point, 'left', scale);
      const d = scaledPoint(point, scale);
      appendCubicSamples(current, a, b, c, d, 24);
    } else {
      current.push(scaledPoint(point, scale));
    }

    previous = point;
  }

  if (current.length > 1) {
    contours.push(makeContour(current));
  }

  return contours;
}

function makeContour(samples) {
  let length = 0;
  for (let i = 1; i < samples.length; i++) {
    length += dist(samples[i - 1].x, samples[i - 1].y, samples[i].x, samples[i].y);
  }
  return { samples, length, isDot: length < 0.0001 };
}

function drawContour(contour, targetLength) {
  const samples = contour.samples;

  if (contour.isDot) {
    if (targetLength > 0) {
      point(samples[0].x, samples[0].y);
    }
    return;
  }

  if (samples.length < 2 || targetLength <= 0) {
    return;
  }

  let used = 0;
  beginShape();
  vertex(samples[0].x, samples[0].y);

  for (let i = 1; i < samples.length; i++) {
    const a = samples[i - 1];
    const b = samples[i];
    const segmentLength = dist(a.x, a.y, b.x, b.y);

    if (used + segmentLength <= targetLength) {
      vertex(b.x, b.y);
      used += segmentLength;
    } else {
      const amt = (targetLength - used) / segmentLength;
      vertex(lerp(a.x, b.x, amt), lerp(a.y, b.y, amt));
      break;
    }
  }

  endShape();
}

function appendCubicSamples(samples, a, b, c, d, steps) {
  for (let i = 1; i <= steps; i++) {
    const t = i / steps;
    samples.push({
      x: bezierPoint(a.x, b.x, c.x, d.x, t),
      y: bezierPoint(a.y, b.y, c.y, d.y, t)
    });
  }
}

function scaledPoint(point, scale) {
  return { x: point.x * scale, y: point.y * scale };
}

function scaledControl(point, side, scale) {
  const control = point.controls && point.controls[side] ? point.controls[side] : point;
  return { x: control.x * scale, y: control.y * scale };
}
