// Typode (2013) is a procedural, monospace, single-stroke font
// by Santiago Ortiz / Moebio: https://moebio.com/research/typode/
// Ported to p5.js by Golan Levin, 2025 / Shared with permission.

let follow_mouseX = 0;
let follow_mouseY = 0;

let TYPODE_MAX_TEXT_WIDTH = 650;
let TYPODE_LINE_SPACING = 30;
let TYPODE_SPACE = 3;
let TYPODE_SCALE = 6;

let transformations = [];
let whichTransformation = 0;
let transformation;

//----------------------------------------------
function setup() {
  createCanvas(800, 300);
  transformations = [identity, fishEye, vibrato, rotato, wave];
  transformation = transformations[whichTransformation];
}

//----------------------------------------------
function draw() {
  background(0);
  stroke(255);
  strokeWeight(1);
  strokeJoin(ROUND);

  //follow_mouseX, follow_mouseY are used as a point that follows the cursor softly
  follow_mouseX = 0.8 * follow_mouseX + 0.2 * mouseX;
  follow_mouseY = 0.8 * follow_mouseY + 0.2 * mouseY;
  
  let theText = "Typode is a procedural single-stroke "; 
  theText += "font by Santiago Ortiz / Moebio.\n";
  theText += "ABCDEFGHIJKLMNOPQRSTUVWXYZ\n";
  theText += "abcdefghijklmnopqrstuvwxyz\n";
  theText += "0123456789 [,.;:+*()<>/\\\"'=%$&].\n"
  theText += "Click to shift transformation!";

  drawTypodeString(theText, 75,60, TYPODE_SCALE); 
}


//----------------------------------------------
function drawTypodeString(str, px,py, sca) {
  let x0 = px; 
  let y0 = py; 
  
  for (var i = 0; i < str.length; i++) {
    let ch = str.charAt(i);
    if (ch == "\n" && TYPODE_MAX_TEXT_WIDTH != 0) {
      y0 += TYPODE_LINE_SPACING;
      x0 = px;
      continue;
    }
    drawTypodeCharacter(ch, x0,y0, sca); 
 
    if (!(x0 === px && ch === " ")) {
      x0 += sca * TYPODE_SPACE;
    }
    let xnext = x0 + sca * TYPODE_SPACE;
    let tr = TYPODE_MAX_TEXT_WIDTH + px;
    if ((TYPODE_MAX_TEXT_WIDTH > 0) && (xnext > tr)) {
      y0 += TYPODE_LINE_SPACING;
      x0 = px;
    }
  }
}

//----------------------------------------------
function drawTypodeCharacter(ch, x0,y0, sca){ 
  let polylines = [];
  let glyph = typodeFont[ch];
  
  if (glyph == null) {
    var symbolPosition = typodeFont.symbols[0].indexOf(ch);
    if (symbolPosition != -1){
      glyph = typodeFont[typodeFont.symbols[1][symbolPosition]];
    }
  }

  noFill(); 
  for (let i = 0; i < glyph.length; i++) {
    let aPolyLine = glyph[i];
    if (aPolyLine.length == 0) continue;

    beginShape();
    for (let j = 0; j < aPolyLine.length; j++) {
      let px = x0 + sca * aPolyLine[j][0]; 
      let py = y0 + sca * aPolyLine[j][1]; 
      let aPoint = transformation(px,py);
      vertex(aPoint[0], aPoint[1]);
    }
    endShape(); 
  }
}

//----------------------------------------------
function mousePressed(){
  whichTransformation = (whichTransformation+1) % transformations.length;
  transformation = transformations[whichTransformation];
}



//============================================== 
// Santiago's Point-transformation functions
identity = function (x, y) {
  return [x, y];
};

fishEye = function (x, y) {
  var q = 3.0;
  var k = 0.025;
  var vx = x - follow_mouseX;
  var vy = y - follow_mouseY;
  var norm = Math.sqrt(Math.pow(vx, 2) + Math.pow(vy, 2));
  var factor = (norm + (q * norm) / (1 + Math.pow(k * norm, 2))) / norm;
  return [follow_mouseX + vx * factor, follow_mouseY + vy * factor];
};

vibrato = function (x, y) {
  var r = (Math.cos(frameCount * 0.035) + 1) * 2;
  var angle = 2 * Math.PI * Math.random();
  return [x + r * Math.cos(angle), y + r * Math.sin(angle)];
};

rotato = function (x, y) {
  var r = Math.pow((Math.cos(frameCount * 0.01) + 1) * 0.5, 2) * TYPODE_LINE_SPACING * 0.8;
  var angle = frameCount * 0.05 + x + y;
  return [x + r * Math.cos(angle), y + r * Math.sin(angle)];
};

wave = function (x, y) {
  var r = (Math.cos(y * 0.01 + frameCount * 0.01) + 1) * 200;
  var angle = 0;
  return [x + r * Math.cos(angle), y];
};


