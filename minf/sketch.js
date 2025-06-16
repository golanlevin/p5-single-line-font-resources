// "minf" is a CC0 ultra-minimal single-stroke vector font by Golan Levin.
// All minf glyphs are constructed from 4 points,
// continuously connected in one polyline stroke by 3 line segments.
// (None of the lines have zero length, nor double back on themselves.)
// No claims are made about minf's attractiveness or legibility. 
//
// All of the (x,y) values in minf's glyph coordinates are stored in 2 bits.
// Therefore the alphabet is defined by 26*8*2 = 416 bits = 52 bytes of data. 
// In practice it is convenient to store this in a base-64 encoded string. 
// This expands the storage somewhat to the 72-byte string,
// +T4D0dE+zy1tG4Mdw/oDnxm/CLLTDwR/Nd8x/R1xMNL8HhNd0vOLHRvfF50X/R/TBcMdPw==

let minf; // a minimal font

function setup() {
  createCanvas(800, 200);
  let minfEncoded = "+T4D0dE+zy1tG4Mdw/oDnxm/CLLTDwR/Nd8x/R1xMNL8HhNd0vOLHRvfF50X/R/TBcMdPw==";
  minf = decodeBase64ToMinf(minfEncoded); 
  
  /* alternatively, load uncompressed data into memory (see below): */
  // minf = minfRaw; 
}

function draw() {
  background(0);
  stroke(255); 
  drawMinfString("abcdefghijklmnopqrstuvwxyz", 40, 40, 7); 
  drawMinfString("hello world", 40, 100, 7); 
}

function keyPressed(){
  if (key == 's'){
    exportToSVGFont(minf, "MinfFont", 1000);
  }
}

function drawMinfString(str, x,y, sca){
  noFill(); 
  strokeJoin(ROUND);
  str = str.toUpperCase(); 
  let px = x; 
  for (let i = 0; i < str.length; i++) {
    const chr = str[i];
    let codePoint = chr.charCodeAt(0) - 65;
    if ((codePoint >= 0) && (codePoint < 26)){
      drawMinfChar(codePoint, px,y, sca); 
    } 
    px += sca * 4;
  }
}

function drawMinfChar(ch, x,y, sca){
  beginShape(); 
  for (let i=0; i<=3; i++){
    let px = x + sca * minf[ch][0][i][0]; 
    let py = y + sca * minf[ch][0][i][1] * 2;
    vertex(px,py);
  }
  endShape(); 
}

function decodeBase64ToMinf(base64String) {
  const farr = [];
  const binaryString = atob(base64String);
  for (let i = 0; i < binaryString.length; i += 2) {
    const highByte = binaryString.charCodeAt(i);
    const lowByte = binaryString.charCodeAt(i + 1);
    const value = (highByte << 8) | lowByte;
    const x0 = (value >> 14) & 0b11;
    const y0 = (value >> 12) & 0b11;
    const x1 = (value >> 10) & 0b11;
    const y1 = (value >> 8) & 0b11;
    const x2 = (value >> 6) & 0b11;
    const y2 = (value >> 4) & 0b11;
    const x3 = (value >> 2) & 0b11;
    const y3 = value & 0b11;
    farr.push([[[x0,y0],[x1,y1],[x2,y2],[x3,y3]]]);
  }
  return farr;
}


//==============================================================
// If you'd like to alter the minf letterforms, feel free;
// adjust the arrays below, then call compressMinfRaw()
// to get the new base-64 compressed string. 
// Each glyph is assumed to consist of a single stroke. 

