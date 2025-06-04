/* 
This sketch implements some of the "Letter Spirit" grid-fonts 
devised by Douglas Hofstadter and Gary McGraw in "Letter Spirit: 
An Emergent Model of the Perception and Creation of Alphabetic 
Style" (1993), and later elaborated in "Fluid Concepts and 
Creative Analogies: Computer Models Of The Fundamental 
Mechanisms Of Thought" (1996). See: 
https://gwern.net/doc/design/typography/1993-hofstadter.pdf
*/

// See bottom of this file for font definitions
let CURRENT_GRIDFONT; 

function setup() {
  createCanvas(800, 400);
}


function draw() {
  background(0);
  strokeWeight(1);
  stroke(255);

  let unit = 6;
  let linesp = 52;
  let tx = 50;
  const alphabet = "abcdefghijklmnopqrstuvwxyz  hello world";

  let num = 1; 
  CURRENT_GRIDFONT = font_double_backslash;
  drawString(alphabet, tx, (num++) * linesp, unit);
  CURRENT_GRIDFONT = font_benzene_left;
  drawString(alphabet, tx, (num++) * linesp, unit);
  CURRENT_GRIDFONT = font_benzene_right;
  drawString(alphabet, tx, (num++) * linesp, unit);
  CURRENT_GRIDFONT = font_square_curl;
  drawString(alphabet, tx, (num++) * linesp, unit);
  CURRENT_GRIDFONT = font_standard_square;
  drawString(alphabet, tx, (num++) * linesp, unit);
  CURRENT_GRIDFONT = font_hint_four;
  drawString(alphabet, tx, (num++) * linesp, unit);
}


function drawGlyph(ch, px, py, sc) {
  let charData = CURRENT_GRIDFONT[ch];
  if (!charData) return;
  let strokes = split(charData, ',');
  if (!strokes) return;
  
  noFill();
  const charACode = "a".charCodeAt(0);
  for (let stroke of strokes) {
    beginShape();
    for (let i = 0; i < stroke.length; i++) {
      let charPos = stroke[i];
      let charPosCode = charPos.charCodeAt(0) - charACode;
      let charPosX = charPosCode % 3;
      let charPosY = int(charPosCode / 3);
      vertex(px + charPosX * sc, py + charPosY * sc);
    }
    endShape();
  }
}


function drawString(str, px, py, sc, bDrawGrid = false) {
  for (let i = 0; i < str.length; i++) {
    let ch = str[i].toLowerCase();
    if (bDrawGrid){
      drawGlyphGrid(px, py, sc);
    }
    drawGlyph(ch, px, py, sc);
    px += sc * 3;
  }
}


function drawGlyphGrid(px, py, sc) {
  for (let i = 0; i < 21; i++) {
    let charPosX = i % 3;
    let charPosY = int(i / 3);
    circle(px + charPosX * sc, py + charPosY * sc, 1, 1);
  }
}


/*
Each glyph consists of a sequence of strokes, encoded as a string. 
Each string connects points in a lattice, which are indexed by
the characters in this Letter Spirit design grid: 

   a b c
   d e f 
   g h i 
   j k l 
   m n o
   p q r 
   s t u
   
*/

let font_double_backslash = {
  a: "gol,kjnk",
  b: "dm,gonj",
  c: "hgol",
  d: "lhgof",
  e: "klhgo",
  f: "iedgo,lhg",
  g: "lhgo,irn",
  h: "djn,gol",
  i: "gol,dhei",
  j: "goruq,dhei",
  k: "djn,hgol",
  l: "dgol",
  m: "njgo,khl",
  n: "njgol",
  o: "ghlog",
  p: "gp,gonj",
  q: "ogjnor",
  r: "ilhgo",
  s: "lhgonjm",
  t: "dgol,gh",
  u: "golh",
  v: "goi",
  w: "hnj,goi",
  x: "lhnj,go",
  y: "jgo,hlrn",
  z: "jgomqr",
};


let font_benzene_right = {
  a: "jhio,klnmk",
  b: "jhilnma",
  c: "ihjmnl",
  d: "ihjmnlc",
  e: "jkihjmnl",
  f: "cen,ihj",
  g: "strihjmnl",
  h: "am,jhiln",
  i: "jhn,dbegd",
  j: "jhqs,dbegd",
  k: "am,ihjln",
  l: "abnl",
  m: "ghjm,hkiln",
  n: "ghjm,hiln",
  o: "hilnmjh",
  p: "mnlihjs",
  q: "ihjmnl,iu",
  r: "ihjm",
  s: "ihjlnm",
  t: "enl,jhi",
  u: "hjmnl,io",
  v: "ghnli",
  w: "hjmknli",
  x: "ghno,im",
  y: "hjmnl,irts",
  z: "jhimnl",
};


