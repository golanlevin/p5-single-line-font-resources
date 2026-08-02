// Modern two.js recovery display for Jono Brandel's AniType endpoint font.
// The glyph data in anitype_endpoints.js preserves Brandel's original
// endpoint records: command, x, y, controls.left, controls.right.

const FULL_SET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789*+-/?!';
const SAMPLE_TEXT = 'HELLO WORLD';
const CYCLE_MS = 4000;
const gapPercent = 0.9;

let two;
let anitypeFont;
let glyphInstances = [];

window.addEventListener('DOMContentLoaded', () => {
  two = new Two({
    type: Two.Types.svg,
    width: 900,
    height: 300,
    autostart: true
  }).appendTo(document.querySelector('#stage'));

  anitypeFont = new AniTypeTwoFont(two, ANITYPE_ENDPOINTS);
  buildDisplay();

  two.bind('update', () => {
    const phase = Math.pow(drawPhase(performance.now(), CYCLE_MS), 2.0);
    for (const glyph of glyphInstances) {
      glyph.setAmount(phase);
    }
  });
});

function buildDisplay() {
  const txSize = 34;
  anitypeFont.drawString(FULL_SET.slice(0, 26), 42, 70, txSize, glyphInstances);
  anitypeFont.drawString(FULL_SET.slice(26, 36), 42, 120, txSize, glyphInstances);
  anitypeFont.drawString(FULL_SET.slice(36), 42, 170, txSize, glyphInstances);
  anitypeFont.drawString(SAMPLE_TEXT, 42, 220, txSize, glyphInstances);
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

class AniTypeTwoFont {
  constructor(twoInstance, data) {
    this.two = twoInstance;
    this.source = data.source;
    this.version = data.version;
    this.dimensions = data.dimensions;
    this.glyphs = data.glyphs;
    this.advance = this.dimensions.width * gapPercent + this.dimensions.spacing;
  }

  drawString(str, x, y, size, instances) {
    let cursor = x;
    const scale = size / this.dimensions.height;
    const advance = this.advance * scale;

    for (let i = 0; i < str.length; i++) {
      const ch = str[i].toUpperCase();
      if (ch === ' ') {
        cursor += advance;
        continue;
      }

      const glyph = this.drawGlyph(ch, cursor + this.dimensions.width * scale * 0.5, y, size);
      if (glyph) {
        instances.push(glyph);
      }
      cursor += advance;
    }
  }

  drawGlyph(ch, x, y, size) {
    const glyph = this.glyphs[ch];
    if (!glyph) {
      return null;
    }

    const scale = size / this.dimensions.height;
    const linewidth = 1;
    const dotLength = size * 0.08;
    const group = this.two.makeGroup();
    const contours = glyphToContours(glyph, scale);
    const parts = [];
    let totalLength = 0;

    group.translation.set(x, y);

    for (const contour of contours) {
      const contourLength = contour.isDot ? dotLength : contour.length;
      const element = contour.isDot
        ? makeDot(this.two, contour.points[0], linewidth)
        : makePath(contour.points, linewidth);

      element.visible = false;
      group.add(element);
      parts.push({ element, length: contourLength, isDot: contour.isDot });
      totalLength += contourLength;
    }

    return new AniTypeTwoGlyph(parts, totalLength);
  }
}

class AniTypeTwoGlyph {
  constructor(parts, totalLength) {
    this.parts = parts;
    this.totalLength = totalLength;
    this.setAmount(0);
  }

  setAmount(amount) {
    let remaining = clamp(amount, 0, 1) * this.totalLength;

    for (const part of this.parts) {
      if (remaining <= 0) {
        part.element.visible = false;
        if (!part.isDot) {
          part.element.ending = 0;
        }
        continue;
      }

      const drawLength = Math.min(remaining, part.length);
      part.element.visible = true;

      if (!part.isDot) {
        part.element.beginning = 0;
        part.element.ending = clamp(drawLength / part.length, 0, 1);
      }

      remaining -= part.length;
    }
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
      current = [scaledEndpoint(point, scale)];
      previous = point;
      continue;
    }

    if (point.command === 'C') {
      const scaled = scaledEndpoint(point, scale);
      current.push(scaled);
    } else {
      current.push(scaledEndpoint(point, scale));
    }

    previous = point;
  }

  if (current.length > 1) {
    contours.push(makeContour(current));
  }

  return contours;
}

function makeContour(points) {
  const samples = endpointsToSamples(points);
  let length = 0;
  for (let i = 1; i < samples.length; i++) {
    length += distance(samples[i - 1], samples[i]);
  }
  return { points, samples, length, isDot: length < 0.0001 };
}

function endpointsToSamples(points) {
  const samples = [];
  let previous = null;

  for (const point of points) {
    if (!previous || point.command === 'M') {
      samples.push({ x: point.x, y: point.y });
    } else if (point.command === 'C') {
      appendCubicSamples(samples, previous, previous.controls.right, point.controls.left, point, 24);
    } else {
      samples.push({ x: point.x, y: point.y });
    }
    previous = point;
  }

  return samples;
}

function makePath(points, linewidth) {
  const anchors = points.map((point) => {
    const command = point.command === 'C'
      ? Two.Commands.curve
      : point.command === 'M'
        ? Two.Commands.move
        : Two.Commands.line;
    const anchor = new Two.Anchor(
      point.x,
      point.y,
      point.controls.left.x,
      point.controls.left.y,
      point.controls.right.x,
      point.controls.right.y,
      command
    );
    anchor.relative = false;
    return anchor;
  });

  const path = new Two.Path(anchors, false, false, true);
  path.noFill();
  path.stroke = 'white';
  path.linewidth = linewidth;
  path.cap = 'round';
  path.join = 'round';
  path.beginning = 0;
  path.ending = 0;
  return path;
}

function makeDot(twoInstance, point, linewidth) {
  const dot = twoInstance.makeCircle(point.x, point.y, linewidth * 0.5, 12);
  dot.noStroke();
  dot.fill = 'white';
  return dot;
}

function scaledEndpoint(point, scale) {
  return {
    command: point.command,
    x: point.x * scale,
    y: point.y * scale,
    controls: {
      left: scaledControl(point, 'left', scale),
      right: scaledControl(point, 'right', scale)
    }
  };
}

function scaledControl(point, side, scale) {
  const control = point.controls && point.controls[side] ? point.controls[side] : point;
  return { x: control.x * scale, y: control.y * scale };
}

function appendCubicSamples(samples, a, b, c, d, steps) {
  for (let i = 1; i <= steps; i++) {
    const t = i / steps;
    samples.push({
      x: cubicPoint(a.x, b.x, c.x, d.x, t),
      y: cubicPoint(a.y, b.y, c.y, d.y, t)
    });
  }
}

function cubicPoint(a, b, c, d, t) {
  const mt = 1 - t;
  return mt * mt * mt * a + 3 * mt * mt * t * b + 3 * mt * t * t * c + t * t * t * d;
}

function distance(a, b) {
  return Math.hypot(b.x - a.x, b.y - a.y);
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}
