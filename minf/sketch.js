// "minf" is a CC0 ultra-minimal single-stroke vector font by Golan Levin.
// All minf glyphs are constructed from 4 points, connected by 3 lines.
// (None of the lines have zero length, nor double back on themselves.)
// No claims are made about minf's attractiveness or legibility. 
//
// All of the (x,y) values in minf's glyph coordinates are stored in 2 bits.
// Therefore the alphabet is defined by 26*8*2 = 416 bits = 52 bytes of data. 
// In practice it is convenient to store this in a base-64 encoded string. 
// This expands the complete font storage somewhat, to the 72-byte string:
// +T4D0dE+zy1tG4Mdw/oDnxm/CLLTDwR/Nd8x/R1xMNL8HhNd0vOLHRvfF50X/R/TBcMdPw==

let minf; 
function setup() {
  createCanvas(800, 200);
  let minfEncoded = "+T4D0dE+zy1tG4Mdw/oDnxm/CLLTDwR/Nd8x/R1xMNL8HhNd0vOLHRvfF50X/R/TBcMdPw==";
  minf = decodeBase64ToMinf(minfEncoded); 
}

function draw() {
  background(0);
  stroke(255); 
  drawMinfString("abcdefghijklmnopqrstuvwxyz", 40, 40, 7); 
  drawMinfString("hello world", 40, 100, 7); 
}

function drawMinfString(str, x,y, sca){
  noFill(); 
  strokeJoin(ROUND);
  str = str.toUpperCase(); 
  let px = x; 
  for (let i = 0; i < str.length; i++) {
    const char = str[i];
    let codePoint = char.charCodeAt(0) - 65;
    if ((codePoint >= 0) && (codePoint < 26)){
      drawMinfChar(codePoint, px,y, sca); 
    } 
    px += sca * 4;
  }
}

function drawMinfChar(ch, x,y, sca){
  beginShape(); 
  for (let i=0; i<=3; i++){
    let px = x + sca * minf[ch][i][0]; 
    let py = y + sca * minf[ch][i][1] * 2;
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
    farr.push([[x0,y0],[x1,y1],[x2,y2],[x3,y3]]);
  }
  return farr;
}


//==============================================================
// If you'd like to alter the minf letterforms, feel free;
// adjust the arrays below, then call compressMinfRaw()
// to get the new base-64 compressed string. 

const minfRaw = [
  [[3,3],[2,1],[0,3],[3,2]],/*a*/
  [[0,0],[0,3],[3,1],[0,1]],/*b*/
  [[3,1],[0,1],[0,3],[3,2]],/*c*/
  [[3,0],[3,3],[0,2],[3,1]],/*d*/
  [[1,2],[3,1],[0,1],[2,3]],/*e*/
  [[2,0],[0,3],[0,1],[3,1]],/*f*/
  [[3,0],[0,3],[3,3],[2,2]],/*g*/
  [[0,0],[0,3],[2,1],[3,3]],/*h*/
  [[0,1],[2,1],[2,3],[3,3]],/*i*/
  [[0,0],[2,0],[2,3],[0,2]],/*j*/
  [[3,1],[0,3],[0,0],[3,3]],/*k*/
  [[0,0],[1,0],[1,3],[3,3]],/*l*/
  [[0,3],[1,1],[3,1],[3,3]],/*m*/
  [[0,3],[0,1],[3,3],[3,1]],/*n*/
  [[0,1],[3,1],[1,3],[0,1]],/*o*/
  [[0,3],[0,0],[3,1],[0,2]],/*p*/
  [[3,3],[3,0],[0,1],[3,2]],/*q*/
  [[0,1],[0,3],[1,1],[3,1]],/*r*/
  [[3,1],[0,2],[3,3],[0,3]],/*s*/
  [[2,0],[2,3],[0,1],[3,1]],/*t*/
  [[0,1],[2,3],[3,1],[3,3]],/*u*/
  [[0,1],[1,3],[2,1],[3,1]],/*v*/
  [[0,1],[1,3],[3,3],[3,1]],/*w*/
  [[0,1],[3,3],[3,1],[0,3]],/*x*/
  [[0,0],[1,1],[3,0],[0,3]],/*y*/
  [[0,1],[3,1],[0,3],[3,3]],/*z*/
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
