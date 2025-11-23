// Single-stroke monospace font from "Space Type Generator"
// (c) 2019 by Kiel Mutschelknaus (@kielm), CC by-nc-sa/4.0
// From https://spacetypegenerator.com/sketch.js and
// https://spacetypegenerator.com/keyboardEngine_190103.js
// Adapted by Golan Levin, November 2025

let myKielmFont; 
let cycle = 300; // animation period

function setup() {
  createCanvas(800, 300);
  pixelDensity(2); 
  myKielmFont = new KielmFont(); 
}

function draw() {
  background(0);
  strokeCap(ROUND);
  strokeJoin(ROUND); 
  strokeWeight(1); 
  stroke(255); 
  noFill();
  
  
  let str1 = "ABCDEFGHIJKLMNOPQRSTUVWXYZ 1234567890"; 
  myKielmFont.drawString (str1, 55,50, 12.5,25.0, 0,0);
  
  let str2 = "abcdefghijklmnopqrstuvwxyz &!?_-,.:;/"; 
  myKielmFont.drawString (str2, 55,100, 12.5,25.0, 0,0);
  
  let str3 = "Space Type Generator"; 
  myKielmFont.drawStringFancy (str3, 55,150, 12.5,25.0, 0,0);
  
  //--------------
  let t = sin(TWO_PI*((frameCount%cycle)/cycle));
  let ang = map(t,-1,1, PI*1.0, PI*1.5);
  let r = 90; 
  let sx = r * (1 + cos(ang))/2; 
  let sy = r * (1 + sin(ang))/2;  
  let str4 = "Hello World"; 
  myKielmFont.drawString(str4, 55,200, 12.5,25.0, sx,sy);
}


//---------------------------------------------------------
/*!
 * The font below is adapted from Space Type Generator
 * Copyright (c) Kiel Mutschelknaus (@kielm), 2019
 * https://spacetypegenerator.com/sketch.js
 * This work is licensed under CC BY-NC-SA 4.0: the
 * Creative Commons Attribution-NonCommercial-ShareAlike 
 * 4.0 International License.
 */

class KielmFont {
  constructor() {
    this.tx = 12.5;
    this.ty = 25.0;
    this.sx = 0;
    this.sy = 0;
    this.ts = 6.0;
    
    // Build glyph dispatch table once
    this.glyphs = {
      "A": this._A, "a": this._a,
      "B": this._B, "b": this._b,
      "C": this._C, "c": this._c,
      "D": this._D, "d": this._d,
      "E": this._E, "e": this._e,
      "F": this._F, "f": this._f,
      "G": this._G, "g": this._g,
      "H": this._H, "h": this._h,
      "I": this._I, "i": this._i,
      "J": this._J, "j": this._j,
      "K": this._K, "k": this._k,
      "L": this._L, "l": this._l,
      "M": this._M, "m": this._m,
      "N": this._N, "n": this._n,
      "O": this._O, "o": this._o,
      "P": this._P, "p": this._p,
      "Q": this._Q, "q": this._q,
      "R": this._R, "r": this._r,
      "S": this._S, "s": this._s,
      "T": this._T, "t": this._t,
      "U": this._U, "u": this._u,
      "V": this._V, "v": this._v,
      "W": this._W, "w": this._w,
      "X": this._X, "x": this._x,
      "Y": this._Y, "y": this._y,
      "Z": this._Z, "z": this._z,

      "0": this._zero, "1": this._one, "2": this._two,
      "3": this._three, "4": this._four, "5": this._five,
      "6": this._six, "7": this._seven, "8": this._eight,
      "9": this._nine,

      "_": this._underscore,
      "-": this._dash,
      "?": this._question,
      ".": this._period,
      ":": this._colon,
      ";": this._semicolon,
      ",": this._comma,
      "!": this._exclaim,
      "/": this._slash,
      "&": this._amp,
      " ": this._space
    };
  }
  
  drawChar(c) {
    const fn = this.glyphs[c];
    if (fn) return fn.call(this);
  }
  
  drawString(str, px, py, tx, ty, sx, sy) {
    this.tx = tx;
    this.ty = ty;
    this.sx = sx;
    this.sy = sy;

    let x = px;
    const y = py;
    const adv = tx + sx + this.ts;

    for (let i = 0; i < str.length; i++) {
      push();
      translate(x, y);
      this.drawChar(str[i]);
      pop();
      x += adv;
    }
  }
  
  
  drawStringFancy(str, px, py, tx, ty, sx, sy) {
    this.ty = ty;
    this.sx = sx;
    this.sy = sy;

    let x = px;
    const y = py;
    for (let i = 0; i < str.length; i++) {
      // Per-character based on x position
      const localTx = 12.5;
      const localSx = 20 * (1 + sin(0.01*x+ TWO_PI*frameCount/cycle));
      this.tx = localTx;
      this.sx = localSx;
      
      push();
      translate(x, y);
      this.drawChar(str[i]);
      pop();

      // Compute per-character advance; move pen
      const adv = localTx + localSx + this.ts;
      x += adv;
    }
  }

  
  setStretch(sx, sy) {
    this.sx = sx;
    this.sy = sy;
  }

  setSize(tx, ty) {
    this.tx = tx;
    this.ty = ty;
  }
  
  setSpacing (ts) {
    this.ts = ts;
  }
  

  //-------------------------
  // Glyph designs
  
  _A() {
    const tx=this.tx,ty=this.ty,sx=this.sx,sy=this.sy;
    beginShape();
    vertex(0,ty+sy);
    vertex(tx/2+sx/2,0);
    vertex(tx+sx,ty+sy);
    endShape();
    const ang=atan((tx/2+sx/2)/(ty+sy));
    const angX=tan(ang)*(ty/3);
    line(angX,(2*ty)/3+sy,tx+sx-angX,(2*ty)/3+sy);
  }

