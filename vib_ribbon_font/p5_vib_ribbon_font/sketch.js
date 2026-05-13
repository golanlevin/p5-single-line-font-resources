// Display the extracted Vib-Ribbon Latin single-stroke font.
// Font data is loaded from vib_ribbon_latin_stroke_font.js

let myVibFontEn;
let myVibFontJp;
let bAnimating = false;

function setup() {
  createCanvas(800, 870);
  myVibFontEn = new VibRibbonFont(VIB_RIBBON_LATIN_STROKE_FONT);
  myVibFontJp = new VibRibbonFont(VIB_RIBBON_JAPANESE_STROKE_FONT);
}

function mousePressed(){
  bAnimating = !bAnimating;
}

function draw() {
  background("black");
  stroke("white");
  strokeWeight(1);
  noFill();

  let tracking = 3;
  let sca = 42;
  let ty = 30;
  let dy = 60;
  myVibFontEn.drawString("ABCDEFGHIJKLMNOPQRSTUVWXYZ", 60, ty += dy, sca, tracking);
  myVibFontEn.drawString("abcdefghijklmnopqrstuvwxyz", 60, ty += dy, sca, tracking);
  myVibFontEn.drawString("1234567890 !?&.,-()\u00A1\u00BF", 60, ty += dy, sca, tracking);
  myVibFontEn.drawString("Hello World!", 60, ty += dy, sca, tracking);

  //---------------------------
  // Show Japanese version at the bottom of the canvas
  ty = 600; 
  sca = 36;
  dy = 60;
  myVibFontJp.drawString("アイウエオカキクケコサシスセソタチツテト", 60, ty += dy, sca, tracking);
  myVibFontJp.drawString("ナニヌネノハヒフヘホマミムメモヤユヨラリルレロワン", 60, ty += dy, sca, tracking);
  myVibFontJp.drawString("ャュョッァィゥェォ゛゜",60, ty += dy, sca, tracking);
 
  //---------------------------
  // Draw grid of supported Windows-1252 extended Latin characters
  ty = 360;
  sca = 21;
  dy = 30;
  tracking = 3;
  let decoder = new TextDecoder("windows-1252");
  for (let i = 0xC0; i <= 255; i++) {
    let hex = i.toString(16).toUpperCase().padStart(2, "0");
    let bytes = new Uint8Array([i]);
    let ch = decoder.decode(bytes);
    let tx = 60 + (i % 8) * 87;
    stroke(102);
    myVibFontEn.drawString(hex, tx, ty, sca, tracking);
    stroke("white");
    myVibFontEn.drawString(ch, tx + 30, ty, sca, tracking);
    if (i % 8 === 7) {
      ty += dy;
    }
  }

}

function keyPressed() {
  if (key === "s") {
    save("vib_ribbon_latin_stroke_font.png");
  }
}

//=====================================================
// Class to handle Vib-Ribbon JSON font rendering
class VibRibbonFont {
  constructor(fontData) {
    this.fontData = fontData;
    this.glyphs = Object.assign(
      {},
      fontData.glyphs || {},
      fontData.inferred_accented_glyphs || {}
    );
    this.unitsPerEm = 180;
    this.defaultAdvance = 58;
  }

  //---------------------------------------------------------
  // Draw a string at the specified position and scale
  drawString(str, x, y, sca, tracking = 0) {
    let cursorX = x;
    for (const chr of str) {
      if (chr === " ") {
        cursorX += sca * 0.58 + tracking;
        continue;
      }
      const glyph = this.glyphs[chr];
      if (glyph) {
        this.drawGlyph(glyph, cursorX, y, sca);
        cursorX += this.getAdvance(glyph, sca) + tracking;
      } else {
        cursorX += sca * 0.48 + tracking;
      }
    }
  }

  //---------------------------------------------------------
  // Draw a single glyph at the specified position and scale
  drawGlyph(glyph, x, y, sca) {
    const s = sca / this.unitsPerEm;
    const nStrokes = glyph.strokes.length; 
    for (let i=0; i<nStrokes; i++){
      let strokePath = glyph.strokes[i]; 
      let p0x = strokePath[0][0];
      let p0y = strokePath[0][1];
      let p1x = strokePath[1][0];
      let p1y = strokePath[1][1];
      if (bAnimating){ // It's Vib Ribbon after all
        let animAmount = mouseX/6; 
        p0x += (noise(x + p0x*(11+i), y + p0y*(11+i), frameCount+123) - 0.5) * animAmount;
        p0y += (noise(x + p0x*(11+i), y + p0y*(11+i), frameCount+234) - 0.5) * animAmount;
        p1x += (noise(x + p1x*(10+i), y + p1y*(10+i), frameCount+123) - 0.5) * animAmount;
        p1y += (noise(x + p1x*(10+i), y + p1y*(10+i), frameCount+234) - 0.5) * animAmount;
      }
      line(
        x + p0x * s,
        y + p0y * s,
        x + p1x * s,
        y + p1y * s
      );
    }
  }

  //---------------------------------------------------------
  // Estimate advance from glyph bounds, with a minimum width
  getAdvance(glyph, sca) {
    const b = glyph.bounds;
    const width = b ? b.max_x - b.min_x : this.defaultAdvance;
    const advanceUnits = Math.max(this.defaultAdvance, width + 22);
    return advanceUnits * (sca / this.unitsPerEm);
  }
}
