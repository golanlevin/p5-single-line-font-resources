// Asteroids vector font by Atari programmer Ed Logg
// p5.js port of C code version by Trammell Hudson
// See: https://trmm.net/Asteroids_font/
// https://github.com/osresearch/vst/blob/master/teensyv/asteroids_font.c
// https://web.archive.org/web/20141222010537/http://www.edge-online.com/features/making-asteroids/


// Font data array with human-readable points
const AsteroidsFont = {
  "0": [[0,0],[8,0],[8,12],[0,12],[0,0],[8,12],"FONT_LAST"],
  "1": [[4,0],[4,12],[3,10],"FONT_LAST"],
  "2": [[0,12],[8,12],[8,7],[0,5],[0,0],[8,0],"FONT_LAST"],
  "3": [[0,12],[8,12],[8,0],[0,0],"FONT_UP",[0,6],[8,6],"FONT_LAST"],
  "4": [[0,12],[0,6],[8,6],"FONT_UP",[8,12],[8,0],"FONT_LAST"],
  "5": [[0,0],[8,0],[8,6],[0,7],[0,12],[8,12],"FONT_LAST"],
  "6": [[0,12],[0,0],[8,0],[8,5],[0,7],"FONT_LAST"],
  "7": [[0,12],[8,12],[8,6],[4,0],"FONT_LAST"],
  "8": [[0,0],[8,0],[8,12],[0,12],[0,0],"FONT_UP",[0,6],[8,6],"FONT_LAST"],
  "9": [[8,0],[8,12],[0,12],[0,7],[8,5],"FONT_LAST"],
  "A": [[0,0],[0,8],[4,12],[8,8],[8,0],"FONT_UP",[0,4],[8,4],"FONT_LAST"],
  "B": [[0,0],[0,12],[4,12],[8,10],[4,6],[8,2],[4,0],[0,0],"FONT_LAST"],
  "C": [[8,0],[0,0],[0,12],[8,12],"FONT_LAST"],
  "D": [[0,0],[0,12],[4,12],[8,8],[8,4],[4,0],[0,0],"FONT_LAST"],
  "E": [[8,0],[0,0],[0,12],[8,12],"FONT_UP",[0,6],[6,6],"FONT_LAST"],
  "F": [[0,0],[0,12],[8,12],"FONT_UP",[0,6],[6,6],"FONT_LAST"],
  "G": [[6,6],[8,4],[8,0],[0,0],[0,12],[8,12],"FONT_LAST"],
  "H": [[0,0],[0,12],"FONT_UP",[0,6],[8,6],"FONT_UP",[8,12],[8,0],"FONT_LAST"],
  "I": [[0,0],[8,0],"FONT_UP",[4,0],[4,12],"FONT_UP",[0,12],[8,12],"FONT_LAST"],
  "J": [[0,4],[4,0],[8,0],[8,12],"FONT_LAST"],
  "K": [[0,0],[0,12],"FONT_UP",[8,12],[0,6],[6,0],"FONT_LAST"],
  "L": [[8,0],[0,0],[0,12],"FONT_LAST"],
  "M": [[0,0],[0,12],[4,8],[8,12],[8,0],"FONT_LAST"],
  "N": [[0,0],[0,12],[8,0],[8,12],"FONT_LAST"],
  "O": [[0,0],[0,12],[8,12],[8,0],[0,0],"FONT_LAST"],
  "P": [[0,0],[0,12],[8,12],[8,6],[0,5],"FONT_LAST"],
  "Q": [[0,0],[0,12],[8,12],[8,4],[0,0],"FONT_UP",[4,4],[8,0],"FONT_LAST"],
  "R": [[0,0],[0,12],[8,12],[8,6],[0,5],"FONT_UP",[4,5],[8,0],"FONT_LAST"],
  "S": [[0,2],[2,0],[8,0],[8,5],[0,7],[0,12],[6,12],[8,10],"FONT_LAST"],
  "T": [[0,12],[8,12],"FONT_UP",[4,12],[4,0],"FONT_LAST"],
  "U": [[0,12],[0,2],[4,0],[8,2],[8,12],"FONT_LAST"],
  "V": [[0,12],[4,0],[8,12],"FONT_LAST"],
  "W": [[0,12],[2,0],[4,4],[6,0],[8,12],"FONT_LAST"],
  "X": [[0,0],[8,12],"FONT_UP",[0,12],[8,0],"FONT_LAST"],
  "Y": [[0,12],[4,6],[8,12],"FONT_UP",[4,6],[4,0],"FONT_LAST"],
  "Z": [[0,12],[8,12],[0,0],[8,0],"FONT_UP",[2,6],[6,6],"FONT_LAST"],
  ".": [[3,0],[4,0],"FONT_LAST"],
  ",": [[2,0],[4,2],"FONT_LAST"],
  "-": [[2,6],[6,6],"FONT_LAST"],
  "+": [[1,6],[7,6],"FONT_UP",[4,9],[4,3],"FONT_LAST"],
  "!": [[4,0],[3,2],[5,2],[4,0],"FONT_UP",[4,4],[4,12],"FONT_LAST"],
  "#": [[0,4],[8,4],[6,2],[6,10],[8,8],[0,8],[2,10],[2,2],"FONT_LAST"],
  "^": [[2,6],[4,12],[6,6],"FONT_LAST"],
  "=": [[1,4],[7,4],"FONT_UP",[1,8],[7,8],"FONT_LAST"],
  "*": [[0,0],[4,12],[8,0],[0,8],[8,8],[0,0],"FONT_LAST"],
  "_": [[0,0],[8,0],"FONT_LAST"],
  "/": [[0,0],[8,12],"FONT_LAST"],
  "\\": [[0,12],[8,0],"FONT_LAST"],
  "@": [[8,4],[4,0],[0,4],[0,8],[4,12],[8,8],[4,4],[3,6],"FONT_LAST"],
  "$": [[6,2],[2,6],[6,10],"FONT_UP",[4,12],[4,0],"FONT_LAST"],
  "&": [[8,0],[4,12],[8,8],[0,4],[4,0],[8,4],"FONT_LAST"],
  "[": [[6,0],[2,0],[2,12],[6,12],"FONT_LAST"],
  "]": [[2,0],[6,0],[6,12],[2,12],"FONT_LAST"],
  "(": [[6,0],[2,4],[2,8],[6,12],"FONT_LAST"],
  ")": [[2,0],[6,4],[6,8],[2,12],"FONT_LAST"],
  "{": [[6,0],[4,2],[4,10],[6,12],"FONT_UP",[2,6],[4,6],"FONT_LAST"],
  "}": [[4,0],[6,2],[6,10],[4,12],"FONT_UP",[6,6],[8,6],"FONT_LAST"],
  "%": [[0,0],[8,12],"FONT_UP",[2,10],[2,8],"FONT_UP",[6,4],[6,2],"FONT_LAST"],
  "<": [[6,0],[2,6],[6,12],"FONT_LAST"],
  ">": [[2,0],[6,6],[2,12],"FONT_LAST"],
  "|": [[4,0],[4,5],"FONT_UP",[4,6],[4,12],"FONT_LAST"],
  ":": [[4,9],[4,7],"FONT_UP",[4,5],[4,3],"FONT_LAST"],
  ";": [[4,9],[4,7],"FONT_UP",[4,5],[1,2],"FONT_LAST"],
  "\"": [[2,10],[2,6],"FONT_UP",[6,10],[6,6],"FONT_LAST"],
  "'": [[2,6],[6,10],"FONT_LAST"],
  "`": [[2,10],[6,6],"FONT_LAST"],
  "~": [[0,4],[2,8],[6,4],[8,8],"FONT_LAST"],
  "?": [[0,8],[4,12],[8,8],[4,4],"FONT_UP",[4,1],[4,0],"FONT_LAST"]
};


