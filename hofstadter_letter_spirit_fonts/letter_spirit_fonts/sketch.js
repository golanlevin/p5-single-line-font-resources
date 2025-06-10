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
  createCanvas(800, 635);
}


function draw() {
  background(0);
  
  const str = "abcdefghijklmnopqrstuvwxyz  hello world";
  let unit = 5;
  let linesp = 40;
  let tx = 50;
  
  let num = 1; 
  let bGrid = mouseIsPressed; 
  let fnx = tx + (str.length+1)*unit*3;
  
  CURRENT_GRIDFONT = font_double_backslash;
  drawString(str, tx, (num++) * linesp, unit, bGrid);
  drawCurrentFontName(fnx, num*linesp-20); 
  
  CURRENT_GRIDFONT = font_benzene_left;
  drawString(str, tx, (num++) * linesp, unit, bGrid);
  drawCurrentFontName(fnx, num*linesp-20); 
  
  CURRENT_GRIDFONT = font_benzene_right;
  drawString(str, tx, (num++) * linesp, unit, bGrid);
  drawCurrentFontName(fnx, num*linesp-20); 
  
  CURRENT_GRIDFONT = font_square_curl;
  drawString(str, tx, (num++) * linesp, unit, bGrid);
  drawCurrentFontName(fnx, num*linesp-20); 
  
  CURRENT_GRIDFONT = font_standard_square;
  drawString(str, tx, (num++) * linesp, unit, bGrid);
  drawCurrentFontName(fnx, num*linesp-20); 
  
  CURRENT_GRIDFONT = font_hint_four;
  drawString(str, tx, (num++) * linesp, unit, bGrid);
  drawCurrentFontName(fnx, num*linesp-20); 
  
  CURRENT_GRIDFONT = font_boat;
  drawString(str, tx, (num++) * linesp, unit, bGrid);
  drawCurrentFontName(fnx, num*linesp-20); 
  
  CURRENT_GRIDFONT = font_intersect;
  drawString(str, tx, (num++) * linesp, unit, bGrid);
  drawCurrentFontName(fnx, num*linesp-20); 
  
  CURRENT_GRIDFONT = font_zigzag;
  drawString(str, tx, (num++) * linesp, unit, bGrid);
  drawCurrentFontName(fnx, num*linesp-20); 
  
  CURRENT_GRIDFONT = font_snout;
  drawString(str, tx, (num++) * linesp, unit, bGrid);
  drawCurrentFontName(fnx, num*linesp-20); 
  
  CURRENT_GRIDFONT = font_bowtie;
  drawString(str, tx, (num++) * linesp, unit, bGrid);
  drawCurrentFontName(fnx, num*linesp-20); 
  
  CURRENT_GRIDFONT = font_weird_arrow;
  drawString(str, tx, (num++) * linesp, unit, bGrid);
  drawCurrentFontName(fnx, num*linesp-20); 
  
  CURRENT_GRIDFONT = font_sabretooth;
  drawString(str, tx, (num++) * linesp, unit, bGrid);
  drawCurrentFontName(fnx, num*linesp-20); 
  
  CURRENT_GRIDFONT = font_sluice;
  drawString(str, tx, (num++) * linesp, unit, bGrid);
  drawCurrentFontName(fnx, num*linesp-20); 
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
      let charPos = stroke[i].toLowerCase();
      let charPosCode = charPos.charCodeAt(0) - charACode;
      if ((charPosCode >= 0) && (charPosCode < 21)){
        let charPosX = charPosCode % 3;
        let charPosY = int(charPosCode / 3);
        vertex(px + charPosX * sc, py + charPosY * sc);
      }
    }
    endShape();
  }
}


function drawString(str, px, py, sc, bDrawGrid = false) {
  noFill(); 
  stroke(255);
  strokeWeight(0.75);
  
  for (let i = 0; i < str.length; i++) {
    let ch = str[i].toLowerCase();
    if (bDrawGrid){
      stroke(127);
      drawGlyphGrid(px, py, sc);
      stroke(255);
    }
    drawGlyph(ch, px, py, sc);
    px += sc * 3;
  }
}


function drawGlyphGrid(px, py, sc) {
  for (let i = 0; i < 21; i++) {
    let charPosX = i % 3;
    let charPosY = int(i / 3);
    circle(px + charPosX * sc, py + charPosY * sc, 1);
  }
}


function drawCurrentFontName(px, py){
  fill(127); 
  noStroke(); 
  text(CURRENT_GRIDFONT.name, px,py); 
}


function keyPressed(){
  // save("letter_spirit.png"); 
}