  _a() {
    const tx=this.tx,ty=this.ty,sx=this.sx,sy=this.sy;
    beginShape();
    vertex(tx+sx,ty+sy);
    vertex(tx+sx,ty/2);
    bezierVertex(tx+sx,ty/2,tx+sx,ty/4,tx/2+sx,ty/4);
    vertex(tx/2,ty/4);
    bezierVertex(0,ty/4,0,ty/2,0,ty/2);
    endShape();
    beginShape();
    vertex(tx+sx,(3*ty)/4+sy);
    vertex(tx+sx,(3*ty)/4);
    bezierVertex(tx+sx,(3*ty)/4,tx+sx,ty/2,tx/2+sx,ty/2);
    vertex(tx/2,ty/2);
    bezierVertex(0,ty/2,0,(3*ty)/4,0,(3*ty)/4);
    vertex(0,(3*ty)/4+sy);
    bezierVertex(0,(3*ty)/4+sy,0,ty+sy,tx/2,ty+sy);
    vertex(tx/2+sx,ty+sy);
    bezierVertex(tx+sx,ty+sy,tx+sx,(3*ty)/4+sy,tx+sx,(3*ty)/4+sy);
    vertex(tx+sx,ty/2);
    endShape();
  }

  _B() {
    const tx=this.tx,ty=this.ty,sx=this.sx,sy=this.sy;
    beginShape();
    vertex(0,ty+sy);
    vertex(0,0);
    vertex(tx/2+sx,0);
    bezierVertex(tx/2+sx,0,tx+sx,0,tx+sx,ty/4);
    vertex(tx+sx,ty/4+sy/2);
    bezierVertex(tx+sx,ty/2+sy/2,tx/2+sx/2,ty/2+sy/2,tx/2+sx/2,ty/2+sy/2);
    vertex(0,ty/2+sy/2);
    endShape();
    const yoff=ty/2+sy/2;
    beginShape();
    vertex(0,yoff);
    vertex(tx/2+sx,yoff);
    bezierVertex(tx/2+sx,yoff,tx+sx,yoff,tx+sx,yoff+ty/4);
    vertex(tx+sx,yoff+ty/4+sy/2);
    bezierVertex(tx+sx,yoff+ty/2+sy/2,
                 tx/2+sx/2,yoff+ty/2+sy/2,
                 tx/2+sx/2,yoff+ty/2+sy/2);
    vertex(0,yoff+ty/2+sy/2);
    endShape();
  }

  _b() {
    const tx=this.tx,ty=this.ty,sx=this.sx,sy=this.sy;
    beginShape();
    vertex(tx+sx,ty/2);
    bezierVertex(tx+sx,ty/2,tx+sx,ty/4,tx/2+sx,ty/4);
    vertex(tx/2,ty/4);
    bezierVertex(0,ty/4,0,ty/2,0,ty/2);
    vertex(0,(3*ty)/4+sy);
    bezierVertex(0,(3*ty)/4+sy,0,ty+sy,tx/2,ty+sy);
    vertex(tx/2+sx,ty+sy);
    bezierVertex(tx+sx,ty+sy,tx+sx,(3*ty)/4+sy,tx+sx,(3*ty)/4+sy);
    vertex(tx+sx,ty/2);
    endShape();
    line(0,0,0,ty+sy);
  }

  _C() {
    const tx=this.tx,ty=this.ty,sx=this.sx,sy=this.sy;
    beginShape();
    vertex(tx+sx,ty/3);
    bezierVertex(tx+sx,ty/3,tx+sx,0,tx/2+sx,0);
    vertex(tx/2,0);
    bezierVertex(0,0,0,ty/3,0,ty/3);
    vertex(0,(2*ty)/3+sy);
    bezierVertex(0,(2*ty)/3+sy,0,ty+sy,tx/2,ty+sy);
    vertex(tx/2+sx,ty+sy);
    bezierVertex(tx+sx,ty+sy,tx+sx,(2*ty)/3+sy,tx+sx,(2*ty)/3+sy);
    endShape();
  }

  _c() {
    const tx=this.tx,ty=this.ty,sx=this.sx,sy=this.sy;
    beginShape();
    vertex(tx+sx,ty/2);
    bezierVertex(tx+sx,ty/2,tx+sx,ty/4,tx/2+sx,ty/4);
    vertex(tx/2,ty/4);
    bezierVertex(0,ty/4,0,ty/2,0,ty/2);
    vertex(0,(3*ty)/4+sy);
    bezierVertex(0,(3*ty)/4+sy,0,ty+sy,tx/2,ty+sy);
    vertex(tx/2+sx,ty+sy);
    bezierVertex(tx+sx,ty+sy,tx+sx,(3*ty)/4+sy,tx+sx,(3*ty)/4+sy);
    endShape();
  }

  _D() {
    const tx=this.tx,ty=this.ty,sx=this.sx,sy=this.sy;
    beginShape();
    vertex(tx+sx,ty/3);
    bezierVertex(tx+sx,ty/3,tx+sx,0,tx/2+sx,0);
    vertex(0,0);
    vertex(0,ty+sy);
    vertex(tx/2,ty+sy);
    vertex(tx/2+sx,ty+sy);
    bezierVertex(tx+sx,ty+sy,tx+sx,(2*ty)/3+sy,tx+sx,(2*ty)/3+sy);
    vertex(tx+sx,ty/3);
    endShape();
  }

