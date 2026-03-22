// Loads, parses, and displays a Clojure file containing
// a custom monospace, monoline vector font by Tyler X. Hobbs
// Re-published with permission • https://www.tylerxhobbs.com/

let fontLines;
let glyphs = {};
let placeholderGlyph = [];

// -----------------------------
function preload() {
  fontLines = loadStrings("tylerxhobbs_font.clj");
}

function setup() {
  createCanvas(900, 330);

  // Parse the .clj file once at startup
  const source = fontLines.join("\n");
  const parsed = parseClojureFontFile(source);
  glyphs = parsed.charLayouts || {};
  placeholderGlyph = parsed.charPlaceholder || [];
  print(`Loaded glyphs: ${Object.keys(glyphs).length}`);
  print(Object.keys(glyphs)); 
  exportGlyphsToJSON(); 
}

function draw() {
  background('black');
  stroke('white');
  strokeWeight(1);
  strokeJoin(ROUND);
  strokeCap(ROUND);
  noFill();

  drawString("ABCDEFGHIJKLMNOPQRSTUVWXYZ", 60, 60, 20);
  drawString(".,;:\'\"<>[]{}()/|\\?`~!@#$%^&*-_+=", 60,140, 14);
  drawString("0123456789 - HELLO WORLD", 60,190, 14);
  drawString("FONT BY TYLER X. HOBBS", 60,240, 14);
}

function keyPressed(){
  if (key == 's'){
    save("tylerxhobbs_font.png"); 
  }
}

function exportGlyphsToJSON() {
  const json = JSON.stringify(glyphs, null, 2);
  console.log(json);
  return json;
}

// -----------------------------
// Public drawing API
function drawGlyph(ch, x, y, sca) {
  const curves = glyphs[ch] ?? placeholderGlyph;
  const charWidth = sca;
  const charHeight = sca * 2.0;

  for (const curve of curves) {
    beginShape();
    for (const pt of curve) {
      const px = x + pt[0] * charWidth;
      const py = y + pt[1] * charHeight;
      vertex(px, py);
    }
    endShape();
  }
}

function drawString(str, x, y, sca) {
  const spacing = sca * 1.5; // matches original proportional spacing
  for (let i = 0; i < str.length; i++) {
    drawGlyph(str[i], x + i * spacing, y, sca);
  }
}

// -----------------------------
// Mini Clojure Parser
function parseClojureFontFile(source) {
  const tokens = tokenizeClojure(source);
  let i = 0;
  const forms = [];

  while (i < tokens.length) {
    const result = readForm(tokens, i);
    forms.push(result.value);
    i = result.next;
  }

  let charLayouts = null;
  let charPlaceholder = null;

  // Look for:
  // (def char-placeholder ...)
  // (def char-layouts ...)
  for (const form of forms) {
    if (isList(form) && form.items.length >= 3) {
      const head = form.items[0];
      const name = form.items[1];
      const value = form.items[2];

      if (isSymbol(head, "def") && isSymbolObject(name)) {
        if (name.name === "char-layouts") {
          charLayouts = cljToJs(value);
        } else if (name.name === "char-placeholder") {
          charPlaceholder = cljToJs(value);
        }
      }
    }
  }

  return {
    charLayouts,
    charPlaceholder
  };
}

// -----------------------------
// Tokenizer
// Supports:
// - strings
// - numbers
// - symbols
// - (), [], {}
// - commas as whitespace
// - ; comments
// - // comments (for robustness)
//
function tokenizeClojure(src) {
  const tokens = [];
  let i = 0;

  while (i < src.length) {
    const ch = src[i];

    // Whitespace or commas
    if (/\s|,/.test(ch)) {
      i++;
      continue;
    }

    // Clojure-style comment ; ... endline
    if (ch === ";") {
      while (i < src.length && src[i] !== "\n") i++;
      continue;
    }

    // JS-style comment // ... endline, tolerated for robustness
    if (ch === "/" && src[i + 1] === "/") {
      i += 2;
      while (i < src.length && src[i] !== "\n") i++;
      continue;
    }

    // Delimiters
    if ("()[]{}".includes(ch)) {
      tokens.push({ type: "delim", value: ch });
      i++;
      continue;
    }

    // String
    if (ch === '"') {
      let j = i + 1;
      let out = "";

      while (j < src.length) {
        const cj = src[j];

        if (cj === "\\") {
          const next = src[j + 1];
          if (next === "n") out += "\n";
          else if (next === "t") out += "\t";
          else if (next === '"' || next === "\\" ) out += next;
          else out += next;
          j += 2;
          continue;
        }

        if (cj === '"') break;
        out += cj;
        j++;
      }

      if (j >= src.length) {
        throw new Error("Unterminated string literal");
      }

      tokens.push({ type: "string", value: out });
      i = j + 1;
      continue;
    }

    // Number or symbol
    let j = i;
    while (
      j < src.length &&
      !/\s|,/.test(src[j]) &&
      !"()[]{}\";".includes(src[j])
    ) {
      // stop before // comment
      if (src[j] === "/" && src[j + 1] === "/") break;
      j++;
    }

    const raw = src.slice(i, j);

    if (/^[+-]?(?:\d+\.?\d*|\.\d+)$/.test(raw)) {
      tokens.push({ type: "number", value: parseFloat(raw) });
    } else {
      tokens.push({ type: "symbol", value: raw });
    }

    i = j;
  }

  return tokens;
}