/*

Each glyph consists of a sequence of strokes encoded as a string. 
Each string represents points connected in a lattice. The points are 
indexed by the characters in this Letter Spirit design grid: 

   a b c
   d e f 
   g h i 
   j k l 
   m n o
   p q r 
   s t u
   
*/

let font_sabretooth = {
  name: "Sabretooth", 
  a: "jhklnmk",
  b: "amklhg",
  c: "ihjkol",
  d: "ihjkoc",
  e: "kihjkol",
  f: "feam,lhg",
  g: "okjhirnps",
  h: "amkhlo", 
  i: "gkjm,db",
  j: "gkjmq,db",
  k: "am,likjno",
  l: "amk", 
  m: "mjnhlo,gk", 
  n: "jnhlo,gk",
  o: "hlomkh",
  p: "sghlkm",
  q: "okjhiu", 
  r: "gm,ihlj", 
  s: "hgklnm",
  t: "enl,ihjg",
  u: "gjnh,ko", 
  v: "gjnki", 
  w: "gjnhli", 
  x: "hjko,limn",
  y: "ghjko,irnps",
  z: "jgkmo,kl",
};

let font_sluice = {
  name: "Sluice",
  a: "ghl,jkonj",
  b: "djn,hlokh",
  c: "kgjno,hl", 
  d: "hkmjh,fln",
  e: "ghlkg,jno",
  f: "gkn,iehl",
  g: "hkmjh,ioqpn",
  h: "djh,nkio", 
  i: "hjm,eg", 
  j: "iknp,fh", 
  k: "djh,im,ko", 
  l: "eko,jn",
  m: "hjm,nkio", 
  n: "gjh,nkio",
  o: "hj,ilnki",
  p: "hjp,ilnki",
  q: "gknjg,hlr",
  r: "hjm,lik",
  s: "ihj,klnm", 
  t: "ehj,iknl",
  u: "hkmg,nlo",
  v: "ikg,lnj", 
  w: "gjn,hkoi", 
  x: "hjg,im,knl",
  y: "hkmg,ioqpn",
  z: "jhim,lno",
};

let font_weird_arrow = {
  name: "Weird Arrow",
  a: "gio,hkjnl",
  b: "bdmnlhkj",
  c: "lkhjno",
  d: "bfonjhkl",
  e: "onklihjn",
  f: "fcehgkn,ik",
  g: "lkhjno,lrtsp",
  h: "bdjkn,jhlo",
  i: "jhlkn,ge",
  j: "jhlktp,ge",
  k: "bdm,ihklnj", 
  l: "dbfenl",
  m: "gm,olhjkn", 
  n: "gj,olhjkn", 
  o: "jkhlnmj",
  p: "sjkhlnm",
  q: "lhkjmnlrtu",
  r: "klhj,gm",
  s: "lhjkom",
  t: "ehgkno,ik",
  u: "gjnl,hklo",
  v: "hkjnli", 
  w: "gjnli,hkj", 
  x: "ghklnj,ik,lo",
  y: "hkjnl,irtsp",
  z: "jhlkmo",
};

let font_bowtie = {
  name: "Bowtie",
  a: "ghlnjkm",
  b: "ebdghlnjkm",
  c: "ihjnlok",
  d: "ebfihjnlko",
  e: "iklhjno",
  f: "cefbdhn,gh",
  g: "iklhjnortq",
  h: "ebdghlo,hjnkm",
  i: "hjnkm,eabd",
  j: "hjnqspt,eabd",
  k: "ebdghjm,jno,hlki",
  l: "ebdjnkm",
  m: "mjhgkio,kn",
  n: "olhjnkm",
  o: "gkjhlnj",
  p: "gkjhlnmptq",
  q: "iklhjnortuq",
  r: "ilhjnkm", 
  s: "ihlnjkm",
  t: "ehjnlko,gh",
  u: "gjnlhki,lo",
  v: "gkhjnli",
  w: "gjnmkoi,hk",
  x: "jgo,hlimn",
  y: "ikhlnortq,gjn",
  z: "ghjnlko",
};

let font_snout = {
  name: "Snout",
  a: "hiomgkl",
  b: "amoikj",
  c: "ikjmo",
  d: "comgkl",
  e: "jkoigmn",
  f: "feagkn,ig",
  g: "lkmgiuqp",
  h: "am,jkio", 
  i: "jkio,ghf",
  j: "jkirqs,ghf",
  k: "am,likjno",
  l: "bkmo",
  m: "mgklo,kn", 
  n: "mgklo",
  o: "gklomg",
  p: "jkoigs",
  q: "lkmgiu", 
  r: "lkgm",
  s: "hgjkiom", 
  t: "dhno,ikj",
  u: "hkmoi",
  v: "jhkmnli",
  w: "gjkoi,hk",
  x: "jgklo,im",
  y: "hkmo,iuqp",
  z: "hikgmo",
};