  _d() {
    const tx=this.tx,ty=this.ty,sx=this.sx,sy=this.sy;
    beginShape();
    vertex(tx+sx,ty/2);
    bezierVertex(tx+sx,ty/2,tx+sx,ty/4,tx/2+sx,ty/4);
    vertex(tx/2,ty/4);
    bezierVertex(0,ty/4,0,ty/2,0,ty/2);
    vertex(0,(3*ty)/4+sy);
    bezierVertex(0,(3*ty)/4+sy,0,ty+sy,tx/2,ty+sy);
    vertex(tx/2+sx,ty+sy);
    bezierVertex(tx+sx,ty+sy,tx+sx,(3*ty)/4+sy,tx+sx,(3*ty)/4+sy);
    vertex(tx+sx,ty/2);
    endShape();
    line(tx+sx,0,tx+sx,ty+sy);
  }

  _E() {
    const tx=this.tx,ty=this.ty,sx=this.sx,sy=this.sy;
    beginShape();
    vertex(tx+sx,0);
    vertex(0,0);
    vertex(0,ty+sy);
    vertex(tx+sx,ty+sy);
    endShape();
    line(0,ty/2+sy/2,(2*tx)/3+sx,ty/2+sy/2);
  }

  _e() {
    const tx=this.tx,ty=this.ty,sx=this.sx,sy=this.sy;
    beginShape();
    vertex(0,(5*ty)/8+sy/2);
    vertex(tx+sx,(5*ty)/8+sy/2);
    vertex(tx+sx,ty/2);
    bezierVertex(tx+sx,ty/2,tx+sx,ty/4,tx/2+sx,ty/4);
    vertex(tx/2,ty/4);
    bezierVertex(0,ty/4,0,ty/2,0,ty/2);
    vertex(0,(3*ty)/4+sy);
    bezierVertex(0,(3*ty)/4+sy,0,ty+sy,tx/2,ty+sy);
    vertex(tx/2+sx,ty+sy);
    bezierVertex(tx+sx,ty+sy,tx+sx,(3*ty)/4+sy,tx+sx,(3*ty)/4+sy);
    endShape();
  }

  _F() {
    const tx=this.tx,ty=this.ty,sx=this.sx,sy=this.sy;
    beginShape();
    vertex(tx+sx,0);
    vertex(0,0);
    vertex(0,ty+sy);
    endShape();
    line(0,ty/2+sy/2,(2*tx)/3+sx,ty/2+sy/2);
  }

  _f() {
    const tx=this.tx,ty=this.ty,sx=this.sx,sy=this.sy;
    beginShape();
    vertex(tx/2+sx/2,ty+sy);
    vertex(tx/2+sx/2,ty/4);
    bezierVertex(tx/2+sx/2,ty/4,tx/2+sx/2,0,tx+sx/2,0);
    vertex(tx+sx,0);
    endShape();
    line(0,ty/2+sy/2,tx+sx,ty/2+sy/2);
    line(0,ty+sy,tx+sx,ty+sy);
  }

  _G() {
    const tx=this.tx,ty=this.ty,sx=this.sx,sy=this.sy;
    beginShape();
    vertex(tx+sx,ty/3);
    bezierVertex(tx+sx,ty/3,tx+sx,0,tx/2+sx,0);
    vertex(tx/2,0);
    bezierVertex(0,0,0,ty/3,0,ty/3);
    vertex(0,(2*ty)/3+sy);
    bezierVertex(0,(2*ty)/3+sy,0,ty+sy,tx/2,ty+sy);
    vertex(tx/2+sx,ty+sy);
    bezierVertex(tx+sx,ty+sy,tx+sx,(2*ty)/3+sy,tx+sx,(2*ty)/3+sy);
    endShape();
    beginShape();
    vertex(tx/2+sx/2,ty/2+sy/2);
    vertex(tx+sx,ty/2+sy/2);
    vertex(tx+sx,ty+sy);
    endShape();
  }

  _g() {
    const tx=this.tx,ty=this.ty,sx=this.sx,sy=this.sy;
    beginShape();
    vertex(tx+sx,ty/2);
    bezierVertex(tx+sx,ty/2,tx+sx,ty/4,tx/2+sx,ty/4);
    vertex(tx/2,ty/4);
    bezierVertex(0,ty/4,0,ty/2,0,ty/2);
    vertex(0,ty/2+sy);
    bezierVertex(0,ty/2+sy,0,(3*ty)/4+sy,tx/2,(3*ty)/4+sy);
    vertex(tx/2+sx,(3*ty)/4+sy);
    bezierVertex(tx+sx,(3*ty)/4+sy,tx+sx,ty/2+sy,tx+sx,ty/2+sy);
    vertex(tx+sx,ty/2);
    endShape();
    beginShape();
    vertex(tx/2+sx/2,(3*ty)/4+sy);
    vertex(tx+sx,ty+sy);
    bezierVertex(tx+sx,ty+sy,tx+sx,(5*ty)/4+sy,tx/2+sx,(5*ty)/4+sy);
    vertex(tx/2,(5*ty)/4+sy);
    bezierVertex(0,(5*ty)/4+sy,0,ty+sy,0,ty+sy);
    endShape();
    line(tx/2+sx/2,ty/4,tx+sx,ty/4);
  }

  
  
  _H() {
    const tx=this.tx,ty=this.ty,sx=this.sx,sy=this.sy;
    line(0,0,0,ty+sy);
    line(0,ty/2+sy/2,tx+sx,ty/2+sy/2);
    line(tx+sx,0,tx+sx,ty+sy);
  }

  _h() {
    const tx=this.tx,ty=this.ty,sx=this.sx,sy=this.sy;
    beginShape();
    vertex(tx+sx,ty+sy);
    vertex(tx+sx,ty/2);
    bezierVertex(tx+sx,ty/2,tx+sx,ty/4,tx/2+sx,ty/4);
    vertex(tx/2,ty/4);
    bezierVertex(0,ty/4,0,ty/2,0,ty/2);
    vertex(0,ty+sy);
    endShape();
    line(0,0,0,ty+sy);
  }

