
// Poul-Henning Kamp reverse-engineered the character 
// generator on the HP1345A digital vector display, c.1985
// Ported from https://phk.freebsd.dk/hacks/Wargames/index.html
// Uses or adapts the following resources:
// https://phk.freebsd.dk/_downloads/e52aa694fd64ff9d2a1a7291b7697f3e/hp1345_font.py
// https://phk.freebsd.dk/_downloads/a89c073235ca9c2b13d657173d32bf78/01347-80012.bin
// https://phk.freebsd.dk/_downloads/2355976608a6359335e30a88e181f1fc/1816-1500.bin

/*
 * ----------------------------------------------------------------------------
 * "THE BEER-WARE LICENSE" (Revision 42):
 * <phk@FreeBSD.org> wrote this file. As long as you retain this notice you
 * can do whatever you want with this stuff. If we meet some day, and you think
 * this stuff is worth it, you can buy me a beer in return.   Poul-Henning Kamp
 * ----------------------------------------------------------------------------
 * This file reads the ROMs and produces a list of delta-vectors.
 */

let hpLineFont;
let strokeBytes;
let indexBytes;
let romFilesLoaded = false;

function preload() {
  // Load files with loadBytes
  loadBytes("01347-80012.bin", (data) => {
    strokeBytes = data;
    checkIfBothFilesAreLoaded();
  });

  loadBytes("1816-1500.bin", (data) => {
    indexBytes = data;
    checkIfBothFilesAreLoaded();
  });
}


//=============================================
function checkIfBothFilesAreLoaded() {
  if (strokeBytes && indexBytes) {
    romFilesLoaded = true;
  }
}


//=============================================
function setup() {
  createCanvas(800, 500);
  if (romFilesLoaded){
    hpLineFont = new HP1345AFont();
  }
}


//=============================================
class HP1345AFont {
  constructor() {
    this.v = Array(256).fill([]);
    this.pts = null;
    this.idx = null;
    this.used = null;
    this.loadROMs();
  }

  loadROMs() {
    this.pts = strokeBytes.bytes;
    this.idx = indexBytes.bytes;
    this.used = Array(this.pts.length).fill(false);
    this.buildAllCharacters();
  }

  buildCharacter(ch) {
    const ia = (ch & 0x1f) | ((ch & 0xe0) << 1);
    let sa = this.idx[ia] << 2;
    sa |= ((1 ^ (ch >> 5) ^ (ch >> 6)) & 1) << 10;
    sa |= ((ch >> 7) & 1) << 11;
    if (!this.pts[sa] && !this.pts[sa + 1]) return;

    const l = [];
    while (true) {
      if (this.used[sa]) return;
      this.used[sa] = true;

      let dx = this.pts[sa] & 0x3f;
      if (this.pts[sa] & 0x40) dx = -dx;

      let dy = this.pts[sa + 1] & 0x3f;
      if (this.pts[sa + 1] & 0x40) dy = -dy;

      if (!(this.pts[sa] & 0x80)) l.push([]);
      if (l.length === 0) l.push([[0, 0]]);
      l[l.length - 1].push([dx, dy]);
      if (this.pts[sa + 1] & 0x80) break;
      sa += 2;
    }
    this.v[ch] = l;
  }

  buildAllCharacters() {
    for (let i = 0; i < 128; i++) {
      this.buildCharacter(i);
    }
    [0x9b, 0x9e, 0x91, 0x82].forEach((i) => this.buildCharacter(i));
    for (let i = 128; i < 256; i++) {
      this.buildCharacter(i);
    }
  }

  vectors(ch) {
    return this.v[ch];
  }

  bbox(ch, bbox = null, x = 0, y = 0) {
    if (!bbox) bbox = [0, 0, -999, -999];
    this.v[ch].forEach((i) =>
      i.forEach(([dx, dy]) => {
        x += dx;
        y += dy;
        bbox[0] = Math.min(bbox[0], x);
        bbox[1] = Math.min(bbox[1], y);
        bbox[2] = Math.max(bbox[2], x);
        bbox[3] = Math.max(bbox[3], y);
      })
    );
    return [bbox, x, y];
  }
  
  drawCharacter(ch, px, py) {
    let asciiCode = ch.charCodeAt(0) & 0xff;
    let x = px;
    let y = py;
    beginShape();
    this.vectors(asciiCode).forEach((j) => {
      j.forEach(([dx, dy]) => {
        x += dx;
        y -= dy;
        vertex(x, y);
      });
      endShape();
      beginShape();
    });
    endShape();
  }
  
  drawString(w, px, py) {
    const spacing = 16;
    for (let i = 0; i < w.length; i++) {
      const ch = w[i];
      this.drawCharacter(ch, px + i * spacing, py);
    }
  }
}


//=============================================
function draw() {
  background(0);
  noFill();
  stroke(255);
  strokeWeight(1);
  strokeCap(ROUND);
  strokeJoin(ROUND); 
  
  push(); 
  translate(80,80); 
  const gridSize = 16;
  const cellSize = 40;
  for (let i=0; i<126; i++){
    let ox = i%16; 
    let oy = int(i/16);
    let px = ox * cellSize;
    let py = oy * cellSize;
    let ch = String.fromCharCode(i);
    hpLineFont.drawCharacter(ch, px,py); 
  }
  pop(); 
  
  hpLineFont.drawString("Hello World", 80,420); 
}