// -----------------------------
// Reader
// Produces tagged AST objects for list/vector/map/symbol
function readForm(tokens, i) {
  if (i >= tokens.length) {
    throw new Error("Unexpected end of input");
  }

  const tok = tokens[i];

  if (tok.type === "number") {
    return { value: tok.value, next: i + 1 };
  }

  if (tok.type === "string") {
    return { value: tok.value, next: i + 1 };
  }

  if (tok.type === "symbol") {
    return {
      value: { type: "symbol", name: tok.value },
      next: i + 1
    };
  }

  if (tok.type === "delim") {
    if (tok.value === "(") return readList(tokens, i + 1);
    if (tok.value === "[") return readVector(tokens, i + 1);
    if (tok.value === "{") return readMap(tokens, i + 1);
  }

  throw new Error("Unexpected token: " + JSON.stringify(tok));
}

function readList(tokens, i) {
  const items = [];
  while (i < tokens.length) {
    const tok = tokens[i];
    if (tok.type === "delim" && tok.value === ")") {
      return {
        value: { type: "list", items },
        next: i + 1
      };
    }
    const result = readForm(tokens, i);
    items.push(result.value);
    i = result.next;
  }
  throw new Error("Unterminated list");
}

function readVector(tokens, i) {
  const items = [];
  while (i < tokens.length) {
    const tok = tokens[i];
    if (tok.type === "delim" && tok.value === "]") {
      return {
        value: { type: "vector", items },
        next: i + 1
      };
    }
    const result = readForm(tokens, i);
    items.push(result.value);
    i = result.next;
  }
  throw new Error("Unterminated vector");
}

function readMap(tokens, i) {
  const entries = [];
  while (i < tokens.length) {
    const tok = tokens[i];
    if (tok.type === "delim" && tok.value === "}") {
      return {
        value: { type: "map", entries },
        next: i + 1
      };
    }

    const k = readForm(tokens, i);
    const v = readForm(tokens, k.next);
    entries.push([k.value, v.value]);
    i = v.next;
  }
  throw new Error("Unterminated map");
}

// -----------------------------
// AST utilities
function isList(x) {
  return x && x.type === "list";
}

function isSymbol(x, name) {
  return x && x.type === "symbol" && x.name === name;
}

function isSymbolObject(x) {
  return x && x.type === "symbol";
}

// ------------------------------------------------------------
// Convert Clojure AST subset into JS data
// This is enough for this font format.
// ------------------------------------------------------------
function cljToJs(node) {
  if (typeof node === "number" || typeof node === "string") {
    return node;
  }

  if (!node || typeof node !== "object") {
    return node;
  }

  if (node.type === "vector") {
    return node.items.map(cljToJs);
  }

  if (node.type === "map") {
    const obj = {};
    for (const [k, v] of node.entries) {
      const kk = cljToJs(k);
      obj[String(kk)] = cljToJs(v);
    }
    return obj;
  }

  if (node.type === "symbol") {
    // For this font data we should not need symbols as values,
    // but preserve them as strings if they appear.
    return node.name;
  }

  if (node.type === "list") {
    // Not evaluating arbitrary code here.
    // For this task, lists are only used for top-level forms,
    // which are inspected separately before conversion.
    return node.items.map(cljToJs);
  }

  return node;
}