  _I() {
    const tx=this.tx,ty=this.ty,sx=this.sx,sy=this.sy;
    line(0,0,tx+sx,0);
    line(0,ty+sy,tx+sx,ty+sy);
    line(tx/2+sx/2,0,tx/2+sx/2,ty+sy);
  }

  _i() {
    const tx=this.tx,ty=this.ty,sx=this.sx,sy=this.sy;
    beginShape();
    vertex(0,ty/4);
    vertex(tx/2+sx/2,ty/4);
    vertex(tx/2+sx/2,ty+sy);
    endShape();
    line(0,ty+sy,tx+sx,ty+sy);
    line(tx/2+sx/2,0,tx/2+sx/2,ty/8);
  }

  _J() {
    const tx=this.tx,ty=this.ty,sx=this.sx,sy=this.sy;
    beginShape();
    vertex(0,(2*ty)/3+sy);
    bezierVertex(0,(2*ty)/3+sy,0,ty+sy,tx/2,ty+sy);
    vertex(tx/2+sx,ty+sy);
    bezierVertex(tx+sx,ty+sy,tx+sx,(2*ty)/3+sy,tx+sx,(2*ty)/3+sy);
    vertex(tx+sx,0);
    vertex(tx/3,0);
    endShape();
  }

  _j() {
    const tx=this.tx,ty=this.ty,sx=this.sx,sy=this.sy;
    beginShape();
    vertex(tx/4,ty/4);
    vertex((3*tx)/4+sx,ty/4);
    vertex((3*tx)/4+sx,ty+sy);
    bezierVertex((3*tx)/4+sx,ty+sy,
                 (3*tx)/4+sx,(5*ty)/4+sy,
                 tx/4+sx,(5*ty)/4+sy);
    vertex(0,(5*ty)/4+sy);
    endShape();
    line((3*tx)/4+sx,0,(3*tx)/4+sx,ty/8);
  }

  _K() {
    const tx=this.tx,ty=this.ty,sx=this.sx,sy=this.sy;
    line(0,0,0,ty+sy);
    line(0,(2*ty)/3+sy,tx+sx,0);
    const ang=atan(((2*ty)/3+sy)/(tx+sx));
    const angX=(ty/2+sy/2)/tan(ang);
    line(tx+sx-angX,ty/2+sy/2,tx+sx,ty+sy);
  }

  _k() {
    const tx=this.tx,ty=this.ty,sx=this.sx,sy=this.sy;
    line(0,0,0,ty+sy);
    line(tx+sx,ty/4,0,(3*ty)/4+sy);
    line(tx+sx,ty+sy,tx/2+sx/2,ty/2+sy/2);
  }

  _L() {
    const tx=this.tx,ty=this.ty,sx=this.sx,sy=this.sy;
    beginShape();
    vertex(0,0);
    vertex(0,ty+sy);
    vertex(tx+sx,ty+sy);
    endShape();
  }

  _l() {
    const tx=this.tx,ty=this.ty,sx=this.sx,sy=this.sy;
    beginShape();
    vertex(0,0);
    vertex(tx/2+sx/2,0);
    vertex(tx/2+sx/2,ty+sy);
    endShape();
    line(0,ty+sy,tx+sx,ty+sy);
  }

  _M() {
    const tx=this.tx,ty=this.ty,sx=this.sx,sy=this.sy;
    beginShape();
    vertex(0,ty+sy);
    vertex(0,0);
    vertex(tx/2+sx/2,(2*ty)/3+sy);
    vertex(tx+sx,0);
    vertex(tx+sx,ty+sy);
    endShape();
  }

  _m() {
    const tx=this.tx,ty=this.ty,sx=this.sx,sy=this.sy;
    line(0,ty/4,0,ty+sy);
    beginShape();
    vertex(0,(3*ty)/8);
    bezierVertex(0,(3*ty)/8,0,ty/4,tx/4,ty/4);
    vertex(tx/4+sx/2,ty/4);
    bezierVertex(tx/2+sx/2,ty/4,
                 tx/2+sx/2,(3*ty)/8,
                 tx/2+sx/2,(3*ty)/8);
    vertex(tx/2+sx/2,ty+sy);
    endShape();
    const xoff=tx/2+sx/2;
    beginShape();
    vertex(xoff,(3*ty)/8);
    bezierVertex(xoff,(3*ty)/8,xoff,ty/4,tx/4+xoff,ty/4);
    vertex(tx/4+sx/2+xoff,ty/4);
    bezierVertex(tx/2+sx/2+xoff,ty/4,
                 tx/2+sx/2+xoff,(3*ty)/8,
                 tx/2+sx/2+xoff,(3*ty)/8);
    vertex(tx/2+sx/2+xoff,ty+sy);
    endShape();
  }

  _N() {
    const tx=this.tx,ty=this.ty,sx=this.sx,sy=this.sy;
    beginShape();
    vertex(0,ty+sy);
    vertex(0,0);
    vertex(tx+sx,ty+sy);
    vertex(tx+sx,0);
    endShape();
  }

  _n() {
    const tx=this.tx,ty=this.ty,sx=this.sx,sy=this.sy;
    line(0,ty/4,0,ty+sy);
    beginShape();
    vertex(tx+sx,ty+sy);
    vertex(tx+sx,ty/2);
    bezierVertex(tx+sx,ty/2,tx+sx,ty/4,tx/2+sx,ty/4);
    vertex(tx/2,ty/4);
    bezierVertex(0,ty/4,0,ty/2,0,ty/2);
    endShape();
  }