const minfRaw = [
  [[[3,3],[2,1],[0,3],[3,2]]],/*a*/
  [[[0,0],[0,3],[3,1],[0,1]]],/*b*/
  [[[3,1],[0,1],[0,3],[3,2]]],/*c*/
  [[[3,0],[3,3],[0,2],[3,1]]],/*d*/
  [[[1,2],[3,1],[0,1],[2,3]]],/*e*/
  [[[2,0],[0,3],[0,1],[3,1]]],/*f*/
  [[[3,0],[0,3],[3,3],[2,2]]],/*g*/
  [[[0,0],[0,3],[2,1],[3,3]]],/*h*/
  [[[0,1],[2,1],[2,3],[3,3]]],/*i*/
  [[[0,0],[2,0],[2,3],[0,2]]],/*j*/
  [[[3,1],[0,3],[0,0],[3,3]]],/*k*/
  [[[0,0],[1,0],[1,3],[3,3]]],/*l*/
  [[[0,3],[1,1],[3,1],[3,3]]],/*m*/
  [[[0,3],[0,1],[3,3],[3,1]]],/*n*/
  [[[0,1],[3,1],[1,3],[0,1]]],/*o*/
  [[[0,3],[0,0],[3,1],[0,2]]],/*p*/
  [[[3,3],[3,0],[0,1],[3,2]]],/*q*/
  [[[0,1],[0,3],[1,1],[3,1]]],/*r*/
  [[[3,1],[0,2],[3,3],[0,3]]],/*s*/
  [[[2,0],[2,3],[0,1],[3,1]]],/*t*/
  [[[0,1],[2,3],[3,1],[3,3]]],/*u*/
  [[[0,1],[1,3],[2,1],[3,1]]],/*v*/
  [[[0,1],[1,3],[3,3],[3,1]]],/*w*/
  [[[0,1],[3,3],[3,1],[0,3]]],/*x*/
  [[[0,0],[1,1],[3,0],[0,3]]],/*y*/
  [[[0,1],[3,1],[0,3],[3,3]]],/*z*/
];

function compressMinfRaw(){
  let binaryStr = ""; 
  for (let i=0; i<minfRaw.length; i++){
    let result = 
      (minfRaw[i][0][0] << 14) | (minfRaw[i][0][1] << 12) | 
      (minfRaw[i][1][0] << 10) | (minfRaw[i][1][1] <<  8) |
      (minfRaw[i][2][0] <<  6) | (minfRaw[i][2][1] <<  4) | 
      (minfRaw[i][3][0] << 2)  | (minfRaw[i][3][1]      ) ;
    let buffer = new ArrayBuffer(2);
    let view = new DataView(buffer);
    view.setUint16(0, result, false); 
    let resultBinary = String.fromCharCode(view.getUint8(0), view.getUint8(1));
    binaryStr += resultBinary; 
  }
  let encoded = btoa(binaryStr);
  return encoded; 
}


// Function to export a single-stroke typeface to SVG 1.1 Font format
function exportToSVGFont(typeface, fontName, unitsPerEm) {
  let svgFont = `<?xml version="1.0" encoding="UTF-8"?>\n`;
  svgFont += `<svg xmlns="http://www.w3.org/2000/svg" `; 
  svgFont += `xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1">\n`;
  svgFont += `<defs>\n`;
  svgFont += `<font id="${fontName}" horiz-adv-x="${unitsPerEm}">\n`;
  svgFont += `  <font-face font-family="${fontName}" `;
  svgFont += `units-per-em="${unitsPerEm}" ascent="${0.8 * unitsPerEm}" `; 
  svgFont += `descent="${-0.2 * unitsPerEm}" />\n`;
  svgFont += `  <missing-glyph horiz-adv-x="${unitsPerEm}" />\n`;

  // Iterate over each glyph in the typeface
  for (let i = 0; i < typeface.length; i++) {
    const charCode = 65 + i; // Unicode for A-Z
    const unicodeChar = String.fromCharCode(charCode);
    const glyphData = typeface[i];

    // Generate SVG path data for the glyph
    let pathData = "";
    let nStrokesInGlyph = glyphData.length; 
    for (let s=0; s<nStrokesInGlyph; s++){
      let aStroke = glyphData[s]; 
      let nPointsInStroke = aStroke.length;
      for (let j = 0; j < nPointsInStroke; j++) {
        const [x, y] = aStroke[j];
        const command = j === 0 ? "M" : "L";
        pathData += `${command}${x * unitsPerEm / 4},${-y * unitsPerEm / 4} `;
      }
    }
    svgFont += `  <glyph unicode="${unicodeChar}" `
    svgFont += `horiz-adv-x="${unitsPerEm}" `
    svgFont += `d="${pathData.trim()}" />\n`;
  }

  svgFont += `</font>\n`;
  svgFont += `</defs>\n`;
  svgFont += `</svg>`;
  saveStrings([svgFont], `${fontName}.svg`);
}
