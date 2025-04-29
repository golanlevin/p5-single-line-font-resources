// GridFont by Anders Hoff (2019)
// A grid-based system for designing simple symbols and fonts. 
// Includes example fonts. Mainly intended for plotter drawings.
// From: https://github.com/inconvergent/gridfont
// Ported to p5.js by Golan Levin, April 2025

// Font data is stored in the files:
// hoff_gridfont_original-all-data.json
// hoff_gridfont_smooth-all-data.json
// Note that Hoff's fonts only support lowercase.

let originalJson;
let smoothJson; 
let gridfontOriginal;
let gridfontSmooth;

DEFAULT_SCALE = 5.0; // Default scale (pixels per grid unit)
DEFAULT_XDST = 7.0; // Fixed extra spacing between glyphs (pixels)


function preload() {
  originalJson = loadJSON("hoff_gridfont_original-all-data.json");
  smoothJson = loadJSON("hoff_gridfont_smooth-all-data.json");
}


function setup() {
  createCanvas(800,650);
  gridfontOriginal = new AndersHoffGridFont(originalJson);
  gridfontSmooth   = new AndersHoffGridFont(smoothJson);
}


function draw() {
  background("black");
  stroke("white");
  strokeJoin(ROUND); 
  noFill();

  let sc = DEFAULT_SCALE;
  let th = 1; // stroke weight
  gridfontOriginal.drawString("abcdefghijklmnopqrstuvwxyz", 50, 50, sc, th);
  gridfontOriginal.drawString("1234567890", 50, 100, sc, th);
  gridfontOriginal.drawString("*&+${}()/[]^=-!.,<>'#|_:;@%?~\"", 50, 150, sc, th);
  gridfontOriginal.drawString("the quick (brown) fox?", 50, 200, sc, th);
  gridfontOriginal.drawString("jumps over the lazy dog.", 50, 250, sc, th);
  
  gridfontSmooth.drawString("abcdefghijklmnopqrstuvwxyz", 50, 350, sc, th);
  gridfontSmooth.drawString("1234567890", 50, 400, sc, th);
  gridfontSmooth.drawString("*&+${}()/[]^=-!.,<>'#|_:;@%?~\"", 50, 450, sc, th);
  gridfontSmooth.drawString("the quick (brown) fox?", 50, 500, sc, th);
  gridfontSmooth.drawString("jumps over the lazy dog.", 50, 550, sc, th);
}


// ---------------------------
class AndersHoffGridFont {
  
  constructor(fontData) {
    this.special = fontData.special;
    this.compass = fontData.compass;
    this.groups = fontData.groups;
    this.symbols = fontData.symbols;

    this.commands = new Set([]);
    for (let key in this.compass) {
      this.commands.add(key);
    }
    for (let key in this.special) {
      this.commands.add(this.special[key]);
    }
    this.tokenizer = this.buildTokenizer();
  }
  
  
  buildTokenizer() {
    // Build a regex pattern to recognize all commands
    // A command is a letter like 'L', 'N', 'D', 'M', etc.,
    // optionally followed by numbers, fractions, or commas 
    // (e.g., "L3", "p1/2", "M0,6")

    // 1: Turn the command Set into a string like 'LNRSeptqDMWHZ'
    let commandLetters = Array.from(this.commands).join("");

    // 2: Build a regex pattern
    // This means: a command letter, followed by optional
    // numbers, commas, dots, slashes
    let pattern = `[${commandLetters}][0-9,./]*`;

    // 3: Create and return the regular expression
    return new RegExp(pattern, "g");
  }