  _O() {
    const tx=this.tx,ty=this.ty,sx=this.sx,sy=this.sy;
    beginShape();
    vertex(tx+sx,ty/3);
    bezierVertex(tx+sx,ty/3,tx+sx,0,tx/2+sx,0);
    vertex(tx/2,0);
    bezierVertex(0,0,0,ty/3,0,ty/3);
    vertex(0,(2*ty)/3+sy);
    bezierVertex(0,(2*ty)/3+sy,0,ty+sy,tx/2,ty+sy);
    vertex(tx/2+sx,ty+sy);
    bezierVertex(tx+sx,ty+sy,tx+sx,(2*ty)/3+sy,tx+sx,(2*ty)/3+sy);
    vertex(tx+sx,ty/3);
    endShape();
  }

  _o() {
    const tx = this.tx, ty = this.ty, sx = this.sx, sy = this.sy;
    beginShape();
    vertex(tx+sx,ty/2);
    bezierVertex(tx+sx,ty/2,tx+sx,ty/4,tx/2+sx,ty/4);
    vertex(tx/2,ty/4);
    bezierVertex(0,ty/4,0,ty/2,0,ty/2);
    vertex(0,(3*ty)/4+sy);
    bezierVertex(0,(3*ty)/4+sy,0,ty+sy,tx/2,ty+sy);
    vertex(tx/2+sx,ty+sy);
    bezierVertex(tx+sx,ty+sy,tx+sx,(3*ty)/4+sy,tx+sx,(3*ty)/4+sy);
    vertex(tx+sx,ty/2);
    endShape();
  }

  _P() {
    const tx = this.tx, ty = this.ty, sx = this.sx, sy = this.sy;
    beginShape();
    vertex(0,ty+sy);
    vertex(0,0);
    vertex(tx/2+sx,0);
    quadraticVertex(tx+sx,0,tx+sx,ty/4);
    vertex(tx+sx,ty/4+sy/2);
    quadraticVertex(tx+sx,ty/2+sy/2,tx/2+sx,ty/2+sy/2);
    vertex(0,ty/2+sy/2);
    endShape();
  }

  _p() {
    const tx = this.tx, ty = this.ty, sx = this.sx, sy = this.sy;
    line(0,ty/4,0,(5*ty)/4+sy);
    beginShape();
    vertex(tx+sx,ty/2);
    bezierVertex(tx+sx,ty/2,tx+sx,ty/4,tx/2+sx,ty/4);
    vertex(tx/2,ty/4);
    bezierVertex(0,ty/4,0,ty/2,0,ty/2);
    vertex(0,(3*ty)/4+sy);
    bezierVertex(0,(3*ty)/4+sy,0,ty+sy,tx/2,ty+sy);
    vertex(tx/2+sx,ty+sy);
    bezierVertex(tx+sx,ty+sy,tx+sx,(3*ty)/4+sy,tx+sx,(3*ty)/4+sy);
    vertex(tx+sx,ty/2);
    endShape();
  }

  _Q() {
    const tx = this.tx, ty = this.ty, sx = this.sx, sy = this.sy;
    beginShape();
    vertex(tx+sx,ty/3);
    bezierVertex(tx+sx,ty/3,tx+sx,0,tx/2+sx,0);
    vertex(tx/2,0);
    bezierVertex(0,0,0,ty/3,0,ty/3);
    vertex(0,(2*ty)/3+sy);
    bezierVertex(0,(2*ty)/3+sy,0,ty+sy,tx/2,ty+sy);
    vertex(tx/2+sx,ty+sy);
    bezierVertex(tx+sx,ty+sy,tx+sx,(2*ty)/3+sy,tx+sx,(2*ty)/3+sy);
    vertex(tx+sx,ty/3);
    endShape();
    line(tx/2+sx/2,ty/2+sy,tx+sx,ty+sy);
  }

  _q() {
    const tx = this.tx, ty = this.ty, sx = this.sx, sy = this.sy;
    line(tx+sx,ty/4,tx+sx,(5*ty)/4+sy);
    beginShape();
    vertex(tx+sx,ty/2);
    bezierVertex(tx+sx,ty/2,tx+sx,ty/4,tx/2+sx,ty/4);
    vertex(tx/2,ty/4);
    bezierVertex(0,ty/4,0,ty/2,0,ty/2);
    vertex(0,(3*ty)/4+sy);
    bezierVertex(0,(3*ty)/4+sy,0,ty+sy,tx/2,ty+sy);
    vertex(tx/2+sx,ty+sy);
    bezierVertex(tx+sx,ty+sy,tx+sx,(3*ty)/4+sy,tx+sx,(3*ty)/4+sy);
    vertex(tx+sx,ty/2);
    endShape();
  }

  _R() {
    const tx = this.tx, ty = this.ty, sx = this.sx, sy = this.sy;
    beginShape();
    vertex(0,ty+sy);
    vertex(0,0);
    vertex(tx/2+sx,0);
    quadraticVertex(tx+sx,0,tx+sx,ty/4);
    vertex(tx+sx,ty/4+sy/2);
    quadraticVertex(tx+sx,ty/2+sy/2,tx/2+sx,ty/2+sy/2);
    vertex(0,ty/2+sy/2);
    endShape();
    line(tx/2+sx/2,ty/2+sy/2,tx+sx,ty+sy);
  }

  _r() {
    const tx = this.tx, ty = this.ty, sx = this.sx, sy = this.sy;
    beginShape();
    vertex(tx+sx,ty/2);
    bezierVertex(tx+sx,ty/2,tx+sx,ty/4,tx/2+sx,ty/4);
    vertex(tx/2,ty/4);
    bezierVertex(0,ty/4,0,ty/2,0,ty/2);
    endShape();
    line(0,ty/4,0,ty+sy);
  }