// Draw a single character
function drawChar(ch, x, y, size) {
  const points = AsteroidsFont[ch];
  if (!points) return; // Character not found

  let penUp = true; // Start with the pen up
  let lastPoint = null;

  for (const point of points) {
    if (point === "FONT_LAST") break; // End of character
    if (point === "FONT_UP") {
      penUp = true; // Pen up, don't draw a line
      continue;
    }

    const [px, py] = point; // Extract x, y coordinates
    const sx = x + px * size;
    const sy = y - py * size; // Invert Y for canvas coordinates

    if (penUp) {
      // Move to the new position without drawing
      lastPoint = { x: sx, y: sy };
    } else {
      // Draw a line from the last point
      if (lastPoint) {
        // Using individual lines makes it easier to blow up letters
        line(lastPoint.x, lastPoint.y, sx, sy);
      }
      lastPoint = { x: sx, y: sy };
    }

    penUp = false; // Pen down after the first move
  }
}


function drawString(str, x, y, size) {
  str = str.toUpperCase();
  let xOffset = 0; // Horizontal offset for character spacing

  for (let chr of str) {
    // Skip if character is not in the font table
    if (!AsteroidsFont[chr]) {
      xOffset += 12 * size; // Default spacing for unknown characters
      continue;
    }

    // Draw the character at the current position
    drawChar(chr, x + xOffset, y, size);

    // Increment horizontal offset by character width
    xOffset += 12 * size; // Characters are 12 units wide by design
  }
}


function setup() {
  createCanvas(800, 240);
}


function draw(){
  background(0);
  stroke(255);
  strokeWeight(1); 
  strokeCap(ROUND); 
  strokeJoin(ROUND); 
  
  drawString("ABCDEFGHIJKLMNOPQRSTUVWXYZ", 40, 70, 2); 
  drawString("1234567890", 40, 110, 2); 
  drawString(".,-+!#^=*_/\\@$&[](){}%<>|:;\'`~?", 40, 150, 2);
  drawString("Hello World", 40, 190, 2);
}