let font_zigzag = {
  name: "Zigzag",
  a: "ghln,mko", 
  b: "aegkm,hlnjh",
  c: "lhjn,mko",
  d: "ceiko,hlnjh",
  e: "lhjn,ikg",
  f: "fbdhjn,ieg",
  g: "hlnjh,ikos",
  h: "aegkm,jhln",
  i: "gkm,hj,bd",
  j: "gkmqs,hj,bd",
  k: "aego,hjn,im",
  l: "aegkm,jn",
  m: "jhln,im,gk",
  n: "jhln,gkm",
  o: "hlnjh,gk",
  p: "hlnjh,gkmqs",
  q: "hlnjh,ikoqu",
  r: "lhj,gkm",
  s: "lhj,go,km",
  t: "dhjnl,ikg",
  u: "hjnl,iko",
  v: "gkm,hlnj",
  w: "gkm,hlnj,ko",
  x: "go,im,hj",
  y: "hjnl,ikos",
  z: "jhl,im,ko",
};

let font_intersect = {
  name: "Intersect",
  a: "ghlnmjko", 
  b: "hilnmjh,bdgk",
  c: "lhgjno", 
  d: "ghlonjg,bfik",
  e: "gklhjno",
  f: "cbdgo,ihj",
  g: "hilnmjh,korts",
  h: "bdgk,oihjm",
  i: "hlo,db",
  j: "hlrt,db",
  k: "bdgo,ihjm", 
  l: "bdgo",
  m: "oihjm,gkn",
  n: "oihjm,gk",
  o: "hilnmjh",
  p: "ghlonjg,kmpt",
  q: "hilnmjh,kou",
  r: "ihj,gkn",
  s: "ihj,gom",
  t: "egjno,dhi", 
  u: "gmnli,ko",
  v: "ilnmjh,gk",
  w: "gjnoi,hkm", 
  x: "ghlo,im", 
  y: "ilnmg,korts",
  z: "ghl,imo", 
};

let font_boat = {
  name: "Boat",
  a: "gilnjl",
  b: "djnlig",
  c: "igjnl",
  d: "flnjgi",
  e: "jkigjnl",
  f: "fdjn,hg",
  g: "lnjgioqm",
  h: "djn,gio",
  i: "hiln,ef",
  j: "hilp,ef",
  k: "dm,ihjnl",
  l: "djnl",
  m: "oigjn,hk",
  n: "oigjn", 
  o: "igjnli", 
  p: "jnligp",
  q: "lnjgir", 
  r: "ligjn",
  s: "igklnj",
  t: "djnl,hg", 
  u: "gjnl,io",
  v: "gjnli",
  w: "gjnli,hn",
  x: "hikjn,go",
  y: "gjnl,ioqm",
  z: "gikjnl",
};

let font_double_backslash = {
  name: "Double Backslash",
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
  name: "Benzene Right",
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
  name: "Benzene Left",
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
};

let font_square_curl = {
  name: "Square Curl",
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
  name: "Standard Square",
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
  name: "Hint Four",
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
};

// Additional alphabet fragments:
// Incomplete grid-fonts by D. Hofstadter 

let font_victory = {
  name: "Victory",
  a: "ghlo,lkmn",
  b: "aekm,hlon",
  c: "ihjkol",
  d: "ceko,hjmn",
  e: "kihjno",
  f: "ebdhkm,jf",
  g: "ihjmn,ihjhkoqtp",
};

let font_house = {
  name: "House",
  a: "jhlomkl",
  b: "dmolhj",
  c: "lhjmo",
  d: "lhjmof",
  e: "jlhjmo",
  f: "iegm,lhj",
  g: "omjhlrp",
};

let font_grecian_urn = {
  name: "Grecian Urn",
  a: "gjhio,lkmn",
  b: "aj,gionkm",
  c: "ilhgmo",
  d: "cl,igmnko",
  e: "hligmnko",
  f: "cfbaghjm",
  g: "ikhgmo,lutps",
};

let font_buxtehude = {
  name: "Buxtehude",
  a: "jhlnmk",
  b: "hlnj,ek",
  c: "ihjnl",
  d: "hjnl,ek",
  e: "kihjnl",
  f: "iegm,kj",
  g: "lhjn,kqm",
};