  _S() {
    const tx = this.tx, ty = this.ty, sx = this.sx, sy = this.sy;
    beginShape();
    vertex(tx+sx,ty/4);
    bezierVertex(tx+sx,ty/4,tx+sx,0,tx/2+sx,0);
    vertex(tx/2,0);
    bezierVertex(0,0,0,ty/4,0,ty/4);
    bezierVertex(0,(2*ty)/3+sy,tx+sx,ty/3,tx+sx,(3*ty)/4+sy);
    bezierVertex(tx+sx,(3*ty)/4+sy,tx+sx,ty+sy,tx/2+sx,ty+sy);
    vertex(tx/2,ty+sy);
    bezierVertex(0,ty+sy,0,(2*ty)/3+sy,0,(2*ty)/3+sy);
    endShape();
  }

  _s() {
    const tx = this.tx, ty = this.ty, sx = this.sx, sy = this.sy;
    beginShape();
    vertex((7*tx)/8+sx,(3*ty)/8);
    bezierVertex((7*tx)/8+sx,(3*ty)/8,(7*tx)/8+sx,ty/4,tx/2+sx,ty/4);
    vertex(tx/2,ty/4);
    bezierVertex(tx/8,ty/4,tx/8,(3*ty)/8,tx/8,(3*ty)/8);
    bezierVertex(tx/8,(5*ty)/8+sy,tx+sx,(3*ty)/8,tx+sx,(3*ty)/4+sy);
    bezierVertex(tx+sx,(3*ty)/4+sy,tx+sx,ty+sy,tx/2+sx,ty+sy);
    vertex(tx/2,ty+sy);
    bezierVertex(0,ty+sy,0,(3*ty)/4+sy,0,(3*ty)/4+sy);
    endShape();
  }

  _T() {
    const tx = this.tx, ty = this.ty, sx = this.sx, sy = this.sy;
    line(0,0,tx+sx,0);
    line(tx/2+sx/2,0,tx/2+sx/2,ty+sy);
  }

  _t() {
    const tx = this.tx, ty = this.ty, sx = this.sx, sy = this.sy;
    line(0,ty/4,tx+sx,ty/4);
    beginShape();
    vertex(tx/2+sx/2,0);
    vertex(tx/2+sx/2,(3*ty)/4+sy);
    bezierVertex(tx/2+sx/2,(3*ty)/4+sy,
                 tx/2+sx/2,ty+sy,
                 (3*tx)/4+sx/2,ty+sy);
    vertex(tx+sx,ty+sy);
    endShape();
  }
  
  _U() {
    const tx=this.tx, ty=this.ty, sx=this.sx, sy=this.sy;
    beginShape();
    vertex(0,0);
    vertex(0,2*ty/3+sy);
    bezierVertex(0,2*ty/3+sy,0,ty+sy,tx/2,ty+sy);
    vertex(tx/2+sx,ty+sy);
    bezierVertex(tx+sx,ty+sy,tx+sx,2*ty/3+sy,tx+sx,2*ty/3+sy);
    vertex(tx+sx,0);
    endShape();
  }

  _u() {
    const tx=this.tx, ty=this.ty, sx=this.sx, sy=this.sy;
    line(tx+sx,ty/4,tx+sx,ty+sy);
    beginShape();
    vertex(0,ty/4);
    vertex(0,3*ty/4+sy);
    bezierVertex(0,3*ty/4+sy,0,ty+sy,tx/2,ty+sy);
    vertex(tx/2+sx,ty+sy);
    bezierVertex(tx+sx,ty+sy,tx+sx,3*ty/4+sy,tx+sx,3*ty/4+sy);
    endShape();
  }

  _V() {
    const tx=this.tx, ty=this.ty, sx=this.sx, sy=this.sy;
    beginShape();
    vertex(0,0);
    vertex(tx/2+sx/2,ty+sy);
    vertex(tx+sx,0);
    endShape();
  }

  _v() {
    const tx=this.tx, ty=this.ty, sx=this.sx, sy=this.sy;
    beginShape();
    vertex(0,ty/4);
    vertex(tx/2+sx/2,ty+sy);
    vertex(tx+sx,ty/4);
    endShape();
  }

  _W() {
    const tx=this.tx, ty=this.ty, sx=this.sx, sy=this.sy;
    beginShape();
    vertex(0,0);
    vertex(tx/4,ty+sy);
    vertex(tx/2+sx/2,ty/3);
    vertex(3*tx/4+sx,ty+sy);
    vertex(tx+sx,0);
    endShape();
  }

  _w() {
    const tx=this.tx, ty=this.ty, sx=this.sx, sy=this.sy;
    beginShape();
    vertex(0,ty/4);
    vertex(tx/4+sx/4,ty+sy);
    vertex(tx/2+sx/2,ty/2+sy/2);
    vertex(3*tx/4+3*sx/4,ty+sy);
    vertex(tx+sx,ty/4);
    endShape();
  }

  _X() {
    const tx=this.tx, ty=this.ty, sx=this.sx, sy=this.sy;
    line(0,0,tx+sx,ty+sy);
    line(0,ty+sy,tx+sx,0);
  }

  _x() {
    const tx=this.tx, ty=this.ty, sx=this.sx, sy=this.sy;
    line(0,ty/4,tx+sx,ty+sy);
    line(0,ty+sy,tx+sx,ty/4);
  }

  _Y() {
    const tx=this.tx, ty=this.ty, sx=this.sx, sy=this.sy;
    beginShape();
    vertex(0,0);
    vertex(tx/2+sx/2,ty/2+sy/2);
    vertex(tx+sx,0);
    endShape();
    line(tx/2+sx/2,ty/2+sy/2,tx/2+sx/2,ty+sy);
  }

