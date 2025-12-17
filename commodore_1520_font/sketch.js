// Monospace, monoline vector font from the Commodore 1520 plotter/printer
// ROM data recovered Jim Brain, Gerrit Heitsch, and Silver Dream / silverdr
// Font data recovered by Stewart C Russell, ported to p5.js by Golan Levin
// 
// More information: 
// https://e4aws.silverdr.com/resources/6500/fontpreview.svg
// https://e4aws.silverdr.com/hacks/6500_1/
// https://github.com/scruss/FifteenTwenty/blob/master/README.md
// https://scruss.com/blog/2016/05/10/fifteentwenty-now-on-fontlibrary-and-github/
// https://scruss.com/blog/2016/04/23/fifteentwenty-commodore-1520-plotter-font/

function setup() {
  createCanvas(800, 300);
}


function draw() {
  background('black');
  stroke('white'); 
  strokeJoin(ROUND); 
  strokeWeight(1); 
  noFill(); 

  let tx = 55; 
  let ty = 40;

  drawString("ABCDEFGHIJKLMNOPQRSTUVWXYZ", tx,ty+=50, 1.2);
  drawString("abcdefghijklmnopqrstuvwxyz", tx,ty+=50, 1.2);
  drawString(".,:;!?\"'#$%&@+-=*/<>_",     tx,ty+=50, 1.2);
  drawString("1234567890  Hello World",    tx,ty+=50, 1.2);
}


//---------------------------------------
function drawString(str, x, y, size, spacing = 1.1, lineHeight = 1.3) {
  let cx = x;
  let cy = y;
  const baseAdvance = 20 * size;
  for (let ch of str) {
    if (ch === "\n") {
      cx = x;
      cy += baseAdvance * lineHeight;
      continue;
    }
    drawGlyph(ch, cx, cy, size);
    cx += baseAdvance * spacing;
  }
}


//---------------------------------------
function drawGlyph(ch, cx, cy, size) {
  const glyph = commodore1520font[ch];
  if (!glyph) return;
  drawPath(glyph.d, cx, cy, size);
}


//---------------------------------------
function drawPath(d, cx, cy, size) {
  const bbox = computeGlyphBBox(d);
  if (!bbox) return;

  const ox = bbox.minX;
  const oy = 32;
  const tokens = d.match(/[ML]|-?\d+(\.\d+)?/g);
  
  let i = 0;
  while (i < tokens.length) {
    const cmd = tokens[i++];
    if (cmd === "M") {
      const x0 = Number(tokens[i++]);
      const y0 = Number(tokens[i++]);
      beginShape();
      vertex(
        cx + (x0 - ox) * size,
        cy + (y0 - oy) * size
      );

      while (i < tokens.length && tokens[i] === "L") {
        i++;
        const x = Number(tokens[i++]);
        const y = Number(tokens[i++]);
        vertex(
          cx + (x - ox) * size,
          cy + (y - oy) * size
        );
      }
      endShape();
    }
  }
}


//---------------------------------------
function computeGlyphBBox(d) {
  const tokens = d.match(/[ML]|-?\d+(\.\d+)?/g);
  if (!tokens) return null;
  let minX = Infinity;
  let maxX = -Infinity;
  for (let i = 0; i < tokens.length; i++) {
    const t = tokens[i];
    if (t === "M" || t === "L") {
      const x = Number(tokens[++i]);
      minX = min(minX, x);
      maxX = max(maxX, x);
    }
  }
  return { minX, maxX};
}