let font_benzene_left = {
  a: "ghlonjko",
  b: "ghlonja",
  c: "lhgjno",
  d: "lhgjnoc",
  e: "gklhgjno", 
  f: "fbajn,hd",
  g: "onjghlutp",
  h: "ajn,ghlo",
  i: "hlon,iebfi",
  j: "hlut,iebfi",
  k: "am,ghl,jno",
  l: "ajn", 
  m: "olhkgjn",
  n: "olhgjn",
  o: "ghlonjg",
  p: "jnolhgs", 
  q: "onjghlu", 
  r: "lhgm", 
  s: "lhgonj", 
  t: "eko,dhi",
  u: "gjnolh", 
  v: "ghkoi", 
  w: "gjnkolh", 
  x: "ihnm,go",
  y: "gjno,hlutp",
  z: "ghljno",
}


let font_square_curl = {
  a: "hiomjk",
  b: "dmoihk",
  c: "khgmo",
  d: "khgmof",
  e: "kligmn",
  f: "hifdm,jk",
  g: "knmgirq",
  h: "dm,gionk",
  i: "jghn,adeb",
  j: "jghqpm,adeb",
  k: "dm,gi,hnol",
  l: "dmnk",
  m: "mgion,hk",
  n: "mgionk",
  o: "giomg",
  p: "pgionk",
  q: "rigmnk",
  r: "mgilk",
  s: "hgjlon",
  t: "enol,gi",
  u: "gmoihk",
  v: "gjknoih",
  w: "gmoih,kn",
  x: "ghno,iljm",
  y: "gmo,khirq",
  z: "hiljmn",
};


let font_standard_square = {
  a: "giomjl",
  b: "amoig",
  c: "igmo",
  d: "comgi",
  e: "jligmo",
  f: "cbn,ig",
  g: "omgius",
  h: "am,gio",
  i: "ghn,de",
  j: "ghts,de",
  k: "ami,ko",
  l: "bn",
  m: "mgio,hn",
  n: "mgio",
  o: "giomg",
  p: "moigs",
  q: "omgiu",
  r: "igm",
  s: "igjlom",
  t: "eno,ig",
  u: "gmoi",
  v: "gjnli",
  w: "gmoi,hn",
  x: "go,im",
  y: "gmo,ius",
  z: "gimo",
};


let font_hint_four = {
  a: "ghlnjk",
  b: "ajnlh",
  c: "hjno",
  d: "clnjh",
  e: "klhjno",
  f: "cen,gh",
  g: "njhlrt",
  h: "ajhlo",
  i: "hn,ec",
  j: "hqs,ec",
  k: "ajko,ik",
  l: "bko",
  m: "mjhlo,kn",
  n: "mjhlo",
  o: "ghlnj",
  p: "nlhjs",
  q: "njhlu",
  r: "ihjm",
  s: "hjlnm",
  t: "enl,gh",
  u: "gmnli",
  v: "gjnli",
  w: "gjnli,hk",
  x: "go,im", 
  y: "gjnlrt",
  z: "himo",
}


// Additional alphabet fragments:
// Incomplete grid-fonts by D. Hofstadter 

let font_victory = {
  a: "ghlo,lkmn",
  b: "aekm,hlon",
  c: "ihjkol",
  d: "ceko,hjmn",
  e: "kihjno",
  f: "ebdhkm,jf",
  g: "ihjmn,ihjhkoqtp",
};

let font_house = {
  a: "jhlomkl",
  b: "dmolhj",
  c: "lhjmo",
  d: "lhjmof",
  e: "jlhjmo",
  f: "iegm,lhj",
  g: "omjhlrp",
};

let font_grecian_urn = {
  a: "gjhio,lkmn",
  b: "aj,gionkm",
  c: "ilhgmo",
  d: "cl,igmnko",
  e: "hligmnko",
  f: "cfbaghjm",
  g: "ikhgmo,lutps",
};

let font_buxtehude = {
  a: "jhlnmk",
  b: "hlnj,ek",
  c: "ihjnl",
  d: "hjnl,ek",
  e: "kihjnl",
  f: "iegm,kj",
  g: "lhjn,kqm",
};