  _y() {
    const tx=this.tx, ty=this.ty, sx=this.sx, sy=this.sy;
    beginShape();
    vertex(0,ty/4);
    vertex(tx/2+sx/2,ty+sy);
    vertex(tx+sx,ty/4);
    endShape();
    beginShape();
    vertex(tx/2+sx/2,ty+sy);
    bezierVertex(tx/2+sx/2,ty+sy,tx/2+sx/2,5*ty/4+sy,sx/2,5*ty/4+sy);
    vertex(0,5*ty/4+sy);
    endShape();
  }

  _Z() {
    const tx=this.tx, ty=this.ty, sx=this.sx, sy=this.sy;
    beginShape();
    vertex(0,0);
    vertex(tx+sx,0);
    vertex(0,ty+sy);
    vertex(tx+sx,ty+sy);
    endShape();
  }

  _z() {
    const tx=this.tx, ty=this.ty, sx=this.sx, sy=this.sy;
    beginShape();
    vertex(0,ty/4);
    vertex(tx+sx,ty/4);
    vertex(0,ty+sy);
    vertex(tx+sx,ty+sy);
    endShape();
  }
  
  _underscore() {
    const tx=this.tx, ty=this.ty, sx=this.sx, sy=this.sy;
    line(0,ty+sy,tx+sx,ty+sy);
  }

  _dash() {
    const tx=this.tx, ty=this.ty, sx=this.sx, sy=this.sy;
    line(0,ty/2+sy/2,tx+sx,ty/2+sy/2);
  }

  _question() {
    const tx=this.tx, ty=this.ty, sx=this.sx, sy=this.sy;
    beginShape();
    vertex(0,ty/3);
    bezierVertex(0,ty/3,0,0,tx/2,0);
    vertex(tx/2+sx,0);
    bezierVertex(tx+sx,0,tx+sx,ty/3,tx+sx,ty/3);
    vertex(tx+sx,ty/3+sy);
    bezierVertex(tx+sx,ty/3+sy,tx+sx,ty/3+ty/4+sy,tx/2+sx/2,ty/3+ty/4+sy);
    vertex(tx/2+sx/2,3*ty/4+sy);
    endShape();
    line(tx/2+sx/2,7*ty/8+sy,tx/2+sx/2,ty+sy);
  }

  _period() {
    const tx=this.tx, ty=this.ty, sx=this.sx, sy=this.sy;
    line(tx/2+sx/2,7*ty/8+sy,tx/2+sx/2,ty+sy);
  }

  _colon() {
    const tx=this.tx, ty=this.ty, sx=this.sx, sy=this.sy;
    line(tx/2+sx/2,ty/2+sy/2-ty/8,tx/2+sx/2,ty/2+sy/2);
    line(tx/2+sx/2,7*ty/8+sy,tx/2+sx/2,ty+sy);
  }

  _semicolon() {
    const tx=this.tx, ty=this.ty, sx=this.sx, sy=this.sy;
    line(tx/2+sx/2,ty/2+sy/2-ty/8,tx/2+sx/2,ty/2+sy/2);
    line(tx/2+sx/2,7*ty/8+sy,tx/2+sx/2-tx/4,ty+sy);
  }

  _comma() {
    const tx=this.tx, ty=this.ty, sx=this.sx, sy=this.sy;
    line(tx/2+sx/2,7*ty/8+sy,tx/2+sx/2-tx/4,ty+sy);
  }

  _exclaim() {
    const tx=this.tx, ty=this.ty, sx=this.sx, sy=this.sy;
    line(tx/2+sx/2,0,tx/2+sx/2,3*ty/4+sy);
    line(tx/2+sx/2,7*ty/8+sy,tx/2+sx/2,ty+sy);
  }

  _slash() {
    const tx=this.tx, ty=this.ty, sx=this.sx, sy=this.sy;
    line(0,ty+sy,tx+sx,0);
  }

  _amp() {
    const tx=this.tx, ty=this.ty, sx=this.sx, sy=this.sy;
    beginShape();
    vertex(tx+sx,ty+sy);
    quadraticVertex(tx/8,ty/4,tx/8,ty/8);
    quadraticVertex(tx/8,0,3*tx/8,0);
    vertex(3*tx/8+sx,0);
    bezierVertex(5*tx/8+sx,0,5*tx/8+sx,ty/8,5*tx/8+sx,ty/8);
    bezierVertex(5*tx/8+sx,ty/4,0,ty/2+sy,0,3*ty/4+sy);
    quadraticVertex(0,ty+sy,tx/2,ty+sy);
    vertex(tx/2+sx,ty+sy);
    bezierVertex(tx+sx,ty+sy,tx+sx,ty/2+sy/2,tx+sx,ty/2+sy/2);
    vertex(3*tx/4+sx,ty/2+sy/2);
    endShape();
  }

  _space() {
    // intentionally empty
  }
  
  _one() {
    const tx=this.tx, ty=this.ty, sx=this.sx, sy=this.sy;
    beginShape();
    vertex(0,ty/4);
    vertex(tx/2+sx/2,0);
    vertex(tx/2+sx/2,ty+sy);
    endShape();
    line(0,ty+sy,tx+sx,ty+sy);
  }

  _two() {
    const tx=this.tx, ty=this.ty, sx=this.sx, sy=this.sy;
    beginShape();
    vertex(0,ty/3);
    quadraticVertex(0,0,tx/2,0);
    vertex(tx/2+sx,0);
    quadraticVertex(tx+sx,0,tx+sx,ty/3);
    vertex(tx+sx,ty/3+sy);
    bezierVertex(tx+sx,2*ty/3+sy,0,2*ty/3+sy,0,ty+sy);
    vertex(tx+sx,ty+sy);
    endShape();
  }