//============================================== 
const typodeFont = {
	"0":[[[0,0],[2,0],[2,3],[0,3],[0,0],[2,3]]],
	"1":[[[0,2],[2,0],[2,3]]],
	"2":[[[0,0],[2,0],[2,1],[0,3],[2,3]]],
	"3":[[[0,0],[2,0],[0,1],[2,1],[2,3],[0,3]]],
	"4":[[[0,0],[0,2],[2,2],[2,0]],[[2,2],[2,3]]],
	"5":[[[2,0],[0,0],[0,1],[2,1],[2,3],[0,3]]],
	"6":[[[2,0],[0,0],[0,3],[2,3],[2,1],[0,1]]],
	"7":[[[0,0],[2,0],[0,3]],[[0,1],[2,1]]],
	"8":[[[0,0],[2,0],[2,3],[0,3],[0,0]],[[0,1],[2,1]]],
	"9":[[[2,1],[0,1],[0,0],[2,0],[2,1],[0,3]]],
	
	"A":[ [[0,3],[0,0],[2,0],[2,1],[0,1]], [[2,1],[2,3]] ],
	"B":[ [[0,1],[2,1],[2,3],[0,3],[0,0],[1,0],[1,1]] ],
	"C":[ [[2,0],[0,0],[0,3],[2,3]] ],
	"D":[ [[0,0],[1,0],[2,1],[2,3], [0,3],[0,0]] ],
	"E":[ [[2,0],[0,0],[0,3],[2,3]], [[0,1],[2,1]] ],
	"F":[ [[2,0],[0,0],[0,3]], [[0,1],[2,1]] ],
	"G":[ [[2,0],[0,0],[0,3],[2,3],[2,2],[1,2]] ],
	"H":[ [[0,3],[0,0]], [[2,3],[2,0]], [[0,1],[2,1]] ],
	"I":[ [[1,3],[1,0]] ],
	"J":[ [[0,0],[2,0],[2,3],[0,3],[0,2]] ],
	"K":[ [[0,3],[0,0]], [[0,1],[2,0]], [[0.6, 0.6],[2, 3]] ],
	"L":[ [[2,3],[0,3],[0,0]] ],
	"M":[ [[0,3],[0,0],[1,1],[2,0],[2,3]] ],
	"N":[ [[0,3],[0,0],[2,3],[2,0]] ],
	"Ñ":[ [[0,3],[0,0],[2,3],[2,0],[1,1],[1,0]] ],
	"O":[ [[0,0],[2,0],[2,3],[0,3],[0,0]] ],
	"P":[ [[0,3],[0,0],[2,0],[2,2],[0,2]] ],
	"Q":[ [[2,3],[0,3],[0,0],[2,0],[2,3],[1,2]] ],
	"R":[ [[0,3],[0,0],[2,0],[2,2],[0,2]], [[1,2],[2,3]] ],
	"S":[ [[2,0],[0,0],[0,1],[2,1],[2,3],[0,3]] ],
	"T":[ [[0,0],[2,0]], [[1,0],[1,3]] ],
	"U":[ [[0,0],[0,3],[2,3],[2,0]] ],
	"V":[ [[0,0],[1,3],[2,0]] ],
	"W":[ [[0,0],[0,3],[1,2],[2,3],[2,0]] ],
	"X":[ [[0,0],[2,3]], [[0,3],[2,0]] ],
	"Y":[ [[0,3],[2,0]], [[0,0],[1.1,1.1]] ],
	"Z":[ [[0,0],[2,0],[0,3],[2,3]] ],
	
	"a":[ [[0,1],[2,1],[2,3],[0,3],[0,2],[2,2]] ],
	"b":[ [[0,0],[0,3],[2,3],[2,1],[0,1]] ],
	"c":[ [[2,1],[0,1],[0,3],[2,3]] ],
	"d":[ [[2,0],[2,3],[0,3],[0,1],[2,1]] ],
	"e":[ [[2,3],[0,3],[0,1],[2,1],[2,2],[0,2]] ],
	"f":[ [[1,3],[1,0],[2,0]], [[0,2],[2,2]] ],
	"g":[ [[2,3],[0,3],[0,2],[2,2],[2,4],[0,4]] ],
	"h":[ [[0,0],[0,3]], [[0,1],[2,1],[2,3]] ],
	"i":[ [[1,3],[1,1]] ],
	"j":[ [[0,4],[1,4],[1,1]] ],
	"k":[ [[0,3],[0,0]], [[0,2],[2,1]], [[0.8, 1.6],[2, 3]] ],
	"l":[ [[2,3],[1,3],[1,0]] ],
	"m":[ [[0,3],[0,1],[1,2],[2,1],[2,3]] ],
	"n":[ [[0,3],[0,1],[2,3],[2,1]] ],
	"ñ":[ [[0,3],[0,1],[2,3],[2,1],[1,1]] ],
	"o":[ [[0,1],[2,1],[2,3],[0,3],[0,1]] ],
	"p":[ [[0,4],[0,1],[2,1],[2,3],[0,3]] ],
	"q":[ [[2,4],[2,1],[0,1],[0,3],[2,3]] ],
	"r":[ [[1,3],[1,1],[2,1]] ],
	"s":[ [[2,1],[0,1],[0,2],[2,2],[2,3],[0,3]] ],
	"t":[ [[2,3],[1,3],[1,0]], [[0,1],[2,1]] ],
	"u":[ [[0,1],[0,3],[2,3],[2,1]] ],
	"v":[ [[0,1],[1,3],[2,1]] ],
	"w":[ [[0,1],[0,3],[1,2],[2,3],[2,1]] ],
	"x":[ [[0,1],[2,3]], [[0,3],[2,1]] ],
	"y":[ [[0,3],[2,1]], [[0,1],[1,2]] ],
	"z":[ [[0,1],[2,1],[0,3],[2,3]] ],
	
	"á":[ [[0,1],[2,1],[2,3],[0,3],[0,2],[2,2]], [[1,0.4],[2,0]] ],
	"é":[ [[2,3],[0,3],[0,1],[2,1],[2,2],[0,2]], [[1,0.4],[2,0]] ],
	"í":[ [[1,3],[1,1]], [[1,0.4],[2,0]] ],
	"ó":[ [[0,1],[2,1],[2,3],[0,3],[0,1]], [[1,0.4],[2,0]] ],
	"ú":[ [[0,1],[0,3],[2,3],[2,1]], [[1,0.4],[2,0]] ],
	"ü":[ [[0,1],[0,3],[2,3],[2,1]], [[0,0],[0,0.4]], [[2,0],[2,0.4]] ],
	"ç":[ [[2,1],[0,1],[0,3],[2,3]], [[1,3],[1,3.4],[1.6, 3.4],[1.6, 4],[1, 4]] ],
	"Ç":[ [[2,0],[0,0],[0,3],[2,3]], [[1,3],[1,3.4],[1.6, 3.4],[1.6, 4],[1, 4]] ],
	
  
	"symbols":[
		["=", "%", "<", ">", ":", ",", ";", ".", "[", "]", "(", ")", 
          "+", "-", "*", "?", "!", "\"", "'", "/", "\\", "$",  "&"," "],
		["equal", "percentage", "lower", "greater", "colon", "comma", 
         "semicolon", "period", "openbracket", "closebracket", "openparenthesis", 
         "closeparenthesis", "plus", "minus", "asterisk", "question", "exclamation", 
         "quote", "singlequote", "slash", "backslash", "dollar","and", "space"]
	],
	
	"equal":[ [[0,2],[2,2]], [[0,3],[2,3]] ],
	"percentage":[ [[0,3],[2,0]], [[0,0.5], [0,1]], [[2,2.5], [2,2]] ],
	"lower":[ [[2,0],[0,1.5],[2,3]] ],
	"greater":[ [[0,0],[2,1.5],[0,3]] ],
	"colon":[ [[0,1.4],[0,1.6]], [[0,2.4],[0,2.6]] ],
	"comma":[ [[0,2.4],[-0.2,3]] ],
	"semicolon":[ [[0,1.4],[0,1.6]], [[0,2.4],[-0.2,3]] ],
	"period":[ [[0,2.8],[0,3]] ],
	"openbracket":[ [[1.4,3],[1,3],[1,0],[1.4,0]] ],
	"closebracket":[ [[0.6,3],[1,3],[1,0],[0.6,0]] ],
	"openparenthesis":[ [[1.4,3],[0.8,1.5],[1.4,0]] ],
	"closeparenthesis":[ [[1.4,3],[2,1.5],[1.4,0]] ],
	"plus":[ [[0,2],[2,2]], [[1,1],[1,3]] ],
	"minus":[ [[0,2],[2,2]] ],
	"asterisk":[ [[0,2],[2,2]], [[1,1],[1,3]], [[0.4,1.4],[1.6,2.6]], [[1.6,1.4],[0.4,2.6]] ],
	"question":[ [[1,3],[1,2.4]], [[1,2],[1,1.4],[2,1.4],[2,0],[0,0],[0,1]] ],
	"exclamation":[ [[1,3],[1,2.4]], [[1,2],[1,0]] ],
	"quote":[ [[0.6,0],[0.6,1]], [[1.4,0],[1.4,1]] ],
	"singlequote":[ [[0.6,0],[0.6,1]] ],
	"slash":[ [[0,3],[2,0]] ],
	"backslash":[ [[0,0],[2,3]]],
	"dollar":[ [[2,0],[0,0],[0,1],[2,1],[2,3],[0,3]], [[1,-0.5],[1,3.5]] ],
	"space":[],
    "and": [[[2,3],[0,1],[0.5,0.5],[1,0], [1.5,0.5],[1,1],[0,2],[1,3],[2,2]]]
}
