/**
 * p5_hangeul_specimens
 *
 * This specimen app compares the exported Wansung SVG 1.1 Hangeul fonts on the
 * same two-line pangram-style text. It deliberately does not load the large
 * SHX-derived JSON or run the jamo compositor; every glyph here comes from an
 * already-generated SVG 1.1 font file copied into this app's data/ folder.
 *
 * Contrast with p5_hangeul_compositor, which tests jamo composition directly,
 * and p5_hangeul_full, which starts from SHX JSON and can generate the SVG
 * font files that this sketch consumes.
 */
let manifest;
let specimenFonts = [];
let loadError = "";

const MANIFEST_PATH = "data/manifest.json";
const DEFAULT_SIZE = 22;
const DEFAULT_WEIGHT = 1.0;
const LABEL_SIZE = 12;
const LEFT_MARGIN = 28;
const SECOND_COLUMN_X = 650;
const TOP_MARGIN = 32;
const ROW_GAP = 18;
const LEFT_COLUMN_COUNT = 5;
const DEFAULT_TEXT = [
  "웬 초콜릿? 제가 원했던 건 뻥튀기 쬐끔과 의류예요.",
  "얘야, 왜 또 불평? 다람쥐 헌 쳇바퀴에 타고파.",
].join("\n");

/**
 * Create the p5 canvas and start loading the exported SVG font manifest.
 */
function setup() {
  const wrap = document.getElementById("canvasWrap");
  const canvas = createCanvas(wrap.clientWidth, canvasHeight());
  canvas.parent("canvasWrap");
  pixelDensity(Math.min(2, window.devicePixelRatio || 1));
  loadManifest();
}

/**
 * Render the two-line specimen once for every loaded Wansung SVG font.
 */
function draw() {
  background("#000000");

  if (loadError) {
    drawStatus(loadError);
    return;
  }
  if (!specimenFonts.length || specimenFonts.some((font) => !font.ready)) {
    drawStatus("Loading exported SVG fonts...");
    return;
  }

  stroke("#ffffff");
  strokeWeight(DEFAULT_WEIGHT);
  strokeJoin(ROUND);
  strokeCap(ROUND);
  noFill();

  const rowHeight = specimenRowHeight();
  for (let index = 0; index < specimenFonts.length; index++) {
    const font = specimenFonts[index];
    const isRightColumn = index >= LEFT_COLUMN_COUNT;
    const columnIndex = isRightColumn ? index - LEFT_COLUMN_COUNT : index;
    const x = isRightColumn ? SECOND_COLUMN_X : LEFT_MARGIN;
    const y = TOP_MARGIN + columnIndex * rowHeight;
    drawFontLabel(font.displayName, x, y);
    const textBaseline = y + LABEL_SIZE + 7 + DEFAULT_SIZE;
    font.drawString(DEFAULT_TEXT, x, textBaseline, DEFAULT_SIZE, DEFAULT_SIZE * 0.04);
  }
}

/**
 * Save the comparison sheet as a PNG when the user presses "s".
 */
function keyPressed() {
  if (key === "s" || key === "S") {
    saveCanvas("p5_hangeul_specimens", "png");
  }
}

/**
 * Load the generated manifest and instantiate one Wansung font per typeface.
 */
async function loadManifest() {
  try {
    const response = await fetch(MANIFEST_PATH);
    if (!response.ok) throw new Error(`Could not load manifest (${response.status})`);
    manifest = await response.json();
    const wansungFonts = manifest.fonts.filter((font) => font.kind === "wansung");
    specimenFonts = wansungFonts.map((font) => new SvgFont(font.file, font.source.replace(/\.shx$/i, "")));
    resizeCanvas(document.getElementById("canvasWrap").clientWidth, canvasHeight());
  } catch (error) {
    loadError = `${error.message}. Start a local server from p5_hangeul_specimens/.`;
  }
}

/**
 * Draw a loading or error message on the canvas.
 * @param {string} message - Status text to show.
 */
function drawStatus(message) {
  push();
  noStroke();
  fill("#ffffff");
  textSize(15);
  textAlign(LEFT, TOP);
  text(message, 24, 24);
  pop();
}

/**
 * Draw the font name above its specimen pair using regular p5 text.
 * @param {string} name - Font display name.
 * @param {number} x - Label left edge.
 * @param {number} y - Label top edge.
 */
function drawFontLabel(name, x, y) {
  push();
  noStroke();
  fill("#767676");
  textSize(LABEL_SIZE);
  textAlign(LEFT, TOP);
  text(name, x, y);
  pop();
}

/**
 * Compute a canvas height large enough to include every specimen row.
 * @returns {number} Canvas height in CSS pixels.
 */
function canvasHeight() {
  const fontCount = Math.max(1, specimenFonts.length || 9);
  const rowCount = Math.max(LEFT_COLUMN_COUNT, fontCount - LEFT_COLUMN_COUNT);
  return Math.max(window.innerHeight, Math.ceil(TOP_MARGIN * 2 + rowCount * specimenRowHeight()));
}

/**
 * Return the vertical stride for one specimen block.
 * @returns {number} Row height in canvas pixels.
 */