//---------------------------------------
const commodore1520font = {
  " ": { char: " ", d: "M8 36" },
  "!": { char: "!", d: "M48 32L48 28L52 28L52 32L48 32M48 24L48 8L52 8L52 24L48 24" },
  "\"": { char: "\"", d: "M76 8L76 12M84 8L84 12" },
  "#": { char: "#", d: "M108 28L108 12M116 12L116 28M120 24L104 24M104 16L120 16" },
  "$": { char: "$", d: "M140 28L148 28L152 24L148 20L140 20L136 16L140 12L148 12M144 8L144 32" },
  "%": { char: "%", d: "M168 28L184 12M172 12L168 12L168 16L172 16L172 12M180 24L184 24L184 28L180 28L180 24" },
  "&": { char: "&", d: "M216 32L200 16L200 12L204 8L208 12L208 16L200 24L200 28L204 32L208 32L216 24" },
  "'": { char: "'", d: "M240 16L240 8" },
  "(": { char: "(", d: "M276 32L272 32L268 28L268 12L272 8L276 8" },
  ")": { char: ")", d: "M304 32L308 32L312 28L312 12L308 8L304 8" },
  "*": { char: "*", d: "M328 28L344 12M328 12L344 28M336 12L336 28" },
  "+": { char: "+", d: "M368 28L368 12M360 20L376 20" },
  ",": { char: ",", d: "M400 36L404 32L404 28L400 28L400 32L404 32" },
  "-": { char: "-", d: "M424 20L440 20" },
  ".": { char: ".", d: "M464 32L464 28L468 28L468 32L464 32" },
  "/": { char: "/", d: "M488 32L508 12" },
  
  "0": { char: "0", d: "M520 28L536 12L532 8L524 8L520 12L520 28L524 32L532 32L536 28L536 12" },
  "1": { char: "1", d: "M556 12L560 8L560 32M556 32L564 32" },
  "2": { char: "2", d: "M584 12L588 8L596 8L600 12L600 16L584 32L600 32" },
  "3": { char: "3", d: "M616 12L620 8L628 8L632 12L632 16L628 20L624 20M628 20L632 24L632 28L628 32L620 32L616 28" },
  "4": { char: "4", d: "M660 32L660 8L648 20L648 24L664 24" },
  "5": { char: "5", d: "M680 28L684 32L692 32L696 28L696 20L692 16L680 16L680 8L696 8" },
  "6": { char: "6", d: "M712 20L716 16L724 16L728 20L728 28L724 32L716 32L712 28L712 12L716 8L724 8L728 12" },
  "7": { char: "7", d: "M744 32L760 16L760 8L744 8" },
  "8": { char: "8", d: "M12 20L8 16L8 12L12 8L20 8L24 12L24 16L20 20L24 24L24 28L20 32L12 32L8 28L8 24L12 20L20 20" },
  "9": { char: "9", d: "M40 28L44 32L52 32L56 28L56 12L52 8L44 8L40 12L40 16L44 20L52 20L56 16" },
  
  ":": { char: ":", d: "M76 28L76 24L80 24L80 28L76 28M76 16L76 12L80 12L80 16L76 16" },
  ";": { char: ";", d: "M108 32L112 28L112 24L108 24L108 28L112 28M112 16L112 12L108 12L108 16L112 16" },
  "<": { char: "<", d: "M152 32L140 20L152 8" },
  "=": { char: "=", d: "M172 24L184 24M172 16L184 16" },
  ">": { char: ">", d: "M204 32L216 20L204 8" },
  "?": { char: "?", d: "M232 12L236 8L244 8L248 12L248 16L244 20L240 20L240 24M240 28L240 32" },
  "@": { char: "@", d: "M276 24L276 16L268 16L268 28L276 28L280 24L280 16L276 12L268 12L264 16L264 28L268 32L280 32" },

  "A": { char: "A", d: "M296 32L296 16L304 8L312 16L312 32M296 20L312 20" },
  "B": { char: "B", d: "M328 32L328 8L340 8L344 12L344 16L340 20M328 20L340 20L344 24L344 28L340 32L328 32" },
  "C": { char: "C", d: "M376 28L372 32L364 32L360 28L360 12L364 8L372 8L376 12" },
  "D": { char: "D", d: "M392 32L392 8L404 8L408 12L408 28L404 32L392 32" },
  "E": { char: "E", d: "M440 32L424 32L424 8L440 8M436 20L424 20" },
  "F": { char: "F", d: "M456 32L456 8L472 8M456 20L468 20" },
  "G": { char: "G", d: "M504 12L500 8L492 8L488 12L488 28L492 32L504 32L504 20L496 20" },
  "H": { char: "H", d: "M520 32L520 8M536 8L536 32M520 20L536 20" },
  "I": { char: "I", d: "M556 32L564 32M560 32L560 8M556 8L564 8" },
  "J": { char: "J", d: "M584 28L588 32L592 32L596 28L596 8" },
  "K": { char: "K", d: "M616 32L616 8M632 8L616 24M620 20L632 32" },
  "L": { char: "L", d: "M648 8L648 32L664 32" },
  "M": { char: "M", d: "M680 32L680 8L688 16L688 20L688 16L696 8L696 32" },
  "N": { char: "N", d: "M712 32L712 8M712 12L728 28M728 8L728 32" },
  "O": { char: "O", d: "M744 28L744 12L748 8L756 8L760 12L760 28L756 32L748 32L744 28" },
  "P": { char: "P", d: "M8 32L8 8L20 8L24 12L24 16L20 20L8 20" },
  "Q": { char: "Q", d: "M48 24L56 32M52 32L44 32L40 28L40 12L44 8L52 8L56 12L56 28L52 32" },
  "R": { char: "R", d: "M72 32L72 8L84 8L88 12L88 16L84 20L72 20M76 20L88 32" },
  "S": { char: "S", d: "M104 28L108 32L116 32L120 28L120 24L116 20L108 20L104 16L104 12L108 8L116 8L120 12" },
  "T": { char: "T", d: "M144 32L144 8M136 8L152 8" },
  "U": { char: "U", d: "M168 8L168 28L172 32L180 32L184 28L184 8" },
  "V": { char: "V", d: "M200 8L200 24L208 32L216 24L216 8" },
  "W": { char: "W", d: "M232 8L232 32L240 24M240 20L240 24L248 32L248 8" },
  "X": { char: "X", d: "M264 32L264 28L280 12L280 8M264 8L264 12L280 28L280 32" },
  "Y": { char: "Y", d: "M304 32L304 20L312 12L312 8M296 8L296 12L304 20" },
  "Z": { char: "Z", d: "M328 8L344 8L344 12L328 28L328 32L344 32" },
  
  "a": { char: "a", d: "M564 28L560 32L556 32L552 28L552 24L556 20L560 20L564 24M552 16L560 16L564 20L564 28L568 32" },
  "b": { char: "b", d: "M584 8L584 32L592 32L596 28L596 20L592 16L584 16" },
  "c": { char: "c", d: "M628 28L624 32L620 32L616 28L616 20L620 16L624 16L628 20" },
  "d": { char: "d", d: "M660 16L652 16L648 20L648 28L652 32L660 32L660 8" },
  "e": { char: "e", d: "M680 24L692 24L692 20L688 16L684 16L680 20L680 28L684 32L692 32" },
  "f": { char: "f", d: "M720 32L720 8L724 8M716 20L724 20" },
  "g": { char: "g", d: "M744 32L748 36L752 36L756 32L756 20L752 16L748 16L744 20L744 24L748 28L752 28L756 24" },
  "h": { char: "h", d: "M8 32L8 8M8 16L16 16L20 20L20 32" },
  "i": { char: "i", d: "M48 32L48 20M48 16L48 12" },
  "j": { char: "j", d: "M72 32L76 36L80 36L84 32L84 20M84 16L84 12" },
  "k": { char: "k", d: "M116 32L108 24M104 8L104 32M104 28L116 16" },
  "l": { char: "l", d: "M140 8L140 32L144 32" },
  "m": { char: "m", d: "M168 32L168 16M168 20L172 16L176 20L176 32M176 20L180 16L184 20L184 32" },
  "n": { char: "n", d: "M200 32L200 16L200 20L204 16L208 16L212 20L212 32" },
  "o": { char: "o", d: "M232 28L232 20L236 16L240 16L244 20L244 28L240 32L236 32L232 28" },
  "p": { char: "p", d: "M264 28L272 28L276 24L276 20L272 16L264 16L264 36" },
  "q": { char: "q", d: "M312 36L308 36L308 16L300 16L296 20L296 24L300 28L308 28" },
  "r": { char: "r", d: "M328 16L332 20L332 32M332 20L336 16L340 16" },
  "s": { char: "s", d: "M360 28L364 32L368 32L372 28L368 24L364 24L360 20L364 16L368 16L372 20" },
  "t": { char: "t", d: "M392 16L400 16M396 8L396 32L400 32" },
  "u": { char: "u", d: "M424 16L424 32L436 32L436 16" },
  "v": { char: "v", d: "M456 16L456 24L464 32L472 24L472 16" },
  "w": { char: "w", d: "M488 16L488 28L492 32L496 28L496 24L496 28L500 32L504 28L504 16" },
  "x": { char: "x", d: "M520 32L536 16M520 16L536 32" },
  "y": { char: "y", d: "M552 16L552 20L560 28M568 16L568 20L552 36" },
  "z": { char: "z", d: "M584 16L600 16L584 32L600 32" },
  "|": { char: "|", d: "M628 36L628 8" },
  "_": { char: "_", d: "M676 36L648 36" },
  "Δ": { char: "Δ", d: "M680 32L692 20L704 32L680 32" },
  "π": { char: "π", d: "M712 24L716 20L724 20L724 32M716 32L716 20L724 20L728 16" },
  "□": { char: "□", d: "M744 32L744 8L764 8L764 32L744 32" }
};