  parseRaw(symbolObj) {
    // Parse the 'raw' mini-language of a symbol 
    // into a set of drawable paths

    // If the symbol has no raw definition, return an empty array
    if (!symbolObj.raw) return [];

    // Step 1: Split the raw string into two parts:
    // - info: like 'S4,9' (size of the symbol grid)
    // - rawPaths: drawing instructions like 'M3,2DS4|(c-arc)'
    let [info, rawPaths] = symbolObj.raw.split(":");

    // Step 2: Parse the info to get the grid width and height
    let [gw, gh] = this.parseInfo(info);

    // Step 3: Split the rawPaths by '|' 
    // (each '|' separates a different drawing path)
    // Trim whitespace, then parse each individual path
    let paths = rawPaths
      .split("|")
      .map((path) => this.parsePath((gw, gh), path.trim()));

    // Step 4: Return the parsed paths
    return paths;
  }

  
  parseInfo(info) {
    if (!info.startsWith("S")) throw new Error("Info must start with S");
    let parts = info.substring(1).split(",");
    return [parseInt(parts[0]), parseInt(parts[1])];
  }

  
  expandGroups(path) {
    let expanded = path;
    let changed = true;
    while (changed) {
      changed = false;
      for (let [key, val] of Object.entries(this.groups)) {
        if (expanded.includes(key)) {
          expanded = expanded.replaceAll(key, val);
          changed = true;
        }
      }
    }
    return expanded;
  }

  
  parsePath(bbox, rawPath) {
    let path = [];
    let state = [0, 0, false]; // x, y, penDown

    rawPath = this.expandGroups(rawPath);
    let tokens = rawPath.match(this.tokenizer) || [];

    for (let token of tokens) {
      let cmd = token[0];
      let arg = token.substring(1);
      let parsedArg = this.parseArg(arg);
      state = this.doCommand(
        path.length > 0 ? path[0] : [0, 0],
        state,
        bbox,
        cmd,
        parsedArg,
        path
      );
    }
    return path;
  }

  
  parseArg(arg) {
    if (!arg) return 1;
    if (arg.includes(",")) {
      return arg.split(",").map((v) => this.fractFloat(v));
    }
    return this.fractFloat(arg);
  }

  
  fractFloat(v) {
    if (v.includes("/")) {
      let [num, den] = v.split("/").map(Number);
      return num / den;
    }
    return parseFloat(v);
  }

  
  relMove(state, delta, arg = 1) {
    if (Array.isArray(arg)) {
      return [state[0] + delta[0] * arg[0], state[1] + delta[1] * arg[1]];
    } else {
      return [state[0] + delta[0] * arg, state[1] + delta[1] * arg];
    }
  }

  
  doCommand(start, state, bbox, cmd, arg, path) {
    let [x, y, penDown] = state;

    if (this.compass[cmd]) {
      let [dx, dy] = this.compass[cmd];
      let [nx, ny] = this.relMove([x, y], [dx, dy], arg);
      if (penDown) path.push([x, y]);
      if (penDown) path.push([nx, ny]);
      return [nx, ny, penDown];
    }

    if (cmd === this.special.abs_move) {
      if (Array.isArray(arg)) {
        return [arg[0], arg[1], penDown];
      }
      return [arg, arg, penDown];
    }

    if (cmd === this.special.pen_down) {
      return [x, y, true];
    }

    if (cmd === this.special.start) {
      return [start[0], start[1], penDown];
    }

    if (cmd === this.special.left) {
      return [0, y, penDown];
    }

    if (cmd === this.special.right) {
      return [bbox[0] - 1, y, penDown];
    }

    if (cmd === this.special.top) {
      return [x, 0, penDown];
    }

    if (cmd === this.special.bottom) {
      return [x, bbox[1] - 1, penDown];
    }

    throw new Error("Unknown command: " + cmd);
  }

  
  drawSymbol(sym, x, y, sc = 20, th = 1) {
    if (!this.symbols[sym]) {
      console.warn("Symbol not found:", sym);
      return;
    }
    let symbolObj = this.symbols[sym];
    let paths = symbolObj.paths || this.parseRaw(symbolObj);
    symbolObj.paths = paths;

    push();
    translate(x, y);
    scale(sc, sc);
    strokeWeight(th / sc);
    noFill();
    for (let path of paths) {
      beginShape();
      for (let pt of path) {
        vertex(pt[0], pt[1]);
      }
      endShape();
    }
    pop();
  }
  

  drawString(txt, startX, startY, sc = DEFAULT_SCALE, th = 1) {
    txt = txt.toLowerCase(); // Hoff only supports lowercase.
    let x = startX;
    let y = startY;
    let xdst = DEFAULT_XDST;

    for (let c of txt) {
      if (!this.symbols[c]) {
        // Handle missing char: advance by 1 grid unit + spacing
        x += sc + xdst; 
        continue;
      }

      let symbolObj = this.symbols[c];
      this.drawSymbol(c, x, y, sc, th);

      // Advance by glyph width scaled + fixed spacing
      let glyphWidth = symbolObj.w !== undefined ? symbolObj.w : 1;
      x += glyphWidth * sc + xdst; 
    }
  }
}