function specimenRowHeight() {
  return LABEL_SIZE + 7 + DEFAULT_SIZE * 2.56 + ROW_GAP;
}

/**
 * Keep the canvas matched to the available browser width.
 */
function windowResized() {
  const wrap = document.getElementById("canvasWrap");
  resizeCanvas(wrap.clientWidth, canvasHeight());
}

/**
 * Minimal SVG 1.1 font loader/renderer for the generated single-line fonts.
 */
class SvgFont {
  /**
   * Create an SVG font wrapper and begin fetching the file.
   * @param {string} filePath - Path to an SVG 1.1 font file.
   * @param {string} displayName - Label shown above the specimen text.
   */
  constructor(filePath, displayName) {
    this.filePath = filePath;
    this.displayName = displayName;
    this.glyphs = {};
    this.unitsPerEm = 1000;
    this.defaultHorizAdvX = 1000;
    this.ready = false;
    this.load();
  }

  /**
   * Fetch and parse this font file.
   */
  async load() {
    try {
      const response = await fetch(this.filePath);
      if (!response.ok) throw new Error(`Could not load ${this.filePath} (${response.status})`);
      this.loadData(await response.text());
      this.ready = true;
    } catch (error) {
      loadError = error.message;
    }
  }

  /**
   * Parse <font-face> metrics and <glyph> elements from SVG XML text.
   * @param {string} svgData - Raw SVG 1.1 font document.
   */
  loadData(svgData) {
    const parser = new DOMParser();
    const svgDoc = parser.parseFromString(svgData, "image/svg+xml");
    const fontEl = svgDoc.querySelector("font");
    const fontFace = svgDoc.querySelector("font-face");

    this.defaultHorizAdvX = parseFloat(fontEl?.getAttribute("horiz-adv-x") || 1000);
    this.unitsPerEm = parseFloat(fontFace?.getAttribute("units-per-em") || 1000);

    for (const glyph of svgDoc.querySelectorAll("glyph")) {
      const unicode = glyph.getAttribute("unicode");
      if (unicode === null) continue;
      // XML character references such as &#xAC00; are already decoded by the
      // browser parser, so Array.from() safely captures one Unicode scalar.
      const char = Array.from(unicode)[0];
      this.glyphs[char] = {
        d: glyph.getAttribute("d"),
        horizAdvX: parseFloat(glyph.getAttribute("horiz-adv-x") || this.defaultHorizAdvX),
      };
    }
  }

  /**
   * Draw a multiline string using glyph advances from the SVG font.
   * @param {string} str - Text to draw.
   * @param {number} x - Left edge in canvas pixels.
   * @param {number} y - First-line baseline in canvas pixels.
   * @param {number} size - Em size in pixels.
   * @param {number} tracking - Extra tracking in pixels.
   */
  drawString(str, x, y, size, tracking = 0) {
    let cursorX = x;
    let cursorY = y;
    const scaleFactor = size / this.unitsPerEm;
    const lineHeight = size * 1.28;

    for (const ch of Array.from(str)) {
      if (ch === "\n") {
        cursorX = x;
        cursorY += lineHeight;
        continue;
      }

      const glyph = this.glyphs[ch];
      if (!glyph) {
        cursorX += size * 0.45 + tracking;
        continue;
      }
      if (glyph.d) {
        this.drawGlyph(glyph.d, cursorX, cursorY, size);
      }
      cursorX += glyph.horizAdvX * scaleFactor + tracking;
    }
  }

  /**
   * Stroke one glyph's SVG path data in p5 canvas coordinates.
   * @param {string} pathData - SVG path data from a glyph's d attribute.
   * @param {number} x - Glyph origin x in canvas pixels.
   * @param {number} y - Glyph baseline y in canvas pixels.
   * @param {number} size - Em size in pixels.
   */
  drawGlyph(pathData, x, y, size) {
    const scaleFactor = size / this.unitsPerEm;
    const commands = pathData.match(/[A-Za-z][^A-Za-z]*/g) || [];
    let currentX = x;
    let currentY = y;

    for (const command of commands) {
      const type = command[0];
      const args = command
        .slice(1)
        .trim()
        .split(/[ ,]+/)
        .filter(Boolean)
        .map(Number);

      if (type === "M") {
        // SVG font coordinates are y-up; p5 canvas coordinates are y-down.
        currentX = x + args[0] * scaleFactor;
        currentY = y - args[1] * scaleFactor;
      } else if (type === "L") {
        const px = x + args[0] * scaleFactor;
        const py = y - args[1] * scaleFactor;
        line(currentX, currentY, px, py);
        currentX = px;
        currentY = py;
      } else if (type === "C") {
        const x2 = x + args[0] * scaleFactor;
        const y2 = y - args[1] * scaleFactor;
        const x3 = x + args[2] * scaleFactor;
        const y3 = y - args[3] * scaleFactor;
        const x4 = x + args[4] * scaleFactor;
        const y4 = y - args[5] * scaleFactor;
        bezier(currentX, currentY, x2, y2, x3, y3, x4, y4);
        currentX = x4;
        currentY = y4;
      }
    }
  }
}