  _three() {
    const tx=this.tx, ty=this.ty, sx=this.sx, sy=this.sy;
    beginShape();
    vertex(0,0);
    vertex(tx+sx,0);
    vertex(tx/2+sx/2,ty/3);
    quadraticVertex(tx+sx,ty/3,tx+sx,2*ty/3);
    vertex(tx+sx,2*ty/3+sy);
    quadraticVertex(tx+sx,ty+sy,tx/2+sx,ty+sy);
    vertex(tx/2,ty+sy);
    bezierVertex(0,ty+sy,0,2*ty/3+sy,0,2*ty/3+sy);
    endShape();
  }

  _four() {
    const tx=this.tx, ty=this.ty, sx=this.sx, sy=this.sy;
    beginShape();
    vertex(tx/3,0);
    vertex(0,2*ty/3+sy);
    vertex(tx+sx,2*ty/3+sy);
    endShape();
    line(2*tx/3+sx,0,2*tx/3+sx,ty+sy);
  }

  _five() {
    const tx=this.tx, ty=this.ty, sx=this.sx, sy=this.sy;
    beginShape();
    vertex(tx+sx,0);
    vertex(0,0);
    vertex(0,ty/3);
    vertex(tx/2+sx,ty/3);
    quadraticVertex(tx+sx,ty/3,tx+sx,2*ty/3);
    vertex(tx+sx,2*ty/3+sy);
    quadraticVertex(tx+sx,ty+sy,tx/2+sx,ty+sy);
    bezierVertex(0,ty+sy,0,2*ty/3+sy,0,2*ty/3+sy);
    endShape();
  }

  _six() {
    const tx=this.tx, ty=this.ty, sx=this.sx, sy=this.sy;
    beginShape();
    vertex(tx+sx,2*ty/3+sy);
    quadraticVertex(tx+sx,ty+sy,tx/2+sx,ty+sy);
    vertex(tx/2,ty+sy);
    bezierVertex(0,ty+sy,0,2*ty/3+sy,0,2*ty/3+sy);
    vertex(0,2*ty/3);
    quadraticVertex(0,ty/3,tx/2,ty/3);
    vertex(tx/2+sx,ty/3);
    bezierVertex(tx+sx,ty/3,tx+sx,2*ty/3,tx+sx,2*ty/3);
    vertex(tx+sx,2*ty/3+sy);
    endShape();
    beginShape();
    vertex(0,2*ty/3);
    quadraticVertex(0,0,2*tx/3,0);
    endShape();
  }

  _seven() {
    const tx=this.tx, ty=this.ty, sx=this.sx, sy=this.sy;
    beginShape();
    vertex(0,0);
    vertex(tx+sx,0);
    vertex(tx/2+sx/2,ty+sy);
    endShape();
  }

  _eight() {
    const tx=this.tx, ty=this.ty, sx=this.sx, sy=this.sy;
    // top loop
    beginShape();
    vertex(0,ty/4);
    quadraticVertex(0,0,tx/2,0);
    vertex(tx/2+sx,0);
    bezierVertex(tx+sx,0,tx+sx,ty/4,tx+sx,ty/4);
    vertex(tx+sx,ty/4+sy/2);
    quadraticVertex(tx+sx,ty/2+sy/2,tx/2+sx,ty/2+sy/2);
    vertex(tx/2,ty/2+sy/2);
    bezierVertex(0,ty/2+sy/2,0,ty/4+sy/2,0,ty/4+sy/2);
    vertex(0,ty/4);
    endShape();
    // bottom loop (translate removed)
    const yoff = ty/2 + sy/2;
    beginShape();
    vertex(0,yoff+ty/4);
    quadraticVertex(0,yoff,tx/2,yoff);
    vertex(tx/2+sx,yoff);
    bezierVertex(tx+sx,yoff,tx+sx,yoff+ty/4,tx+sx,yoff+ty/4);
    vertex(tx+sx,yoff+ty/4+sy/2);
    quadraticVertex(tx+sx,yoff+ty/2+sy/2,tx/2+sx,yoff+ty/2+sy/2);
    vertex(tx/2,yoff+ty/2+sy/2);
    bezierVertex(0,yoff+ty/2+sy/2,0,yoff+ty/4+sy/2,0,yoff+ty/4+sy/2);
    vertex(0,yoff+ty/4);
    endShape();
  }

  _nine() {
    const tx=this.tx, ty=this.ty, sx=this.sx, sy=this.sy;
    beginShape();
    vertex(0,ty/3);
    quadraticVertex(0,0,tx/2,0);
    vertex(tx/2+sx,0);
    bezierVertex(tx+sx,0,tx+sx,ty/3,tx+sx,ty/3);
    vertex(tx+sx,ty/3+sy);
    quadraticVertex(tx+sx,2*ty/3+sy,tx/2+sx,2*ty/3+sy);
    vertex(tx/2,2*ty/3+sy);
    bezierVertex(0,2*ty/3+sy,0,ty/3+sy,0,ty/3+sy);
    vertex(0,ty/3);
    endShape();
    line(tx+sx,ty/3+sy,tx+sx,ty+sy);
  }

  _zero() {
    const tx=this.tx, ty=this.ty, sx=this.sx, sy=this.sy;
    beginShape();
    vertex(tx/2+sx,0);
    quadraticVertex(tx+sx,0,tx+sx,ty/3);
    vertex(tx+sx,2*ty/3+sy);
    quadraticVertex(tx+sx,ty+sy,tx/2+sx,ty+sy);
    vertex(tx/2,ty+sy);
    quadraticVertex(0,ty+sy,0,2*ty/3+sy);
    vertex(0,ty/3);
    quadraticVertex(0,0,tx/2,0);
    vertex(tx/2+sx,0);
    endShape();
    line(2*tx/3+sx,ty/3,tx/3,2*ty/3+sy);
  }
}

//---------
// EOF
